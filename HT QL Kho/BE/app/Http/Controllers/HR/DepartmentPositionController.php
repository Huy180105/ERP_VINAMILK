<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\PhongBan;
use App\Models\ChucVu;
use App\Models\NhanVien;
use Illuminate\Http\Request;

class DepartmentPositionController extends Controller
{
    // =========================================================================
    // 1. PHÒNG BAN (HR-FR05, HR-FR06, HR-FR07, HR-FR08)
    // =========================================================================

    public function getDepartments(Request $request)
    {
        $query = PhongBan::withCount(['nhanViens' => function ($q) {
            $q->where('trangThai', 'Đang làm việc');
        }]);

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maPhongBan', 'LIKE', "%{$kw}%")
                  ->orWhere('tenPhongBan', 'LIKE', "%{$kw}%");
            });
        }

        $departments = $query->orderBy('maPhongBan', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    public function getDepartmentDetail($id)
    {
        $department = PhongBan::with(['nhanViens' => function ($q) {
            $q->with('chucVu')->orderBy('maNV', 'asc');
        }])->withCount(['nhanViens' => fn($q) => $q->where('trangThai', 'Đang làm việc')])
          ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $department,
        ]);
    }

    public function createDepartment(Request $request)
    {
        $validated = $request->validate([
            'maPhongBan' => 'required|string|max:20|unique:PhongBan,maPhongBan',
            'tenPhongBan' => 'required|string|max:100',
        ]);

        $dept = PhongBan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm cơ cấu phòng ban mới thành công!',
            'data' => $dept,
        ], 201);
    }

    public function updateDepartment(Request $request, $id)
    {
        $dept = PhongBan::findOrFail($id);

        $validated = $request->validate([
            'tenPhongBan' => 'required|string|max:100',
        ]);

        $dept->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin phòng ban thành công!',
            'data' => $dept,
        ]);
    }

    public function deleteDepartment($id)
    {
        $dept = PhongBan::findOrFail($id);

        // HR-FR07: Tuyệt đối không xóa phòng ban đang có nhân sự làm việc
        $staffCount = NhanVien::where('maPhongBan', $id)->count();
        if ($staffCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa phòng ban [{$dept->tenPhongBan}] do hiện có {$staffCount} nhân sự trực thuộc.",
            ], 400);
        }

        $dept->delete();

        return response()->json([
            'success' => true,
            'message' => "Đã xóa phòng ban {$id} thành công.",
        ]);
    }

    // =========================================================================
    // 2. CHỨC VỤ (HR-FR05, HR-FR06, HR-FR07, HR-FR08)
    // =========================================================================

    public function getPositions(Request $request)
    {
        $query = ChucVu::withCount(['nhanViens' => function ($q) {
            $q->where('trangThai', 'Đang làm việc');
        }]);

        if ($request->filled('keyword')) {
            $kw = trim($request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('maChucVu', 'LIKE', "%{$kw}%")
                  ->orWhere('tenChucVu', 'LIKE', "%{$kw}%");
            });
        }

        $positions = $query->orderBy('maChucVu', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $positions,
        ]);
    }

    public function getPositionDetail($id)
    {
        $position = ChucVu::with(['nhanViens' => function ($q) {
            $q->with('phongBan')->orderBy('maNV', 'asc');
        }])->withCount(['nhanViens' => fn($q) => $q->where('trangThai', 'Đang làm việc')])
          ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $position,
        ]);
    }

    public function createPosition(Request $request)
    {
        $validated = $request->validate([
            'maChucVu' => 'required|string|max:20|unique:ChucVu,maChucVu',
            'tenChucVu' => 'required|string|max:100',
            'phuCap' => 'nullable|numeric|min:0',
        ]);

        $pos = ChucVu::create([
            'maChucVu' => $validated['maChucVu'],
            'tenChucVu' => $validated['tenChucVu'],
            'phuCap' => $validated['phuCap'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm chức vụ mới thành công!',
            'data' => $pos,
        ], 201);
    }

    public function updatePosition(Request $request, $id)
    {
        $pos = ChucVu::findOrFail($id);

        $validated = $request->validate([
            'tenChucVu' => 'required|string|max:100',
            'phuCap' => 'nullable|numeric|min:0',
        ]);

        $pos->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin chức vụ thành công!',
            'data' => $pos,
        ]);
    }

    public function deletePosition($id)
    {
        $pos = ChucVu::findOrFail($id);

        // HR-FR07: Tuyệt đối không xóa chức vụ đang có nhân sự đảm nhiệm
        $staffCount = NhanVien::where('maChucVu', $id)->count();
        if ($staffCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Không thể xóa chức vụ [{$pos->tenChucVu}] do đang có {$staffCount} nhân sự đảm nhiệm.",
            ], 400);
        }

        $pos->delete();

        return response()->json([
            'success' => true,
            'message' => "Đã xóa chức vụ {$id} thành công.",
        ]);
    }
}

