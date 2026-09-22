<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\BangCong;
use App\Models\BangLuong;
use App\Models\NhanVien;
use App\Models\LichSuNhanSu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TimesheetController extends Controller
{
    // =========================================================================
    // HR-FR16: Tra cứu công (Hỗ trợ phân quyền HR vs Nhân viên)
    // =========================================================================
    public function getTimesheets(Request $request)
    {
        $role = $request->header('X-User-Role', 'QuanLyNhanSu');
        $userPhone = $request->header('X-User-Phone');

        $query = BangCong::with(['nhanVien.phongBan', 'nhanVien.chucVu']);

        // Phân quyền theo vai trò (HR-FR16):
        // Nếu là Nhân viên thông thường -> chỉ được xem công của chính mình
        if ($role === 'NhanVien' && $userPhone) {
            $staff = NhanVien::where('soDienThoai', $userPhone)->first();
            if ($staff) {
                $query->where('maNV', $staff->maNV);
            }
        } elseif ($request->filled('maNV')) {
            $query->where('maNV', $request->input('maNV'));
        }

        // Lọc theo tháng (MM/YYYY)
        if ($request->filled('thang')) {
            $query->where('thang', $request->input('thang'));
        }

        // Lọc theo phòng ban
        if ($request->filled('maPhongBan')) {
            $query->whereHas('nhanVien', function ($q) use ($request) {
                $q->where('maPhongBan', $request->input('maPhongBan'));
            });
        }

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maBangCong', 'LIKE', "%{$kw}%")
                  ->orWhere('maNV', 'LIKE', "%{$kw}%")
                  ->orWhereHas('nhanVien', function ($sub) use ($kw) {
                      $sub->where('hoTen', 'LIKE', "%{$kw}%");
                  });
            });
        }

        $timesheets = $query->orderBy('thang', 'desc')->orderBy('maNV', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $timesheets,
            'total' => $timesheets->count(),
        ]);
    }

    // =========================================================================
    // HR-FR13: Ghi nhận chấm công (Thêm hoặc khởi tạo theo tháng)
    // =========================================================================
    public function recordTimesheet(Request $request)
    {
        $validated = $request->validate([
            'maNV' => 'required|string|max:20|exists:NhanVien,maNV',
            'thang' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{4}$/'], // MM/YYYY
            'soNgayCong' => 'required|integer|min:0|max:31',
            'soGioTangCa' => 'nullable|numeric|min:0|max:100',
            'soNgayNghiPhep' => 'nullable|integer|min:0|max:12', // HR-BR03
            'lyDoGiaiTrinh' => 'nullable|string|max:255',
        ]);

        $employee = NhanVien::findOrFail($validated['maNV']);

        // HR-BR02: Nhân viên đã có quyết định thôi việc/nghỉ việc không được tính công cho các kỳ tiếp theo
        if ($employee->trangThai === 'Đã nghỉ việc') {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR02: Nhân viên này đã nghỉ việc, không được ghi nhận chấm công.',
            ], 422);
        }

        // HR-BR03: Kiểm tra giới hạn ngày nghỉ phép có lương (tối đa 12 ngày/năm)
        $nghiPhep = $validated['soNgayNghiPhep'] ?? 0;
        if ($nghiPhep > 12) {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR03: Số ngày nghỉ phép có lương vượt quá hạn mức tối đa 12 ngày/năm theo luật lao động.',
            ], 422);
        }

        // Kiểm tra xem đã có bảng công kỳ này chưa
        $existing = BangCong::where('maNV', $validated['maNV'])
            ->where('thang', $validated['thang'])
            ->first();

        if ($existing) {
            // HR-BR04: Không được sửa nếu bảng công hoặc kỳ lương đã khóa sổ
            if ($existing->trangThai === 'DaKhoa') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bảng chấm công của kỳ này đã bị khóa sổ, không thể chỉnh sửa.',
                ], 400);
            }

            $existing->update([
                'soNgayCong' => $validated['soNgayCong'],
                'soGioTangCa' => $validated['soGioTangCa'] ?? 0,
                'soNgayNghiPhep' => $nghiPhep,
                'lyDoGiaiTrinh' => $validated['lyDoGiaiTrinh'] ?? $existing->lyDoGiaiTrinh,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dữ liệu chấm công thành công!',
                'data' => $existing->load('nhanVien'),
            ]);
        }

        // Tạo mã bảng công tự động: BC-YYYYMM-X
        $thangClean = str_replace('/', '', $validated['thang']);
        $thangParts = explode('/', $validated['thang']);
        $codeThang = $thangParts[1] . $thangParts[0];
        $maBangCong = 'BC-' . $codeThang . '-' . $validated['maNV'];

        $timesheet = BangCong::create([
            'maBangCong' => $maBangCong,
            'maNV' => $validated['maNV'],
            'thang' => $validated['thang'],
            'soNgayCong' => $validated['soNgayCong'],
            'soGioTangCa' => $validated['soGioTangCa'] ?? 0,
            'soNgayNghiPhep' => $nghiPhep,
            'trangThai' => 'DangChot',
            'lyDoGiaiTrinh' => $validated['lyDoGiaiTrinh'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ghi nhận chấm công thành công!',
            'data' => $timesheet->load('nhanVien'),
        ], 201);
    }

    // =========================================================================
    // HR-FR14: Sửa bảng công (Yêu cầu giải trình hợp lệ, kiểm tra khóa sổ)
    // =========================================================================
    public function updateTimesheet(Request $request, $id)
    {
        $timesheet = BangCong::findOrFail($id);

        // Kiểm tra xem bảng lương kỳ này đã chốt/khóa chưa
        $isPayrollLocked = BangLuong::where('maBangCong', $id)
            ->where('trangThai', 'DaKhoa')
            ->exists();

        if ($timesheet->trangThai === 'DaKhoa' || $isPayrollLocked) {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR04: Kỳ công/kỳ lương này đã bị khóa sổ hoặc hoàn tất chi trả. Không thể chỉnh sửa dữ liệu chấm công.',
            ], 400);
        }

        $validated = $request->validate([
            'soNgayCong' => 'required|integer|min:0|max:31',
            'soGioTangCa' => 'nullable|numeric|min:0|max:100',
            'soNgayNghiPhep' => 'nullable|integer|min:0|max:12',
            'lyDoGiaiTrinh' => 'required|string|min:5|max:255', // Yêu cầu giải trình bắt buộc (HR-FR14)
        ]);

        // HR-BR03: Kiểm tra hạn mức phép
        if (($validated['soNgayNghiPhep'] ?? 0) > 12) {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR03: Số ngày nghỉ phép vượt quá định mức 12 ngày/năm.',
            ], 422);
        }

        $timesheet->update([
            'soNgayCong' => $validated['soNgayCong'],
            'soGioTangCa' => $validated['soGioTangCa'] ?? 0,
            'soNgayNghiPhep' => $validated['soNgayNghiPhep'] ?? $timesheet->soNgayNghiPhep,
            'lyDoGiaiTrinh' => $validated['lyDoGiaiTrinh'],
        ]);

        // Lưu vết kiểm toán chỉnh sửa bảng công
        LichSuNhanSu::create([
            'maNV' => $timesheet->maNV,
            'loaiThayDoi' => 'SuaBangCong',
            'noiDung' => "Chỉnh sửa công tháng {$timesheet->thang}: Ngày công: {$timesheet->soNgayCong}, Tăng ca: {$timesheet->soGioTangCa}h. Lý do: {$validated['lyDoGiaiTrinh']}.",
            'nguoiThucHien' => $request->header('X-User-Name', 'Quản lý nhân sự'),
            'ngayTao' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chỉnh sửa bảng chấm công thành công!',
            'data' => $timesheet->load('nhanVien'),
        ]);
    }

    // =========================================================================
    // Khóa sổ bảng chấm công tháng
    // =========================================================================
    public function lockTimesheets(Request $request)
    {
        $validated = $request->validate([
            'thang' => ['required', 'string', 'regex:/^(0[1-9]|1[0-2])\/\d{4}$/'],
        ]);

        $count = BangCong::where('thang', $validated['thang'])
            ->update(['trangThai' => 'DaKhoa']);

        return response()->json([
            'success' => true,
            'message' => "Đã khóa sổ toàn bộ {$count} bảng chấm công kỳ {$validated['thang']}.",
        ]);
    }
}

