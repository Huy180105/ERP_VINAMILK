<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\CongDoan;
use App\Models\LenhSanXuat;
use App\Models\BanThanhPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductionStageController extends Controller
{
    /**
     * Lấy danh sách công đoạn sản xuất (PR-FR18)
     */
    public function getStages(Request $request)
    {
        $query = CongDoan::with(['lenhSanXuat.chiTiets.sanPham', 'nhanVien', 'phieuYeuCauNVLs']);

        if ($request->filled('maLenh')) {
            $query->where('maLenh', $request->maLenh);
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->trangThai);
        }

        $stages = $query->orderBy('maLenh', 'asc')->orderBy('khau', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $stages
        ]);
    }

    /**
     * Bắt đầu thực hiện công đoạn (PR-FR20)
     */
    public function startStage(Request $request, $id)
    {
        $stage = CongDoan::where('maCongDoan', $id)->firstOrFail();
        $stage->trangThai = 'Đang thực hiện';
        $stage->ngayBatDau = Carbon::today()->format('Y-m-d');
        $stage->save();

        return response()->json([
            'success' => true,
            'message' => "Công đoạn {$stage->tenLenh} ({$id}) đã bắt đầu chạy!",
            'data' => $stage
        ]);
    }

    /**
     * Hoàn thành công đoạn & ghi nhận BTP (PR-FR21, PR-FR24, PR-BR08)
     */
    public function completeStage(Request $request, $id)
    {
        $stage = CongDoan::where('maCongDoan', $id)->firstOrFail();

        $validated = $request->validate([
            'soLuongThanhPham' => 'nullable|integer|min:0',
            'thanhPham' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $stage->trangThai = 'Hoàn thành';
            $stage->ngayKetThuc = Carbon::today()->format('Y-m-d');
            if (isset($validated['soLuongThanhPham'])) {
                $stage->soLuongThanhPham = $validated['soLuongThanhPham'];
            }
            if (isset($validated['thanhPham'])) {
                $stage->thanhPham = $validated['thanhPham'];
            }
            $stage->save();

            // Auto-create or update BanThanhPham entry
            $btpCode = 'BTP-' . $stage->maCongDoan;
            BanThanhPham::updateOrCreate(
                ['maBTP' => $btpCode],
                [
                    'tenBTP' => $stage->thanhPham ?? 'BTP Khâu ' . $stage->khau,
                    'maCongDoan' => $stage->maCongDoan,
                    'soLuong' => $stage->soLuongThanhPham ?? 1000,
                    'donVi' => 'Lít / Hộp',
                    'trangThai' => 'Đạt chuẩn',
                    'ghiChu' => "Sản lượng tạo ra sau công đoạn {$stage->tenLenh}",
                ]
            );

            // Automatically start the next stage in sequence if it exists
            $nextStage = CongDoan::where('maLenh', $stage->maLenh)
                ->where('khau', $stage->khau + 1)
                ->first();

            if ($nextStage && $nextStage->trangThai === 'Chờ thực hiện') {
                $nextStage->trangThai = 'Đang thực hiện';
                $nextStage->ngayBatDau = Carbon::today()->format('Y-m-d');
                $nextStage->save();
            }

            // Check if all stages of the order are finished
            $remaining = CongDoan::where('maLenh', $stage->maLenh)
                ->where('trangThai', '!=', 'Hoàn thành')
                ->count();

            if ($remaining === 0) {
                LenhSanXuat::where('maLenh', $stage->maLenh)->update(['trangThai' => 'Hoàn thành']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Công đoạn {$stage->tenLenh} ({$id}) đã hoàn thành xuất sắc!",
                'data' => $stage
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hoàn thành công đoạn: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạm dừng công đoạn & Ghi nhận sự cố kỹ thuật (PR-FR22, PR-FR23, PR-BR14)
     */
    public function recordIncident(Request $request, $id)
    {
        $stage = CongDoan::where('maCongDoan', $id)->firstOrFail();

        $validated = $request->validate([
            'lyDoSuCo' => 'required|string|max:255',
            'nhanCongDieuChinh' => 'nullable|integer',
        ]);

        $stage->trangThai = 'Tạm dừng (Sự cố)';
        $stage->thanhPham = ($stage->thanhPham ?? '') . " [SỰ CỐ: {$validated['lyDoSuCo']}]";
        if (isset($validated['nhanCongDieuChinh'])) {
            $stage->nhanCong = $validated['nhanCongDieuChinh'];
        }
        $stage->save();

        return response()->json([
            'success' => true,
            'message' => "Đã ghi nhận sự cố và tạm dừng công đoạn {$stage->tenLenh} ({$id})!",
            'data' => $stage
        ]);
    }

    /**
     * Tiếp tục công đoạn sau sự cố
     */
    public function resumeStage(Request $request, $id)
    {
        $stage = CongDoan::where('maCongDoan', $id)->firstOrFail();
        $stage->trangThai = 'Đang thực hiện';
        $stage->save();

        return response()->json([
            'success' => true,
            'message' => "Công đoạn {$stage->tenLenh} đã được khôi phục hoạt động!",
            'data' => $stage
        ]);
    }

    /**
     * Phân công nhân sự & nhân công thực hiện công đoạn (PR-FR19)
     */
    public function assignStaff(Request $request, $id)
    {
        $stage = CongDoan::where('maCongDoan', $id)->firstOrFail();

        $validated = $request->validate([
            'maNhanVien' => 'required|string|exists:NhanVien,maNV',
            'nhanCong' => 'required|integer|min:1',
            'chiPhi' => 'nullable|numeric|min:0',
        ]);

        $stage->update([
            'maNhanVien' => $validated['maNhanVien'],
            'nhanCong' => $validated['nhanCong'],
            'chiPhi' => $validated['chiPhi'] ?? $stage->chiPhi,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Đã phân công nhân sự quản lý công đoạn {$id} thành công!",
            'data' => $stage->load('nhanVien')
        ]);
    }
}
