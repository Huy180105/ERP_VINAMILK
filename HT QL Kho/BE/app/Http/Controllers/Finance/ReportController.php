<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PhieuThu;
use App\Models\PhieuChi;
use App\Models\TaiKhoanQuy;
use App\Models\DoiTuongGiaoDich;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Báo cáo tổng hợp Thu - Chi - Tồn quỹ (FI-FR05)
     */
    public function getSummaryReport(Request $request)
    {
        $tuNgay = $request->input('tuNgay');
        $denNgay = $request->input('denNgay');

        $queryThu = PhieuThu::where('trangThai', 'DaDuyet');
        $queryChi = PhieuChi::where('trangThai', 'DaDuyet');

        if ($tuNgay) {
            $queryThu->whereDate('ngayThu', '>=', $tuNgay);
            $queryChi->whereDate('ngayChi', '>=', $tuNgay);
        }
        if ($denNgay) {
            $queryThu->whereDate('ngayThu', '<=', $denNgay);
            $queryChi->whereDate('ngayChi', '<=', $denNgay);
        }

        $tongThu = (float) $queryThu->sum('soTien');
        $tongChi = (float) $queryChi->sum('soTien');

        // Biểu đồ 6 tháng gần nhất: tối ưu 2 truy vấn tổng hợp thay vì lặp 12 lần
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();
        $thuMonthly = PhieuThu::where('trangThai', 'DaDuyet')
            ->whereDate('ngayThu', '>=', $sixMonthsAgo)
            ->selectRaw('YEAR(ngayThu) as yr, MONTH(ngayThu) as mo, SUM(soTien) as total')
            ->groupBy('yr', 'mo')
            ->get()
            ->keyBy(fn($r) => "{$r->yr}-{$r->mo}");

        $chiMonthly = PhieuChi::where('trangThai', 'DaDuyet')
            ->whereDate('ngayChi', '>=', $sixMonthsAgo)
            ->selectRaw('YEAR(ngayChi) as yr, MONTH(ngayChi) as mo, SUM(soTien) as total')
            ->groupBy('yr', 'mo')
            ->get()
            ->keyBy(fn($r) => "{$r->yr}-{$r->mo}");

        $monthlyChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = Carbon::now()->subMonths($i);
            $key = "{$m->year}-{$m->month}";
            $mThu = (float) ($thuMonthly[$key]->total ?? 0);
            $mChi = (float) ($chiMonthly[$key]->total ?? 0);
            $monthlyChart[] = [
                'thang' => "Tháng {$m->month}/{$m->year}",
                'thu' => $mThu,
                'chi' => $mChi,
                'chenhLech' => $mThu - $mChi,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tongThu' => $tongThu,
                'tongChi' => $tongChi,
                'chenhLech' => $tongThu - $tongChi,
                'soPhieuThu' => $queryThu->count(),
                'soPhieuChi' => $queryChi->count(),
                'tongSoDuQuy' => (float) TaiKhoanQuy::where('trangThai', 1)->sum('soDuHienTai'),
                'monthlyChart' => $monthlyChart,
            ]
        ]);
    }

    /**
     * Báo cáo Sổ quỹ chi tiết (Tiền mặt / Tiền gửi ngân hàng)
     */
    public function getCashBookReport(Request $request)
    {
        $maTaiKhoanQuy = $request->input('maTaiKhoanQuy');
        $tuNgay = $request->input('tuNgay');
        $denNgay = $request->input('denNgay');

        $applyFilters = function ($query, $dateCol) use ($maTaiKhoanQuy, $tuNgay, $denNgay) {
            $query->where('trangThai', 'DaDuyet');
            if ($maTaiKhoanQuy) $query->where('maTaiKhoanQuy', $maTaiKhoanQuy);
            if ($tuNgay) $query->whereDate($dateCol, '>=', $tuNgay);
            if ($denNgay) $query->whereDate($dateCol, '<=', $denNgay);
            return $query;
        };

        $thuList = $applyFilters(PhieuThu::with('doiTuong'), 'ngayThu')->get()->map(fn($pt) => [
            'maPhieu' => $pt->maPhieuThu,
            'ngayGiaoDich' => $pt->ngayThu,
            'loaiPhieu' => 'Thu',
            'soTienThu' => (float) $pt->soTien,
            'soTienChi' => 0.0,
            'dienGiai' => $pt->lyDoThu,
            'phuongThuc' => $pt->phuongThucThu,
            'maTaiKhoanQuy' => $pt->maTaiKhoanQuy,
            'tenDoiTuong' => $pt->doiTuong?->tenDoiTuong ?? 'N/A',
            'trangThai' => $pt->trangThai,
        ]);

        $chiList = $applyFilters(PhieuChi::with('doiTuong'), 'ngayChi')->get()->map(fn($pc) => [
            'maPhieu' => $pc->maPhieuChi,
            'ngayGiaoDich' => $pc->ngayChi,
            'loaiPhieu' => 'Chi',
            'soTienThu' => 0.0,
            'soTienChi' => (float) $pc->soTien,
            'dienGiai' => $pc->lyDoChi,
            'phuongThuc' => $pc->phuongThucChi,
            'maTaiKhoanQuy' => $pc->maTaiKhoanQuy,
            'tenDoiTuong' => $pc->doiTuong?->tenDoiTuong ?? 'N/A',
            'trangThai' => $pc->trangThai,
        ]);

        $combined = $thuList->concat($chiList)->sortBy('ngayGiaoDich')->values();
        $runningBalance = 0;
        $totalThu = 0;
        $totalChi = 0;

        $transactions = $combined->map(function ($tx) use (&$runningBalance, &$totalThu, &$totalChi) {
            $totalThu += $tx['soTienThu'];
            $totalChi += $tx['soTienChi'];
            $runningBalance += ($tx['soTienThu'] - $tx['soTienChi']);
            $tx['soDuLuyKe'] = $runningBalance;
            return $tx;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $transactions,
                'totalThu' => $totalThu,
                'totalChi' => $totalChi,
                'chenhLech' => $totalThu - $totalChi,
            ]
        ]);
    }

    /**
     * Báo cáo Thu - Chi theo Đối tượng giao dịch (KH / NCC / NV)
     * Đã tối ưu hóa loại bỏ N+1 query loop
     */
    public function getByCounterpartyReport(Request $request)
    {
        $tuNgay = $request->input('tuNgay');
        $denNgay = $request->input('denNgay');
        $loaiDoiTuong = $request->input('loaiDoiTuong');

        $query = DoiTuongGiaoDich::with(['khachHang', 'nhaCungCap', 'nhanVien']);
        if ($loaiDoiTuong) {
            $query->where('loaiDoiTuong', $loaiDoiTuong);
        }
        $list = $query->get();

        // 2 câu truy vấn tổng hợp gom nhóm theo maDoiTuong thay vì chạy query trong vòng foreach
        $thuSums = PhieuThu::where('trangThai', 'DaDuyet')
            ->when($tuNgay, fn($q) => $q->whereDate('ngayThu', '>=', $tuNgay))
            ->when($denNgay, fn($q) => $q->whereDate('ngayThu', '<=', $denNgay))
            ->groupBy('maDoiTuong')
            ->selectRaw('maDoiTuong, SUM(soTien) as total')
            ->pluck('total', 'maDoiTuong');

        $chiSums = PhieuChi::where('trangThai', 'DaDuyet')
            ->when($tuNgay, fn($q) => $q->whereDate('ngayChi', '>=', $tuNgay))
            ->when($denNgay, fn($q) => $q->whereDate('ngayChi', '<=', $denNgay))
            ->groupBy('maDoiTuong')
            ->selectRaw('maDoiTuong, SUM(soTien) as total')
            ->pluck('total', 'maDoiTuong');

        $result = [];
        foreach ($list as $dt) {
            $tongThu = (float) ($thuSums[$dt->maDoiTuong] ?? 0);
            $tongChi = (float) ($chiSums[$dt->maDoiTuong] ?? 0);

            if ($tongThu > 0 || $tongChi > 0) {
                $result[] = [
                    'maDoiTuong' => $dt->maDoiTuong,
                    'maThamChieu' => $dt->maThamChieu,
                    'tenDoiTuong' => $dt->tenDoiTuong,
                    'loaiDoiTuong' => $dt->loaiDoiTuong,
                    'soDienThoai' => $dt->soDienThoai,
                    'tongThu' => $tongThu,
                    'tongChi' => $tongChi,
                    'chenhLech' => $tongThu - $tongChi,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    /**
     * Báo cáo Đối soát Ngân hàng & Quỹ (FI-FR06)
     */
    public function getReconciliationReport(Request $request)
    {
        $maTaiKhoanQuy = $request->input('maTaiKhoanQuy');
        $tuNgay = $request->input('tuNgay');
        $denNgay = $request->input('denNgay');

        $accountQuery = TaiKhoanQuy::where('trangThai', 1);
        if ($maTaiKhoanQuy) {
            $accountQuery->where('maTaiKhoanQuy', $maTaiKhoanQuy);
        }
        $accounts = $accountQuery->get();

        $ptQuery = PhieuThu::with(['doiTuong', 'taiKhoanQuy'])->whereIn('trangThai', ['ChoDoiSoat', 'DaDuyet']);
        $pcQuery = PhieuChi::with(['doiTuong', 'taiKhoanQuy'])->whereIn('trangThai', ['Moi', 'DaDuyet']);

        if ($maTaiKhoanQuy) {
            $ptQuery->where('maTaiKhoanQuy', $maTaiKhoanQuy);
            $pcQuery->where('maTaiKhoanQuy', $maTaiKhoanQuy);
        }
        if ($tuNgay) {
            $ptQuery->whereDate('ngayThu', '>=', $tuNgay);
            $pcQuery->whereDate('ngayChi', '>=', $tuNgay);
        }
        if ($denNgay) {
            $ptQuery->whereDate('ngayThu', '<=', $denNgay);
            $pcQuery->whereDate('ngayChi', '<=', $denNgay);
        }

        $receipts = $ptQuery->orderBy('ngayThu', 'desc')->get()->map(fn($pt) => [
            'maPhieu' => $pt->maPhieuThu,
            'loaiPhieu' => 'Thu',
            'ngay' => $pt->ngayThu,
            'soTien' => (float) $pt->soTien,
            'phuongThuc' => $pt->phuongThucThu,
            'maTaiKhoanQuy' => $pt->maTaiKhoanQuy,
            'tenTaiKhoanQuy' => $pt->taiKhoanQuy?->tenTaiKhoanQuy ?? 'N/A',
            'tenDoiTuong' => $pt->doiTuong?->tenDoiTuong ?? 'N/A',
            'trangThai' => $pt->trangThai,
            'ghiChu' => $pt->lyDoThu,
        ]);

        $payments = $pcQuery->orderBy('ngayChi', 'desc')->get()->map(fn($pc) => [
            'maPhieu' => $pc->maPhieuChi,
            'loaiPhieu' => 'Chi',
            'ngay' => $pc->ngayChi,
            'soTien' => (float) $pc->soTien,
            'phuongThuc' => $pc->phuongThucChi,
            'maTaiKhoanQuy' => $pc->maTaiKhoanQuy,
            'tenTaiKhoanQuy' => $pc->taiKhoanQuy?->tenTaiKhoanQuy ?? 'N/A',
            'tenDoiTuong' => $pc->doiTuong?->tenDoiTuong ?? 'N/A',
            'trangThai' => $pc->trangThai,
            'ghiChu' => $pc->lyDoChi,
        ]);

        $pendingReceipts = $receipts->where('trangThai', 'ChoDoiSoat')->values();
        $approvedReceipts = $receipts->where('trangThai', 'DaDuyet')->values();

        return response()->json([
            'success' => true,
            'data' => [
                'accounts' => $accounts,
                'pendingReconciliation' => [
                    'count' => $pendingReceipts->count(),
                    'totalAmount' => $pendingReceipts->sum('soTien'),
                    'items' => $pendingReceipts,
                ],
                'approvedItems' => [
                    'receiptsCount' => $approvedReceipts->count(),
                    'receiptsTotal' => $approvedReceipts->sum('soTien'),
                    'paymentsCount' => $payments->count(),
                    'paymentsTotal' => $payments->sum('soTien'),
                ],
                'allVouchers' => $receipts->concat($payments)->sortByDesc('ngay')->values(),
            ]
        ]);
    }
}
