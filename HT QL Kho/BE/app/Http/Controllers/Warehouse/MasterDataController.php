<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\NguyenVatLieu;
use App\Models\LoaiNVL;
use App\Models\SanPham;
use App\Models\NhaCungCap;
use App\Models\KhachHang;
use App\Models\NhanVien;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    // Raw Materials Management (CF-FR01 to CF-FR04)
    public function getMaterials(Request $request)
    {
        $query = NguyenVatLieu::with('loaiNVL');

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('tenNVL', 'LIKE', "%{$keyword}%")
                  ->orWhere('maNVL', 'LIKE', "%{$keyword}%");
        }

        if ($request->has('maLoaiNVL')) {
            $query->where('maLoaiNVL', $request->input('maLoaiNVL'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function createMaterial(Request $request)
    {
        $validated = $request->validate([
            'maNVL' => 'required|string|unique:NguyenVatLieu,maNVL',
            'maLoaiNVL' => 'nullable|string|exists:LoaiNVL,maLoaiNVL',
            'tenNVL' => 'required|string|max:100',
            'donVi' => 'nullable|string|max:20',
            'ghiChu' => 'nullable|string',
        ]);

        $material = NguyenVatLieu::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm nguyên vật liệu mới thành công',
            'data' => $material,
        ], 201);
    }

    public function updateMaterial(Request $request, $id)
    {
        $material = NguyenVatLieu::findOrFail($id);

        $validated = $request->validate([
            'maLoaiNVL' => 'nullable|string|exists:LoaiNVL,maLoaiNVL',
            'tenNVL' => 'required|string|max:100',
            'donVi' => 'nullable|string|max:20',
            'ghiChu' => 'nullable|string',
        ]);

        $material->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin nguyên vật liệu thành công',
            'data' => $material,
        ]);
    }

    public function deleteMaterial($id)
    {
        $material = NguyenVatLieu::findOrFail($id);
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa nguyên vật liệu thành công',
        ]);
    }

    // Material Types (LoaiNVL)
    public function getMaterialTypes()
    {
        return response()->json([
            'success' => true,
            'data' => LoaiNVL::all(),
        ]);
    }

    // Products Lookup (CF-FR05)
    public function getProducts(Request $request)
    {
        $query = SanPham::query();

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('tenSanPham', 'LIKE', "%{$keyword}%")
                  ->orWhere('maSanPham', 'LIKE', "%{$keyword}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    // Suppliers Management (CF-FR06 to CF-FR09)
    public function getSuppliers(Request $request)
    {
        $query = NhaCungCap::query();

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('tenNCC', 'LIKE', "%{$keyword}%")
                  ->orWhere('maNCC', 'LIKE', "%{$keyword}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function createSupplier(Request $request)
    {
        $validated = $request->validate([
            'maNCC' => 'required|string|unique:NhaCungCap,maNCC',
            'tenNCC' => 'required|string|max:100',
            'maSoThue' => 'nullable|string|max:20',
            'diaChi' => 'nullable|string|max:200',
            'soDienThoai' => 'nullable|string|max:15',
            'email' => 'nullable|email|max:100',
        ]);

        $supplier = NhaCungCap::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm nhà cung cấp mới thành công',
            'data' => $supplier,
        ], 201);
    }

    // Customers / Distributors Lookup (CF-FR10)
    public function getCustomers(Request $request)
    {
        $query = KhachHang::query();

        if ($request->has('keyword')) {
            $keyword = $request->input('keyword');
            $query->where('tenKhachHang', 'LIKE', "%{$keyword}%")
                  ->orWhere('maKhachHang', 'LIKE', "%{$keyword}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    // Warehouse Staff Lookup
    public function getStaff()
    {
        return response()->json([
            'success' => true,
            'data' => NhanVien::all(),
        ]);
    }
}
