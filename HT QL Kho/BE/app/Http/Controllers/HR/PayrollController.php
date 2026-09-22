<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\BangLuong;
use App\Models\BangCong;
use App\Models\HopDong;
use App\Models\NhanVien;
use App\Models\LichSuNhanSu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    // =========================================================================
    // Danh sách bảng lương
    // =========================================================================
    public function getPayrolls(Request $request)
    {
        $role = $request->header('X-User-Role', 'QuanLyNhanSu');
        $userPhone = $request->header('X-User-Phone');

        $query = BangLuong::with(['nhanVien.phongBan', 'nhanVien.chucVu', 'bangCong', 'hopDong']);

        // Phân quyền nhân viên thông thường chỉ xem lương của chính mình
        if ($role === 'NhanVien' && $userPhone) {
            $staff = NhanVien::where('soDienThoai', $userPhone)->first();
            if ($staff) {
                $query->where('maNV', $staff->maNV);
            }
        } elseif ($request->filled('maNV')) {
            $query->where('maNV', $request->input('maNV'));
        }

        if ($request->filled('thang')) {
            $query->where('thang', $request->input('thang'));
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        if ($request->filled('maPhongBan')) {
            $query->whereHas('nhanVien', function ($q) use ($request) {
                $q->where('maPhongBan', $request->input('maPhongBan'));
            });
        }

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maBangLuong', 'LIKE', "%{$kw}%")
                  ->orWhere('maNV', 'LIKE', "%{$kw}%")
                  ->orWhereHas('nhanVien', function ($sub) use ($kw) {
                      $sub->where('hoTen', 'LIKE', "%{$kw}%");
                  });
            });
        }

        $payrolls = $query->orderBy('thang', 'desc')->orderBy('maNV', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $payrolls,
            'total' => $payrolls->count(),
        ]);
    }

    // =========================================================================
    // HR-FR17: Tính lương tháng tự động (Batch Calculation)
    // Quy tắc: HR-BR02 (loại trừ thôi việc), HR-BR05 (khấu trừ BHXH VAS)
    // =========================================================================
    public function calculateMonthlyPayroll(Request $request)
    {
        $validated = $request->validate([
            'thang' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{4}$/'],
        ]);

        $thang = $validated['thang'];

        // Kiểm tra nếu kỳ lương đã khóa sổ -> từ chối tính toán lại
        $lockedCount = BangLuong::where('thang', $thang)->where('trangThai', 'DaKhoa')->count();
        if ($lockedCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Kỳ lương {$thang} đã được khóa sổ (chốt số liệu). Vui lòng mở khóa kỳ lương trước nếu cần tính toán lại.",
            ], 400);
        }

        // Lấy tất cả nhân viên đang làm việc (HR-BR02: loại bỏ người đã thôi việc)
        $employees = NhanVien::with(['chucVu', 'hopDongHienTai'])
            ->where('trangThai', 'Đang làm việc')
            ->get();

        if ($employees->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy nhân viên đang làm việc trong hệ thống.',
            ], 404);
        }

        $results = [];
        $thangParts = explode('/', $thang);
        $codeThang = $thangParts[1] . $thangParts[0];

        DB::beginTransaction();
        try {
            foreach ($employees as $emp) {
                // Kiểm tra có hợp đồng lao động hiệu lực không
                $contract = $emp->hopDongHienTai;
                if (!$contract) {
                    continue; // Bỏ qua nếu chưa ký hợp đồng chính thức
                }

                // Kiểm tra có bảng chấm công tháng này không
                $timesheet = BangCong::where('maNV', $emp->maNV)->where('thang', $thang)->first();
                $soNgayCong = $timesheet ? $timesheet->soNgayCong : 22; // Mặc định 22 ngày công chuẩn nếu chưa nhập
                $soGioTangCa = $timesheet ? (float)$timesheet->soGioTangCa : 0;

                $luongCoBan = (float)$contract->mucLuongCoBan;
                $phuCap = $emp->chucVu ? (float)$emp->chucVu->phuCap : 0;

                // Chuẩn tính lương 22 ngày công chuẩn / tháng
                $luongNgay = $luongCoBan / 22;
                $luongThoiGian = $luongNgay * $soNgayCong;
                $luongGio = $luongNgay / 8;
                $luongTangCa = round($luongGio * 1.5 * $soGioTangCa);

                // HR-BR05: Khấu trừ bảo hiểm bắt buộc theo luật (10.5% gồm 8% BHXH + 1.5% BHYT + 1% BHTN)
                $khauTruBH = round($luongCoBan * 0.105);
                $khauTru = $khauTruBH;

                // Thực lĩnh = Lương thời gian + Phụ cấp chức vụ + Lương tăng ca - Khấu trừ bảo hiểm
                $tongThucNhan = max(0, round($luongThoiGian + $phuCap + $luongTangCa - $khauTru));

                $maBangLuong = 'BL-' . $codeThang . '-' . $emp->maNV;

                $payroll = BangLuong::updateOrCreate(
                    [
                        'maNV' => $emp->maNV,
                        'thang' => $thang,
                    ],
                    [
                        'maBangLuong' => $maBangLuong,
                        'maBangCong' => $timesheet?->maBangCong,
                        'maHopDong' => $contract->maHopDong,
                        'luongCoBan' => $luongCoBan,
                        'phuCap' => $phuCap,
                        'luongTangCa' => $luongTangCa,
                        'khauTru' => $khauTru,
                        'tongThucNhan' => $tongThucNhan,
                        'trangThai' => 'TamTinh',
                    ]
                );

                $results[] = $payroll;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã tính lương tự động thành công cho " . count($results) . " nhân viên kỳ {$thang}!",
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tính toán bảng lương: ' . $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================================
    // HR-FR18: Sửa bảng lương (Điều chỉnh trợ cấp/khấu trừ phát sinh trước khi chốt)
    // =========================================================================
    public function updatePayroll(Request $request, $id)
    {
        $payroll = BangLuong::findOrFail($id);

        // HR-BR04: Bảng lương đã được chốt sổ -> hệ thống từ chối chỉnh sửa
        if ($payroll->trangThai === 'DaKhoa') {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR04: Bảng lương tháng này đã được khóa sổ (chốt số liệu), từ chối chỉnh sửa.',
            ], 400);
        }

        $validated = $request->validate([
            'phuCap' => 'nullable|numeric|min:0',
            'luongTangCa' => 'nullable|numeric|min:0',
            'khauTru' => 'nullable|numeric|min:0',
            'lyDoSua' => 'required|string|min:5|max:255', // Lưu log lý do giải trình (HR-NFR04)
        ]);

        $phuCap = $validated['phuCap'] ?? $payroll->phuCap;
        $luongTangCa = $validated['luongTangCa'] ?? $payroll->luongTangCa;
        $khauTru = $validated['khauTru'] ?? $payroll->khauTru;

        // Tính lại tổng thực nhận
        $luongCoBan = (float)$payroll->luongCoBan;
        $soNgayCong = $payroll->bangCong ? $payroll->bangCong->soNgayCong : 22;
        $luongThoiGian = ($luongCoBan / 22) * $soNgayCong;
        $tongThucNhan = max(0, round($luongThoiGian + $phuCap + $luongTangCa - $khauTru));

        $currentUser = $request->header('X-User-Name', 'Quản lý nhân sự');

        // HR-NFR04: Lưu vết người thực hiện chỉnh sửa bảng lương
        LichSuNhanSu::create([
            'maNV' => $payroll->maNV,
            'loaiThayDoi' => 'SuaBangLuong',
            'noiDung' => "Điều chỉnh bảng lương [{$payroll->maBangLuong}] kỳ {$payroll->thang}: Phụ cấp: " . number_format($phuCap, 0, ',', '.') . "đ, Khấu trừ: " . number_format($khauTru, 0, ',', '.') . "đ, Thực nhận: " . number_format($tongThucNhan, 0, ',', '.') . "đ. Lý do: {$validated['lyDoSua']}.",
            'nguoiThucHien' => $currentUser,
            'ngayTao' => now(),
        ]);

        $payroll->update([
            'phuCap' => $phuCap,
            'luongTangCa' => $luongTangCa,
            'khauTru' => $khauTru,
            'tongThucNhan' => $tongThucNhan,
            'nguoiSua' => $currentUser,
            'lyDoSua' => $validated['lyDoSua'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Điều chỉnh số liệu bảng lương thành công!',
            'data' => $payroll->load(['nhanVien', 'bangCong']),
        ]);
    }

    // =========================================================================
    // HR-BR04: Khóa (chốt số liệu) bảng lương tháng
    // =========================================================================
    public function lockPayroll(Request $request)
    {
        $validated = $request->validate([
            'thang' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{4}$/'],
        ]);

        $count = BangLuong::where('thang', $validated['thang'])
            ->update(['trangThai' => 'DaKhoa']);

        return response()->json([
            'success' => true,
            'message' => "Đã chốt và khóa sổ toàn bộ {$count} phiếu lương kỳ {$validated['thang']} thành công (HR-BR04).",
        ]);
    }

    public function unlockPayroll(Request $request)
    {
        $validated = $request->validate([
            'thang' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{4}$/'],
        ]);

        $count = BangLuong::where('thang', $validated['thang'])
            ->update(['trangThai' => 'TamTinh']);

        return response()->json([
            'success' => true,
            'message' => "Đã mở khóa sổ kỳ lương {$validated['thang']}.",
        ]);
    }

    // =========================================================================
    // HR-FR20: Xuất báo cáo lương (Kiểm tra ràng buộc khóa sổ HR-BR04)
    // =========================================================================
    public function exportPayroll(Request $request)
    {
        $validated = $request->validate([
            'thang' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{4}$/'],
        ]);

        $thang = $validated['thang'];

        // HR-BR04: Bảng lương tháng phải được khóa (chốt số liệu) trước khi tiến hành xuất báo cáo chi trả
        $hasUnlocked = BangLuong::where('thang', $thang)->where('trangThai', 'TamTinh')->exists();
        if ($hasUnlocked) {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR04: Bảng lương tháng này chưa được khóa sổ hoàn tất. Vui lòng bấm "Chốt & Khóa Bảng Lương" trước khi tiến hành xuất báo cáo chi trả.',
            ], 400);
        }

        $records = BangLuong::with(['nhanVien.phongBan', 'nhanVien.chucVu', 'bangCong'])
            ->where('thang', $thang)
            ->orderBy('maNV', 'asc')
            ->get();

        if ($records->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => "Không tìm thấy dữ liệu bảng lương của kỳ {$thang}.",
            ], 404);
        }

        $totalFund = $records->sum('tongThucNhan');
        $totalInsurance = $records->sum('khauTru');
        $totalAllowance = $records->sum('phuCap');

        return response()->json([
            'success' => true,
            'data' => [
                'thang' => $thang,
                'tongNhanSu' => $records->count(),
                'tongQuyLuong' => $totalFund,
                'tongKhauTruBaoHiem' => $totalInsurance,
                'tongPhuCap' => $totalAllowance,
                'trangThai' => 'DaKhoa',
                'chiTiet' => $records,
            ],
        ]);
    }
}

