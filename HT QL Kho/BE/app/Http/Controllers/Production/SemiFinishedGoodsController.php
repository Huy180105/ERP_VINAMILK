<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\BanThanhPham;
use App\Models\PhieuYeuCauBTP;
use App\Models\ChiTietPhieuYeuCauBTP;
use App\Models\TienDoSanXuat;
use App\Models\ChiTietTienDoSanXuat;
use App\Models\CongDoan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SemiFinishedGoodsController extends Controller
{
    /**
     * Danh sách Bán Thành Phẩm (BTP) hiện có trong xưởng (PR-FR24)
     */
    public function getBTPList(Request $request)
    {
        $query = BanThanhPham::with('congDoan.lenhSanXuat');

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('maBTP', 'like', "%{$keyword}%")
                  ->orWhere('tenBTP', 'like', "%{$keyword}%");
            });
        }

        $btpList = $query->get();

        return response()->json([
            'success' => true,
            'data' => $btpList
        ]);
    }

    /**
     * Tạo hoặc cập nhật Bán thành phẩm mới (PR-FR25)
     */
    public function createBTP(Request $request)
    {
        $validated = $request->validate([
            'maBTP' => 'required|string|unique:BanThanhPham,maBTP',
            'tenBTP' => 'required|string|max:255',
            'maCongDoan' => 'nullable|string|exists:CongDoan,maCongDoan',
            'soLuong' => 'required|integer|min:0',
            'donVi' => 'nullable|string|max:20',
            'trangThai' => 'nullable|string|max:50',
            'ghiChu' => 'nullable|string|max:255',
        ]);

        $btp = BanThanhPham::create([
            'maBTP' => $validated['maBTP'],
            'tenBTP' => $validated['tenBTP'],
            'maCongDoan' => $validated['maCongDoan'] ?? null,
            'soLuong' => $validated['soLuong'],
            'donVi' => $validated['donVi'] ?? 'Lít',
            'trangThai' => $validated['trangThai'] ?? 'Đạt chuẩn',
            'ghiChu' => $validated['ghiChu'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo Bán Thành Phẩm thành công!',
            'data' => $btp
        ], 201);
    }

    /**
     * Danh sách Phiếu chuyển / Yêu cầu BTP giữa các công đoạn (PR-FR27)
     */
    public function getBTPTransferRequests(Request $request)
    {
        $query = PhieuYeuCauBTP::with(['lenhSanXuat', 'congDoan', 'nhanVien', 'chiTiets.banThanhPham']);

        if ($request->filled('maLenh')) {
            $query->where('maLenh', $request->maLenh);
        }

        $requests = $query->orderBy('ngayYeuCau', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Tạo Phiếu yêu cầu chuyển BTP (PR-FR27)
     */
    public function createBTPTransferRequest(Request $request)
    {
        $validated = $request->validate([
            'maPhieuYCBTP' => 'nullable|string|unique:PhieuYeuCauBTP,maPhieuYCBTP',
            'maLenh' => 'required|string|exists:LenhSanXuat,maLenh',
            'maCongDoan' => 'nullable|string|exists:CongDoan,maCongDoan',
            'maNhanVien' => 'nullable|string|exists:NhanVien,maNV',
            'ngayYeuCau' => 'required|date',
            'ghiChu' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.maBTP' => 'required|string',
            'items.*.soLuong' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $reqCode = $validated['maPhieuYCBTP'];
            if (!$reqCode) {
                $count = PhieuYeuCauBTP::count() + 1;
                $reqCode = 'YCBTP' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }

            $req = PhieuYeuCauBTP::create([
                'maPhieuYCBTP' => $reqCode,
                'maLenh' => $validated['maLenh'],
                'maCongDoan' => $validated['maCongDoan'] ?? null,
                'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
                'ngayYeuCau' => $validated['ngayYeuCau'],
                'trangThai' => 'Đã duyệt chuyển',
                'ghiChu' => $validated['ghiChu'] ?? 'Phiếu điều chuyển BTP sang công đoạn tiếp theo',
            ]);

            foreach ($validated['items'] as $item) {
                $btp = BanThanhPham::find($item['maBTP']);
                ChiTietPhieuYeuCauBTP::create([
                    'maPhieuYCBTP' => $reqCode,
                    'maBTP' => $item['maBTP'],
                    'tenBTP' => $btp ? $btp->tenBTP : $item['maBTP'],
                    'soLuong' => $item['soLuong'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Tạo phiếu điều chuyển BTP ({$reqCode}) thành công!",
                'data' => PhieuYeuCauBTP::with(['chiTiets', 'nhanVien'])->where('maPhieuYCBTP', $reqCode)->first()
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo phiếu BTP: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Nhật ký Tiến độ sản xuất (PR-FR32)
     */
    public function getProgressLogs(Request $request)
    {
        $query = TienDoSanXuat::with(['lenhSanXuat', 'congDoan', 'nhanVien', 'chiTiets.banThanhPham']);

        if ($request->filled('maLenh')) {
            $query->where('maLenh', $request->maLenh);
        }

        $logs = $query->orderBy('ngaySX', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
