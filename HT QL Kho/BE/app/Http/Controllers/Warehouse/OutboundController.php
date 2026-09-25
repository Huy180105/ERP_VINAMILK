<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\PhieuXuatNVL;
use App\Models\ChiTietPhieuXuatNVL;
use App\Models\PhieuXuatSP;
use App\Models\ChiTietPhieuXuatSP;
use App\Models\TonKho;
use App\Models\PhieuYeuCauNVL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutboundController extends Controller
{
    // =========================================================================
    // 1. XUẤT KHO NVL CẤP PHÁT CHO SẢN XUẤT (CF-FR30 đến CF-FR40)
    // =========================================================================

    public function getPendingMaterialRequests()
    {
        $requests = PhieuYeuCauNVL::with(['chiTiets.nguyenVatLieu', 'nhanVien', 'lenhSanXuat'])
            ->where('trangThai', 'Chưa xử lý')
            ->orderBy('ngayYeuCau', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function getRawMaterialDispatches(Request $request)
    {
        $dispatches = PhieuXuatNVL::with(['nhanVienTao', 'nhanVienNhan', 'chiTiets.tonKho'])
            ->when($request->filled('trangThai'), fn($q) => $q->where('trangThai', $request->input('trangThai')))
            ->orderBy('ngayXuat', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $dispatches,
        ]);
    }

    public function createRawMaterialDispatch(Request $request)
    {
        $validated = $request->validate([
            'maPhieuXuatNVL'   => 'required|string|unique:PhieuXuatNVL,maPhieuXuatNVL',
            'maXuong'          => 'nullable|string',
            'maNVTao'          => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan'         => 'nullable|string|exists:NhanVien,maNV',
            'ngayXuat'         => 'required|date',
            'maPhieuYeuCauNVL' => 'nullable|string',
            'ghiChu'           => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.maTonKho' => 'required|string|exists:TonKho,maTonKho',
            'items.*.soLuong'  => 'required|integer|min:1',
        ]);

        // Kiểm tra tồn kho khả dụng trước khi tạo phiếu
        foreach ($validated['items'] as $item) {
            $tonKho = TonKho::where('maTonKho', $item['maTonKho'])->first();
            if (!$tonKho || $tonKho->soLuongTonHienTai < $item['soLuong']) {
                $curr = $tonKho?->soLuongTonHienTai ?? 0;
                return response()->json([
                    'success' => false,
                    'message' => "Không đủ tồn kho khả dụng cho mã lô {$item['maTonKho']} (Tồn hiện tại: {$curr})",
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            $dispatch = PhieuXuatNVL::create([
                'maPhieuXuatNVL'   => $validated['maPhieuXuatNVL'],
                'maXuong'          => $validated['maXuong'] ?? null,
                'maNVTao'          => $validated['maNVTao'] ?? null,
                'maNVNhan'         => $validated['maNVNhan'] ?? null,
                'ngayXuat'         => $validated['ngayXuat'],
                'trangThai'        => 'Chờ duyệt',
                'maPhieuYeuCauNVL' => $validated['maPhieuYeuCauNVL'] ?? null,
                'ghiChu'           => $validated['ghiChu'] ?? null,
            ]);

            if (!empty($validated['maPhieuYeuCauNVL'])) {
                PhieuYeuCauNVL::where('maPhieuYCNVL', $validated['maPhieuYeuCauNVL'])
                    ->update(['trangThai' => 'Đang xử lý']);
            }

            foreach ($validated['items'] as $item) {
                ChiTietPhieuXuatNVL::create([
                    'maPhieuXuatNVL' => $dispatch->maPhieuXuatNVL,
                    'maTonKho'       => $item['maTonKho'],
                    'soLuong'        => $item['soLuong'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu xuất kho NVL thành công (Trạng thái: Chờ duyệt)',
                'data'    => $dispatch->load('chiTiets'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xuất kho NVL: ' . $e->getMessage()], 500);
        }
    }

    // Phê duyệt phiếu xuất kho NVL (CF-FR40)
    public function approveRawMaterialDispatch($id)
    {
        $dispatch = PhieuXuatNVL::findOrFail($id);
        $dispatch->update(['trangThai' => 'Đã duyệt']);
        
        if ($dispatch->maPhieuYeuCauNVL) {
            PhieuYeuCauNVL::where('maPhieuYCNVL', $dispatch->maPhieuYeuCauNVL)->update(['trangThai' => 'Đã duyệt']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Quản lý kho đã duyệt phiếu xuất kho nguyên vật liệu!',
            'data'    => $dispatch,
        ]);
    }

    // Từ chối phiếu xuất kho NVL (CF-FR41)
    public function rejectRawMaterialDispatch(Request $request, $id)
    {
        $dispatch = PhieuXuatNVL::findOrFail($id);

        if ($dispatch->trangThai !== 'Chờ duyệt') {
            return response()->json([
                'success' => false,
                'message' => "Chỉ được phép từ chối phiếu khi đang ở trạng thái 'Chờ duyệt'.",
            ], 400);
        }

        $lyDo = $request->input('lyDo', 'Không đạt yêu cầu xuất cấp');
        $dispatch->update([
            'trangThai' => 'Từ chối',
            'ghiChu'    => $dispatch->ghiChu ? ($dispatch->ghiChu . " | [Từ chối]: " . $lyDo) : ("[Từ chối]: " . $lyDo),
        ]);
        
        if ($dispatch->maPhieuYeuCauNVL) {
            PhieuYeuCauNVL::where('maPhieuYCNVL', $dispatch->maPhieuYeuCauNVL)->update(['trangThai' => 'Không duyệt']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Quản lý kho đã từ chối duyệt phiếu xuất kho NVL!',
            'data'    => $dispatch,
        ]);
    }

    // Xác nhận hoàn thành phiếu xuất NVL -> Tự động trừ tồn kho theo lô (CF-FR39)
    public function completeRawMaterialDispatch($id)
    {
        $dispatch = PhieuXuatNVL::with('chiTiets')->findOrFail($id);

        if ($dispatch->trangThai === 'Đã xuất kho' || $dispatch->trangThai === 'Hoàn thành') {
            return response()->json(['success' => false, 'message' => 'Phiếu xuất đã được xuất kho trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            if ($err = $this->deductInventoryLots($dispatch->chiTiets)) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => $err], 400);
            }

            $dispatch->update(['trangThai' => 'Hoàn thành']);

            if ($dispatch->maPhieuYeuCauNVL) {
                PhieuYeuCauNVL::where('maPhieuYCNVL', $dispatch->maPhieuYeuCauNVL)
                    ->update(['trangThai' => 'Đã xuất kho']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận hoàn thành xuất kho NVL! Tồn kho đã được trừ.',
                'data'    => $dispatch,
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
        $dispatches = PhieuXuatSP::with(['khachHang', 'chiTiets.tonKho'])
            ->when($request->filled('trangThai'), fn($q) => $q->where('trangThai', $request->input('trangThai')))
            ->orderBy('ngayXuat', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $dispatches,
        ]);
    }

    // Phê duyệt phiếu xuất SP (CF-FR48)
    public function approveProductDispatch($id)
    {
        $dispatch = PhieuXuatSP::findOrFail($id);
        $dispatch->update(['trangThai' => 'Đã duyệt']);

        return response()->json([
            'success' => true,
            'message' => 'Quản lý kho đã duyệt phiếu xuất sản phẩm thành công!',
            'data'    => $dispatch,
        ]);
    }

    // Từ chối phiếu xuất SP (CF-FR49)
    public function rejectProductDispatch(Request $request, $id)
    {
        $dispatch = PhieuXuatSP::findOrFail($id);

        if ($dispatch->trangThai !== 'Chờ duyệt') {
            return response()->json([
                'success' => false,
                'message' => "Chỉ được phép từ chối phiếu xuất khi đang ở trạng thái 'Chờ duyệt'.",
            ], 400);
        }

        $lyDo = $request->input('lyDo', 'Chưa đủ điều kiện xuất kho');
        $dispatch->update([
            'trangThai' => 'Từ chối',
            'ghiChu'    => $dispatch->ghiChu ? ($dispatch->ghiChu . " | [Từ chối]: " . $lyDo) : ("[Từ chối]: " . $lyDo),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quản lý kho đã từ chối phiếu xuất sản phẩm!',
            'data'    => $dispatch,
        ]);
    }

    public function completeProductDispatch($id)
    {
        $dispatch = PhieuXuatSP::with('chiTiets')->findOrFail($id);

        if ($dispatch->trangThai === 'Đã xuất kho' || $dispatch->trangThai === 'Hoàn thành') {
            return response()->json(['success' => false, 'message' => 'Phiếu xuất đã được xuất kho trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            if ($err = $this->deductInventoryLots($dispatch->chiTiets)) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => $err], 400);
            }

            $dispatch->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xuất kho sản phẩm cho khách hàng thành công! Tồn kho đã giảm theo lô.',
                'data'    => $dispatch,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xuất kho thành phẩm: ' . $e->getMessage()], 500);
        }
    }

    // Trợ giúp trừ tồn kho theo lô dùng chung
    private function deductInventoryLots($chiTiets): ?string
    {
        foreach ($chiTiets as $detail) {
            $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
            if ($tonKho) {
                if ($tonKho->soLuongTonHienTai < $detail->soLuong) {
                    return "Lô {$detail->maTonKho} không đủ tồn kho để trừ";
                }
                $tonKho->decrement('soLuongTonHienTai', $detail->soLuong);
            }
        }
        return null;
    }
}
