<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PhieuThu;
use App\Models\PhieuChi;
use App\Models\TaiKhoanQuy;
use App\Models\DoiTuongGiaoDich;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $soPhieuThu = $queryThu->count();

        $tongChi = (float) $queryChi->sum('soTien');
        $soPhieuChi = $queryChi->count();

        $chenhLech = $tongThu - $tongChi;

        $tongSoDuQuy = (float) TaiKhoanQuy::where('trangThai', 1)->sum('soDuHienTai');

        $monthlyChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = Carbon::now()->subMonths($i);
            $year = $monthDate->year;
            $month = $monthDate->month;
            $label = "Tháng {$month}/{$year}";

            $mThu = (float) PhieuThu::where('trangThai', 'DaDuyet')
                ->whereYear('ngayThu', $year)
                ->whereMonth('ngayThu', $month)
                ->sum('soTien');

            $mChi = (float) PhieuChi::where('trangThai', 'DaDuyet')
                ->whereYear('ngayChi', $year)
                ->whereMonth('ngayChi', $month)
                ->sum('soTien');

            $monthlyChart[] = [
                'thang' => $label,
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
                'chenhLech' => $chenhLech,
                'soPhieuThu' => $soPhieuThu,
                'soPhieuChi' => $soPhieuChi,
                'tongSoDuQuy' => $tongSoDuQuy,
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

        $thuQuery = PhieuThu::with('doiTuong')
            ->where('trangThai', 'DaDuyet');

        $chiQuery = PhieuChi::with('doiTuong')
            ->where('trangThai', 'DaDuyet');

        if ($maTaiKhoanQuy) {
            $thuQuery->where('maTaiKhoanQuy', $maTaiKhoanQuy);
            $chiQuery->where('maTaiKhoanQuy', $maTaiKhoanQuy);
        }

        if ($tuNgay) {
            $thuQuery->whereDate('ngayThu', '>=', $tuNgay);
            $chiQuery->whereDate('ngayChi', '>=', $tuNgay);
        }
        if ($denNgay) {
            $thuQuery->whereDate('ngayThu', '<=', $denNgay);
            $chiQuery->whereDate('ngayChi', '<=', $denNgay);
        }

        $thuList = $thuQuery->get()->map(function ($pt) {
            return [
                'maPhieu' => $pt->maPhieuThu,
                'ngayGiaoDich' => $pt->ngayThu,
                'loaiPhieu' => 'Thu',
                'soTienThu' => (float) $pt->soTien,
                'soTienChi' => 0.0,
                'dienGiai' => $pt->lyDoThu,
                'phuongThuc' => $pt->phuongThucThu,
                'maTaiKhoanQuy' => $pt->maTaiKhoanQuy,
                'tenDoiTuong' => $pt->doiTuong ? $pt->doiTuong->tenDoiTuong : 'N/A',
                'trangThai' => $pt->trangThai,
            ];
        });

        $chiList = $chiQuery->get()->map(function ($pc) {
            return [
                'maPhieu' => $pc->maPhieuChi,
                'ngayGiaoDich' => $pc->ngayChi,
                'loaiPhieu' => 'Chi',
                'soTienThu' => 0.0,
                'soTienChi' => (float) $pc->soTien,
                'dienGiai' => $pc->lyDoChi,
                'phuongThuc' => $pc->phuongThucChi,
                'maTaiKhoanQuy' => $pc->maTaiKhoanQuy,
                'tenDoiTuong' => $pc->doiTuong ? $pc->doiTuong->tenDoiTuong : 'N/A',
                'trangThai' => $pc->trangThai,
            ];
        });

        // Kết hợp và sắp xếp theo ngày giao dịch
        $combined = $thuList->concat($chiList)->sortBy('ngayGiaoDich')->values();

        $runningBalance = 0;
        $resultTransactions = [];
        $totalThu = 0;
        $totalChi = 0;

        foreach ($combined as $tx) {
            $totalThu += $tx['soTienThu'];
            $totalChi += $tx['soTienChi'];
            $runningBalance += ($tx['soTienThu'] - $tx['soTienChi']);
            $tx['soDuLuyKe'] = $runningBalance;
            $resultTransactions[] = $tx;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $resultTransactions,
                'totalThu' => $totalThu,
                'totalChi' => $totalChi,
                'chenhLech' => $totalThu - $totalChi,
            ]
        ]);
    }

    /**
     * Báo cáo Thu - Chi theo Đối tượng giao dịch (KH / NCC / NV)
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

        $result = [];
        foreach ($list as $dt) {
            $thuQ = PhieuThu::where('maDoiTuong', $dt->maDoiTuong)
                ->where('trangThai', 'DaDuyet');

            $chiQ = PhieuChi::where('maDoiTuong', $dt->maDoiTuong)
                ->where('trangThai', 'DaDuyet');

            if ($tuNgay) {
                $thuQ->whereDate('ngayThu', '>=', $tuNgay);
                $chiQ->whereDate('ngayChi', '>=', $tuNgay);
            }
            if ($denNgay) {
                $thuQ->whereDate('ngayThu', '<=', $denNgay);
                $chiQ->whereDate('ngayChi', '<=', $denNgay);
            }

            $tongThu = (float) $thuQ->sum('soTien');
            $tongChi = (float) $chiQ->sum('soTien');

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
     * Đối soát các chứng từ ngân hàng, chứng từ chờ đối soát (ChoDoiSoat) so với số dư sổ phụ
     */
    public function getReconciliationReport(Request $request)
    {
        $maTaiKhoanQuy = $request->input('maTaiKhoanQuy');
        $tuNgay = $request->input('tuNgay');
        $denNgay = $request->input('denNgay');

        // Danh sách các tài khoản ngân hàng / tiền mặt
        $accountQuery = TaiKhoanQuy::where('trangThai', 1);
        if ($maTaiKhoanQuy) {
            $accountQuery->where('maTaiKhoanQuy', $maTaiKhoanQuy);
        }
        $accounts = $accountQuery->get();

        // Lấy danh sách phiếu thu chờ đối soát hoặc đã duyệt qua tài khoản ngân hàng
        $ptQuery = PhieuThu::with(['doiTuong', 'taiKhoanQuy'])
            ->whereIn('trangThai', ['ChoDoiSoat', 'DaDuyet']);

        // Lấy danh sách phiếu chi chờ đối soát hoặc đã duyệt qua tài khoản ngân hàng
        $pcQuery = PhieuChi::with(['doiTuong', 'taiKhoanQuy'])
            ->whereIn('trangThai', ['Moi', 'DaDuyet']);

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

        $receipts = $ptQuery->orderBy('ngayThu', 'desc')->get()->map(function ($pt) {
            return [
                'maPhieu' => $pt->maPhieuThu,
                'loaiPhieu' => 'Thu',
                'ngay' => $pt->ngayThu,
                'soTien' => (float) $pt->soTien,
                'phuongThuc' => $pt->phuongThucThu,
                'maTaiKhoanQuy' => $pt->maTaiKhoanQuy,
                'tenTaiKhoanQuy' => $pt->taiKhoanQuy ? $pt->taiKhoanQuy->tenTaiKhoanQuy : 'N/A',
                'tenDoiTuong' => $pt->doiTuong ? $pt->doiTuong->tenDoiTuong : 'N/A',
                'trangThai' => $pt->trangThai,
                'ghiChu' => $pt->lyDoThu,
            ];
        });

        $payments = $pcQuery->orderBy('ngayChi', 'desc')->get()->map(function ($pc) {
            return [
                'maPhieu' => $pc->maPhieuChi,
                'loaiPhieu' => 'Chi',
                'ngay' => $pc->ngayChi,
                'soTien' => (float) $pc->soTien,
                'phuongThuc' => $pc->phuongThucChi,
                'maTaiKhoanQuy' => $pc->maTaiKhoanQuy,
                'tenTaiKhoanQuy' => $pc->taiKhoanQuy ? $pc->taiKhoanQuy->tenTaiKhoanQuy : 'N/A',
                'tenDoiTuong' => $pc->doiTuong ? $pc->doiTuong->tenDoiTuong : 'N/A',
                'trangThai' => $pc->trangThai,
                'ghiChu' => $pc->lyDoChi,
            ];
        });

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
