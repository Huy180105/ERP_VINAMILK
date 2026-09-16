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
        $query = TonKho::with(['sanPham', 'nguyenVatLieu', 'khoSanPham', 'khoNguyenVatLieu']);

        if ($request->has('type')) {
            $type = $request->input('type');
            if ($type === 'product') {
                $query->whereNotNull('maSP');
            } elseif ($type === 'material') {
                $query->whereNotNull('maNVL');
            }
        }

        if ($request->has('maSP')) {
            $query->where('maSP', $request->input('maSP'));
        }

        if ($request->has('maNVL')) {
            $query->where('maNVL', $request->input('maNVL'));
        }

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('maTonKho', 'LIKE', "%{$keyword}%")
                  ->orWhere('tenTonKho', 'LIKE', "%{$keyword}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    // Thuật toán Gợi ý FEFO (First Expired, First Out) khi xuất kho sản phẩm / NVL (CF-FR46)
    public function getFefoSuggestions(Request $request)
    {
        $request->validate([
            'maSP' => 'nullable|string',
            'maNVL' => 'nullable|string',
        ]);

        $query = TonKho::query()
            ->where('soLuongTonHienTai', '>', 0)
            ->where('hanSuDung', '>=', Carbon::today()->toDateString());

        if ($request->filled('maSP')) {
            $query->where('maSP', $request->input('maSP'));
        }

        if ($request->filled('maNVL')) {
            $query->where('maNVL', $request->input('maNVL'));
        }

        // Ưu tiên xếp Hạn sử dụng gần nhất lên đầu (FEFO)
        $suggestions = $query->orderBy('hanSuDung', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Gợi ý xuất kho theo nguyên tắc FEFO (Hạn dùng gần nhất xuất trước)',
            'data' => $suggestions,
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
            'success' => true,
            'daysThreshold' => $daysThreshold,
            'count' => $alerts->count(),
            'data' => $alerts,
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
            'success' => true,
            'minThreshold' => $minThreshold,
            'count' => $alerts->count(),
            'data' => $alerts,
        ]);
    }

    // Quản lý vị trí lưu trữ kho
    public function getProductLocations()
    {
        return response()->json([
            'success' => true,
            'data' => KhoSanPham::with('tonKho')->get(),
        ]);
    }

    public function getMaterialLocations()
    {
        return response()->json([
            'success' => true,
            'data' => KhoNguyenVatLieu::with('tonKho')->get(),
        ]);
    }
}
