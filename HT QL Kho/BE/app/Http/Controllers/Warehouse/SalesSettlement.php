<?php

namespace App\Http\Controllers\Warehouse;

use App\Services\SalesStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

trait SalesSettlement
{
    private function invoiceQuery()
    {
        return $this->scope(DB::table('HoaDon as hd')->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang'), 'hd.maKhachHang');
    }

    public function invoices()
    {
        $invoices = $this->invoiceQuery()->leftJoin('CongNo as cn', 'cn.maHoaDon', '=', 'hd.maHoaDon')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'hd.maKhachHang')
            ->select('hd.*', 'gh.diaChiGiao', 'kh.tenKhachHang', 'cn.maCongNo', 'cn.soTienDaTra', 'cn.soTienConLai')->orderByDesc('hd.ngayLap')->get();
        $pending = DB::table('ThanhToan')->whereIn('maCongNo', $invoices->pluck('maCongNo'))->where('trangThai', 'Chờ đối soát')->pluck('maCongNo')->all();
        foreach ($invoices as $invoice) {
            $invoice->tenKhachHang = $this->legacyText($invoice->tenKhachHang);
            $invoice->trangThaiThanhToan = in_array($invoice->maCongNo, $pending) ? 'Chờ đối soát' : (($invoice->soTienConLai ?? $invoice->tongTien) <= 0 ? 'Đã thanh toán' : (($invoice->soTienDaTra ?? 0) > 0 ? 'Thanh toán một phần' : 'Công nợ'));
        }

        return $this->result($invoices);
    }

    public function createInvoice(Request $request)
    {
        $data = $request->validate([
            'maGiaoHang' => 'required|exists:GiaoHang,maGiaoHang', 'hanThanhToan' => 'required|date|after_or_equal:today',
            'duyetVuotHanMuc' => 'sometimes|boolean', 'lyDoDuyet' => 'nullable|string|max:255',
            'soTienThuNgay' => 'sometimes|numeric|min:0|max:999999999999.99|decimal:0,2',
        ]);

        return DB::transaction(function () use ($data) {
            $delivery = DB::table('GiaoHang')->where('maGiaoHang', $data['maGiaoHang'])->first();
            $order = $this->order($delivery->maDonHang);
            $customer = $this->customer($order->maKhachHang);
            $delivery = DB::table('GiaoHang')->where('maGiaoHang', $data['maGiaoHang'])->lockForUpdate()->first();
            $dispatch = DB::table('PhieuXuatSP')->where('maPhieuXuatSP', $delivery->maPhieuXuat)->lockForUpdate()->first();
            if (! $dispatch || $dispatch->trangThai !== 'Hoàn thành' || $dispatch->maDonHang !== $order->maDonHang) {
                SalesStock::fail('Chỉ lập hóa đơn sau khi phiếu xuất kho của đơn hàng đã hoàn tất.');
            }
            if (DB::table('HoaDon')->where('maGiaoHang', $delivery->maGiaoHang)->lockForUpdate()->first()) {
                SalesStock::fail('Yêu cầu giao hàng này đã có hóa đơn.');
            }
            $items = $this->invoiceItems($delivery->maPhieuXuat, $order->maDonHang);
            if ($items->isEmpty()) {
                SalesStock::fail('Phiếu xuất chưa có chi tiết sản phẩm.');
            }
            $total = $items->sum(fn ($item) => round($item->donGia * 100) * $item->soLuong) / 100;
            $cash = (float) ($data['soTienThuNgay'] ?? 0);
            if ($cash > $total) {
                SalesStock::fail('Số tiền thu ngay không được vượt tổng hóa đơn.');
            }
            if ($cash > 0 && ! in_array($delivery->trangThai, ['Đang giao', 'Đang giao hàng', 'Đã giao', 'Đã giao thành công'])) {
                SalesStock::fail('Chỉ ghi nhận thu tiền khi nhân viên đã nhận hàng và bắt đầu giao.');
            }
            $outstanding = DB::table('CongNo')->where('maKhachHang', $order->maKhachHang)->lockForUpdate()->get()->sum('soTienConLai');
            $exceeded = $total - $cash + $outstanding > $customer->hanMucCongNo;
            if ($exceeded) {
                if (! ($data['duyetVuotHanMuc'] ?? false)) {
                    SalesStock::fail('Công nợ vượt hạn mức khách hàng. Cần quản lý phê duyệt và ghi lý do.');
                }
                $this->manager();
                if (! trim($data['lyDoDuyet'] ?? '')) {
                    SalesStock::fail('Vui lòng nhập lý do phê duyệt vượt hạn mức.');
                }
            }
            $invoice = ['maHoaDon' => $this->code('HD'), 'ngayLap' => now(), 'tongTien' => $total, 'maGiaoHang' => $delivery->maGiaoHang];
            DB::table('HoaDon')->insert($invoice);
            $debtId = $this->code('CN');
            DB::table('CongNo')->insert(['maCongNo' => $debtId, 'maHoaDon' => $invoice['maHoaDon'], 'maKhachHang' => $order->maKhachHang, 'soTienNo' => $total, 'soTienDaTra' => $cash, 'soTienConLai' => $total - $cash, 'hanThanhToan' => $data['hanThanhToan'], 'trangThai' => $total > $cash ? 'Còn nợ' : 'Đã tất toán', 'nguoiDuyetVuotHanMuc' => $exceeded ? request()->user()->id : null, 'lyDoDuyet' => $exceeded ? $data['lyDoDuyet'] : null]);
            if ($cash > 0) {
                DB::table('ThanhToan')->insert(['maThanhToan' => $this->code('TT'), 'maCongNo' => $debtId, 'ngayThanhToan' => now(), 'phuongThuc' => 'Tiền mặt', 'soTien' => $cash, 'trangThai' => 'Đã xác nhận', 'nguoiGhiNhan' => request()->user()->id]);
            }

            return $this->result($invoice, 'Đã lập hóa đơn và ghi nhận công nợ.', 201);
        }, 3);
    }

