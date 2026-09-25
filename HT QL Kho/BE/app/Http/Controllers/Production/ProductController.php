<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Danh sách sản phẩm (PR-FR04, PR-FR05)
     */
    public function getProducts(Request $request)
    {
        $query = SanPham::query();

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('tenSanPham', 'LIKE', "%{$kw}%")
                  ->orWhere('maSanPham', 'LIKE', "%{$kw}%");
            });
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        $products = $query->orderBy('maSanPham', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $products,
        ]);
    }

    /**
     * Thêm sản phẩm mới (PR-FR01)
     */
    public function createProduct(Request $request)
    {
        $validated = $request->validate([
            'maSanPham'  => 'required|string|unique:SanPham,maSanPham|max:10',
            'tenSanPham' => 'required|string|max:255',
            'donViTinh'  => 'nullable|string|max:50',
            'hanSuDung'  => 'nullable|string|max:50',
            'donGia'     => 'nullable|numeric|min:0',
            'trangThai'  => 'nullable|string|max:50',
            'ghiChu'     => 'nullable|string|max:255',
        ]);

        if (empty($validated['trangThai'])) {
            $validated['trangThai'] = 'Đang kinh doanh';
        }

        $product = SanPham::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm sản phẩm thành phẩm mới thành công!',
            'data'    => $product,
        ], 201);
    }

    /**
     * Cập nhật thông tin sản phẩm (PR-FR02)
     */
    public function updateProduct(Request $request, $id)
    {
        $product = SanPham::findOrFail($id);

        $validated = $request->validate([
            'tenSanPham' => 'required|string|max:255',
            'donViTinh'  => 'nullable|string|max:50',
            'hanSuDung'  => 'nullable|string|max:50',
            'donGia'     => 'nullable|numeric|min:0',
            'trangThai'  => 'nullable|string|max:50',
            'ghiChu'     => 'nullable|string|max:255',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin sản phẩm thành công!',
            'data'    => $product,
        ]);
    }

    /**
     * Xóa sản phẩm (PR-FR03)
     */
    public function deleteProduct($id)
    {
        $product = SanPham::findOrFail($id);

        // Kiểm tra xem sản phẩm đã phát sinh tồn kho hay chưa
        if ($product->tonKhos()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa sản phẩm đã phát sinh lô hàng trong kho!',
            ], 400);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa sản phẩm thành công!',
        ]);
    }

    /**
     * Cập nhật trạng thái sản phẩm (PR-FR06)
     */
    public function updateStatus(Request $request, $id)
    {
        $product = SanPham::findOrFail($id);

        $validated = $request->validate([
            'trangThai' => 'required|string|in:Đang kinh doanh,Tạm ngừng,Ngừng sản xuất',
        ]);

        $product->update(['trangThai' => $validated['trangThai']]);

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật trạng thái sản phẩm sang '{$validated['trangThai']}'!",
            'data'    => $product,
        ]);
    }
}
