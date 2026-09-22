<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\NhanVien;
use App\Models\PhongBan;
use App\Models\ChucVu;
use App\Models\HopDong;
use App\Models\BangCong;
use App\Models\BangLuong;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HRReportController extends Controller
{
    // =========================================================================
    // Tổng quan chỉ số KPI Nhân sự & Tiền lương
    // =========================================================================
    public function getDashboardSummary()
    {
        $totalActiveEmployees = NhanVien::where('trangThai', 'Đang làm việc')->count();
        $totalResigned = NhanVien::where('trangThai', 'Đã nghỉ việc')->count();
        $totalDepartments = PhongBan::count();
        $totalPositions = ChucVu::count();
        $totalActiveContracts = HopDong::where('trangThai', 'Hiệu lực')->count();

        // Kỳ lương gần nhất
        $latestPayrollMonth = BangLuong::orderBy('thang', 'desc')->value('thang') ?? date('m/Y');
        $latestPayrollFund = BangLuong::where('thang', $latestPayrollMonth)->sum('tongThucNhan');
        $isPayrollLocked = BangLuong::where('thang', $latestPayrollMonth)->where('trangThai', 'DaKhoa')->exists();

        // Cơ cấu theo phòng ban
        $departmentDistribution = PhongBan::withCount(['nhanViens' => fn($q) => $q->where('trangThai', 'Đang làm việc')])
            ->get()
            ->map(fn($d) => [
                'maPhongBan' => $d->maPhongBan,
                'tenPhongBan' => $d->tenPhongBan,
                'soLuong' => $d->nhan_viens_count,
            ]);

        // Hợp đồng sắp hết hạn trong 30 ngày
        $expiringContracts = HopDong::with('nhanVien')
            ->where('trangThai', 'Hiệu lực')
            ->whereNotNull('ngayHetHan')
            ->whereBetween('ngayHetHan', [now(), now()->addDays(30)])
            ->get();

        // 5 nhân viên mới tiếp nhận gần nhất
        $recentEmployees = NhanVien::with(['phongBan', 'chucVu'])
            ->orderBy('ngayVaoLam', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'tongNhanVien' => $totalActiveEmployees,
                'tongNghiViec' => $totalResigned,
                'tongPhongBan' => $totalDepartments,
                'tongChucVu' => $totalPositions,
                'tongHopDongHieuLuc' => $totalActiveContracts,
                'kyLuongGanNhat' => $latestPayrollMonth,
                'quyLuongThangGanNhat' => (float)$latestPayrollFund,
                'trangThaiKhoaKyLuong' => $isPayrollLocked,
                'coCauPhongBan' => $departmentDistribution,
                'hopDongSapHetHan' => $expiringContracts,
                'nhanVienMoi' => $recentEmployees,
            ],
        ]);
    }

    // =========================================================================
    // HR-FR19: Xem báo cáo biến động và cơ cấu nhân sự
    // =========================================================================
    public function getStaffReport(Request $request)
    {
        // 1. Phân bổ theo phòng ban
        $departments = PhongBan::withCount([
            'nhanViens as dang_lam_viec' => fn($q) => $q->where('trangThai', 'Đang làm việc'),
            'nhanViens as da_nghi_viec' => fn($q) => $q->where('trangThai', 'Đã nghỉ việc'),
        ])->get();

        // 2. Phân bổ theo trình độ học vấn
        $education = NhanVien::where('trangThai', 'Đang làm việc')
            ->select('trinhDo', DB::raw('count(*) as soLuong'))
            ->groupBy('trinhDo')
            ->get();

        // 3. Phân bổ theo giới tính
        $gender = NhanVien::where('trangThai', 'Đang làm việc')
            ->select('gioiTinh', DB::raw('count(*) as soLuong'))
            ->groupBy('gioiTinh')
            ->get();

        // 4. Phân bổ theo loại hợp đồng
        $contractTypes = HopDong::where('trangThai', 'Hiệu lực')
            ->select('loaiHopDong', DB::raw('count(*) as soLuong'))
            ->groupBy('loaiHopDong')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'phongBan' => $departments,
                'trinhDo' => $education,
                'gioiTinh' => $gender,
                'loaiHopDong' => $contractTypes,
            ],
        ]);
    }

    // =========================================================================
    // HR-FR20: Báo cáo quỹ lương và chi phí nhân sự theo các kỳ
    // =========================================================================
    public function getPayrollFundReport(Request $request)
    {
        $months = BangLuong::select('thang')
            ->distinct()
            ->orderBy('thang', 'desc')
            ->take(12)
            ->pluck('thang');

        $reportByMonth = [];
        foreach ($months as $m) {
            $records = BangLuong::where('thang', $m)->get();
            $reportByMonth[] = [
                'thang' => $m,
                'tongNhanVien' => $records->count(),
                'tongLuongCoBan' => (float)$records->sum('luongCoBan'),
                'tongPhuCap' => (float)$records->sum('phuCap'),
                'tongTangCa' => (float)$records->sum('luongTangCa'),
                'tongKhauTru' => (float)$records->sum('khauTru'),
                'tongThucNhan' => (float)$records->sum('tongThucNhan'),
                'trangThai' => $records->first()?->trangThai ?? 'TamTinh',
            ];
        }

        // Báo cáo chi phí quỹ lương tháng gần nhất theo phòng ban
        $latestMonth = $months->first() ?? date('m/Y');
        $costByDepartment = DB::table('BangLuong as bl')
            ->join('NhanVien as nv', 'bl.maNV', '=', 'nv.maNV')
            ->join('PhongBan as pb', 'nv.maPhongBan', '=', 'pb.maPhongBan')
            ->where('bl.thang', $latestMonth)
            ->select(
                'pb.maPhongBan',
                'pb.tenPhongBan',
                DB::raw('COUNT(bl.maNV) as soNhanSu'),
                DB::raw('SUM(bl.tongThucNhan) as tongChiPhi')
            )
            ->groupBy('pb.maPhongBan', 'pb.tenPhongBan')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'kyBaoCao' => $latestMonth,
                'theoKy' => $reportByMonth,
                'theoPhongBan' => $costByDepartment,
            ],
        ]);
    }
}
