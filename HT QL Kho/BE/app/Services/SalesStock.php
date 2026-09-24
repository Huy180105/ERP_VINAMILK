<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SalesStock
{
    public static function fail(string $message): never
    {
        throw ValidationException::withMessages(['business' => $message]);
    }

    public function lots(string $warehouse, array $products, bool $lock = false)
    {
        $query = DB::table('TonKho')->where(fn ($query) => $query->where('maKho', $warehouse)->orWhereNull('maKho'))->whereIn('maSP', $products)
            ->where('soLuongTonHienTai', '>', 0)->whereNotIn('trangThai', ['Hết hàng', 'Hết hạn', 'Cách ly', 'Khóa'])
            ->where(fn ($q) => $q->whereNull('hanSuDung')->orWhere('hanSuDung', '>=', today()->toDateString()))->orderBy('maTonKho');

        return ($lock ? $query->lockForUpdate() : $query)->get();
    }

    public function lotsForAvailability(array $products)
    {
        return DB::table('TonKho')->whereIn('maSP', $products)
            ->where('soLuongTonHienTai', '>', 0)->whereNotIn('trangThai', ['Hết hàng', 'Hết hạn', 'Cách ly', 'Khóa'])
            ->where(fn ($q) => $q->whereNull('hanSuDung')->orWhere('hanSuDung', '>=', today()->toDateString()))->get();
    }

    public function reservations(array $lots, ?string $exclude = null, bool $lock = false)
    {
        $query = DB::table('ChiTietPhieuXuatSP as ct')->join('PhieuXuatSP as px', 'px.maPhieuXuatSP', '=', 'ct.maPhieuXuatSP')
            ->whereIn('ct.maTonKho', $lots)->whereNotIn('px.trangThai', ['Hoàn thành', 'Đã hủy'])
            ->when($exclude, fn ($q) => $q->where('px.maPhieuXuatSP', '!=', $exclude))
            ->select('ct.maTonKho', 'ct.soLuong');

        // A locking read sees current reservations even under MySQL REPEATABLE READ.
        return ($lock ? $query->lockForUpdate() : $query)->get()->groupBy('maTonKho')->map(fn ($rows) => $rows->sum('soLuong'));
    }

    public function allocate(string $warehouse, array $items): array
    {
        $lots = $this->lots($warehouse, array_column($items, 'maSanPham'), true);
        $reserved = $this->reservations($lots->pluck('maTonKho')->all(), null, true);
        $allocation = [];
        foreach ($items as $item) {
            $needed = (int) $item['soLuong'];
            foreach ($lots->where('maSP', $item['maSanPham'])->sortBy(fn ($lot) => ($lot->hanSuDung ?? '9999-12-31').$lot->maTonKho) as $lot) {
                $take = min($needed, max(0, $lot->soLuongTonHienTai - ($reserved[$lot->maTonKho] ?? 0)));
                if ($take > 0) {
                    $allocation[] = ['maTonKho' => $lot->maTonKho, 'soLuong' => $take];
                    $needed -= $take;
                }
                if ($needed === 0) {
                    break;
                }
            }
            if ($needed > 0) {
                self::fail("Kho không đáp ứng đủ sản phẩm {$item['maSanPham']}. Vui lòng điều chỉnh số lượng hoặc cập nhật lại đơn hàng.");
            }
        }

        return $allocation;
    }

    public function chooseWarehouse(array $items, ?string $preferred = null): string
    {
        $warehouses = DB::table('Kho')->orderBy('maKho')->pluck('maKho');
        if ($preferred && $warehouses->contains($preferred)) {
            $warehouses = $warehouses->reject(fn ($id) => $id === $preferred)->prepend($preferred);
        }
        foreach ($warehouses as $warehouse) {
            try {
                // Use the same locked, reservation-aware stock check as dispatching.
                $this->allocate($warehouse, $items);

                return $warehouse;
            } catch (ValidationException $exception) {
                if (! isset($exception->errors()['business'])) {
                    throw $exception;
                }
            }
        }
        self::fail('Chưa có kho đủ tồn khả dụng cho toàn bộ đơn hàng. Vui lòng giảm số lượng hoặc kiểm tra phân kho, hạn sử dụng và lượng hàng đang giữ.');
    }

    // Shared by both modules: transactions, quantity limits and idempotent completion.
    public function complete(string $id)
    {
        return DB::transaction(function () use ($id) {
            $snapshot = DB::table('PhieuXuatSP')->where('maPhieuXuatSP', $id)->first();
            abort_unless($snapshot, 404);
            $order = $snapshot->maDonHang ? DB::table('DonHang')->where('maDonHang', $snapshot->maDonHang)->lockForUpdate()->first() : null;
            $dispatch = DB::table('PhieuXuatSP')->where('maPhieuXuatSP', $id)->lockForUpdate()->first();
            if ($dispatch->trangThai === 'Hoàn thành') {
                if ($order) {
                    $this->confirmOrderAndCreateDelivery($dispatch, $order);
                }
                return $dispatch;
            }
            if ($dispatch->trangThai === 'Đã hủy' || ($order && ! in_array($order->trangThai, ['Chờ xác nhận', 'Chờ kho xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao hàng']))) {
                self::fail('Phiếu xuất hoặc đơn hàng không ở trạng thái cho phép xuất kho.');
            }
            $details = DB::table('ChiTietPhieuXuatSP')->where('maPhieuXuatSP', $id)->lockForUpdate()->get();
            if ($details->isEmpty()) {
                self::fail('Phiếu xuất chưa có sản phẩm.');
            }
            $lots = DB::table('TonKho')->whereIn('maTonKho', $details->pluck('maTonKho'))->orderBy('maTonKho')->lockForUpdate()->get()->keyBy('maTonKho');
            $reserved = $this->reservations($lots->keys()->all(), $id, true);
            $quantities = [];
            foreach ($details as $detail) {
                $lot = $lots->get($detail->maTonKho);
                if (! $lot || ! $lot->maSP || $detail->soLuong <= 0 || $lot->soLuongTonHienTai - ($reserved[$lot->maTonKho] ?? 0) < $detail->soLuong
                    || ($lot->hanSuDung && $lot->hanSuDung < today()->toDateString()) || in_array($lot->trangThai, ['Hết hàng', 'Hết hạn', 'Cách ly', 'Khóa'])
                    || ($order && $order->maKho && $lot->maKho && $lot->maKho !== $order->maKho)) {
                    self::fail("Lô {$detail->maTonKho} không đủ tồn khả dụng, sai kho hoặc không còn đủ điều kiện xuất.");
                }
                $quantities[$lot->maSP] = ($quantities[$lot->maSP] ?? 0) + $detail->soLuong;
            }
            if ($order) {
                $ordered = DB::table('ChiTietDonHang')->where('maDonHang', $order->maDonHang)->lockForUpdate()->pluck('soLuong', 'maSanPham');
                $exported = DB::table('ChiTietPhieuXuatSP as ct')->join('PhieuXuatSP as px', 'px.maPhieuXuatSP', '=', 'ct.maPhieuXuatSP')
                    ->join('TonKho as tk', 'tk.maTonKho', '=', 'ct.maTonKho')->where('px.maDonHang', $order->maDonHang)->where('px.trangThai', 'Hoàn thành')
                    ->select('tk.maSP', 'ct.soLuong')->lockForUpdate()->get()->groupBy('maSP')->map(fn ($rows) => $rows->sum('soLuong'));
                foreach ($quantities as $product => $quantity) {
                    if ($quantity + ($exported[$product] ?? 0) > ($ordered[$product] ?? 0)) {
                        self::fail('Tổng số lượng xuất không được vượt số lượng đặt trong đơn hàng.');
                    }
                }
            }
            foreach ($details as $detail) {
                DB::table('TonKho')->where('maTonKho', $detail->maTonKho)->decrement('soLuongTonHienTai', $detail->soLuong);
            }
            DB::table('PhieuXuatSP')->where('maPhieuXuatSP', $id)->update(['trangThai' => 'Hoàn thành']);
            $dispatch = DB::table('PhieuXuatSP')->where('maPhieuXuatSP', $id)->first();
            if ($order) {
                $this->confirmOrderAndCreateDelivery($dispatch, $order);
            }

            return $dispatch;
        }, 3);
    }

    private function confirmOrderAndCreateDelivery(object $dispatch, object $order): void
    {
        DB::table('DonHang')->where('maDonHang', $order->maDonHang)
            ->whereIn('trangThai', ['Chờ xác nhận', 'Chờ kho xác nhận'])
            ->update(['trangThai' => 'Đã xác nhận']);
        if (DB::table('GiaoHang')->where('maPhieuXuat', $dispatch->maPhieuXuatSP)->lockForUpdate()->exists()) {
            return;
        }
        $address = DB::table('KhachHang')->where('maKhachHang', $order->maKhachHang)->value('diaChi');
        $driver = $this->availableDriver();
        $deliveryId = 'GH'.strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 18));
        DB::table('GiaoHang')->insert([
            'maGiaoHang' => $deliveryId,
            'ngayGiao' => now(),
            'diaChiGiao' => $address ?: 'Chưa cập nhật địa chỉ giao hàng',
            'trangThai' => $driver ? 'Chờ giao' : 'Chờ phân công',
            'maDonHang' => $order->maDonHang,
            'maPhieuXuat' => $dispatch->maPhieuXuatSP,
            'maKhachHang' => $order->maKhachHang,
            'maNhanVien' => $driver,
        ]);
        DB::table('HoaDon')->where('maDonHang', $order->maDonHang)->whereNull('maGiaoHang')->update(['maGiaoHang' => $deliveryId]);
    }

    public function availableDriver(?string $exclude = null): ?string
    {
        $busy = DB::table('GiaoHang')->whereNotNull('maNhanVien')->whereIn('trangThai', ['Chờ giao', 'Đang giao', 'Đang giao hàng'])
            ->pluck('maNhanVien');

        return DB::table('NhanVien')->where('maPhongBan', 'PB05')->where('trangThai', 'Đang làm việc')
            ->when($exclude, fn ($query) => $query->where('maNV', '!=', $exclude))
            ->whereNotIn('maNV', $busy)->orderBy('maNV')->value('maNV');
    }

    public function assignQueuedDelivery(string $driver): void
    {
        $queued = DB::table('GiaoHang')->whereNull('maNhanVien')->where('trangThai', 'Chờ phân công')
            ->orderBy('ngayGiao')->lockForUpdate()->first();
        if ($queued) {
            DB::table('GiaoHang')->where('maGiaoHang', $queued->maGiaoHang)->update(['maNhanVien' => $driver, 'trangThai' => 'Chờ giao']);
        }
    }
}