    private function invoiceItems(string $dispatch, string $order)
    {
        return DB::table('ChiTietPhieuXuatSP as ct')->join('TonKho as tk', 'tk.maTonKho', '=', 'ct.maTonKho')
            ->join('ChiTietDonHang as dh', fn ($join) => $join->on('dh.maSanPham', '=', 'tk.maSP')->where('dh.maDonHang', $order))
            ->join('SanPham as sp', 'sp.maSanPham', '=', 'tk.maSP')->where('ct.maPhieuXuatSP', $dispatch)
            ->select('tk.maSP as maSanPham', 'sp.tenSanPham', 'ct.soLuong', 'dh.donGia')->get();
    }

    public function invoiceDetail(string $id)
    {
        $invoice = $this->invoiceQuery()->where('hd.maHoaDon', $id)->select('hd.*', 'gh.maPhieuXuat', 'gh.diaChiGiao')->first();
        abort_unless($invoice, 404);
        $invoice->customer = DB::table('KhachHang')->where('maKhachHang', $invoice->maKhachHang)->first();
        $invoice->tenKhachHang = $this->legacyText($invoice->customer?->tenKhachHang);
        $invoice->soDienThoaiKH = $invoice->customer?->soDienThoai;
        $invoice->items = $invoice->maPhieuXuat
            ? $this->invoiceItems($invoice->maPhieuXuat, $invoice->maDonHang)
            : DB::table('ChiTietDonHang as ct')->join('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
                ->where('ct.maDonHang', $invoice->maDonHang)->select('ct.maSanPham', 'sp.tenSanPham', 'ct.soLuong', 'ct.donGia')->get();

        return $this->result($invoice);
    }

    public function receivables()
    {
        $rows = $this->scope(DB::table('CongNo as cn'), 'cn.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')
            ->select('cn.*', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'kh.hanMucCongNo', 'hd.maDonHang')->orderBy('cn.hanThanhToan')->get();
        foreach ($rows as $row) {
            $row->tenKhachHang = $this->legacyText($row->tenKhachHang);
            $row->trangThai = $row->soTienConLai <= 0 ? 'Đã tất toán' : (($row->hanThanhToan && $row->hanThanhToan < today()->toDateString()) ? 'Quá hạn' : 'Còn nợ');
        }

        return $this->result($rows);
    }

    public function receivableDetail(string $id)
    {
        $row = $this->scope(DB::table('CongNo as cn'), 'cn.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')->where('cn.maCongNo', $id)
            ->select('cn.*', 'kh.tenKhachHang', 'kh.hanMucCongNo', 'hd.maDonHang')->first();
        abort_unless($row, 404);
        $row->tenKhachHang = $this->legacyText($row->tenKhachHang);
        $row->payments = DB::table('ThanhToan')->where('maCongNo', $id)->orderByDesc('ngayThanhToan')->get();

        return $this->result($row);
    }

    public function updateReceivable(Request $request, string $id)
    {
        $this->manager();
        $data = $request->validate(['hanThanhToan' => 'required|date']);
        abort_unless(DB::table('CongNo')->where('maCongNo', $id)->exists(), 404);
        DB::table('CongNo')->where('maCongNo', $id)->update($data);

        return $this->result(null, 'Đã cập nhật hạn thanh toán.');
    }

    public function payments()
    {
        return $this->result($this->scope(DB::table('ThanhToan as tt')->join('CongNo as cn', 'cn.maCongNo', '=', 'tt.maCongNo'), 'cn.maKhachHang')
            ->select('tt.*', 'cn.maHoaDon', 'cn.maKhachHang')->orderByDesc('tt.ngayThanhToan')->get());
    }

    public function createPayment(Request $request)
    {
        $data = $request->validate(['maThanhToan' => 'required|alpha_dash|max:20|unique:ThanhToan,maThanhToan', 'maCongNo' => 'required|exists:CongNo,maCongNo', 'soTien' => 'required|numeric|min:0.01|max:999999999999.99|decimal:0,2', 'phuongThuc' => ['required', Rule::in(['Tiền mặt', 'Chuyển khoản'])], 'thamChieu' => 'nullable|string|max:100']);

        return DB::transaction(function () use ($data) {
            $snapshot = DB::table('CongNo')->where('maCongNo', $data['maCongNo'])->first();
            $this->customer($snapshot->maKhachHang);
            $debt = DB::table('CongNo')->where('maCongNo', $data['maCongNo'])->lockForUpdate()->first();
            $deliveryStatus = DB::table('HoaDon as hd')->join('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')->where('hd.maHoaDon', $debt->maHoaDon)->value('gh.trangThai');
            if (! in_array($deliveryStatus, ['Đang giao', 'Đang giao hàng', 'Đã giao', 'Đã giao thành công'])) {
                SalesStock::fail('Chỉ ghi nhận thanh toán khi đã bắt đầu giao hàng.');
            }
            $pending = DB::table('ThanhToan')->where('maCongNo', $debt->maCongNo)->where('trangThai', 'Chờ đối soát')->lockForUpdate()->get()->sum('soTien');
            if (round(($data['soTien'] + $pending) * 100) > round($debt->soTienConLai * 100)) {
                SalesStock::fail('Số tiền vượt dư nợ còn lại sau khi trừ các khoản chờ đối soát.');
            }
            if ($data['phuongThuc'] === 'Chuyển khoản' && ! trim($data['thamChieu'] ?? '')) {
                SalesStock::fail('Cần nhập mã tham chiếu chuyển khoản để đối soát.');
            }
            $confirmed = $data['phuongThuc'] === 'Tiền mặt';
            DB::table('ThanhToan')->insert($data + ['ngayThanhToan' => now(), 'trangThai' => $confirmed ? 'Đã xác nhận' : 'Chờ đối soát', 'nguoiGhiNhan' => request()->user()->id]);
            if ($confirmed) {
                $this->applyPayment($debt, (float) $data['soTien']);
            }

            return $this->result(null, $confirmed ? 'Đã ghi nhận thanh toán.' : 'Đã lưu chuyển khoản chờ đối soát.', 201);
        }, 3);
    }

    private function applyPayment($debt, float $amount): void
    {
        $remaining = (round($debt->soTienConLai * 100) - round($amount * 100)) / 100;
        if ($remaining < 0) {
            SalesStock::fail('Số tiền thanh toán vượt dư nợ.');
        }
        DB::table('CongNo')->where('maCongNo', $debt->maCongNo)->update(['soTienDaTra' => (round($debt->soTienDaTra * 100) + round($amount * 100)) / 100, 'soTienConLai' => $remaining, 'trangThai' => $remaining == 0 ? 'Đã tất toán' : 'Còn nợ']);
    }

    public function reconcilePayment(Request $request, string $id)
    {
        $this->manager();
        $data = $request->validate(['trangThai' => ['required', Rule::in(['Đã xác nhận', 'Từ chối'])]]);

        return DB::transaction(function () use ($id, $data) {
            $snapshot = DB::table('ThanhToan')->where('maThanhToan', $id)->first();
            abort_unless($snapshot, 404);
            $debtSnapshot = DB::table('CongNo')->where('maCongNo', $snapshot->maCongNo)->first();
            abort_unless($debtSnapshot, 422, 'Giao dịch chưa liên kết công nợ.');
            $this->customer($debtSnapshot->maKhachHang);
            $debt = DB::table('CongNo')->where('maCongNo', $snapshot->maCongNo)->lockForUpdate()->first();
            $payment = DB::table('ThanhToan')->where('maThanhToan', $id)->lockForUpdate()->first();
            if ($payment->trangThai !== 'Chờ đối soát') {
                SalesStock::fail('Giao dịch này đã được xử lý.');
            }
            if ($data['trangThai'] === 'Đã xác nhận') {
                $this->applyPayment($debt, (float) $payment->soTien);
            }
            DB::table('ThanhToan')->where('maThanhToan', $id)->update($data);

            return $this->result(null, 'Đã đối soát giao dịch.');
        }, 3);
    }
}
