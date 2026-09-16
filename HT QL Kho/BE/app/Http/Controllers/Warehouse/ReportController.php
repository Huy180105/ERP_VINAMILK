<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\TonKho;
use App\Models\ChiTietPhieuNhapNVL;
use App\Models\ChiTietPhieuXuatNVL;
use App\Models\ChiTietPhieuNhapSP;
use App\Models\ChiTietPhieuXuatSP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Báo cáo tổng hợp Nhập - Xuất - Tồn (CF-FR56 đến CF-FR58)
    public function getInventorySummary(Request $request)
    {
        $fromDate = $request->input('fromDate', '2026-01-01');
        $toDate = $request->input('toDate', date('Y-m-d'));

        // Pre-aggregate tổng nhập & xuất theo từng mã lô (tránh triệt để N+1 query)
        $nhapNVL = ChiTietPhieuNhapNVL::groupBy('maTonKho')->pluck(DB::raw('SUM(soLuong)'), 'maTonKho');
        $xuatNVL = ChiTietPhieuXuatNVL::groupBy('maTonKho')->pluck(DB::raw('SUM(soLuong)'), 'maTonKho');
        $xuatSP  = ChiTietPhieuXuatSP::groupBy('maTonKho')->pluck(DB::raw('SUM(soLuong)'), 'maTonKho');

        $summary = TonKho::with(['sanPham', 'nguyenVatLieu'])
            ->get()
            ->map(function ($lot) use ($nhapNVL, $xuatNVL, $xuatSP) {
                $isSP = !empty($lot->maSP);
                $tongNhap = (float) ($isSP ? $lot->soLuongNhap : ($nhapNVL[$lot->maTonKho] ?? $lot->soLuongNhap));
                $tongXuat = (float) ($isSP ? ($xuatSP[$lot->maTonKho] ?? 0) : ($xuatNVL[$lot->maTonKho] ?? 0));

                return [
                    'maTonKho'          => $lot->maTonKho,
                    'tenTonKho'         => $lot->tenTonKho,
                    'loai'              => $isSP ? 'Sản phẩm' : 'Nguyên vật liệu',
                    'tenMatHang'        => $lot->sanPham?->tenSanPham ?? $lot->nguyenVatLieu?->tenNVL ?? 'N/A',
                    'ngaySanXuat'       => $lot->ngaySanXuat,
                    'hanSuDung'         => $lot->hanSuDung,
                    'soLuongNhapBanDau' => (float) $lot->soLuongNhap,
                    'tongNhap'          => $tongNhap,
                    'tongXuat'          => $tongXuat,
                    'tonKhoHienTai'     => (float) $lot->soLuongTonHienTai,
                    'trangThai'         => $lot->trangThai,
                ];
            });

        return response()->json([
            'success'  => true,
            'fromDate' => $fromDate,
            'toDate'   => $toDate,
            'data'     => $summary,
        ]);
    }

    // Báo cáo lịch sử thẻ kho (Audit Trail)
    public function getStockAuditTrail(Request $request, $maTonKho)
    {
        $lot = TonKho::with(['sanPham', 'nguyenVatLieu'])->where('maTonKho', $maTonKho)->firstOrFail();

        $movements = collect();

        if ($lot->maSP) {
            // Lịch sử biến động của lô Sản Phẩm
            $xuatSP = ChiTietPhieuXuatSP::where('maTonKho', $maTonKho)
                ->join('PhieuXuatSP', 'ChiTietPhieuXuatSP.maPhieuXuatSP', '=', 'PhieuXuatSP.maPhieuXuatSP')
                ->select('PhieuXuatSP.ngayXuat as ngay', 'PhieuXuatSP.maPhieuXuatSP as maPhieu', DB::raw("'Xuất SP cho Đại lý' as loaiGiaoDich"), 'ChiTietPhieuXuatSP.soLuong')
                ->get();

            $movements = $movements->concat($xuatSP);
        } else {
            // Lịch sử biến động của lô Nguyên Vật Liệu
            $nhapNVL = ChiTietPhieuNhapNVL::where('maTonKho', $maTonKho)
                ->join('PhieuNhapNVL', 'ChiTietPhieuNhapNVL.maPhieuNhapNVL', '=', 'PhieuNhapNVL.maPhieuNhapNVL')
                ->select('PhieuNhapNVL.ngayNhap as ngay', 'PhieuNhapNVL.maPhieuNhapNVL as maPhieu', DB::raw("'Nhập NVL từ NCC' as loaiGiaoDich"), 'ChiTietPhieuNhapNVL.soLuong')
                ->get();

            $xuatNVL = ChiTietPhieuXuatNVL::where('maTonKho', $maTonKho)
                ->join('PhieuXuatNVL', 'ChiTietPhieuXuatNVL.maPhieuXuatNVL', '=', 'PhieuXuatNVL.maPhieuXuatNVL')
                ->select('PhieuXuatNVL.ngayXuat as ngay', 'PhieuXuatNVL.maPhieuXuatNVL as maPhieu', DB::raw("'Xuất NVL cho Xưởng' as loaiGiaoDich"), 'ChiTietPhieuXuatNVL.soLuong')
                ->get();

            $movements = $movements->concat($nhapNVL)->concat($xuatNVL);
        }

        return response()->json([
            'success'   => true,
            'lot'       => $lot,
            'movements' => $movements->sortBy('ngay')->values(),
        ]);
    }
}
