<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HopDong;
use App\Models\NhanVien;
use App\Models\BangLuong;
use App\Models\LichSuNhanSu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    // =========================================================================
    // HR-FR12: Danh sách và tìm kiếm hợp đồng lao động
    // =========================================================================
    public function getContracts(Request $request)
    {
        $query = HopDong::with(['nhanVien.phongBan', 'nhanVien.chucVu']);

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maHopDong', 'LIKE', "%{$kw}%")
                  ->orWhere('maNV', 'LIKE', "%{$kw}%")
                  ->orWhereHas('nhanVien', function ($sub) use ($kw) {
                      $sub->where('hoTen', 'LIKE', "%{$kw}%");
                  });
            });
        }

        if ($request->filled('maNV')) {
            $query->where('maNV', $request->input('maNV'));
        }

        if ($request->filled('loaiHopDong')) {
            $query->where('loaiHopDong', $request->input('loaiHopDong'));
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        $contracts = $query->orderBy('ngayHieuLuc', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $contracts,
            'total' => $contracts->count(),
        ]);
    }

    public function getContractDetail($id)
    {
        $contract = HopDong::with(['nhanVien.phongBan', 'nhanVien.chucVu', 'bangLuongs' => fn($q) => $q->take(6)])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $contract,
        ]);
    }

    // =========================================================================
    // HR-FR09: Thêm hợp đồng lao động (HR-BR01, HR-BR08, HR-BR07)
    // =========================================================================
    public function createContract(Request $request)
    {
        $validated = $request->validate([
            'maHopDong' => 'required|string|max:20|unique:HopDong,maHopDong',
            'maNV' => 'required|string|max:20|exists:NhanVien,maNV',
            'loaiHopDong' => 'required|string|max:50',
            'ngayHieuLuc' => 'required|date',
            'ngayHetHan' => 'nullable|date|after_or_equal:ngayHieuLuc',
            'mucLuongCoBan' => 'required|numeric|gt:0', // HR-BR08: Mức lương cơ bản phải lớn hơn 0
            'trangThai' => 'nullable|string|in:Hiệu lực,Hết hiệu lực,Đã hủy',
        ]);

        $trangThai = $validated['trangThai'] ?? 'Hiệu lực';

        // HR-BR01: Mỗi nhân viên tại một thời điểm chỉ có 1 hợp đồng lao động chính thức có hiệu lực
        if ($trangThai === 'Hiệu lực') {
            $existingActive = HopDong::where('maNV', $validated['maNV'])
                ->where('trangThai', 'Hiệu lực')
                ->exists();

            if ($existingActive) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quy tắc HR-BR01: Nhân viên này hiện đã có một hợp đồng lao động đang có hiệu lực. Vui lòng thanh lý hoặc cập nhật trạng thái hợp đồng cũ trước khi kích hoạt hợp đồng mới.',
                ], 422);
            }
        }

        return DB::transaction(function () use ($validated, $trangThai, $request) {
            $contract = HopDong::create([
                'maHopDong' => $validated['maHopDong'],
                'maNV' => $validated['maNV'],
                'loaiHopDong' => $validated['loaiHopDong'],
                'ngayHieuLuc' => $validated['ngayHieuLuc'],
                'ngayHetHan' => $validated['ngayHetHan'] ?? null,
                'mucLuongCoBan' => $validated['mucLuongCoBan'],
                'trangThai' => $trangThai,
            ]);

            // HR-BR07: Lưu vết mức lương cơ bản ban đầu
            $formattedSalary = number_format($contract->mucLuongCoBan, 0, ',', '.') . ' VNĐ';
            LichSuNhanSu::create([
                'maNV' => $contract->maNV,
                'loaiThayDoi' => 'ThayDoiLuong',
                'noiDung' => "Ký mới hợp đồng [{$contract->maHopDong}] ({$contract->loaiHopDong}), mức lương cơ bản: {$formattedSalary}.",
                'nguoiThucHien' => $request->header('X-User-Name', 'Quản lý nhân sự'),
                'ngayTao' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lập mới hợp đồng lao động thành công!',
                'data' => $contract->load('nhanVien'),
            ], 201);
        });
    }

    // =========================================================================
    // HR-FR10: Sửa hợp đồng lao động (HR-BR07 lưu vết thay đổi lương)
    // =========================================================================
    public function updateContract(Request $request, $id)
    {
        $contract = HopDong::findOrFail($id);

        $validated = $request->validate([
            'loaiHopDong' => 'required|string|max:50',
            'ngayHieuLuc' => 'required|date',
            'ngayHetHan' => 'nullable|date',
            'mucLuongCoBan' => 'required|numeric|gt:0', // HR-BR08
            'trangThai' => 'required|string|in:Hiệu lực,Hết hiệu lực,Đã hủy',
        ]);

        // HR-BR01: Nếu đổi trạng thái sang 'Hiệu lực', kiểm tra xem có HĐ khác đang hiệu lực không
        if ($validated['trangThai'] === 'Hiệu lực' && $contract->trangThai !== 'Hiệu lực') {
            $otherActive = HopDong::where('maNV', $contract->maNV)
                ->where('maHopDong', '!=', $id)
                ->where('trangThai', 'Hiệu lực')
                ->exists();

            if ($otherActive) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quy tắc HR-BR01: Nhân viên hiện có một hợp đồng khác đang hiệu lực.',
                ], 422);
            }
        }

        return DB::transaction(function () use ($contract, $validated, $request) {
            $currentUser = $request->header('X-User-Name', 'Quản lý nhân sự');

            // HR-BR07: Lưu vết nếu thay đổi mức lương cơ bản
            if ((float)$validated['mucLuongCoBan'] !== (float)$contract->mucLuongCoBan) {
                $oldSal = number_format($contract->mucLuongCoBan, 0, ',', '.') . ' VNĐ';
                $newSal = number_format($validated['mucLuongCoBan'], 0, ',', '.') . ' VNĐ';

                LichSuNhanSu::create([
                    'maNV' => $contract->maNV,
                    'loaiThayDoi' => 'ThayDoiLuong',
                    'noiDung' => "Điều chỉnh mức lương cơ bản hợp đồng [{$contract->maHopDong}] từ {$oldSal} sang {$newSal}.",
                    'nguoiThucHien' => $currentUser,
                    'ngayTao' => now(),
                ]);
            }

            $contract->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hợp đồng lao động thành công!',
                'data' => $contract->load('nhanVien'),
            ]);
        });
    }

    // =========================================================================
    // HR-FR11: Xóa hợp đồng lao động (Chỉ xóa hợp đồng chưa hiệu lực / lập nhầm)
    // =========================================================================
    public function deleteContract($id)
    {
        $contract = HopDong::findOrFail($id);

        // Kiểm tra hợp đồng đã phát sinh bảng lương chưa
        $hasPayroll = BangLuong::where('maHopDong', $id)->exists();
        if ($hasPayroll) {
            return response()->json([
                'success' => false,
                'message' => 'Hợp đồng này đã được sử dụng làm căn cứ tính lương trong các kỳ lương trước đây, không thể xóa.',
            ], 400);
        }

        // Quy tắc: Không được xóa hợp đồng đang có hiệu lực
        if ($contract->trangThai === 'Hiệu lực') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa hợp đồng đang có hiệu lực pháp lý. Vui lòng chuyển trạng thái sang "Hết hiệu lực" hoặc "Đã hủy" trước.',
            ], 400);
        }

        $contract->delete();

        return response()->json([
            'success' => true,
            'message' => "Đã xóa hợp đồng {$id} thành công.",
        ]);
    }
}

