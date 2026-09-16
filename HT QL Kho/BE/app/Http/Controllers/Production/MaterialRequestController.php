<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\PhieuYeuCauNVL;
use App\Models\ChiTietPhieuYeuCauNVL;
use App\Models\NguyenVatLieu;
use App\Models\KhoNguyenVatLieu;
use App\Models\TonKho;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MaterialRequestController extends Controller
{
    /**
     * Lấy danh sách phiếu yêu cầu NVL (PR-FR16)
     */
    public function getRequests(Request $request)
    {
        $query = PhieuYeuCauNVL::with([
            'lenhSanXuat.chiTiets.sanPham',
            'congDoan',
            'nhanVien',
            'chiTiets.nguyenVatLieu'
        ]);

        if ($request->filled('maLenh')) {
            $query->where('maLenh', $request->maLenh);
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->trangThai);
        }

        $requests = $query->orderBy('ngayYeuCau', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Tạo phiếu yêu cầu cấp phát NVL mới (PR-FR15)
     */
    public function createRequest(Request $request)
    {
        $validated = $request->validate([
            'maPhieuYCNVL' => 'nullable|string|unique:PhieuYeuCauNVL,maPhieuYCNVL',
            'maLenh' => 'required|string|exists:LenhSanXuat,maLenh',
            'maCongDoan' => 'nullable|string|exists:CongDoan,maCongDoan',
            'maNhanVien' => 'nullable|string|exists:NhanVien,maNV',
            'ngayYeuCau' => 'required|date',
            'ghiChu' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.maNVL' => 'required|string|exists:NguyenVatLieu,maNVL',
            'items.*.soLuong' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $reqCode = $validated['maPhieuYCNVL'];
            if (!$reqCode) {
                $count = PhieuYeuCauNVL::count() + 1;
                $reqCode = 'YCNVL' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }

            $matReq = PhieuYeuCauNVL::create([
                'maPhieuYCNVL' => $reqCode,
                'maLenh' => $validated['maLenh'],
                'maCongDoan' => $validated['maCongDoan'] ?? null,
                'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
                'ngayYeuCau' => $validated['ngayYeuCau'],
                'trangThai' => 'Chưa xử lý',
                'ghiChu' => $validated['ghiChu'] ?? 'Yêu cầu nguyên vật liệu từ Xưởng Sản Xuất',
            ]);

            foreach ($validated['items'] as $item) {
                $nvl = NguyenVatLieu::find($item['maNVL']);
                ChiTietPhieuYeuCauNVL::create([
                    'maPhieuYCNVL' => $reqCode,
                    'maNVL' => $item['maNVL'],
                    'tenNVL' => $nvl ? $nvl->tenNVL : 'NVL',
                    'soLuong' => $item['soLuong'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Tạo Phiếu yêu cầu NVL ({$reqCode}) thành công!",
                'data' => PhieuYeuCauNVL::with(['chiTiets.nguyenVatLieu', 'nhanVien'])->where('maPhieuYCNVL', $reqCode)->first()
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo phiếu yêu cầu NVL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kiểm tra tồn kho khả dụng cho NVL từ Phân hệ Kho (PR-FR14, PR-BR06)
     */
    public function checkAvailability(Request $request)
    {
        $materials = NguyenVatLieu::with(['loaiNVL'])->get();

        $stockData = $materials->map(function ($m) {
            // Sum available stock from TonKho
            $stock = TonKho::where('maNVL', $m->maNVL)
                ->where('trangThai', 'Còn hạn')
                ->sum('soLuongTon');

            return [
                'maNVL' => $m->maNVL,
                'tenNVL' => $m->tenNVL,
                'donVi' => $m->donVi,
                'phanLoai' => $m->loaiNVL ? $m->loaiNVL->tenLoaiNVL : 'Khác',
                'soLuongTonKhaDung' => intval($stock),
                'tinhTrang' => $stock > 500 ? 'Đầy đủ' : ($stock > 0 ? 'Sắp hết' : 'Hết hàng'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stockData
        ]);
    }

    /**
     * Cập nhật trạng thái phiếu yêu cầu NVL (Duyệt xuất kho / Từ chối)
     */
    public function updateStatus(Request $request, $id)
    {
        $req = PhieuYeuCauNVL::where('maPhieuYCNVL', $id)->firstOrFail();

        $validated = $request->validate([
            'trangThai' => 'required|in:Chưa xử lý,Đã xuất kho,Từ chối',
        ]);

        $req->trangThai = $validated['trangThai'];
        $req->save();

        return response()->json([
            'success' => true,
            'message' => "Đã cập nhật trạng thái phiếu yêu cầu {$id} thành {$validated['trangThai']}!",
            'data' => $req
        ]);
    }
}
