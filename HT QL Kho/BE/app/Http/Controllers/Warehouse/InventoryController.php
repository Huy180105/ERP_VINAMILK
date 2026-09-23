<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\TonKho;
use App\Models\Kho;
use App\Models\DeNghiBoSungSanPham;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InventoryController extends Controller
{
    // Tra cứu tồn kho theo lô và lọc (CF-FR51, CF-FR52, DT02, DT03, DT04)
    public function getInventory(Request $request)
    {
        $maSP = $request->input('maSanPham') ?? $request->input('maSP');

        $data = TonKho::with(['sanPham', 'nguyenVatLieu', 'kho'])
            ->when($request->input('type') === 'product', fn($q) => $q->whereNotNull('maSanPham'))
            ->when($request->input('type') === 'material', fn($q) => $q->whereNotNull('maNVL'))
            ->when(!empty($maSP), fn($q) => $q->where('maSanPham', $maSP))
            ->when($request->filled('maNVL'), fn($q) => $q->where('maNVL', $request->input('maNVL')))
            ->when($request->filled('maKho'), fn($q) => $q->where('maKho', $request->input('maKho')))
            ->when($request->filled('keyword'), function ($q) use ($request) {
                $kw = $request->input('keyword');
                $q->where(fn($sub) => $sub->where('maTonKho', 'LIKE', "%{$kw}%")
                                          ->orWhere('tenTonKho', 'LIKE', "%{$kw}%")
                                          ->orWhere('maSanPham', 'LIKE', "%{$kw}%")
                                          ->orWhere('maNVL', 'LIKE', "%{$kw}%"));
            })
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // Thuật toán Gợi ý FEFO (First Expired, First Out) khi xuất kho sản phẩm / NVL (CF-FR46, CF-BR04, CF-BR10)
    public function getFefoSuggestions(Request $request)
    {
        $maSP = $request->input('maSanPham') ?? $request->input('maSP');

        $suggestions = TonKho::with(['sanPham', 'nguyenVatLieu', 'kho'])
            ->where('soLuongTonHienTai', '>', 0)
            ->where('hanSuDung', '>=', Carbon::today()->toDateString())
            ->where(fn($q) => $q->whereNull('trangThaiChatLuong')->orWhere('trangThaiChatLuong', 'Đạt'))
            ->when(!empty($maSP), fn($q) => $q->where('maSanPham', $maSP))
            ->when($request->filled('maNVL'), fn($q) => $q->where('maNVL', $request->input('maNVL')))
            ->orderBy('hanSuDung', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Gợi ý xuất kho theo nguyên tắc FEFO (Hạn dùng gần nhất xuất trước, chất lượng Đạt)',
            'data'    => $suggestions,
        ]);
    }

    // Cảnh báo hàng sắp hết hạn (CF-FR53, CF-FR54)
    public function getNearExpiryAlerts(Request $request)
    {
        $daysThreshold = (int) $request->input('days', 30);
        $thresholdDate = Carbon::today()->addDays($daysThreshold)->toDateString();

        $alerts = TonKho::with(['sanPham', 'nguyenVatLieu', 'kho'])
            ->where('soLuongTonHienTai', '>', 0)
            ->where('hanSuDung', '<=', $thresholdDate)
            ->orderBy('hanSuDung', 'asc')
            ->get();

        return response()->json([
            'success'       => true,
            'daysThreshold' => $daysThreshold,
            'count'         => $alerts->count(),
            'data'          => $alerts,
        ]);
    }

    // Cảnh báo tồn kho thấp dưới định mức (CF-FR55)
    public function getLowStockAlerts(Request $request)
    {
        $minThreshold = (int) $request->input('min_qty', 500);

        $alerts = TonKho::with(['sanPham', 'nguyenVatLieu', 'kho'])
            ->where('soLuongTonHienTai', '<=', $minThreshold)
            ->orderBy('soLuongTonHienTai', 'asc')
            ->get();

        return response()->json([
            'success'      => true,
            'minThreshold' => $minThreshold,
            'count'        => $alerts->count(),
            'data'         => $alerts,
        ]);
    }

    // Quản lý vị trí lưu trữ kho sản phẩm (DT03, DT04)
    public function getProductLocations()
    {
        $data = TonKho::with(['sanPham', 'kho'])
            ->whereNotNull('maSanPham')
            ->get()
            ->map(function ($item) {
                return [
                    'maKhoSP'         => $item->maTonKho,
                    'maTonKho'        => $item->maTonKho,
                    'maKho'           => $item->maKho,
                    'tenKho'          => $item->kho?->tenKho ?? 'Kho Tổng Vinamilk',
                    'loaiKho'         => $item->kho?->loaiKho ?? 'Kho thành phẩm',
                    'tinhTrangKhoSP'  => $item->trangThaiChatLuong ?? 'Đạt',
                    'ghiChu'          => $item->ghiChu,
                    'tonKho'          => $item,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // Quản lý vị trí lưu trữ kho NVL (DT03, DT04)
    public function getMaterialLocations()
    {
        $data = TonKho::with(['nguyenVatLieu', 'kho'])
            ->whereNotNull('maNVL')
            ->get()
            ->map(function ($item) {
                return [
                    'maKhoNVL'        => $item->maTonKho,
                    'maTonKho'        => $item->maTonKho,
                    'maKho'           => $item->maKho,
                    'tenKho'          => $item->kho?->tenKho ?? 'Kho NVL Mộc Châu',
                    'loaiKho'         => $item->kho?->loaiKho ?? 'Kho NVL',
                    'tinhTrangKhoNVL' => $item->trangThaiChatLuong ?? 'Đạt',
                    'ghiChu'          => $item->ghiChu,
                    'tonKho'          => $item,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // =========================================================================
    // QUẢN LÝ ĐỀ NGHỊ BỔ SUNG SẢN PHẨM (BẢNG 36: DeNghiBoSungSanPham)
    // =========================================================================

    public function getDeNghiBoSung(Request $request)
    {
        $data = DeNghiBoSungSanPham::with(['sanPham', 'kho', 'nhanVien'])
            ->when($request->filled('trangThai'), fn($q) => $q->where('trangThai', $request->trangThai))
            ->orderBy('ngayDeNghi', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function createDeNghiBoSung(Request $request)
    {
        $validated = $request->validate([
            'maDeNghi'    => 'nullable|string|unique:DeNghiBoSungSanPham,maDeNghi',
            'maSanPham'   => 'required|string|exists:SanPham,maSanPham',
            'maKho'       => 'required|string|exists:Kho,maKho',
            'soLuong'     => 'required|integer|min:1',
            'ngayCanHang' => 'nullable|date',
            'maNV'        => 'nullable|string|exists:NhanVien,maNV',
            'ghiChu'      => 'nullable|string|max:255',
        ]);

        $code = $validated['maDeNghi'] ?? ('DN' . date('Ymd') . rand(100, 999));

        $item = DeNghiBoSungSanPham::create([
            'maDeNghi'    => $code,
            'maSanPham'   => $validated['maSanPham'],
            'maKho'       => $validated['maKho'],
            'soLuong'     => $validated['soLuong'],
            'ngayDeNghi'  => Carbon::now()->toDateTimeString(),
            'ngayCanHang' => $validated['ngayCanHang'] ?? Carbon::now()->addDays(7)->toDateString(),
            'trangThai'   => 'ChoDuyet',
            'maNV'        => $validated['maNV'] ?? 'NV001',
            'ghiChu'      => $validated['ghiChu'] ?? 'Tồn kho cạn, đề nghị nhà máy sản xuất bổ sung',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Tạo đề nghị bổ sung thành phẩm ({$code}) thành công",
            'data'    => $item->load(['sanPham', 'kho', 'nhanVien']),
        ], 201);
    }

    public function updateDeNghiBoSungStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'trangThai' => 'required|string|max:30',
        ]);

        $item = DeNghiBoSungSanPham::findOrFail($id);
        $item->update(['trangThai' => $validated['trangThai']]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái phiếu đề nghị bổ sung thành công',
            'data'    => $item->load(['sanPham', 'kho', 'nhanVien']),
        ]);
    }
}
