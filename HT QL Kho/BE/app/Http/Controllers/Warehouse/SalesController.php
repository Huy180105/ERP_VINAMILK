<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Services\SalesStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SalesController extends Controller
{
    use SalesSettlement;

    public function __construct(private SalesStock $stock) {}

    private function result($data = null, string $message = '', int $status = 200)
    {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message], $status);
    }

    private function code(string $prefix): string
    {
        return $prefix.strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 18));
    }

    private function legacyText(?string $value): ?string
    {
        if ($value && preg_match('/Ã|Â|Æ|Ä|á»|áº/u', $value)) {
            return mb_convert_encoding($value, 'Windows-1252', 'UTF-8');
        }

        return $value;
    }

    private function manager(): void
    {
        abort_unless(request()->user()->sales_role === 'manager', 403, 'Chức năng này cần quyền quản lý Bán hàng.');
    }

    private function scope($query, string $column)
    {
        if (request()->user()->sales_role !== 'manager') {
            $query->whereIn($column, DB::table('KhachHang')->where('maNhanVienPhuTrach', request()->user()->maNhanVien)->select('maKhachHang'));
        }

        return $query;
    }

    private function customer(string $id, bool $active = false)
    {
        $customer = $this->scope(DB::table('KhachHang'), 'maKhachHang')->where('maKhachHang', $id)->lockForUpdate()->first();
        abort_unless($customer, 404, 'Không tìm thấy khách hàng được phân công.');
        if ($active && ! $customer->hoatDong) {
            SalesStock::fail('Khách hàng đã bị vô hiệu hóa.');
        }

        return $customer;
    }

    private function order(string $id)
    {
        $order = $this->scope(DB::table('DonHang'), 'maKhachHang')->where('maDonHang', $id)->lockForUpdate()->first();
        abort_unless($order, 404);

        return $order;
    }

    public function dashboard()
    {
        $summary = [
            'orders' => $this->scope(DB::table('DonHang'), 'maKhachHang')->count(),
            'pendingOrders' => $this->scope(DB::table('DonHang'), 'maKhachHang')->whereIn('trangThai', ['Chờ xác nhận', 'Chờ kho xác nhận'])->count(),
            'customers' => $this->scope(DB::table('KhachHang'), 'maKhachHang')->where('hoatDong', true)->count(),
            'deliveries' => $this->scope(DB::table('GiaoHang'), 'maKhachHang')->count(),
            'activeDeliveries' => $this->scope(DB::table('GiaoHang'), 'maKhachHang')->whereIn('trangThai', ['Chờ giao', 'Đang giao', 'Đang giao hàng'])->count(),
            'invoices' => $this->invoiceQuery()->count(),
            'receivables' => $this->scope(DB::table('CongNo'), 'maKhachHang')->sum('soTienConLai'),
            'revenue' => $this->invoiceQuery()->sum('hd.tongTien'),
            'totalRevenue' => $this->invoiceQuery()->sum('hd.tongTien'),
        ];
        $orders = $this->scope(DB::table('DonHang as dh'), 'dh.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'dh.maKhachHang')
            ->select('dh.*', 'kh.tenKhachHang')->orderByDesc('dh.ngayMua')->limit(6)->get();
        $deliveries = $this->scope(DB::table('GiaoHang as gh'), 'gh.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->select('gh.*', 'kh.tenKhachHang')->orderByDesc('gh.ngayGiao')->limit(6)->get();
        $invoices = $this->invoiceQuery()->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'hd.maKhachHang')
            ->select('hd.*', 'kh.tenKhachHang')->orderByDesc('hd.ngayLap')->limit(6)->get();
        $receivables = $this->scope(DB::table('CongNo as cn'), 'cn.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->select('cn.*', 'kh.tenKhachHang')->where('cn.soTienConLai', '>', 0)->orderBy('cn.hanThanhToan')->limit(6)->get();
        foreach ([$orders, $deliveries, $invoices, $receivables] as $rows) {
            $rows->each(function ($row) {
                if (property_exists($row, 'tenKhachHang')) {
                    $row->tenKhachHang = $this->legacyText($row->tenKhachHang);
                }
            });
        }

        return $this->result(compact('summary', 'orders', 'deliveries', 'invoices', 'receivables'));
    }

    public function options()
    {
        return $this->result([
            'warehouses' => DB::table('Kho')->orderBy('tenKho')->get(),
            'staff' => DB::table('NhanVien')->select('maNV', 'hoTen')->orderBy('hoTen')->get(),
            'products' => DB::table('SanPham')->where('coGiaBan', true)->get()->each(function ($product) {
                $product->tenSanPham = $this->legacyText($product->tenSanPham);
            }),
        ]);
    }

    public function customers(Request $request)
    {
        $query = $this->scope(DB::table('KhachHang'), 'maKhachHang');
        if ($request->filled('keyword')) {
            $term = '%'.$request->string('keyword').'%';
            $query->where(fn ($q) => $q->where('maKhachHang', 'like', $term)->orWhere('tenKhachHang', 'like', $term)->orWhere('soDienThoai', 'like', $term));
        }

        $customers = $query->orderBy('tenKhachHang')->get()->each(function ($customer) {
            $customer->tenKhachHang = $this->legacyText($customer->tenKhachHang);
            $customer->diaChi = $this->legacyText($customer->diaChi);
        });

        return $this->result($customers);
    }

    public function customerDetail(string $id)
    {
        $customer = $this->customer($id);
        $customer->tenKhachHang = $this->legacyText($customer->tenKhachHang);
        $customer->diaChi = $this->legacyText($customer->diaChi);
        $customer->orders = DB::table('DonHang')->where('maKhachHang', $id)->orderByDesc('ngayMua')->get();
        $customer->tongCongNo = (float) DB::table('CongNo')->where('maKhachHang', $id)->sum('soTienConLai');

        return $this->result($customer);
    }

    public function saveCustomer(Request $request, ?string $id = null)
    {
        $rules = ['tenKhachHang' => 'required|string|max:100', 'soDienThoai' => 'nullable|string|max:15', 'diaChi' => 'required|string|max:255',
            'hanMucCongNo' => 'required|numeric|min:0|max:999999999999.99', 'maNhanVienPhuTrach' => 'nullable|exists:NhanVien,maNV', 'hoatDong' => 'sometimes|boolean'];
        // Identity, ownership and initial status are assigned by the server.
        if (! $id) {
            unset($rules['maNhanVienPhuTrach'], $rules['hoatDong']);
        }
        $data = $request->validate($rules);

        return DB::transaction(function () use ($data, $id) {
            $existing = $id ? $this->customer($id) : null;
            if (request()->user()->sales_role !== 'manager') {
                if ((float) $data['hanMucCongNo'] !== (float) ($existing->hanMucCongNo ?? 0)) {
                    abort(403, 'Cần quản lý phê duyệt thay đổi hạn mức công nợ.');
                }
            }
            if (! $id) {
                $data['maKhachHang'] = $this->code('KH');
                $data['maNhanVienPhuTrach'] = request()->user()->maNhanVien;
                $data['hoatDong'] = true;
                DB::table('KhachHang')->insert($data);
                $id = $data['maKhachHang'];
            } else {
                // Editing contact details must not change the assigned employee.
                unset($data['maNhanVienPhuTrach']);
                DB::table('KhachHang')->where('maKhachHang', $id)->update($data);
            }

            return $this->result(DB::table('KhachHang')->where('maKhachHang', $id)->first(), 'Đã lưu khách hàng.');
        });
    }

    public function deleteCustomer(string $id)
    {
        return DB::transaction(function () use ($id) {
            $this->customer($id);
            DB::table('KhachHang')->where('maKhachHang', $id)->update(['hoatDong' => false]);

            return $this->result(null, 'Đã vô hiệu hóa khách hàng; giữ lại lịch sử giao dịch.');
        });
    }

    public function inventory(Request $request)
    {
        $query = DB::table('TonKho as tk')->leftJoin('Kho as k', 'k.maKho', '=', 'tk.maKho')->join('SanPham as sp', 'sp.maSanPham', '=', 'tk.maSP')
            ->select('tk.*', 'k.tenKho', 'sp.tenSanPham')->orderBy('tk.maTonKho');
        if ($request->filled('maKho')) {
            $query->where('tk.maKho', $request->maKho);
        }
        $lots = $query->get();
        $reserved = $this->stock->reservations($lots->pluck('maTonKho')->all());
        foreach ($lots as $lot) {
            $lot->daGiu = (int) ($reserved[$lot->maTonKho] ?? 0);
            $eligible = $lot->maKho && (! $lot->hanSuDung || $lot->hanSuDung >= today()->toDateString()) && ! in_array($lot->trangThai, ['Hết hàng', 'Hết hạn', 'Cách ly', 'Khóa']);
            $lot->khaDung = $eligible ? max(0, $lot->soLuongTonHienTai - $lot->daGiu) : 0;
        }

        return $this->result($lots);
    }

    public function checkStock()
    {
        $products = DB::table('SanPham')->where('coGiaBan', true)->orderBy('tenSanPham')->get();
        $lots = $this->stock->lotsForAvailability($products->pluck('maSanPham')->all());
        $reserved = $this->stock->reservations($lots->pluck('maTonKho')->all());

        return $this->result($products->map(function ($product) use ($lots, $reserved) {
            $available = $lots->where('maSP', $product->maSanPham)->sum(fn ($lot) => max(0, $lot->soLuongTonHienTai - ($reserved[$lot->maTonKho] ?? 0)));

            return [
                'maSanPham' => $product->maSanPham,
                'tenSanPham' => $this->legacyText($product->tenSanPham),
                'giaBan' => (float) $product->donGia,
                'donViTinh' => $product->donViTinh,
                'tenLoaiSP' => 'Thành phẩm Vinamilk',
                'tonKho' => (int) $available,
                'trangThaiTon' => $available > 0 ? 'Còn hàng' : 'Hết hàng',
            ];
        }));
    }

    public function assignLot(Request $request, string $id)
    {
        $this->manager();
        $data = $request->validate(['maKho' => 'required|exists:Kho,maKho']);

        return DB::transaction(function () use ($data, $id) {
            $lot = DB::table('TonKho')->where('maTonKho', $id)->lockForUpdate()->first();
            abort_unless($lot && $lot->maSP, 404);
            if (($this->stock->reservations([$id])[$id] ?? 0) > 0) {
                SalesStock::fail('Lô đang được giữ cho phiếu xuất; không thể đổi kho.');
            }
            DB::table('TonKho')->where('maTonKho', $id)->update($data);

            return $this->result(null, 'Đã cập nhật kho của lô hàng.');
        });
    }

    public function orders(Request $request)
    {
        $query = $this->scope(DB::table('DonHang as dh'), 'dh.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'dh.maKhachHang')
            ->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'dh.maNhanVien')->select('dh.*', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'kh.diaChi as diaChiKH', 'nv.hoTen as tenNhanVien');
        if ($request->filled('keyword')) {
            $term = '%'.$request->string('keyword').'%';
            $query->where(fn ($q) => $q->where('dh.maDonHang', 'like', $term)->orWhere('kh.tenKhachHang', 'like', $term)->orWhere('dh.maKhachHang', 'like', $term));
        }
        if ($request->filled('status')) {
            $query->where('dh.trangThai', $request->status);
        }
        $orders = $query->orderByDesc('dh.ngayMua')->get();
        $items = DB::table('ChiTietDonHang')->whereIn('maDonHang', $orders->pluck('maDonHang'))->get()->groupBy('maDonHang');
        $dispatches = DB::table('PhieuXuatSP')->whereIn('maDonHang', $orders->pluck('maDonHang'))->get()->groupBy('maDonHang');
        foreach ($orders as $order) {
            $order->tenKhachHang = $this->legacyText($order->tenKhachHang);
            $order->diaChiKH = $this->legacyText($order->diaChiKH);
            $order->items = $items->get($order->maDonHang, collect())->values();
            $order->dispatches = $dispatches->get($order->maDonHang, collect())->values();
        }

        return $this->result($orders);
    }

    public function orderDetail(string $id)
    {
        $order = $this->order($id);
        $customer = DB::table('KhachHang')->where('maKhachHang', $order->maKhachHang)->first();
        $order->tenKhachHang = $this->legacyText($customer?->tenKhachHang);
        $order->soDienThoaiKH = $customer?->soDienThoai;
        $order->diaChiKH = $this->legacyText($customer?->diaChi);
        $order->items = DB::table('ChiTietDonHang as ct')->leftJoin('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
            ->where('ct.maDonHang', $id)->select('ct.*', 'sp.tenSanPham', 'sp.donViTinh')->get();
        $order->items->each(fn ($item) => $item->tenSanPham = $this->legacyText($item->tenSanPham));
        $order->dispatches = DB::table('PhieuXuatSP')->where('maDonHang', $id)->get();

        return $this->result($order);
    }

    public function createOrder(Request $request)
    {
        return $this->saveOrder($request);
    }

    public function updateOrder(Request $request, string $id)
    {
        return $this->saveOrder($request, $id);
    }

    private function saveOrder(Request $request, ?string $id = null)
    {
        $data = $request->validate([
            'maDonHang' => ['nullable', 'alpha_dash', 'max:20', Rule::unique('DonHang', 'maDonHang')->ignore($id, 'maDonHang')],
            'maKhachHang' => 'required|string|exists:KhachHang,maKhachHang', 'maKho' => 'nullable|exists:Kho,maKho',
            'items' => 'required|array|min:1|max:100', 'items.*.maSanPham' => 'required|string|distinct|exists:SanPham,maSanPham', 'items.*.soLuong' => 'required|integer|min:1|max:1000000',
        ], ['maKhachHang.required' => 'Vui lòng chọn khách hàng.', 'items.required' => 'Đơn hàng chưa có sản phẩm.', 'items.*.maSanPham.distinct' => 'Mỗi sản phẩm chỉ được xuất hiện một lần trong đơn.']);

        return DB::transaction(function () use ($data, $id) {
            $old = $id ? $this->order($id) : null;
            if ($old && ! in_array($old->trangThai, ['Chờ xác nhận', 'Chờ kho xác nhận'])) {
                SalesStock::fail('Chỉ được sửa đơn hàng đang chờ Kho xác nhận.');
            }
            if ($old) {
                $pendingDispatches = DB::table('PhieuXuatSP')->where('maDonHang', $id)->where('trangThai', '!=', 'Hoàn thành')->pluck('maPhieuXuatSP');
                DB::table('ChiTietPhieuXuatSP')->whereIn('maPhieuXuatSP', $pendingDispatches)->delete();
                DB::table('PhieuXuatSP')->whereIn('maPhieuXuatSP', $pendingDispatches)->delete();
            }
            $this->customer($data['maKhachHang'], true);
            $data['maKho'] ??= $this->stock->chooseWarehouse($data['items'], $old?->maKho);
            $allocation = $this->stock->allocate($data['maKho'], $data['items']);
            $products = DB::table('SanPham')->whereIn('maSanPham', array_column($data['items'], 'maSanPham'))->get()->keyBy('maSanPham');
            $id ??= $data['maDonHang'] ?? $this->code('DH');
            $totalCents = 0;
            $rows = [];
            foreach ($data['items'] as $item) {
                $product = $products[$item['maSanPham']];
                if (! $product->coGiaBan) {
                    SalesStock::fail("Sản phẩm {$product->maSanPham} chưa có giá bán hoặc đã ngừng kinh doanh.");
                }
                $price = $old ? DB::table('ChiTietDonHang')->where('maDonHang', $id)->where('maSanPham', $item['maSanPham'])->value('donGia') : null;
                $cents = (int) round((float) ($price ?? $product->donGia) * 100);
                $lineCents = $cents * $item['soLuong'];
                $totalCents += $lineCents;
                $rows[] = ['maDonHang' => $id, 'maSanPham' => $item['maSanPham'], 'soLuong' => $item['soLuong'], 'donGia' => $cents / 100, 'thanhTien' => $lineCents / 100];
            }
            if ($totalCents > 99999999999999) {
                SalesStock::fail('Tổng tiền đơn hàng vượt giới hạn cho phép.');
            }
            $order = ['maKhachHang' => $data['maKhachHang'], 'maKho' => $data['maKho'], 'tongTien' => $totalCents / 100, 'thanhTien' => $totalCents / 100];
            $order['maNhanVien'] = $old ? $old->maNhanVien : request()->user()->maNhanVien;
            if ($old) {
                DB::table('DonHang')->where('maDonHang', $id)->update($order);
                DB::table('ChiTietDonHang')->where('maDonHang', $id)->delete();
            } else {
                DB::table('DonHang')->insert($order + ['maDonHang' => $id, 'ngayMua' => now(), 'trangThai' => 'Chờ kho xác nhận']);
            }
            DB::table('ChiTietDonHang')->insert($rows);
            $dispatchId = $this->code('PX');
            DB::table('PhieuXuatSP')->insert([
                'maPhieuXuatSP' => $dispatchId,
                'maKhachHang' => $data['maKhachHang'],
                'maDonHang' => $id,
                'maNVTao' => request()->user()?->maNhanVien,
                'ngayXuat' => today(),
                'trangThai' => 'Chờ duyệt',
                'ghiChu' => 'Yêu cầu Kho xác nhận đơn hàng '.$id,
            ]);
            DB::table('ChiTietPhieuXuatSP')->insert(array_map(fn ($row) => $row + ['maPhieuXuatSP' => $dispatchId], $allocation));
            $this->syncAutomaticInvoice($id, $data['maKhachHang'], $totalCents / 100);

            return $this->result(
                DB::table('DonHang')->where('maDonHang', $id)->first(),
                $old ? 'Đã kiểm tra tồn kho, cập nhật đơn và hóa đơn tự động.' : 'Đã kiểm tra tồn kho, tạo hóa đơn và gửi đơn sang Kho xác nhận.',
                $old ? 200 : 201
            );
        }, 3);
    }

    public function updateOrderStatus(Request $request, string $id)
    {
        $data = $request->validate(['trangThai' => ['required', Rule::in(['Đã hủy'])]]);

        return DB::transaction(function () use ($data, $id) {
            $order = $this->order($id);
            $this->checkRemoval($order);
            DB::table('PhieuXuatSP')->where('maDonHang', $id)->where('trangThai', '!=', 'Hoàn thành')->update(['trangThai' => 'Đã hủy']);
            $this->deleteAutomaticInvoice($id);
            DB::table('DonHang')->where('maDonHang', $id)->update($data);

            return $this->result(null, 'Đã cập nhật đơn hàng.');
        }, 3);
    }

    private function checkRemoval($order): void
    {
        if (! in_array($order->trangThai, ['Chờ xác nhận', 'Chờ kho xác nhận', 'Đã xác nhận', 'Đã hủy'])
            || DB::table('GiaoHang')->where('maDonHang', $order->maDonHang)->exists()
            || DB::table('PhieuXuatSP')->where('maDonHang', $order->maDonHang)->where('trangThai', 'Hoàn thành')->exists()) {
            SalesStock::fail('Không thể xóa hoặc hủy đơn đã xuất kho, giao hàng hoặc phát sinh hóa đơn/thanh toán.');
        }
    }

    public function deleteOrder(string $id)
    {
        return DB::transaction(function () use ($id) {
            $order = $this->order($id);
            $this->checkRemoval($order);
            $dispatches = DB::table('PhieuXuatSP')->where('maDonHang', $id)->pluck('maPhieuXuatSP');
            $this->deleteAutomaticInvoice($id);
            DB::table('ChiTietPhieuXuatSP')->whereIn('maPhieuXuatSP', $dispatches)->delete();
            DB::table('PhieuXuatSP')->where('maDonHang', $id)->delete();
            DB::table('ChiTietDonHang')->where('maDonHang', $id)->delete();
            DB::table('DonHang')->where('maDonHang', $id)->delete();

            return $this->result(null, 'Xóa đơn hàng thành công');
        });
    }

    public function completeDispatch(string $id)
    {
        $this->manager();

        return $this->result($this->stock->complete($id), 'Kho đã xác nhận xuất hàng; đơn hàng đã được xác nhận và yêu cầu giao hàng đã được tạo.');
    }

    public function deliveries()
    {
        $deliveries = $this->scope(DB::table('GiaoHang as gh'), 'gh.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'gh.maNhanVien')
            ->select('gh.*', 'gh.maPhieuXuat as maPhieuXuatSP', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'dh.thanhTien', 'nv.hoTen as tenNhanVienGiao')
            ->orderByDesc('gh.ngayGiao')->get();
        $deliveries->each(function ($delivery) {
            $delivery->tenKhachHang = $this->legacyText($delivery->tenKhachHang);
            $delivery->diaChiGiao = $this->legacyText($delivery->diaChiGiao);
            $delivery->tenNhanVienGiao = $this->legacyText($delivery->tenNhanVienGiao);
        });

        return $this->result($deliveries);
    }

    public function deliveryDetail(string $id)
    {
        $delivery = $this->scope(DB::table('GiaoHang as gh'), 'gh.maKhachHang')->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'gh.maNhanVien')
            ->where('gh.maGiaoHang', $id)->select('gh.*', 'gh.maPhieuXuat as maPhieuXuatSP', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'dh.thanhTien', 'nv.hoTen as tenNhanVienGiao')->first();
        abort_unless($delivery, 404);
        $delivery->tenKhachHang = $this->legacyText($delivery->tenKhachHang);
        $delivery->diaChiGiao = $this->legacyText($delivery->diaChiGiao);
        $delivery->tenNhanVienGiao = $this->legacyText($delivery->tenNhanVienGiao);
        $delivery->items = DB::table('ChiTietDonHang as ct')->leftJoin('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
            ->where('ct.maDonHang', $delivery->maDonHang)->select('ct.*', 'sp.tenSanPham')->get();
        $delivery->items->each(fn ($item) => $item->tenSanPham = $this->legacyText($item->tenSanPham));

        return $this->result($delivery);
    }

    private function syncAutomaticInvoice(string $orderId, string $customerId, float $total): void
    {
        $invoice = DB::table('HoaDon')->where('maDonHang', $orderId)->lockForUpdate()->first();
        if (! $invoice) {
            $invoiceId = $this->code('HD');
            DB::table('HoaDon')->insert(['maHoaDon' => $invoiceId, 'ngayLap' => now(), 'tongTien' => $total, 'maGiaoHang' => null, 'maDonHang' => $orderId, 'maKhachHang' => $customerId]);
            DB::table('CongNo')->insert(['maCongNo' => $this->code('CN'), 'maHoaDon' => $invoiceId, 'maKhachHang' => $customerId, 'soTienNo' => $total, 'soTienDaTra' => 0, 'soTienConLai' => $total, 'hanThanhToan' => today()->addDays(30), 'trangThai' => 'Còn nợ']);

            return;
        }
        $debt = DB::table('CongNo')->where('maHoaDon', $invoice->maHoaDon)->lockForUpdate()->first();
        if ($debt && (float) $debt->soTienDaTra > $total) {
            SalesStock::fail('Không thể giảm giá trị đơn thấp hơn số tiền khách hàng đã thanh toán.');
        }
        DB::table('HoaDon')->where('maHoaDon', $invoice->maHoaDon)->update(['tongTien' => $total, 'maKhachHang' => $customerId]);
        if ($debt) {
            DB::table('CongNo')->where('maCongNo', $debt->maCongNo)->update(['maKhachHang' => $customerId, 'soTienNo' => $total, 'soTienConLai' => $total - $debt->soTienDaTra, 'trangThai' => $total == $debt->soTienDaTra ? 'Đã tất toán' : 'Còn nợ']);
        }
    }

    private function deleteAutomaticInvoice(string $orderId): void
    {
        $invoiceIds = DB::table('HoaDon')->where('maDonHang', $orderId)->pluck('maHoaDon');
        $debtIds = DB::table('CongNo')->whereIn('maHoaDon', $invoiceIds)->pluck('maCongNo');
        DB::table('ThanhToan')->whereIn('maCongNo', $debtIds)->delete();
        DB::table('CongNo')->whereIn('maHoaDon', $invoiceIds)->delete();
        DB::table('HoaDon')->whereIn('maHoaDon', $invoiceIds)->delete();
    }

    public function createDelivery(Request $request)
    {
        $data = $request->validate(['maDonHang' => 'required|exists:DonHang,maDonHang', 'maPhieuXuat' => 'required|exists:PhieuXuatSP,maPhieuXuatSP', 'maNhanVien' => 'required|exists:NhanVien,maNV', 'diaChiGiao' => 'required|string|max:255', 'ngayGiao' => 'required|date']);

        return DB::transaction(function () use ($data) {
            $order = $this->order($data['maDonHang']);
            if (! in_array($order->trangThai, ['Đã xác nhận', 'Đang giao'])) {
                SalesStock::fail('Đơn hàng chưa được xác nhận hoặc đã kết thúc.');
            }
            $dispatch = DB::table('PhieuXuatSP')->where('maPhieuXuatSP', $data['maPhieuXuat'])->first();
            if ($dispatch->maDonHang !== $order->maDonHang || $dispatch->maKhachHang !== $order->maKhachHang || $dispatch->trangThai !== 'Hoàn thành') {
                SalesStock::fail('Chọn phiếu xuất đã hoàn tất của đúng đơn hàng và khách hàng.');
            }
            if (DB::table('GiaoHang')->where('maPhieuXuat', $data['maPhieuXuat'])->exists()) {
                SalesStock::fail('Phiếu xuất đã được sử dụng cho một yêu cầu giao hàng.');
            }
            $data += ['maGiaoHang' => $this->code('GH'), 'maKhachHang' => $order->maKhachHang, 'trangThai' => 'Chờ giao'];
            DB::table('GiaoHang')->insert($data);

            return $this->result($data, 'Đã tạo yêu cầu giao hàng.', 201);
        });
    }

    public function updateDeliveryStatus(Request $request, string $id)
    {
        $data = $request->validate(['trangThai' => ['required', Rule::in(['Đang giao', 'Đã giao', 'Giao thất bại'])]]);

        return DB::transaction(function () use ($id, $data) {
            $delivery = DB::table('GiaoHang')->where('maGiaoHang', $id)->first();
            abort_unless($delivery, 404);
            $this->order($delivery->maDonHang);
            $delivery = DB::table('GiaoHang')->where('maGiaoHang', $id)->lockForUpdate()->first();
            $allowed = ['Chờ giao' => ['Đang giao'], 'Đang giao' => ['Đã giao', 'Giao thất bại'], 'Đang giao hàng' => ['Đã giao', 'Giao thất bại'], 'Giao thất bại' => ['Đang giao']];
            if (! in_array($data['trangThai'], $allowed[$delivery->trangThai] ?? [])) {
                SalesStock::fail('Không thể chuyển sang trạng thái giao hàng này.');
            }
            if ($data['trangThai'] === 'Giao thất bại') {
                $replacement = $this->stock->availableDriver($delivery->maNhanVien);
                DB::table('GiaoHang')->where('maGiaoHang', $id)->update([
                    'maNhanVien' => $replacement,
                    'trangThai' => $replacement ? 'Chờ giao' : 'Chờ phân công',
                ]);
                DB::table('DonHang')->where('maDonHang', $delivery->maDonHang)->update(['trangThai' => 'Đã xác nhận']);

                return $this->result(null, $replacement ? 'Đã chuyển đơn cho nhân viên giao hàng khác.' : 'Chưa có nhân viên rảnh; đơn đã chuyển vào hàng chờ.');
            }
            DB::table('GiaoHang')->where('maGiaoHang', $id)->update($data);
            if ($data['trangThai'] === 'Đã giao' && $delivery->maNhanVien) {
                $this->stock->assignQueuedDelivery($delivery->maNhanVien);
            }
            $delivered = DB::table('GiaoHang as gh')->join('ChiTietPhieuXuatSP as ct', 'ct.maPhieuXuatSP', '=', 'gh.maPhieuXuat')
                ->join('TonKho as tk', 'tk.maTonKho', '=', 'ct.maTonKho')->where('gh.maDonHang', $delivery->maDonHang)
                ->whereIn('gh.trangThai', ['Đã giao', 'Đã giao thành công'])->groupBy('tk.maSP')
                ->selectRaw('tk.maSP, SUM(ct.soLuong) as quantity')->pluck('quantity', 'maSP');
            $allDelivered = DB::table('ChiTietDonHang')->where('maDonHang', $delivery->maDonHang)->get()
                ->every(fn ($item) => ($delivered[$item->maSanPham] ?? 0) >= $item->soLuong);
            DB::table('DonHang')->where('maDonHang', $delivery->maDonHang)->update(['trangThai' => $allDelivered ? 'Đã giao hàng' : 'Đang giao']);

            return $this->result(null, 'Đã cập nhật giao hàng.');
        });
    }

    public function prices()
    {
        $products = DB::table('SanPham')->select('*', 'donGia as giaBan', DB::raw("'Thành phẩm Vinamilk' as tenLoaiSP"))->orderBy('tenSanPham')->get();
        $products->each(fn ($product) => $product->tenSanPham = $this->legacyText($product->tenSanPham));

        return $this->result($products);
    }

    public function savePrice(Request $request, string $id)
    {
        $this->manager();
        $data = $request->validate(['donGia' => 'required|numeric|min:0|max:999999999.99|decimal:0,2']);
        abort_unless(DB::table('SanPham')->where('maSanPham', $id)->exists(), 404);
        DB::table('SanPham')->where('maSanPham', $id)->update($data + ['coGiaBan' => true]);

        return $this->result(null, 'Đã lưu giá bán. Đơn hàng đã lập giữ nguyên đơn giá.');
    }

    public function deletePrice(string $id)
    {
        $this->manager();
        abort_unless(DB::table('SanPham')->where('maSanPham', $id)->exists(), 404);
        DB::table('SanPham')->where('maSanPham', $id)->update(['coGiaBan' => false]);

        return $this->result(null, 'Đã gỡ giá bán; sản phẩm không được chọn cho đơn mới.');
    }
}
