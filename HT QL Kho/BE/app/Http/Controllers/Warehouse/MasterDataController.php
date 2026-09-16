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
        $materials = NguyenVatLieu::with('loaiNVL')
            ->when($request->filled('keyword'), function ($q) use ($request) {
                $kw = $request->input('keyword');
                $q->where(fn($sub) => $sub->where('tenNVL', 'LIKE', "%{$kw}%")->orWhere('maNVL', 'LIKE', "%{$kw}%"));
            })
            ->when($request->filled('maLoaiNVL'), fn($q) => $q->where('maLoaiNVL', $request->input('maLoaiNVL')))
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $materials,
        ]);
    }

    public function createMaterial(Request $request)
    {
        $validated = $request->validate([
            'maNVL'     => 'required|string|unique:NguyenVatLieu,maNVL',
            'maLoaiNVL' => 'nullable|string|exists:LoaiNVL,maLoaiNVL',
            'tenNVL'    => 'required|string|max:100',
            'donVi'     => 'nullable|string|max:20',
            'ghiChu'    => 'nullable|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm nguyên vật liệu mới thành công',
            'data'    => NguyenVatLieu::create($validated),
        ], 201);
    }

    public function updateMaterial(Request $request, $id)
    {
        $material = NguyenVatLieu::findOrFail($id);

        $validated = $request->validate([
            'maLoaiNVL' => 'nullable|string|exists:LoaiNVL,maLoaiNVL',
            'tenNVL'    => 'required|string|max:100',
            'donVi'     => 'nullable|string|max:20',
            'ghiChu'    => 'nullable|string',
        ]);

        $material->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin nguyên vật liệu thành công',
            'data'    => $material,
        ]);
    }

    public function deleteMaterial($id)
    {
        NguyenVatLieu::findOrFail($id)->delete();

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
            'data'    => LoaiNVL::all(),
        ]);
    }

    // Products Lookup (CF-FR05)
    public function getProducts(Request $request)
    {
        $products = SanPham::when($request->filled('keyword'), function ($q) use ($request) {
            $kw = $request->input('keyword');
            $q->where(fn($sub) => $sub->where('tenSanPham', 'LIKE', "%{$kw}%")->orWhere('maSanPham', 'LIKE', "%{$kw}%"));
        })->get();

        return response()->json([
            'success' => true,
            'data'    => $products,
        ]);
    }

    // Suppliers Management (CF-FR06 to CF-FR09)
    public function getSuppliers(Request $request)
    {
        $suppliers = NhaCungCap::when($request->filled('keyword'), function ($q) use ($request) {
            $kw = $request->input('keyword');
            $q->where(fn($sub) => $sub->where('tenNCC', 'LIKE', "%{$kw}%")->orWhere('maNCC', 'LIKE', "%{$kw}%"));
        })->get();

        return response()->json([
            'success' => true,
            'data'    => $suppliers,
        ]);
    }

    public function createSupplier(Request $request)
    {
        $validated = $request->validate([
            'maNCC'       => 'required|string|unique:NhaCungCap,maNCC',
            'tenNCC'      => 'required|string|max:100',
            'maSoThue'    => 'nullable|string|max:20',
            'diaChi'      => 'nullable|string|max:200',
            'soDienThoai' => 'nullable|string|max:15',
            'email'       => 'nullable|email|max:100',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm nhà cung cấp mới thành công',
            'data'    => NhaCungCap::create($validated),
        ], 201);
    }

    // Customers / Distributors Lookup (CF-FR10)
    public function getCustomers(Request $request)
    {
        $customers = KhachHang::when($request->filled('keyword'), function ($q) use ($request) {
            $kw = $request->input('keyword');
            $q->where(fn($sub) => $sub->where('tenKhachHang', 'LIKE', "%{$kw}%")->orWhere('maKhachHang', 'LIKE', "%{$kw}%"));
        })->get();

        return response()->json([
            'success' => true,
            'data'    => $customers,
        ]);
    }

    // Warehouse Staff Lookup
    public function getStaff()
    {
        return response()->json([
            'success' => true,
            'data'    => NhanVien::all(),
        ]);
    }
}
