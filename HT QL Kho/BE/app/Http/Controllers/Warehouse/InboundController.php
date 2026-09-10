<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\PhieuNhapNVL;
use App\Models\ChiTietPhieuNhapNVL;
use App\Models\PhieuNhapSP;
use App\Models\ChiTietPhieuNhapSP;
use App\Models\TonKho;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InboundController extends Controller
{
    // =========================================================================
    // 1. NHẬP KHO NGUYÊN VẬT LIỆU TỪ NHÀ CUNG CẤP (CF-FR11 đến CF-FR19)
    // =========================================================================

    public function getRawMaterialReceipts(Request $request)
    {
        $query = PhieuNhapNVL::with(['nhaCungCap', 'nhanVienTao', 'nhanVienNhan', 'chiTiets.tonKho']);

        if ($request->has('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayNhap', 'desc')->get(),
        ]);
    }

    public function createRawMaterialReceipt(Request $request)
    {
        $validated = $request->validate([
            'maPhieuNhapNVL' => 'required|string|unique:PhieuNhapNVL,maPhieuNhapNVL',
            'maNCC' => 'required|string|exists:NhaCungCap,maNCC',
            'maNVTao' => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan' => 'nullable|string|exists:NhanVien,maNV',
            'ngayNhap' => 'required|date',
            'ghiChu' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.maTonKho' => 'required|string',
            'items.*.maNVL' => 'required|string|exists:NguyenVatLieu,maNVL',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.donGia' => 'nullable|numeric',
            'items.*.ngaySanXuat' => 'required|date',
            'items.*.hanSuDung' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            $receipt = PhieuNhapNVL::create([
                'maPhieuNhapNVL' => $validated['maPhieuNhapNVL'],
                'maNCC' => $validated['maNCC'],
                'maNVTao' => $validated['maNVTao'] ?? null,
                'maNVNhan' => $validated['maNVNhan'] ?? null,
                'ngayNhap' => $validated['ngayNhap'],
                'trangThai' => 'Chờ duyệt',
                'ghiChu' => $validated['ghiChu'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                // Tạo hoặc cập nhật thông tin Lô tồn kho (TonKho)
                TonKho::updateOrCreate(
                    ['maTonKho' => $item['maTonKho']],
                    [
                        'tenTonKho' => 'Lô NVL ' . $item['maNVL'],
                        'maNVL' => $item['maNVL'],
                        'ngaySanXuat' => $item['ngaySanXuat'],
                        'hanSuDung' => $item['hanSuDung'],
                        'soLuongNhap' => $item['soLuong'],
                        'soLuongTonHienTai' => 0, // Chưa cộng tồn kho cho tới khi xác nhận hoàn thành
                        'trangThai' => 'Còn hạn',
                    ]
                );

                $donGia = $item['donGia'] ?? 0;
                ChiTietPhieuNhapNVL::create([
                    'maPhieuNhapNVL' => $receipt->maPhieuNhapNVL,
                    'maTonKho' => $item['maTonKho'],
                    'soLuong' => $item['soLuong'],
                    'donGia' => $donGia,
                    'thanhTien' => $donGia * $item['soLuong'],
                    'ngaySanXuat' => $item['ngaySanXuat'],
                    'hanSuDung' => $item['hanSuDung'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu nhập nguyên vật liệu thành công (Trạng thái: Chờ duyệt)',
                'data' => $receipt->load('chiTiets'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lập phiếu: ' . $e->getMessage()], 500);
        }
    }

    public function approveRawMaterialReceipt($id)
    {
        $receipt = PhieuNhapNVL::findOrFail($id);
        $receipt->update(['trangThai' => 'Đã duyệt']);

        return response()->json([
            'success' => true,
            'message' => 'Đã phê duyệt phiếu nhập nguyên vật liệu',
            'data' => $receipt,
        ]);
    }

    // Xác nhận hoàn thành phiếu nhập -> Tự động cộng tồn kho theo lô (CF-FR18)
    public function completeRawMaterialReceipt($id)
    {
        $receipt = PhieuNhapNVL::with('chiTiets')->findOrFail($id);

        if ($receipt->trangThai === 'Hoàn thành') {
            return response()->json(['success' => false, 'message' => 'Phiếu nhập đã được xác nhận hoàn thành trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($receipt->chiTiets as $detail) {
                $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
                if ($tonKho) {
                    $tonKho->soLuongTonHienTai += $detail->soLuong;
                    $tonKho->save();
                }
            }

            $receipt->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận hoàn thành nhập kho NVL thành công! Tồn kho đã được tự động cộng.',
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi cộng tồn kho: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // 2. NHẬP KHO SẢN PHẨM TỪ XƯỞNG SẢN XUẤT (CF-FR20 đến CF-FR29)
    // =========================================================================

    public function getProductReceipts(Request $request)
    {
        $query = PhieuNhapSP::with(['chiTiets.tonKho']);

        if ($request->has('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayNhap', 'desc')->get(),
        ]);
    }

    public function completeProductReceipt($id)
    {
        $receipt = PhieuNhapSP::with('chiTiets')->findOrFail($id);

        DB::beginTransaction();
        try {
            foreach ($receipt->chiTiets as $detail) {
                $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
                if ($tonKho) {
                    $tonKho->soLuongTonHienTai += $detail->soLuong;
                    $tonKho->save();
                }
            }

            $receipt->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận hoàn thành nhập kho sản phẩm thành công! Tồn kho thành phẩm đã được cập nhật.',
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi nhập kho thành phẩm: ' . $e->getMessage()], 500);
        }
    }
}
