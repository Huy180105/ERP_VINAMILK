<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\TonKho;
use App\Models\KhoSanPham;
use App\Models\KhoNguyenVatLieu;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InventoryController extends Controller
{
    // Tra cứu tồn kho theo lô và lọc (CF-FR51, CF-FR52)
    public function getInventory(Request $request)
    {
        $data = TonKho::with(['sanPham', 'nguyenVatLieu', 'khoSanPham', 'khoNguyenVatLieu'])
            ->when($request->input('type') === 'product', fn($q) => $q->whereNotNull('maSP'))
            ->when($request->input('type') === 'material', fn($q) => $q->whereNotNull('maNVL'))
            ->when($request->filled('maSP'), fn($q) => $q->where('maSP', $request->input('maSP')))
            ->when($request->filled('maNVL'), fn($q) => $q->where('maNVL', $request->input('maNVL')))
            ->when($request->filled('keyword'), function ($q) use ($request) {
                $kw = $request->input('keyword');
                $q->where(fn($sub) => $sub->where('maTonKho', 'LIKE', "%{$kw}%")->orWhere('tenTonKho', 'LIKE', "%{$kw}%"));
            })
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    // Thuật toán Gợi ý FEFO (First Expired, First Out) khi xuất kho sản phẩm / NVL (CF-FR46)
    public function getFefoSuggestions(Request $request)
    {
        $request->validate([
            'maSP'  => 'nullable|string',
            'maNVL' => 'nullable|string',
        ]);

        $suggestions = TonKho::query()
            ->where('soLuongTonHienTai', '>', 0)
            ->where('hanSuDung', '>=', Carbon::today()->toDateString())
            ->when($request->filled('maSP'), fn($q) => $q->where('maSP', $request->input('maSP')))
            ->when($request->filled('maNVL'), fn($q) => $q->where('maNVL', $request->input('maNVL')))
            ->orderBy('hanSuDung', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Gợi ý xuất kho theo nguyên tắc FEFO (Hạn dùng gần nhất xuất trước)',
            'data'    => $suggestions,
        ]);
    }

    // Cảnh báo hàng sắp hết hạn (CF-FR53, CF-FR54)
    public function getNearExpiryAlerts(Request $request)
    {
        $daysThreshold = (int) $request->input('days', 30);
        $thresholdDate = Carbon::today()->addDays($daysThreshold)->toDateString();

        $alerts = TonKho::with(['sanPham', 'nguyenVatLieu'])
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

        $alerts = TonKho::with(['sanPham', 'nguyenVatLieu'])
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

    // Quản lý vị trí lưu trữ kho
    public function getProductLocations()
    {
        return response()->json([
            'success' => true,
            'data'    => KhoSanPham::with('tonKho')->get(),
        ]);
    }

    public function getMaterialLocations()
    {
        return response()->json([
            'success' => true,
            'data'    => KhoNguyenVatLieu::with('tonKho')->get(),
        ]);
    }
}
