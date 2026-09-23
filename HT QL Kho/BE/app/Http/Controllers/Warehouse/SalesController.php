<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use App\Models\PhieuXuatSP;
use App\Models\ChiTietPhieuXuatSP;
use App\Models\DonHang;
use App\Models\ChiTietDonHang;
use App\Models\KhachHang;
use App\Models\SanPham;
use App\Models\TonKho;
use App\Models\GiaoHang;
use App\Models\HoaDon;
use App\Models\CongNo;
use App\Models\ThanhToan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    /**
     * 1. Dashboard tổng quan Phân Hệ Bán Hàng
     */
    public function dashboard()
    {
        $totalRevenue = (float) DB::table('DonHang')
            ->whereIn('trangThai', ['Đã xác nhận', 'Đang giao', 'Hoàn tất', 'Đã giao'])
            ->sum('thanhTien');

        $summary = [
            'orders' => (int) DB::table('DonHang')->count(),
            'pendingOrders' => (int) DB::table('DonHang')->where('trangThai', 'Chờ xác nhận')->count(),
            'completedOrders' => (int) DB::table('DonHang')->whereIn('trangThai', ['Hoàn tất', 'Đã giao'])->count(),
            'customers' => (int) DB::table('KhachHang')->count(),
            'deliveries' => (int) DB::table('GiaoHang')->count(),
            'activeDeliveries' => (int) DB::table('GiaoHang')->where('trangThai', 'Đang giao')->count(),
            'invoices' => (int) DB::table('HoaDon')->count(),
            'totalRevenue' => $totalRevenue,
            'receivables' => (float) DB::table('CongNo')->where('trangThai', '!=', 'Đã tất toán')->sum('soTienConLai'),
        ];

        // Đơn hàng gần nhất
        $orders = DB::table('DonHang as dh')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'dh.maKhachHang')
            ->select(
                'dh.maDonHang',
                'dh.ngayMua',
                'dh.tongTien',
                'dh.thanhTien',
                'dh.trangThai',
                'kh.tenKhachHang',
                'kh.maKhachHang'
            )
            ->orderByDesc('dh.ngayMua')
            ->limit(6)
            ->get();

        // Giao hàng gần nhất
        $deliveries = DB::table('GiaoHang as gh')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->select(
                'gh.maGiaoHang',
                'gh.ngayGiao',
                'gh.trangThai',
                'gh.diaChiGiao',
                'kh.tenKhachHang',
                'dh.maDonHang'
            )
            ->orderByDesc('gh.ngayGiao')
            ->limit(6)
            ->get();

        // Hóa đơn gần nhất
        $invoices = DB::table('HoaDon as hd')
            ->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->select(
                'hd.maHoaDon',
                'hd.ngayLap',
                'hd.tongTien',
                'gh.maGiaoHang',
                'dh.maDonHang',
                'kh.tenKhachHang'
            )
            ->orderByDesc('hd.ngayLap')
            ->limit(6)
            ->get();

        // Công nợ cần thu
        $receivables = DB::table('CongNo as cn')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')
            ->select(
                'cn.maCongNo',
                'cn.soTienNo',
                'cn.soTienDaTra',
                'cn.soTienConLai',
                'cn.hanThanhToan',
                'cn.trangThai',
                'kh.tenKhachHang',
                'kh.soDienThoai',
                'hd.maHoaDon'
            )
            ->where('cn.trangThai', '!=', 'Đã tất toán')
            ->orderBy('cn.hanThanhToan')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'orders' => $orders,
                'deliveries' => $deliveries,
                'invoices' => $invoices,
                'receivables' => $receivables,
            ],
        ]);
    }

    /**
     * 2. Kiểm tra tồn kho thời gian thực của các sản phẩm (SA-BR01)
     */
    public function checkStock(Request $request = null)
    {
        $request = $request ?? request();
        $products = DB::table('SanPham as sp')
            ->select(
                'sp.maSanPham',
                'sp.tenSanPham',
                'sp.donGia as giaBan',
                'sp.donViTinh',
                'sp.trangThai'
            )
            ->get();

        // Lấy tồn kho hiện tại từ TonKho
        $stockMap = DB::table('TonKho')
            ->where('trangThai', '!=', 'Hết hàng')
            ->groupBy('maSanPham')
            ->select('maSanPham', DB::raw('SUM(soLuongTonHienTai) as tonKho'))
            ->pluck('tonKho', 'maSanPham');

        $result = $products->map(function ($p) use ($stockMap) {
            $ton = (int) ($stockMap[$p->maSanPham] ?? 0);
            return [
                'maSanPham' => $p->maSanPham,
                'tenSanPham' => $p->tenSanPham,
                'giaBan' => (float) $p->giaBan,
                'donViTinh' => $p->donViTinh ?? 'Hộp',
                'quyCach' => $p->donViTinh ?? 'Thùng',
                'tenLoaiSP' => 'Thành phẩm Vinamilk',
                'tonKho' => $ton,
                'trangThaiTon' => $ton > 0 ? 'Còn hàng' : 'Hết hàng',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * 3. Quản lý Đơn hàng: Danh sách đơn hàng (SA-FR02)
     */
    public function orders(Request $request = null)
    {
        $request = $request ?? request();
        $query = DB::table('DonHang as dh')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'dh.maKhachHang')
            ->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'dh.maNhanVien')
            ->select(
                'dh.maDonHang',
                'dh.ngayMua',
                'dh.tongTien',
                'dh.thanhTien',
                'dh.trangThai',
                'dh.maKhachHang',
                'dh.maNhanVien',
                'kh.tenKhachHang',
                'kh.soDienThoai as soDienThoaiKH',
                'kh.diaChi as diaChiKH',
                'nv.hoTen as tenNhanVien'
            );

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('dh.maDonHang', 'like', "%{$kw}%")
                  ->orWhere('kh.tenKhachHang', 'like', "%{$kw}%")
                  ->orWhere('kh.soDienThoai', 'like', "%{$kw}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('dh.trangThai', $request->input('status'));
        }

        if ($request->filled('from_date')) {
            $query->whereDate('dh.ngayMua', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('dh.ngayMua', '<=', $request->input('to_date'));
        }

        $orders = $query->orderByDesc('dh.ngayMua')->get();
        $orderIds = $orders->pluck('maDonHang');

        $items = DB::table('ChiTietDonHang as ct')
            ->leftJoin('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
            ->whereIn('ct.maDonHang', $orderIds)
            ->select(
                'ct.maDonHang',
                'ct.maSanPham',
                'sp.tenSanPham',
                'sp.donViTinh',
                'ct.soLuong',
                'ct.donGia',
                'ct.thanhTien'
            )
            ->get()
            ->groupBy('maDonHang');

        // Kiểm tra xem đơn hàng đã có phiếu giao hàng hay hóa đơn chưa
        $deliveryOrders = DB::table('GiaoHang')->whereIn('maDonHang', $orderIds)->pluck('maDonHang')->toArray();

        $orders->each(function ($order) use ($items, $deliveryOrders) {
            $order->items = $items->get($order->maDonHang, collect())->values();
            $order->hasDelivery = in_array($order->maDonHang, $deliveryOrders);
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Chi tiết 1 đơn hàng
     */
    public function orderDetail($id)
    {
        $order = DB::table('DonHang as dh')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'dh.maKhachHang')
            ->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'dh.maNhanVien')
            ->where('dh.maDonHang', $id)
            ->select(
                'dh.*',
                'kh.tenKhachHang',
                'kh.soDienThoai as soDienThoaiKH',
                'kh.diaChi as diaChiKH',
                'kh.hanMucCongNo',
                'nv.hoTen as tenNhanVien'
            )
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng: ' . $id,
            ], 404);
        }

        $items = DB::table('ChiTietDonHang as ct')
            ->leftJoin('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
            ->where('ct.maDonHang', $id)
            ->select(
                'ct.maDonHang',
                'ct.maSanPham',
                'sp.tenSanPham',
                'sp.donViTinh',
                'ct.soLuong',
                'ct.donGia',
                'ct.thanhTien'
            )
            ->get();

        $deliveries = DB::table('GiaoHang as gh')
            ->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'gh.maNV')
            ->where('gh.maDonHang', $id)
            ->select('gh.*', 'nv.hoTen as tenNhanVienGiao')
            ->get();

        $order->items = $items;
        $order->deliveries = $deliveries;

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Tạo mới đơn hàng (SA-FR02 & SA-BR01)
     */
    public function createOrder(Request $request)
    {
        $validated = $request->validate([
            'maDonHang' => 'required|string|unique:DonHang,maDonHang',
            'maKhachHang' => 'required|string|exists:KhachHang,maKhachHang',
            'maNhanVien' => 'nullable|string',
            'ngayMua' => 'nullable|date',
            'trangThai' => 'nullable|string|max:30',
            'items' => 'required|array|min:1',
            'items.*.maSanPham' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.donGia' => 'required|numeric|min:0',
        ]);

        $khachHang = KhachHang::where('maKhachHang', $validated['maKhachHang'])->first();
        if (!$khachHang) {
            return response()->json([
                'success' => false,
                'message' => 'Chưa nhập thông tin khách hàng. Vui lòng chọn khách hàng hợp lệ.',
            ], 422);
        }

        $totalAmount = 0;
        $stockCheckErrors = [];

        // Kiểm tra tồn kho thành phẩm (SA-BR01)
        foreach ($validated['items'] as $item) {
            $product = SanPham::where('maSanPham', $item['maSanPham'])->first();
            $availableStock = (int) TonKho::where('maSanPham', $item['maSanPham'])
                ->where('trangThai', '!=', 'Hết hàng')
                ->sum('soLuongTonHienTai');

            if ($availableStock < $item['soLuong']) {
                $stockCheckErrors[] = "Sản phẩm {$product->tenSanPham} ({$product->maSanPham}) không đủ tồn kho. Tồn kho khả dụng: {$availableStock}, số lượng đặt: {$item['soLuong']}.";
            }

            $lineTotal = $item['soLuong'] * $item['donGia'];
            $totalAmount += $lineTotal;
        }

        if (!empty($stockCheckErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Kho không đáp ứng đủ số lượng sản phẩm đặt. Vui lòng điều chỉnh số lượng.',
                'errors' => $stockCheckErrors,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order = DonHang::create([
                'maDonHang' => $validated['maDonHang'],
                'ngayMua' => Carbon::parse($validated['ngayMua'] ?? now())->format('Y-m-d H:i:s'),
                'tongTien' => $totalAmount,
                'thanhTien' => $totalAmount,
                'trangThai' => $validated['trangThai'] ?? 'Chờ xác nhận',
                'maKhachHang' => $validated['maKhachHang'],
                'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
            ]);

            foreach ($validated['items'] as $item) {
                ChiTietDonHang::create([
                    'maDonHang' => $order->maDonHang,
                    'maSanPham' => $item['maSanPham'],
                    'soLuong' => $item['soLuong'],
                    'donGia' => $item['donGia'],
                    'thanhTien' => $item['soLuong'] * $item['donGia'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Thêm đơn hàng thành công',
                'data' => $order->load('chiTiet'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sửa đơn hàng (SA-FR02)
     */
    public function updateOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'maKhachHang' => 'required|string|exists:KhachHang,maKhachHang',
            'items' => 'required|array|min:1',
            'items.*.maSanPham' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.donGia' => 'required|numeric|min:0',
        ]);

        $order = DonHang::where('maDonHang', $id)->firstOrFail();
        if ($order->trangThai !== 'Chờ xác nhận') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ đơn hàng đang ở trạng thái "Chờ xác nhận" mới được phép chỉnh sửa.',
            ], 422);
        }

        $totalAmount = 0;
        $stockCheckErrors = [];

        foreach ($validated['items'] as $item) {
            $product = SanPham::where('maSanPham', $item['maSanPham'])->first();
            $availableStock = (int) TonKho::where('maSanPham', $item['maSanPham'])
                ->where('trangThai', '!=', 'Hết hàng')
                ->sum('soLuongTonHienTai');

            if ($availableStock < $item['soLuong']) {
                $stockCheckErrors[] = "Sản phẩm {$product->tenSanPham} ({$product->maSanPham}) không đủ tồn kho. Tồn kho khả dụng: {$availableStock}, số lượng đặt: {$item['soLuong']}.";
            }

            $totalAmount += $item['soLuong'] * $item['donGia'];
        }

        if (!empty($stockCheckErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Kho không đáp ứng đủ số lượng. Vui lòng điều chỉnh lại.',
                'errors' => $stockCheckErrors,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order->update([
                'maKhachHang' => $validated['maKhachHang'],
                'tongTien' => $totalAmount,
                'thanhTien' => $totalAmount,
            ]);

            ChiTietDonHang::where('maDonHang', $order->maDonHang)->delete();
            foreach ($validated['items'] as $item) {
                ChiTietDonHang::create([
                    'maDonHang' => $order->maDonHang,
                    'maSanPham' => $item['maSanPham'],
                    'soLuong' => $item['soLuong'],
                    'donGia' => $item['donGia'],
                    'thanhTien' => $item['soLuong'] * $item['donGia'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sửa đơn hàng thành công',
                'data' => $order->fresh()->load('chiTiet'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa đơn hàng (SA-FR02 & Ràng buộc: chưa giao/hoàn tất và chưa thanh toán)
     */
    public function deleteOrder($id)
    {
        $order = DonHang::where('maDonHang', $id)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng.'], 404);
        }

        // Kiểm tra ràng buộc giao hàng
        $hasDelivery = DB::table('GiaoHang')
            ->where('maDonHang', $id)
            ->whereIn('trangThai', ['Đang giao', 'Đã giao'])
            ->exists();

        if ($hasDelivery || in_array($order->trangThai, ['Đang giao', 'Hoàn tất', 'Đã giao'])) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng đã giao hoặc đang giao. Không thể xóa đơn hàng!',
            ], 422);
        }

        // Kiểm tra ràng buộc thanh toán / hóa đơn
        $hasInvoice = DB::table('HoaDon as hd')
            ->join('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->where('gh.maDonHang', $id)
            ->exists();

        if ($hasInvoice) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng đã phát sinh hóa đơn/thanh toán. Không thể xóa đơn hàng đã thanh toán!',
            ], 422);
        }

        DB::beginTransaction();
        try {
            ChiTietDonHang::where('maDonHang', $id)->delete();
            DB::table('GiaoHang')->where('maDonHang', $id)->delete();
            $order->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa đơn hàng thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (Xác nhận, Hủy,...)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'trangThai' => 'required|string|max:30',
        ]);

        $order = DonHang::where('maDonHang', $id)->firstOrFail();

        // Nếu chuyển sang "Đã xác nhận", kiểm tra tồn kho một lần nữa (SA-BR01)
        if ($validated['trangThai'] === 'Đã xác nhận') {
            $items = ChiTietDonHang::where('maDonHang', $id)->get();
            $stockErrors = [];
            foreach ($items as $item) {
                $stock = (int) TonKho::where('maSanPham', $item->maSanPham)
                    ->where('trangThai', '!=', 'Hết hàng')
                    ->sum('soLuongTonHienTai');
                if ($stock < $item->soLuong) {
                    $stockErrors[] = "Sản phẩm {$item->maSanPham} không đủ tồn kho (cần: {$item->soLuong}, có: {$stock})";
                }
            }
            if (!empty($stockErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng chỉ được xác nhận khi số lượng tồn kho đủ đáp ứng.',
                    'errors' => $stockErrors,
                ], 422);
            }

            // Tự động sinh phiếu xuất kho PhieuXuatSP (Flow 7 & DT05) nếu chưa có
            $existingPX = PhieuXuatSP::where('maDonHang', $id)->first();
            if (!$existingPX) {
                $prefix = 'PX' . date('ym');
                $randSuffix = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $newMaPX = $prefix . $randSuffix;
                while (PhieuXuatSP::where('maPhieuXuatSP', $newMaPX)->exists()) {
                    $randSuffix = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
                    $newMaPX = $prefix . $randSuffix;
                }

                PhieuXuatSP::create([
                    'maPhieuXuatSP' => $newMaPX,
                    'maKhachHang'   => $order->maKhachHang,
                    'maNVTao'       => 'NV003',
                    'ngayXuat'      => now(),
                    'trangThai'     => 'Chờ xuất',
                    'ghiChu'        => "Xuất kho tự động từ đơn hàng {$order->maDonHang}",
                    'maDonHang'     => $order->maDonHang,
                ]);

                foreach ($items as $item) {
                    $lot = TonKho::where('maSanPham', $item->maSanPham)
                        ->where('soLuongTonHienTai', '>', 0)
                        ->orderBy('hanSuDung', 'asc')
                        ->first();
                    if ($lot) {
                        ChiTietPhieuXuatSP::create([
                            'maPhieuXuatSP' => $newMaPX,
                            'maTonKho'      => $lot->maTonKho,
                            'soLuong'       => $item->soLuong,
                            'ghiChu'        => "Xuất tự động cho {$item->maSanPham}",
                        ]);
                    }
                }
            }
        }

        $order->update(['trangThai' => $validated['trangThai']]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'data' => $order,
        ]);
    }

    /**
     * 4. Quản lý Khách Hàng / Nhà Phân Phối (SA-FR01)
     */
    public function customers(Request $request = null)
    {
        $request = $request ?? request();
        $query = DB::table('KhachHang as kh')
            ->select('kh.*');

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('kh.maKhachHang', 'like', "%{$kw}%")
                  ->orWhere('kh.tenKhachHang', 'like', "%{$kw}%")
                  ->orWhere('kh.soDienThoai', 'like', "%{$kw}%")
                  ->orWhere('kh.diaChi', 'like', "%{$kw}%");
            });
        }

        $customers = $query->orderBy('kh.tenKhachHang')->get();

        // Tính công nợ hiện tại của từng khách hàng
        $custIds = $customers->pluck('maKhachHang');
        $debts = DB::table('CongNo')
            ->whereIn('maKhachHang', $custIds)
            ->where('trangThai', '!=', 'Đã tất toán')
            ->groupBy('maKhachHang')
            ->select('maKhachHang', DB::raw('SUM(soTienConLai) as tongNoHienTai'))
            ->pluck('tongNoHienTai', 'maKhachHang');

        $customers->each(function ($c) use ($debts) {
            $c->tongNoHienTai = (float) ($debts[$c->maKhachHang] ?? 0);
            $c->hanMucConLai = max(0, (float) $c->hanMucCongNo - $c->tongNoHienTai);
        });

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    public function customerDetail($id)
    {
        $customer = DB::table('KhachHang')->where('maKhachHang', $id)->first();
        if (!$customer) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khách hàng.'], 404);
        }

        $orders = DB::table('DonHang')->where('maKhachHang', $id)->orderByDesc('ngayMua')->limit(10)->get();
        $debts = DB::table('CongNo')->where('maKhachHang', $id)->orderByDesc('hanThanhToan')->get();

        $tongNo = (float) DB::table('CongNo')
            ->where('maKhachHang', $id)
            ->where('trangThai', '!=', 'Đã tất toán')
            ->sum('soTienConLai');

        $customer->tongNoHienTai = $tongNo;
        $customer->hanMucConLai = max(0, (float) $customer->hanMucCongNo - $tongNo);
        $customer->recentOrders = $orders;
        $customer->recentDebts = $debts;

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    public function storeCustomer(Request $request)
    {
        $validated = $request->validate([
            'maKhachHang' => 'required|string|max:20|unique:KhachHang,maKhachHang',
            'tenKhachHang' => 'required|string|max:100',
            'soDienThoai' => 'nullable|string|max:15',
            'diaChi' => 'nullable|string|max:255',
            'hanMucCongNo' => 'nullable|numeric|min:0',
        ]);

        $customer = KhachHang::create([
            'maKhachHang' => $validated['maKhachHang'],
            'tenKhachHang' => $validated['tenKhachHang'],
            'soDienThoai' => $validated['soDienThoai'] ?? null,
            'diaChi' => $validated['diaChi'] ?? null,
            'hanMucCongNo' => $validated['hanMucCongNo'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm khách hàng thành công',
            'data' => $customer,
        ], 201);
    }

    public function updateCustomer(Request $request, $id)
    {
        $customer = KhachHang::where('maKhachHang', $id)->firstOrFail();

        $validated = $request->validate([
            'tenKhachHang' => 'required|string|max:100',
            'soDienThoai' => 'nullable|string|max:15',
            'diaChi' => 'nullable|string|max:255',
            'hanMucCongNo' => 'nullable|numeric|min:0',
        ]);

        $customer->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin khách hàng thành công',
            'data' => $customer,
        ]);
    }

    public function deleteCustomer($id)
    {
        $customer = KhachHang::where('maKhachHang', $id)->firstOrFail();

        // Kiểm tra xem khách hàng có đơn hàng hoặc công nợ chưa trả
        $hasOrders = DB::table('DonHang')->where('maKhachHang', $id)->exists();
        $hasUnpaidDebts = DB::table('CongNo')->where('maKhachHang', $id)->where('trangThai', '!=', 'Đã tất toán')->exists();

        if ($hasUnpaidDebts) {
            return response()->json([
                'success' => false,
                'message' => 'Khách hàng này hiện còn công nợ chưa tất toán, không thể xóa!',
            ], 422);
        }

        if ($hasOrders) {
            return response()->json([
                'success' => false,
                'message' => 'Khách hàng đã có lịch sử đơn hàng trong hệ thống. Để bảo đảm toàn vẹn dữ liệu, không thể xóa vĩnh viễn.',
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa khách hàng thành công',
        ]);
    }

    /**
     * 5. Quản lý Giao Hàng (SA-FR04)
     */
    public function deliveries(Request $request = null)
    {
        $request = $request ?? request();
        $query = DB::table('GiaoHang as gh')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'gh.maNV')
            ->leftJoin('PhieuXuatSP as px', 'px.maPhieuXuatSP', '=', 'gh.maPhieuXuatSP')
            ->select(
                'gh.*',
                'dh.tongTien',
                'dh.thanhTien',
                'kh.tenKhachHang',
                'kh.soDienThoai as soDienThoaiKH',
                'nv.hoTen as tenNhanVienGiao',
                'px.ngayXuat as ngayXuatKho'
            );

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('gh.trangThai', $request->input('status'));
        }

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('gh.maGiaoHang', 'like', "%{$kw}%")
                  ->orWhere('gh.maDonHang', 'like', "%{$kw}%")
                  ->orWhere('kh.tenKhachHang', 'like', "%{$kw}%")
                  ->orWhere('gh.diaChiGiao', 'like', "%{$kw}%");
            });
        }

        $deliveries = $query->orderByDesc('gh.ngayGiao')->get();

        // Kiểm tra xem đã có hóa đơn chưa
        $deliveryIds = $deliveries->pluck('maGiaoHang');
        $invoiceMap = DB::table('HoaDon')->whereIn('maGiaoHang', $deliveryIds)->pluck('maHoaDon', 'maGiaoHang');

        $deliveries->each(function ($d) use ($invoiceMap) {
            $d->maHoaDon = $invoiceMap[$d->maGiaoHang] ?? null;
        });

        return response()->json([
            'success' => true,
            'data' => $deliveries,
        ]);
    }

    public function deliveryDetail($id)
    {
        $delivery = DB::table('GiaoHang as gh')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->leftJoin('NhanVien as nv', 'nv.maNV', '=', 'gh.maNV')
            ->leftJoin('PhieuXuatSP as px', 'px.maPhieuXuatSP', '=', 'gh.maPhieuXuatSP')
            ->where('gh.maGiaoHang', $id)
            ->select('gh.*', 'dh.thanhTien', 'dh.ngayMua', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'nv.hoTen as tenNhanVienGiao', 'px.ngayXuat as ngayXuatKho')
            ->first();

        if (!$delivery) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy phiếu giao hàng.'], 404);
        }

        $items = DB::table('ChiTietDonHang as ct')
            ->leftJoin('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
            ->where('ct.maDonHang', $delivery->maDonHang)
            ->select('ct.*', 'sp.tenSanPham', 'sp.donViTinh')
            ->get();

        $invoice = DB::table('HoaDon')->where('maGiaoHang', $id)->first();

        $delivery->items = $items;
        $delivery->hoaDon = $invoice;

        return response()->json([
            'success' => true,
            'data' => $delivery,
        ]);
    }

    public function storeDelivery(Request $request)
    {
        $validated = $request->validate([
            'maGiaoHang' => 'required|string|max:20|unique:GiaoHang,maGiaoHang',
            'maDonHang' => 'required|string|exists:DonHang,maDonHang',
            'maPhieuXuatSP' => 'nullable|string',
            'maPhieuXuat' => 'nullable|string',
            'maNV' => 'nullable|string',
            'maNhanVien' => 'nullable|string',
            'diaChiGiao' => 'required|string|max:255',
            'ngayGiao' => 'nullable|date',
            'trangThai' => 'nullable|string|max:30',
        ]);

        $order = DonHang::where('maDonHang', $validated['maDonHang'])->firstOrFail();

        $maPX = $validated['maPhieuXuatSP'] ?? $request->input('maPhieuXuat');
        if (!$maPX) {
            $px = PhieuXuatSP::where('maDonHang', $order->maDonHang)->first();
            if ($px) {
                $maPX = $px->maPhieuXuatSP;
            }
        }

        DB::beginTransaction();
        try {
            $delivery = GiaoHang::create([
                'maGiaoHang' => $validated['maGiaoHang'],
                'ngayGiao' => Carbon::parse($validated['ngayGiao'] ?? now())->format('Y-m-d H:i:s'),
                'diaChiGiao' => $validated['diaChiGiao'],
                'trangThai' => $validated['trangThai'] ?? 'Đang giao',
                'maDonHang' => $order->maDonHang,
                'maPhieuXuatSP' => $maPX,
                'maKhachHang' => $order->maKhachHang,
                'maNV' => $validated['maNV'] ?? $request->input('maNhanVien') ?? 'NV004',
            ]);

            // Cập nhật trạng thái đơn hàng sang Đang giao
            $order->update(['trangThai' => 'Đang giao']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo phiếu giao hàng thành công',
                'data' => $delivery,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo phiếu giao hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateDeliveryStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'trangThai' => 'required|string|max:30',
        ]);

        $delivery = GiaoHang::where('maGiaoHang', $id)->firstOrFail();
        $delivery->update(['trangThai' => $validated['trangThai']]);

        // Nếu Đã giao, cập nhật đơn hàng thành Đã giao / Hoàn tất
        if ($validated['trangThai'] === 'Đã giao' && $delivery->maDonHang) {
            DonHang::where('maDonHang', $delivery->maDonHang)->update(['trangThai' => 'Đã giao']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái giao hàng thành công',
            'data' => $delivery,
        ]);
    }

    /**
     * 6. Quản lý Hóa Đơn & Thanh Toán (SA-FR03 & SA-BR03)
     */
    public function invoices(Request $request = null)
    {
        $request = $request ?? request();
        $query = DB::table('HoaDon as hd')
            ->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->select(
                'hd.*',
                'gh.diaChiGiao',
                'gh.ngayGiao',
                'dh.maDonHang',
                'kh.tenKhachHang',
                'kh.soDienThoai as soDienThoaiKH',
                'kh.maKhachHang'
            );

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('hd.maHoaDon', 'like', "%{$kw}%")
                  ->orWhere('gh.maGiaoHang', 'like', "%{$kw}%")
                  ->orWhere('dh.maDonHang', 'like', "%{$kw}%")
                  ->orWhere('kh.tenKhachHang', 'like', "%{$kw}%");
            });
        }

        $invoices = $query->orderByDesc('hd.ngayLap')->get();

        // Kiểm tra công nợ và thanh toán cho từng hóa đơn
        $invoiceIds = $invoices->pluck('maHoaDon');
        $debts = DB::table('CongNo')->whereIn('maHoaDon', $invoiceIds)->get()->keyBy('maHoaDon');

        $invoices->each(function ($inv) use ($debts) {
            $debt = $debts->get($inv->maHoaDon);
            if ($debt) {
                $inv->trangThaiThanhToan = $debt->trangThai;
                $inv->soTienNo = (float) $debt->soTienNo;
                $inv->soTienDaTra = (float) $debt->soTienDaTra;
                $inv->soTienConLai = (float) $debt->soTienConLai;
                $inv->maCongNo = $debt->maCongNo;
            } else {
                $inv->trangThaiThanhToan = 'Đã thanh toán';
                $inv->soTienConLai = 0;
            }
        });

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function invoiceDetail($id)
    {
        $invoice = DB::table('HoaDon as hd')
            ->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->where('hd.maHoaDon', $id)
            ->select('hd.*', 'gh.diaChiGiao', 'gh.ngayGiao', 'dh.maDonHang', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'kh.maKhachHang', 'kh.hanMucCongNo')
            ->first();

        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hóa đơn.'], 404);
        }

        $items = DB::table('ChiTietDonHang as ct')
            ->leftJoin('SanPham as sp', 'sp.maSanPham', '=', 'ct.maSanPham')
            ->where('ct.maDonHang', $invoice->maDonHang)
            ->select('ct.*', 'sp.tenSanPham', 'sp.donViTinh')
            ->get();

        $debt = DB::table('CongNo')->where('maHoaDon', $id)->first();
        $payments = [];
        if ($debt) {
            $payments = DB::table('ThanhToan')->where('maCongNo', $debt->maCongNo)->orderByDesc('ngayThanhToan')->get();
        }

        $invoice->items = $items;
        $invoice->congNo = $debt;
        $invoice->payments = $payments;

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    /**
     * Lập hóa đơn bán hàng (SA-BR03)
     */
    public function storeInvoice(Request $request)
    {
        $validated = $request->validate([
            'maHoaDon' => 'required|string|max:20|unique:HoaDon,maHoaDon',
            'maGiaoHang' => 'required|string|exists:GiaoHang,maGiaoHang',
            'tongTien' => 'required|numeric|min:0',
            'ngayLap' => 'nullable|date',
        ]);

        $delivery = GiaoHang::where('maGiaoHang', $validated['maGiaoHang'])->firstOrFail();

        $invoice = HoaDon::create([
            'maHoaDon' => $validated['maHoaDon'],
            'ngayLap' => Carbon::parse($validated['ngayLap'] ?? now())->format('Y-m-d H:i:s'),
            'tongTien' => $validated['tongTien'],
            'maGiaoHang' => $delivery->maGiaoHang,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lập hóa đơn thành công',
            'data' => $invoice,
        ], 201);
    }

    /**
     * Ghi nhận thanh toán đơn hàng & kiểm tra hạn mức công nợ (SA-FR03, SA-FR05)
     */
    public function recordPayment(Request $request)
    {
        $validated = $request->validate([
            'maHoaDon' => 'required|string|exists:HoaDon,maHoaDon',
            'phuongThuc' => 'required|string|in:Tiền mặt,Chuyển khoản,Công nợ',
            'soTienThanhToan' => 'required|numeric|min:0',
            'hanThanhToan' => 'nullable|date',
        ]);

        $invoice = DB::table('HoaDon as hd')
            ->join('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->join('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->where('hd.maHoaDon', $validated['maHoaDon'])
            ->select('hd.*', 'gh.maDonHang', 'kh.maKhachHang', 'kh.tenKhachHang', 'kh.hanMucCongNo')
            ->first();

        $totalInvoice = (float) $invoice->tongTien;
        $paidAmount = (float) $validated['soTienThanhToan'];
        $remainingDebt = max(0, $totalInvoice - $paidAmount);
        $method = $validated['phuongThuc'];

        DB::beginTransaction();
        try {
            $creditLimitWarning = null;

            // Nếu thanh toán thiếu hoặc chọn Công nợ gối đầu -> Ghi nhận vào CongNo
            if ($method === 'Công nợ' || $remainingDebt > 0) {
                // Kiểm tra hạn mức công nợ hiện tại của khách hàng
                $currentDebt = (float) DB::table('CongNo')
                    ->where('maKhachHang', $invoice->maKhachHang)
                    ->where('trangThai', '!=', 'Đã tất toán')
                    ->sum('soTienConLai');

                $newTotalDebt = $currentDebt + $remainingDebt;
                $creditLimit = (float) $invoice->hanMucCongNo;

                if ($creditLimit > 0 && $newTotalDebt > $creditLimit) {
                    $creditLimitWarning = "CẢNH BÁO: Tổng công nợ của khách hàng ({$newTotalDebt} đ) đã vượt hạn mức tín dụng cho phép ({$creditLimit} đ). Cần Quản lý kinh doanh duyệt trước khi bàn giao.";
                }

                $debtStatus = $paidAmount > 0 ? 'Thanh toán một phần' : 'Còn nợ';
                if ($remainingDebt == 0) {
                    $debtStatus = 'Đã tất toán';
                }

                $maCongNo = 'CN' . date('Ymd') . rand(1000, 9999);
                $congNo = CongNo::create([
                    'maCongNo' => $maCongNo,
                    'soTienNo' => $totalInvoice,
                    'soTienDaTra' => $paidAmount,
                    'soTienConLai' => $remainingDebt,
                    'hanThanhToan' => $validated['hanThanhToan'] ?? Carbon::now()->addDays(30)->format('Y-m-d'),
                    'trangThai' => $debtStatus,
                    'maHoaDon' => $invoice->maHoaDon,
                    'maKhachHang' => $invoice->maKhachHang,
                ]);

                // Lưu lần thanh toán nếu có trả trước một phần
                if ($paidAmount > 0) {
                    ThanhToan::create([
                        'maThanhToan' => 'TT' . date('Ymd') . rand(1000, 9999),
                        'maCongNo' => $maCongNo,
                        'ngayThanhToan' => Carbon::now()->format('Y-m-d H:i:s'),
                        'phuongThuc' => $method,
                    ]);
                }
            } else {
                // Thanh toán đủ toàn bộ bằng Tiền mặt hoặc Chuyển khoản
                $maCongNo = 'CN' . date('Ymd') . rand(1000, 9999);
                CongNo::create([
                    'maCongNo' => $maCongNo,
                    'soTienNo' => $totalInvoice,
                    'soTienDaTra' => $totalInvoice,
                    'soTienConLai' => 0,
                    'hanThanhToan' => Carbon::now()->format('Y-m-d'),
                    'trangThai' => 'Đã tất toán',
                    'maHoaDon' => $invoice->maHoaDon,
                    'maKhachHang' => $invoice->maKhachHang,
                ]);

                ThanhToan::create([
                    'maThanhToan' => 'TT' . date('Ymd') . rand(1000, 9999),
                    'maCongNo' => $maCongNo,
                    'ngayThanhToan' => Carbon::now()->format('Y-m-d H:i:s'),
                    'phuongThuc' => $method,
                ]);
            }

            // Cập nhật đơn hàng thành Hoàn tất
            DonHang::where('maDonHang', $invoice->maDonHang)->update(['trangThai' => 'Hoàn tất']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ghi nhận thanh toán thành công',
                'warning' => $creditLimitWarning,
                'data' => [
                    'maHoaDon' => $invoice->maHoaDon,
                    'phuongThuc' => $method,
                    'soTienDaTra' => $paidAmount,
                    'soTienConLai' => $remainingDebt,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi ghi nhận thanh toán: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 7. Quản lý Công Nợ (SA-FR05)
     */
    public function receivables(Request $request = null)
    {
        $request = $request ?? request();
        $query = DB::table('CongNo as cn')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')
            ->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->select(
                'cn.*',
                'kh.tenKhachHang',
                'kh.soDienThoai as soDienThoaiKH',
                'kh.hanMucCongNo',
                'hd.maHoaDon',
                'gh.maDonHang'
            );

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('cn.trangThai', $request->input('status'));
        }

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('cn.maCongNo', 'like', "%{$kw}%")
                  ->orWhere('kh.tenKhachHang', 'like', "%{$kw}%")
                  ->orWhere('hd.maHoaDon', 'like', "%{$kw}%");
            });
        }

        $receivables = $query->orderBy('cn.hanThanhToan')->get();

        return response()->json([
            'success' => true,
            'data' => $receivables,
        ]);
    }

    public function receivableDetail($id)
    {
        $debt = DB::table('CongNo as cn')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')
            ->where('cn.maCongNo', $id)
            ->select('cn.*', 'kh.tenKhachHang', 'kh.soDienThoai as soDienThoaiKH', 'kh.hanMucCongNo', 'hd.tongTien as tongTienHoaDon')
            ->first();

        if (!$debt) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy công nợ.'], 404);
        }

        $payments = DB::table('ThanhToan')
            ->where('maCongNo', $id)
            ->orderByDesc('ngayThanhToan')
            ->get();

        $debt->payments = $payments;

        return response()->json([
            'success' => true,
            'data' => $debt,
        ]);
    }

    /**
     * 8. Quản lý Bảng Giá Sản Phẩm (SA-FR06)
     */
    public function pricing(Request $request = null)
    {
        $request = $request ?? request();
        $query = DB::table('SanPham as sp')
            ->select(
                'sp.maSanPham',
                'sp.tenSanPham',
                'sp.donGia as giaBan',
                'sp.donViTinh',
                'sp.trangThai',
                DB::raw("'Thành phẩm Vinamilk' as tenLoaiSP")
            );

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('sp.maSanPham', 'like', "%{$kw}%")
                  ->orWhere('sp.tenSanPham', 'like', "%{$kw}%");
            });
        }

        $pricing = $query->orderBy('sp.maSanPham')->get();

        return response()->json([
            'success' => true,
            'data' => $pricing,
        ]);
    }

    public function updatePrice(Request $request, $id)
    {
        $validated = $request->validate([
            'giaBan' => 'required|numeric|min:0',
        ]);

        $product = SanPham::where('maSanPham', $id)->firstOrFail();
        $product->update(['donGia' => $validated['giaBan']]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật giá bán sản phẩm thành công',
            'data' => $product,
        ]);
    }
}
