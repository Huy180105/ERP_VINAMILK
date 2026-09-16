<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\PhieuXuatNVL;
use App\Models\ChiTietPhieuXuatNVL;
use App\Models\PhieuXuatSP;
use App\Models\ChiTietPhieuXuatSP;
use App\Models\TonKho;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutboundController extends Controller
{
    // =========================================================================
    // 1. XUẤT KHO NVL CẤP PHÁT CHO SẢN XUẤT (CF-FR30 đến CF-FR40)
    // =========================================================================

    public function getRawMaterialDispatches(Request $request)
    {
        $query = PhieuXuatNVL::with(['nhanVienTao', 'nhanVienNhan', 'chiTiets.tonKho']);

        if ($request->has('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayXuat', 'desc')->get(),
        ]);
    }

    public function createRawMaterialDispatch(Request $request)
    {
        $validated = $request->validate([
            'maPhieuXuatNVL' => 'required|string|unique:PhieuXuatNVL,maPhieuXuatNVL',
            'maXuong' => 'nullable|string',
            'maNVTao' => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan' => 'nullable|string|exists:NhanVien,maNV',
            'ngayXuat' => 'required|date',
            'maPhieuYeuCauNVL' => 'nullable|string',
            'ghiChu' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.maTonKho' => 'required|string|exists:TonKho,maTonKho',
            'items.*.soLuong' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Kiểm tra tồn kho khả dụng trước khi cho phép xuất
            foreach ($validated['items'] as $item) {
                $tonKho = TonKho::where('maTonKho', $item['maTonKho'])->first();
                if (!$tonKho || $tonKho->soLuongTonHienTai < $item['soLuong']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Không đủ tồn kho khả dụng cho mã lô {$item['maTonKho']} (Tồn hiện tại: {$tonKho->soLuongTonHienTai})",
                    ], 400);
                }
            }

            $dispatch = PhieuXuatNVL::create([
                'maPhieuXuatNVL' => $validated['maPhieuXuatNVL'],
                'maXuong' => $validated['maXuong'] ?? null,
                'maNVTao' => $validated['maNVTao'] ?? null,
                'maNVNhan' => $validated['maNVNhan'] ?? null,
                'ngayXuat' => $validated['ngayXuat'],
                'trangThai' => 'Chờ duyệt',
                'maPhieuYeuCauNVL' => $validated['maPhieuYeuCauNVL'] ?? null,
                'ghiChu' => $validated['ghiChu'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                ChiTietPhieuXuatNVL::create([
                    'maPhieuXuatNVL' => $dispatch->maPhieuXuatNVL,
                    'maTonKho' => $item['maTonKho'],
                    'soLuong' => $item['soLuong'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu xuất kho NVL thành công (Trạng thái: Chờ duyệt)',
                'data' => $dispatch->load('chiTiets'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xuất kho NVL: ' . $e->getMessage()], 500);
        }
    }

    // Xác nhận hoàn thành phiếu xuất NVL -> Tự động trừ tồn kho theo lô (CF-FR39)
    public function completeRawMaterialDispatch($id)
    {
        $dispatch = PhieuXuatNVL::with('chiTiets')->findOrFail($id);

        if ($dispatch->trangThai === 'Hoàn thành') {
            return response()->json(['success' => false, 'message' => 'Phiếu xuất đã được hoàn thành trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($dispatch->chiTiets as $detail) {
                $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
                if ($tonKho) {
                    if ($tonKho->soLuongTonHienTai < $detail->soLuong) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => "Lô {$detail->maTonKho} không đủ tồn kho để trừ"], 400);
                    }
                    $tonKho->soLuongTonHienTai -= $detail->soLuong;
                    $tonKho->save();
                }
            }

            $dispatch->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận hoàn thành xuất kho NVL! Tồn kho đã được trừ.',
                'data' => $dispatch,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi trừ tồn kho: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // 2. XUẤT KHO SẢN PHẨM GIAO CHO KHÁCH HÀNG / NPP (CF-FR41 đến CF-FR50)
    // =========================================================================

    public function getProductDispatches(Request $request)
    {
        $query = PhieuXuatSP::with(['khachHang', 'chiTiets.tonKho']);

        if ($request->has('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayXuat', 'desc')->get(),
        ]);
    }

    public function completeProductDispatch($id)
    {
        $dispatch = PhieuXuatSP::with('chiTiets')->findOrFail($id);

        DB::beginTransaction();
        try {
            foreach ($dispatch->chiTiets as $detail) {
                $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
                if ($tonKho) {
                    if ($tonKho->soLuongTonHienTai < $detail->soLuong) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => "Lô sản phẩm {$detail->maTonKho} không đủ tồn kho"], 400);
                    }
                    $tonKho->soLuongTonHienTai -= $detail->soLuong;
                    $tonKho->save();
                }
            }

            $dispatch->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xuất kho sản phẩm cho khách hàng thành công! Tồn kho đã giảm theo lô.',
                'data' => $dispatch,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xuất kho thành phẩm: ' . $e->getMessage()], 500);
        }
    }
}
