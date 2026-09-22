<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\NhanVien;
use App\Models\TaiKhoan;
use App\Models\LichSuNhanSu;
use App\Models\HopDong;
use App\Models\BangCong;
use App\Models\BangLuong;
use App\Models\PhongBan;
use App\Models\ChucVu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    // =========================================================================
    // HR-FR04: Tìm kiếm / Danh sách nhân viên
    // =========================================================================
    public function getEmployees(Request $request)
    {
        $query = NhanVien::with(['phongBan', 'chucVu', 'hopDongHienTai', 'taiKhoan']);

        // Lọc theo từ khóa (Mã NV, Họ tên, SĐT, Email)
        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maNV', 'LIKE', "%{$kw}%")
                  ->orWhere('hoTen', 'LIKE', "%{$kw}%")
                  ->orWhere('soDienThoai', 'LIKE', "%{$kw}%")
                  ->orWhere('email', 'LIKE', "%{$kw}%");
            });
        }

        // Lọc theo phòng ban
        if ($request->filled('maPhongBan')) {
            $query->where('maPhongBan', $request->input('maPhongBan'));
        }

        // Lọc theo chức vụ
        if ($request->filled('maChucVu')) {
            $query->where('maChucVu', $request->input('maChucVu'));
        }

        // Lọc theo trạng thái làm việc
        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        $employees = $query->orderBy('maNV', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $employees,
            'total' => $employees->count(),
        ]);
    }

    // =========================================================================
    // Xem chi tiết nhân viên và lịch sử biến động (HR-BR07)
    // =========================================================================
    public function getEmployeeDetail($id)
    {
        $employee = NhanVien::with([
            'phongBan', 
            'chucVu', 
            'hopDongs' => fn($q) => $q->orderBy('ngayHieuLuc', 'desc'),
            'bangCongs' => fn($q) => $q->orderBy('thang', 'desc')->take(12),
            'bangLuongs' => fn($q) => $q->orderBy('thang', 'desc')->take(12),
            'taiKhoan',
            'lichSuThayDoi'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $employee,
        ]);
    }

    // =========================================================================
    // HR-FR01: Thêm nhân viên mới (kèm HR-BR09 tự tạo TK, HR-BR12 SĐT duy nhất)
    // =========================================================================
    public function createEmployee(Request $request)
    {
        $validated = $request->validate([
            'maNV' => 'required|string|max:20|unique:NhanVien,maNV',
            'hoTen' => 'required|string|max:100',
            'soDienThoai' => 'required|string|max:20|unique:NhanVien,soDienThoai', // HR-BR12
            'email' => 'nullable|email|max:100',
            'ngaySinh' => 'nullable|date',
            'gioiTinh' => 'nullable|string|max:10',
            'trinhDo' => 'nullable|string|max:50',
            'maPhongBan' => 'nullable|string|max:20|exists:PhongBan,maPhongBan',
            'maChucVu' => 'nullable|string|max:20|exists:ChucVu,maChucVu',
            'ngayVaoLam' => 'nullable|date',
            'trangThai' => 'nullable|string|max:50',
            'vaiTro' => 'nullable|string|in:QuanLyNhanSu,ChuyenVienNhanSu,NhanVien',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // 1. Tạo hồ sơ nhân viên
            $employee = NhanVien::create([
                'maNV' => $validated['maNV'],
                'hoTen' => $validated['hoTen'],
                'soDienThoai' => $validated['soDienThoai'],
                'email' => $validated['email'] ?? null,
                'ngaySinh' => $validated['ngaySinh'] ?? null,
                'gioiTinh' => $validated['gioiTinh'] ?? 'Nam',
                'trinhDo' => $validated['trinhDo'] ?? 'Đại học',
                'maPhongBan' => $validated['maPhongBan'] ?? null,
                'maChucVu' => $validated['maChucVu'] ?? null,
                'ngayVaoLam' => $validated['ngayVaoLam'] ?? date('Y-m-d'),
                'trangThai' => $validated['trangThai'] ?? 'Đang làm việc',
            ]);

            // 2. HR-BR09: Tự động khởi tạo 1 tài khoản đăng nhập với mật khẩu mặc định "123456" đã băm
            $vaiTro = $validated['vaiTro'] ?? 'NhanVien';
            $maTaiKhoan = 'TK-' . $employee->maNV;
            
            TaiKhoan::create([
                'maTaiKhoan' => $maTaiKhoan,
                'maNV' => $employee->maNV,
                'matKhau' => Hash::make('123456'), // HR-BR09: Đã băm khi lưu trữ
                'vaiTro' => $vaiTro,
                'trangThai' => 'Hoạt động',
                'phaiDoiMatKhau' => 1, // HR-BR10: Bắt buộc đổi mật khẩu lần đầu
            ]);

            // 3. HR-BR07: Lưu vết lịch sử tiếp nhận nhân sự
            $pb = $employee->maPhongBan ? PhongBan::find($employee->maPhongBan)?->tenPhongBan : 'Chưa phân bổ';
            $cv = $employee->maChucVu ? ChucVu::find($employee->maChucVu)?->tenChucVu : 'Chưa phân bổ';
            
            LichSuNhanSu::create([
                'maNV' => $employee->maNV,
                'loaiThayDoi' => 'TaoMoi',
                'noiDung' => "Tiếp nhận nhân sự mới: {$employee->hoTen} ({$employee->maNV}). Phòng ban: {$pb}, Chức vụ: {$cv}. Tự động cấp tài khoản đăng nhập (SĐT: {$employee->soDienThoai}).",
                'nguoiThucHien' => $request->header('X-User-Name', 'Quản lý nhân sự'),
                'ngayTao' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thêm nhân viên mới và khởi tạo tài khoản thành công!',
                'data' => $employee->load(['phongBan', 'chucVu', 'taiKhoan']),
            ], 201);
        });
    }

    // =========================================================================
    // HR-FR02: Sửa nhân viên (Lưu vết thay đổi phòng ban, chức vụ - HR-BR07)
    // =========================================================================
    public function updateEmployee(Request $request, $id)
    {
        $employee = NhanVien::findOrFail($id);

        $validated = $request->validate([
            'hoTen' => 'required|string|max:100',
            'soDienThoai' => "required|string|max:20|unique:NhanVien,soDienThoai,{$id},maNV", // HR-BR12
            'email' => 'nullable|email|max:100',
            'ngaySinh' => 'nullable|date',
            'gioiTinh' => 'nullable|string|max:10',
            'trinhDo' => 'nullable|string|max:50',
            'maPhongBan' => 'nullable|string|max:20|exists:PhongBan,maPhongBan',
            'maChucVu' => 'nullable|string|max:20|exists:ChucVu,maChucVu',
            'ngayVaoLam' => 'nullable|date',
            'trangThai' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($employee, $validated, $request) {
            $currentUser = $request->header('X-User-Name', 'Quản lý nhân sự');

            // HR-BR07: Lưu vết nếu điều chuyển phòng ban
            if (isset($validated['maPhongBan']) && $validated['maPhongBan'] !== $employee->maPhongBan) {
                $oldPB = PhongBan::find($employee->maPhongBan)?->tenPhongBan ?? 'Chưa phân bổ';
                $newPB = PhongBan::find($validated['maPhongBan'])?->tenPhongBan ?? 'Chưa phân bổ';

                LichSuNhanSu::create([
                    'maNV' => $employee->maNV,
                    'loaiThayDoi' => 'DieuChuyenPhongBan',
                    'noiDung' => "Điều chuyển phòng ban từ [{$oldPB}] sang [{$newPB}].",
                    'nguoiThucHien' => $currentUser,
                    'ngayTao' => now(),
                ]);
            }

            // HR-BR07: Lưu vết nếu điều chuyển chức vụ
            if (isset($validated['maChucVu']) && $validated['maChucVu'] !== $employee->maChucVu) {
                $oldCV = ChucVu::find($employee->maChucVu)?->tenChucVu ?? 'Chưa phân bổ';
                $newCV = ChucVu::find($validated['maChucVu'])?->tenChucVu ?? 'Chưa phân bổ';

                LichSuNhanSu::create([
                    'maNV' => $employee->maNV,
                    'loaiThayDoi' => 'DieuChuyenChucVu',
                    'noiDung' => "Thay đổi chức vụ từ [{$oldCV}] sang [{$newCV}].",
                    'nguoiThucHien' => $currentUser,
                    'ngayTao' => now(),
                ]);
            }

            // HR-BR02: Ghi vết nếu chuyển sang 'Đã nghỉ việc'
            if (isset($validated['trangThai']) && $validated['trangThai'] !== $employee->trangThai) {
                LichSuNhanSu::create([
                    'maNV' => $employee->maNV,
                    'loaiThayDoi' => 'TrangThaiLamViec',
                    'noiDung' => "Cập nhật trạng thái làm việc từ [{$employee->trangThai}] sang [{$validated['trangThai']}].",
                    'nguoiThucHien' => $currentUser,
                    'ngayTao' => now(),
                ]);
            }

            // Cập nhật thông tin (không đổi mã NV theo quy tắc)
            $employee->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hồ sơ nhân viên thành công!',
                'data' => $employee->load(['phongBan', 'chucVu', 'taiKhoan']),
            ]);
        });
    }

    // =========================================================================
    // HR-FR03: Xóa nhân viên (Kiểm tra ràng buộc dữ liệu HR-BR06)
    // =========================================================================
    public function deleteEmployee($id)
    {
        $employee = NhanVien::findOrFail($id);

        // HR-BR06: Không được xóa hồ sơ nhân viên đã phát sinh lịch sử lương hoặc lịch sử công tác
        $hasContract = HopDong::where('maNV', $id)->exists();
        $hasTimesheet = BangCong::where('maNV', $id)->exists();
        $hasPayroll = BangLuong::where('maNV', $id)->exists();

        // Kiểm tra tham chiếu từ các phân hệ khác (Kho, Thu Chi, Sản xuất, Bán hàng)
        $hasPhieuChi = DB::table('PhieuChi')->where('nguoiLap', $id)->orWhere('nguoiDuyet', $id)->exists();
        $hasPhieuThu = DB::table('PhieuThu')->where('nguoiLap', $id)->orWhere('nguoiDuyet', $id)->exists();
        $hasDonHang = DB::table('DonHang')->where('maNhanVien', $id)->exists();

        if ($hasContract || $hasTimesheet || $hasPayroll || $hasPhieuChi || $hasPhieuThu || $hasDonHang) {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR06: Không thể xóa nhân viên đã phát sinh lịch sử hợp đồng, chấm công, bảng lương hoặc chứng từ giao dịch liên kết. Bạn có thể cập nhật trạng thái sang "Đã nghỉ việc".',
            ], 400);
        }

        return DB::transaction(function () use ($employee) {
            TaiKhoan::where('maNV', $employee->maNV)->delete();
            LichSuNhanSu::where('maNV', $employee->maNV)->delete();
            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa hồ sơ nhân viên {$employee->maNV} thành công.",
            ]);
        });
    }
}
