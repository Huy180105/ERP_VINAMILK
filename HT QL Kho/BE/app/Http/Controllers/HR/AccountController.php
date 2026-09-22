<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\TaiKhoan;
use App\Models\NhanVien;
use App\Models\LichSuNhanSu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    // =========================================================================
    // Danh sách tài khoản người dùng
    // =========================================================================
    public function getAccounts(Request $request)
    {
        $query = TaiKhoan::with(['nhanVien.phongBan', 'nhanVien.chucVu']);

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maTaiKhoan', 'LIKE', "%{$kw}%")
                  ->orWhere('maNV', 'LIKE', "%{$kw}%")
                  ->orWhereHas('nhanVien', function ($sub) use ($kw) {
                      $sub->where('hoTen', 'LIKE', "%{$kw}%")
                          ->orWhere('soDienThoai', 'LIKE', "%{$kw}%");
                  });
            });
        }

        if ($request->filled('vaiTro')) {
            $query->where('vaiTro', $request->input('vaiTro'));
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        $accounts = $query->orderBy('maTaiKhoan', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
            'total' => $accounts->count(),
        ]);
    }

    // =========================================================================
    // HR-FR21: Đăng nhập hệ thống (bằng SĐT & mật khẩu)
    // Quy tắc: HR-BR10 (kiểm tra bắt buộc đổi mật khẩu nếu là 123456)
    // =========================================================================
    public function login(Request $request)
    {
        $validated = $request->validate([
            'soDienThoai' => 'required|string',
            'matKhau' => 'required|string',
        ]);

        // Tìm nhân viên theo số điện thoại (HR-BR12: SĐT duy nhất)
        $employee = NhanVien::where('soDienThoai', $validated['soDienThoai'])->first();
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Số điện thoại không tồn tại trong hệ thống hồ sơ nhân viên.',
            ], 401);
        }

        // Tìm tài khoản liên kết
        $account = TaiKhoan::where('maNV', $employee->maNV)->first();
        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Nhân viên này chưa được cấp tài khoản đăng nhập.',
            ], 401);
        }

        // Kiểm tra trạng thái tài khoản
        if ($account->trangThai === 'Khóa') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đăng nhập của bạn hiện đang bị khóa. Vui lòng liên hệ Quản lý Nhân sự để mở khóa.',
            ], 403);
        }

        // Kiểm tra mật khẩu (so khớp hash)
        if (!Hash::check($validated['matKhau'], $account->matKhau)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu không chính xác. Vui lòng thử lại.',
            ], 401);
        }

        // HR-BR10: Kiểm tra xem có đang dùng mật khẩu mặc định "123456" không
        $isDefaultPassword = Hash::check('123456', $account->matKhau) || $account->phaiDoiMatKhau;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'data' => [
                'maTaiKhoan' => $account->maTaiKhoan,
                'maNV' => $employee->maNV,
                'hoTen' => $employee->hoTen,
                'soDienThoai' => $employee->soDienThoai,
                'vaiTro' => $account->vaiTro,
                'phaiDoiMatKhau' => (bool)$isDefaultPassword, // HR-BR10
                'phongBan' => $employee->phongBan?->tenPhongBan,
                'chucVu' => $employee->chucVu?->tenChucVu,
            ],
        ]);
    }

    // =========================================================================
    // HR-FR22: Đổi mật khẩu (HR-BR10 bắt buộc đổi, HR-BR11 từ chối nếu trùng "123456")
    // =========================================================================
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'soDienThoai' => 'required|string',
            'matKhauHienTai' => 'required|string',
            'matKhauMoi' => 'required|string|min:6',
        ]);

        $employee = NhanVien::where('soDienThoai', $validated['soDienThoai'])->first();
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin nhân viên.',
            ], 404);
        }

        $account = TaiKhoan::where('maNV', $employee->maNV)->first();
        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản tương ứng.',
            ], 404);
        }

        // Xác thực mật khẩu hiện tại
        if (!Hash::check($validated['matKhauHienTai'], $account->matKhau)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu hiện tại không chính xác.',
            ], 422);
        }

        // HR-BR11: Từ chối nếu mật khẩu mới trùng với mật khẩu mặc định "123456"
        if ($validated['matKhauMoi'] === '123456') {
            return response()->json([
                'success' => false,
                'message' => 'Quy tắc HR-BR11: Mật khẩu mới không được trùng với mật khẩu mặc định "123456". Vui lòng chọn mật khẩu an toàn hơn.',
            ], 422);
        }

        $account->update([
            'matKhau' => Hash::make($validated['matKhauMoi']),
            'phaiDoiMatKhau' => 0,
        ]);

        // Lưu vết lịch sử
        LichSuNhanSu::create([
            'maNV' => $account->maNV,
            'loaiThayDoi' => 'DoiMatKhau',
            'noiDung' => 'Người dùng tự đổi mật khẩu tài khoản thành công.',
            'nguoiThucHien' => $employee->hoTen,
            'ngayTao' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công! Giờ đây bạn có thể đăng nhập bình thường.',
        ]);
    }

    // =========================================================================
    // HR-FR23: Khóa / Mở khóa tài khoản
    // =========================================================================
    public function toggleLock($id)
    {
        $account = TaiKhoan::findOrFail($id);
        $newStatus = ($account->trangThai === 'Hoạt động') ? 'Khóa' : 'Hoạt động';
        
        $account->update(['trangThai' => $newStatus]);

        LichSuNhanSu::create([
            'maNV' => $account->maNV,
            'loaiThayDoi' => 'TrangThaiTaiKhoan',
            'noiDung' => "Quản lý nhân sự đã chuyển trạng thái tài khoản thành: [{$newStatus}].",
            'nguoiThucHien' => request()->header('X-User-Name', 'Quản lý nhân sự'),
            'ngayTao' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Đã chuyển trạng thái tài khoản thành '{$newStatus}'.",
            'data' => $account,
        ]);
    }

    // =========================================================================
    // HR-FR24: Phân quyền vai trò (QuanLyNhanSu, ChuyenVienNhanSu, NhanVien)
    // =========================================================================
    public function assignRole(Request $request, $id)
    {
        $account = TaiKhoan::findOrFail($id);

        $validated = $request->validate([
            'vaiTro' => 'required|string|in:QuanLyNhanSu,ChuyenVienNhanSu,NhanVien',
        ]);

        $oldRole = $account->vaiTro;
        $account->update(['vaiTro' => $validated['vaiTro']]);

        LichSuNhanSu::create([
            'maNV' => $account->maNV,
            'loaiThayDoi' => 'PhanQuyen',
            'noiDung' => "Phân quyền lại vai trò tài khoản từ [{$oldRole}] sang [{$validated['vaiTro']}].",
            'nguoiThucHien' => $request->header('X-User-Name', 'Quản lý nhân sự'),
            'ngayTao' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Phân quyền vai trò '{$validated['vaiTro']}' cho tài khoản thành công!",
            'data' => $account,
        ]);
    }
}

