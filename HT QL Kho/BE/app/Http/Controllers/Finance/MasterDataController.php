<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\DanhMucThu;
use App\Models\DanhMucChi;
use App\Models\DoiTuongGiaoDich;
use App\Models\TaiKhoanQuy;
use App\Models\KhachHang;
use App\Models\NhaCungCap;
use App\Models\NhanVien;
use App\Models\PhieuThu;
use App\Models\PhieuChi;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    // =========================================================================
    // 1. DANH MỤC KHOẢN THU (FI-FR01, Use Case 2.5.4.2 a)
    // =========================================================================
    public function getRevCategories(Request $request)
    {
        $query = DanhMucThu::query();
        if ($request->filled('keyword')) {
            $kw = $request->input('keyword');
            $query->where(fn($q) => $q->where('tenDanhMucThu', 'LIKE', "%{$kw}%")
                                      ->orWhere('maDanhMucThu', 'LIKE', "%{$kw}%")
                                      ->orWhere('moTa', 'LIKE', "%{$kw}%"));
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function createRevCategory(Request $request)
    {
        $validated = $request->validate([
            'maDanhMucThu' => 'required|string|max:50|unique:DanhMucThu,maDanhMucThu',
            'tenDanhMucThu' => 'required|string|max:100',
            'moTa' => 'nullable|string|max:255',
            'trangThai' => 'nullable|boolean',
        ]);

        $category = DanhMucThu::create([
            'maDanhMucThu' => $validated['maDanhMucThu'],
            'tenDanhMucThu' => $validated['tenDanhMucThu'],
            'moTa' => $validated['moTa'] ?? null,
            'trangThai' => $validated['trangThai'] ?? 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Thêm danh mục thu mới thành công', 'data' => $category], 201);
    }

    public function updateRevCategory(Request $request, $id)
    {
        $category = DanhMucThu::findOrFail($id);
        $validated = $request->validate([
            'tenDanhMucThu' => 'required|string|max:100',
            'moTa' => 'nullable|string|max:255',
            'trangThai' => 'nullable|boolean',
        ]);

        $category->update($validated);
        return response()->json(['success' => true, 'message' => 'Cập nhật danh mục thu thành công', 'data' => $category]);
    }

    public function deleteRevCategory($id)
    {
        $category = DanhMucThu::findOrFail($id);
        if ($category->chiTiets()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa do đã phát sinh chứng từ phiếu thu liên quan (Quy tắc 2.5.4.2 a).'
            ], 400);
        }
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa danh mục thu thành công']);
    }

    // =========================================================================
    // 2. DANH MỤC KHOẢN CHI (FI-FR01, Use Case 2.5.4.2 b)
    // =========================================================================
    public function getExpCategories(Request $request)
    {
        $query = DanhMucChi::query();
        if ($request->filled('keyword')) {
            $kw = $request->input('keyword');
            $query->where(fn($q) => $q->where('tenDanhMucChi', 'LIKE', "%{$kw}%")
                                      ->orWhere('maDanhMucChi', 'LIKE', "%{$kw}%")
                                      ->orWhere('moTa', 'LIKE', "%{$kw}%"));
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function createExpCategory(Request $request)
    {
        $validated = $request->validate([
            'maDanhMucChi' => 'required|string|max:50|unique:DanhMucChi,maDanhMucChi',
            'tenDanhMucChi' => 'required|string|max:100',
            'moTa' => 'nullable|string|max:255',
            'trangThai' => 'nullable|boolean',
        ]);

        $category = DanhMucChi::create([
            'maDanhMucChi' => $validated['maDanhMucChi'],
            'tenDanhMucChi' => $validated['tenDanhMucChi'],
            'moTa' => $validated['moTa'] ?? null,
            'trangThai' => $validated['trangThai'] ?? 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Thêm danh mục chi mới thành công', 'data' => $category], 201);
    }

    public function updateExpCategory(Request $request, $id)
    {
        $category = DanhMucChi::findOrFail($id);
        $validated = $request->validate([
            'tenDanhMucChi' => 'required|string|max:100',
            'moTa' => 'nullable|string|max:255',
            'trangThai' => 'nullable|boolean',
        ]);

        $category->update($validated);
        return response()->json(['success' => true, 'message' => 'Cập nhật danh mục chi thành công', 'data' => $category]);
    }

    public function deleteExpCategory($id)
    {
        $category = DanhMucChi::findOrFail($id);
        if ($category->chiTiets()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa do đã phát sinh chứng từ phiếu chi liên quan (Quy tắc 2.5.4.2 b).'
            ], 400);
        }
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa danh mục chi thành công']);
    }

    // =========================================================================
    // 3. ĐỐI TƯỢNG GIAO DỊCH (BẢNG ÁNH XẠ MAPPING - FI-FR02, FI-BR05)
    // =========================================================================
    public function getCounterparties(Request $request)
    {
        $query = DoiTuongGiaoDich::with(['khachHang', 'nhaCungCap', 'nhanVien']);

        if ($request->filled('loaiDoiTuong')) {
            $query->where('loaiDoiTuong', $request->input('loaiDoiTuong'));
        }
        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        $list = $query->get();

        if ($request->filled('keyword')) {
            $kw = mb_strtolower($request->input('keyword'));
            $list = $list->filter(fn($item) =>
                str_contains(mb_strtolower($item->maDoiTuong), $kw) ||
                str_contains(mb_strtolower($item->maThamChieu), $kw) ||
                str_contains(mb_strtolower($item->tenDoiTuong), $kw) ||
                str_contains(mb_strtolower($item->soDienThoai ?? ''), $kw)
            )->values();
        }

        return response()->json(['success' => true, 'data' => $list]);
    }

    public function getAvailableSourceEntities(Request $request)
    {
        $loai = $request->input('loaiDoiTuong', 'KH');
        $data = match ($loai) {
            'KH' => KhachHang::select('maKhachHang as id', 'maKhachHang as maGoc', 'tenKhachHang as ten', 'soDienThoai', 'diaChi', 'maSoThue', 'email')->get(),
            'NCC' => NhaCungCap::select('maNCC as id', 'maNCC as maGoc', 'tenNCC as ten', 'soDienThoai', 'diaChi', 'maSoThue', 'email')->get(),
            'NV' => NhanVien::select('maNV as id', 'maNV as maGoc', 'hoTen as ten', 'soDienThoai', 'diaChi', 'email')->get(),
            default => collect(),
        };

        $existingMapped = DoiTuongGiaoDich::where('loaiDoiTuong', $loai)
            ->where('trangThai', 1)
            ->pluck('maThamChieu');

        return response()->json([
            'success' => true,
            'data' => $data,
            'mapped' => $existingMapped,
        ]);
    }

    public function createCounterparty(Request $request)
    {
        $validated = $request->validate([
            'maDoiTuong' => 'required|string|max:50|unique:DoiTuongGiaoDich,maDoiTuong',
            'maThamChieu' => 'required|string|max:50',
            'loaiDoiTuong' => 'required|string|in:KH,NCC,NV,Khac',
            'trangThai' => 'nullable|boolean',
        ]);

        $exists = match ($validated['loaiDoiTuong']) {
            'KH' => KhachHang::where('maKhachHang', $validated['maThamChieu'])->exists(),
            'NCC' => NhaCungCap::where('maNCC', $validated['maThamChieu'])->exists(),
            'NV' => NhanVien::where('maNV', $validated['maThamChieu'])->exists(),
            'Khac' => true,
        };

        if (!$exists) {
            return response()->json(['success' => false, 'message' => "Mã tham chiếu {$validated['maThamChieu']} không tồn tại ở bảng nguồn"], 400);
        }

        $existing = DoiTuongGiaoDich::where('loaiDoiTuong', $validated['loaiDoiTuong'])
            ->where('maThamChieu', $validated['maThamChieu'])
            ->where('trangThai', 1)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "Đối tượng {$validated['loaiDoiTuong']} ({$validated['maThamChieu']}) đã có bản ghi ánh xạ hoạt động ({$existing->maDoiTuong})."
            ], 400);
        }

        $counterparty = DoiTuongGiaoDich::create([
            'maDoiTuong' => $validated['maDoiTuong'],
            'maThamChieu' => $validated['maThamChieu'],
            'loaiDoiTuong' => $validated['loaiDoiTuong'],
            'trangThai' => $validated['trangThai'] ?? 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm ánh xạ đối tượng giao dịch thành công',
            'data' => $counterparty,
        ], 201);
    }

    /**
     * Sửa ánh xạ đối tượng. Không cho đổi nguồn sau khi đã phát sinh chứng từ,
     * để lịch sử thu chi luôn truy vết được về đúng KH/NCC/NV ban đầu.
     */
    public function updateCounterparty(Request $request, $id)
    {
        $counterparty = DoiTuongGiaoDich::findOrFail($id);
        $validated = $request->validate([
            'maThamChieu' => 'required|string|max:50',
            'loaiDoiTuong' => 'required|string|in:KH,NCC,NV',
            'trangThai' => 'nullable|boolean',
        ]);

        $sourceChanged = $counterparty->maThamChieu !== $validated['maThamChieu']
            || $counterparty->loaiDoiTuong !== $validated['loaiDoiTuong'];
        if ($sourceChanged && (
            PhieuThu::where('maDoiTuong', $counterparty->maDoiTuong)->exists()
            || PhieuChi::where('maDoiTuong', $counterparty->maDoiTuong)->exists()
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể đổi nguồn của đối tượng đã phát sinh chứng từ. Chỉ có thể thay đổi trạng thái.',
            ], 400);
        }

        $exists = match ($validated['loaiDoiTuong']) {
            'KH' => KhachHang::where('maKhachHang', $validated['maThamChieu'])->exists(),
            'NCC' => NhaCungCap::where('maNCC', $validated['maThamChieu'])->exists(),
            'NV' => NhanVien::where('maNV', $validated['maThamChieu'])->exists(),
        };
        if (!$exists) {
            return response()->json(['success' => false, 'message' => 'Mã tham chiếu không tồn tại ở bảng nguồn.'], 400);
        }

        $duplicate = DoiTuongGiaoDich::where('loaiDoiTuong', $validated['loaiDoiTuong'])
            ->where('maThamChieu', $validated['maThamChieu'])
            ->where('maDoiTuong', '!=', $counterparty->maDoiTuong)
            ->where('trangThai', 1)
            ->exists();
        if ($duplicate) {
            return response()->json(['success' => false, 'message' => 'Đã tồn tại ánh xạ hoạt động cho đối tượng nguồn này.'], 400);
        }

        $counterparty->update($validated);
        return response()->json(['success' => true, 'message' => 'Cập nhật ánh xạ đối tượng thành công', 'data' => $counterparty]);
    }

    public function toggleStatusCounterparty($id)
    {
        $counterparty = DoiTuongGiaoDich::findOrFail($id);
        $newStatus = $counterparty->trangThai ? 0 : 1;
        $counterparty->update(['trangThai' => $newStatus]);

        $statusText = $newStatus ? 'Kích hoạt' : 'Ngừng hoạt động / Vô hiệu hóa';
        return response()->json([
            'success' => true,
            'message' => "Đã chuyển trạng thái đối tượng sang: {$statusText}",
            'data' => $counterparty,
        ]);
    }

    public function deleteCounterparty($id)
    {
        $counterparty = DoiTuongGiaoDich::findOrFail($id);

        if (PhieuThu::where('maDoiTuong', $id)->exists() || PhieuChi::where('maDoiTuong', $id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không được phép xóa đối tượng đã phát sinh chứng từ. Hãy sử dụng chức năng "Vô hiệu hóa".'
            ], 400);
        }

        $counterparty->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa ánh xạ đối tượng thành công']);
    }

    // =========================================================================
    // 4. TÀI KHOẢN QUỸ / NGÂN HÀNG (FI-FR05)
    // =========================================================================
    public function getAccounts(Request $request)
    {
        $query = TaiKhoanQuy::query();
        if ($request->filled('loaiTaiKhoan')) {
            $query->where('loaiTaiKhoan', $request->input('loaiTaiKhoan'));
        }
        if ($request->filled('keyword')) {
            $kw = $request->input('keyword');
            $query->where(fn($q) => $q->where('tenTaiKhoanQuy', 'LIKE', "%{$kw}%")
                                      ->orWhere('maTaiKhoanQuy', 'LIKE', "%{$kw}%")
                                      ->orWhere('soTaiKhoan', 'LIKE', "%{$kw}%"));
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function createAccount(Request $request)
    {
        $validated = $request->validate([
            'maTaiKhoanQuy' => 'required|string|max:50|unique:TaiKhoanQuy,maTaiKhoanQuy',
            'tenTaiKhoanQuy' => 'required|string|max:150',
            'loaiTaiKhoan' => 'required|string|in:TM,NH',
            'soTaiKhoan' => 'nullable|string|max:50',
            'nganHang' => 'nullable|string|max:100',
            'soDuHienTai' => 'nullable|numeric|min:0',
            'trangThai' => 'nullable|boolean',
        ]);

        $account = TaiKhoanQuy::create([
            'maTaiKhoanQuy' => $validated['maTaiKhoanQuy'],
            'tenTaiKhoanQuy' => $validated['tenTaiKhoanQuy'],
            'loaiTaiKhoan' => $validated['loaiTaiKhoan'],
            'soTaiKhoan' => $validated['soTaiKhoan'] ?? null,
            'nganHang' => $validated['nganHang'] ?? null,
            'soDuHienTai' => $validated['soDuHienTai'] ?? 0,
            'trangThai' => $validated['trangThai'] ?? 1,
        ]);

        return response()->json(['success' => true, 'message' => 'Thêm tài khoản quỹ mới thành công', 'data' => $account], 201);
    }

    public function updateAccount(Request $request, $id)
    {
        $account = TaiKhoanQuy::findOrFail($id);
        $validated = $request->validate([
            'tenTaiKhoanQuy' => 'required|string|max:150',
            'loaiTaiKhoan' => 'required|string|in:TM,NH',
            'soTaiKhoan' => 'nullable|string|max:50',
            'nganHang' => 'nullable|string|max:100',
            'soDuHienTai' => 'nullable|numeric|min:0',
            'trangThai' => 'nullable|boolean',
        ]);

        $account->update($validated);
        return response()->json(['success' => true, 'message' => 'Cập nhật tài khoản quỹ thành công', 'data' => $account]);
    }

    public function deleteAccount($id)
    {
        try {
            $account = TaiKhoanQuy::findOrFail($id);
            $account->delete();
            return response()->json(['success' => true, 'message' => 'Đã xóa tài khoản quỹ thành công']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không thể xóa do có phiếu thu/chi liên quan'], 400);
        }
    }
}
