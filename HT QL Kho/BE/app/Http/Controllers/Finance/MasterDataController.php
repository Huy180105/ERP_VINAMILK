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
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('tenDanhMucThu', 'LIKE', "%{$keyword}%")
                  ->orWhere('maDanhMucThu', 'LIKE', "%{$keyword}%")
                  ->orWhere('moTa', 'LIKE', "%{$keyword}%");
            });
        }
        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục thu mới thành công',
            'data' => $category,
        ], 201);
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

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thu thành công',
            'data' => $category,
        ]);
    }

    public function deleteRevCategory($id)
    {
        try {
            $category = DanhMucThu::findOrFail($id);
            if ($category->chiTiets()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa danh mục thu này do đã phát sinh chứng từ phiếu thu liên quan (Quy tắc nghiệp vụ 2.5.4.2 a).'
                ], 400);
            }
            $category->delete();
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa danh mục thu thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xóa danh mục thu: ' . $e->getMessage()
            ], 400);
        }
    }

    // =========================================================================
    // 2. DANH MỤC KHOẢN CHI (FI-FR01, Use Case 2.5.4.2 b)
    // =========================================================================
    public function getExpCategories(Request $request)
    {
        $query = DanhMucChi::query();
        if ($request->filled('keyword')) {
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('tenDanhMucChi', 'LIKE', "%{$keyword}%")
                  ->orWhere('maDanhMucChi', 'LIKE', "%{$keyword}%")
                  ->orWhere('moTa', 'LIKE', "%{$keyword}%");
            });
        }
        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục chi mới thành công',
            'data' => $category,
        ], 201);
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

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục chi thành công',
            'data' => $category,
        ]);
    }

    public function deleteExpCategory($id)
    {
        try {
            $category = DanhMucChi::findOrFail($id);
            if ($category->chiTiets()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa danh mục chi này do đã phát sinh chứng từ phiếu chi liên quan (Quy tắc nghiệp vụ 2.5.4.2 b).'
                ], 400);
            }
            $category->delete();
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa danh mục chi thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xóa danh mục chi: ' . $e->getMessage()
            ], 400);
        }
    }

    // =========================================================================
    // 3. ĐỐI TƯỢNG GIAO DỊCH (BẢNG ÁNH XẠ MAPPING - FI-FR02, FI-BR05, Use Case 2.5.4.2 c)
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
            $keyword = mb_strtolower($request->input('keyword'));
            $list = $list->filter(function ($item) use ($keyword) {
                return str_contains(mb_strtolower($item->maDoiTuong), $keyword) ||
                       str_contains(mb_strtolower($item->maThamChieu), $keyword) ||
                       str_contains(mb_strtolower($item->tenDoiTuong), $keyword) ||
                       str_contains(mb_strtolower($item->soDienThoai ?? ''), $keyword);
            })->values();
        }

        return response()->json([
            'success' => true,
            'data' => $list,
        ]);
    }

    public function getAvailableSourceEntities(Request $request)
    {
        $loai = $request->input('loaiDoiTuong', 'KH');
        $data = [];

        if ($loai === 'KH') {
            $data = KhachHang::select('maKhachHang as id', 'maKhachHang as maGoc', 'tenKhachHang as ten', 'soDienThoai', 'diaChi', 'maSoThue', 'email')->get();
        } elseif ($loai === 'NCC') {
            $data = NhaCungCap::select('maNCC as id', 'maNCC as maGoc', 'tenNCC as ten', 'soDienThoai', 'diaChi', 'maSoThue', 'email')->get();
        } elseif ($loai === 'NV') {
            $data = NhanVien::select('maNV as id', 'maNV as maGoc', 'hoTen as ten', 'soDienThoai', 'diaChi', 'email')->get();
        }

        $existingMapped = DoiTuongGiaoDich::where('loaiDoiTuong', $loai)
            ->where('trangThai', 1)
            ->pluck('maThamChieu')
            ->toArray();

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

        if ($validated['loaiDoiTuong'] === 'KH' && !KhachHang::where('maKhachHang', $validated['maThamChieu'])->exists()) {
            return response()->json(['success' => false, 'message' => "Mã khách hàng {$validated['maThamChieu']} không tồn tại ở bảng KhachHang"], 400);
        } elseif ($validated['loaiDoiTuong'] === 'NCC' && !NhaCungCap::where('maNCC', $validated['maThamChieu'])->exists()) {
            return response()->json(['success' => false, 'message' => "Mã nhà cung cấp {$validated['maThamChieu']} không tồn tại ở bảng NhaCungCap"], 400);
        } elseif ($validated['loaiDoiTuong'] === 'NV' && !NhanVien::where('maNV', $validated['maThamChieu'])->exists()) {
            return response()->json(['success' => false, 'message' => "Mã nhân viên {$validated['maThamChieu']} không tồn tại ở bảng NhanVien"], 400);
        }

        $existing = DoiTuongGiaoDich::where('loaiDoiTuong', $validated['loaiDoiTuong'])
            ->where('maThamChieu', $validated['maThamChieu'])
            ->where('trangThai', 1)
            ->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "Đối tượng {$validated['loaiDoiTuong']} với mã tham chiếu {$validated['maThamChieu']} đã có bản ghi ánh xạ đang hoạt động ({$existing->maDoiTuong})."
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
            'message' => 'Thêm ánh xạ đối tượng giao dịch thành công (Dữ liệu mô tả liên kết động)',
            'data' => $counterparty,
        ], 201);
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

        $hasReceipts = PhieuThu::where('maDoiTuong', $id)->exists();
        $hasPayments = PhieuChi::where('maDoiTuong', $id)->exists();

        if ($hasReceipts || $hasPayments) {
            return response()->json([
                'success' => false,
                'message' => 'Không được phép xóa vật lý đối tượng này do đã phát sinh phiếu thu/chi. Hãy sử dụng chức năng "Vô hiệu hóa" để ngừng hoạt động.'
            ], 400);
        }

        $counterparty->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã xóa ánh xạ đối tượng thành công'
        ]);
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
            $keyword = $request->input('keyword');
            $query->where(function ($q) use ($keyword) {
                $q->where('tenTaiKhoanQuy', 'LIKE', "%{$keyword}%")
                  ->orWhere('maTaiKhoanQuy', 'LIKE', "%{$keyword}%")
                  ->orWhere('soTaiKhoan', 'LIKE', "%{$keyword}%");
            });
        }
        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
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

        return response()->json([
            'success' => true,
            'message' => 'Thêm tài khoản quỹ mới thành công',
            'data' => $account,
        ], 201);
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

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tài khoản quỹ thành công',
            'data' => $account,
        ]);
    }

    public function deleteAccount($id)
    {
        try {
            $account = TaiKhoanQuy::findOrFail($id);
            $account->delete();
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa tài khoản quỹ thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa do có phiếu thu/chi liên quan: ' . $e->getMessage()
            ], 400);
        }
    }
}
