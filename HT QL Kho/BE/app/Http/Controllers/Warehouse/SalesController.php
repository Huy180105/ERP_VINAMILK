<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use App\Models\DonHang;
use App\Models\ChiTietDonHang;
use App\Models\KhachHang;
use App\Models\SanPham;
use App\Models\TonKho;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    public function dashboard()
    {
        $summary = [
            'orders' => (int) DB::table('DonHang')->count(),
            'customers' => (int) DB::table('KhachHang')->count(),
            'deliveries' => (int) DB::table('GiaoHang')->count(),
            'invoices' => (int) DB::table('HoaDon')->count(),
            'receivables' => (float) DB::table('CongNo')->sum('soTienConLai'),
        ];

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
            ->limit(8)
            ->get();

        $customers = DB::table('KhachHang')
            ->select('maKhachHang', 'tenKhachHang', 'soDienThoai', 'diaChi', 'hanMucCongNo')
            ->orderBy('tenKhachHang')
            ->limit(8)
            ->get();

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
            ->limit(8)
            ->get();

        $invoices = DB::table('HoaDon as hd')
            ->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->select(
                'hd.maHoaDon',
                'hd.ngayLap',
                'hd.tongTien',
                'gh.maGiaoHang',
                'dh.maDonHang'
            )
            ->orderByDesc('hd.ngayLap')
            ->limit(8)
            ->get();

        $receivables = DB::table('CongNo as cn')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')
            ->select(
                'cn.maCongNo',
                'cn.soTienNo',
                'cn.soTienConLai',
                'cn.hanThanhToan',
                'cn.trangThai',
                'kh.tenKhachHang',
                'hd.maHoaDon'
            )
            ->orderBy('cn.hanThanhToan')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'orders' => $orders,
                'customers' => $customers,
                'deliveries' => $deliveries,
                'invoices' => $invoices,
                'receivables' => $receivables,
            ],
        ]);
    }

    public function orders(Request $request)
    {
        $query = DB::table('DonHang as dh')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'dh.maKhachHang')
            ->select(
                'dh.maDonHang',
                'dh.ngayMua',
                'dh.tongTien',
                'dh.thanhTien',
                'dh.trangThai',
                'dh.maKhachHang',
                'dh.maNhanVien',
                'kh.tenKhachHang'
            );

        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('dh.maDonHang', 'like', "%{$keyword}%")
                  ->orWhere('kh.tenKhachHang', 'like', "%{$keyword}%");
            });
        }

        $orders = $query->orderByDesc('dh.ngayMua')->get();
        $orderIds = $orders->pluck('maDonHang');
        $items = DB::table('ChiTietDonHang')
            ->whereIn('maDonHang', $orderIds)
            ->select('maDonHang', 'maSanPham', 'soLuong', 'donGia')
            ->get()
            ->groupBy('maDonHang');

        $orders->each(function ($order) use ($items) {
            $order->items = $items->get($order->maDonHang, collect())->values();
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

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
                'message' => 'Chưa nhập thông tin khách hàng. Vui lòng chọn khách hàng/nhà phân phối trước khi tạo đơn.',
            ], 422);
        }

        if (empty($validated['items'])) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa có sản phẩm. Vui lòng thêm ít nhất một sản phẩm.',
            ], 422);
        }

        $totalAmount = 0;
        $stockCheckErrors = [];

        foreach ($validated['items'] as $item) {
            $product = SanPham::where('maSanPham', $item['maSanPham'])->first();
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sản phẩm ' . $item['maSanPham'] . ' không tồn tại trong hệ thống.',
                ], 422);
            }

            $availableStock = TonKho::where('maSP', $product->maSanPham)
                ->where('trangThai', '!=', 'Hết hàng')
                ->sum('soLuongTonHienTai');

            if ($availableStock < $item['soLuong']) {
                $stockCheckErrors[] = "Sản phẩm {$product->tenSanPham} ({$product->maSanPham}) không đủ tồn kho. Tồn kho hiện có: {$availableStock}, yêu cầu: {$item['soLuong']}";
            }

            $lineTotal = $item['soLuong'] * $item['donGia'];
            $totalAmount += $lineTotal;
        }

        if (!empty($stockCheckErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Kho không đáp ứng đủ. Vui lòng điều chỉnh số lượng đặt hàng.',
                'errors' => $stockCheckErrors,
            ], 422);
        }

        $order = DonHang::create([
            'maDonHang' => $validated['maDonHang'],
            'ngayMua' => Carbon::parse($validated['ngayMua'] ?? now())->format('Y-m-d H:i:s'),
            'tongTien' => $totalAmount,
            'thanhTien' => $totalAmount,
            'trangThai' => $validated['trangThai'] ?? 'Chờ xác nhận',
            'maKhachHang' => $validated['maKhachHang'],
            'maNhanVien' => $validated['maNhanVien'] ?? null,
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

        $order->load('khachHang', 'chiTiet.sanPham');

        return response()->json([
            'success' => true,
            'message' => 'Thêm đơn hàng thành công',
            'data' => $order,
        ], 201);
    }

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
                'message' => 'Chỉ đơn hàng đang Chờ xác nhận mới được phép chỉnh sửa.',
            ], 422);
        }

        $totalAmount = 0;
        $stockCheckErrors = [];

        foreach ($validated['items'] as $item) {
            $product = SanPham::where('maSanPham', $item['maSanPham'])->first();
            $availableStock = TonKho::where('maSP', $product->maSanPham)
                ->where('trangThai', '!=', 'Hết hàng')
                ->sum('soLuongTonHienTai');

            if ($availableStock < $item['soLuong']) {
                $stockCheckErrors[] = "Sản phẩm {$product->tenSanPham} ({$product->maSanPham}) không đủ tồn kho. Tồn kho hiện có: {$availableStock}, yêu cầu: {$item['soLuong']}";
            }

            $totalAmount += $item['soLuong'] * $item['donGia'];
        }

        if (!empty($stockCheckErrors)) {
            return response()->json([
                'success' => false,
                'message' => 'Kho không đáp ứng đủ. Vui lòng điều chỉnh số lượng đặt hàng.',
                'errors' => $stockCheckErrors,
            ], 422);
        }

        DB::transaction(function () use ($order, $validated, $totalAmount) {
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
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đơn hàng thành công',
            'data' => $order->fresh()->load('khachHang', 'chiTiet.sanPham'),
        ]);
    }

    public function deleteOrder($id)
    {
        $order = DonHang::where('maDonHang', $id)->firstOrFail();
        if ($order->trangThai !== 'Chờ xác nhận') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ đơn hàng đang Chờ xác nhận mới được phép hủy.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            ChiTietDonHang::where('maDonHang', $order->maDonHang)->delete();
            $order->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Hủy đơn hàng thành công',
        ]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'trangThai' => 'required|string|max:30',
        ]);

        $updated = DB::table('DonHang')->where('maDonHang', $id)->update([
            'trangThai' => $validated['trangThai'],
        ]);

        $order = DB::table('DonHang')->where('maDonHang', $id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'data' => $order,
        ]);
    }

    public function customers(Request $request)
    {
        $query = DB::table('KhachHang')
            ->select('maKhachHang', 'tenKhachHang', 'soDienThoai', 'diaChi', 'hanMucCongNo');

        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('tenKhachHang', 'like', "%{$keyword}%")
                  ->orWhere('maKhachHang', 'like', "%{$keyword}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('tenKhachHang')->get(),
        ]);
    }

    public function deliveries(Request $request)
    {
        $query = DB::table('GiaoHang as gh')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'gh.maKhachHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->select(
                'gh.maGiaoHang',
                'gh.ngayGiao',
                'gh.trangThai',
                'gh.diaChiGiao',
                'kh.tenKhachHang',
                'dh.maDonHang'
            );

        if ($request->filled('status')) {
            $query->where('gh.trangThai', $request->input('status'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('gh.ngayGiao')->get(),
        ]);
    }

    public function invoices(Request $request)
    {
        $query = DB::table('HoaDon as hd')
            ->leftJoin('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->leftJoin('DonHang as dh', 'dh.maDonHang', '=', 'gh.maDonHang')
            ->select(
                'hd.maHoaDon',
                'hd.ngayLap',
                'hd.tongTien',
                'gh.maGiaoHang',
                'dh.maDonHang'
            );

        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('hd.maHoaDon', 'like', "%{$keyword}%")
                ->orWhere('gh.maGiaoHang', 'like', "%{$keyword}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderByDesc('hd.ngayLap')->get(),
        ]);
    }

    public function receivables(Request $request)
    {
        $query = DB::table('CongNo as cn')
            ->leftJoin('KhachHang as kh', 'kh.maKhachHang', '=', 'cn.maKhachHang')
            ->leftJoin('HoaDon as hd', 'hd.maHoaDon', '=', 'cn.maHoaDon')
            ->select(
                'cn.maCongNo',
                'cn.soTienNo',
                'cn.soTienConLai',
                'cn.hanThanhToan',
                'cn.trangThai',
                'kh.tenKhachHang',
                'hd.maHoaDon'
            );

        if ($request->filled('status')) {
            $query->where('cn.trangThai', $request->input('status'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('cn.hanThanhToan')->get(),
        ]);
    }
}
