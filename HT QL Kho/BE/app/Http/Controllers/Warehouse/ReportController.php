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

        $summary = TonKho::with(['sanPham', 'nguyenVatLieu'])
            ->get()
            ->map(function ($lot) {
                $tongNhapNVL = ChiTietPhieuNhapNVL::where('maTonKho', $lot->maTonKho)->sum('soLuong');
                $tongXuatNVL = ChiTietPhieuXuatNVL::where('maTonKho', $lot->maTonKho)->sum('soLuong');
                $tongNhapSP = ChiTietPhieuNhapSP::where('maTonKho', $lot->maTonKho)->sum('soLuong');
                $tongXuatSP = ChiTietPhieuXuatSP::where('maTonKho', $lot->maTonKho)->sum('soLuong');

                $tongNhap = $tongNhapNVL + $tongNhapSP;
                $tongXuat = $tongXuatNVL + $tongXuatSP;

                return [
                    'maTonKho' => $lot->maTonKho,
                    'tenTonKho' => $lot->tenTonKho,
                    'loai' => $lot->maSP ? 'Sản phẩm' : 'Nguyên vật liệu',
                    'tenMatHang' => $lot->sanPham ? $lot->sanPham->tenSanPham : ($lot->nguyenVatLieu ? $lot->nguyenVatLieu->tenNVL : 'N/A'),
                    'ngaySanXuat' => $lot->ngaySanXuat,
                    'hanSuDung' => $lot->hanSuDung,
                    'soLuongNhapBanDau' => $lot->soLuongNhap,
                    'tongNhap' => $tongNhap,
                    'tongXuat' => $tongXuat,
                    'tonKhoHienTai' => $lot->soLuongTonHienTai,
                    'trangThai' => $lot->trangThai,
                ];
            });

        return response()->json([
            'success' => true,
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'data' => $summary,
        ]);
    }

    // Báo cáo lịch sử thẻ kho (Audit Trail)
    public function getStockAuditTrail(Request $request, $maTonKho)
    {
        $lot = TonKho::with(['sanPham', 'nguyenVatLieu'])->where('maTonKho', $maTonKho)->firstOrFail();

        $nhapNVL = ChiTietPhieuNhapNVL::where('maTonKho', $maTonKho)
            ->join('PhieuNhapNVL', 'ChiTietPhieuNhapNVL.maPhieuNhapNVL', '=', 'PhieuNhapNVL.maPhieuNhapNVL')
            ->select('PhieuNhapNVL.ngayNhap as ngay', 'PhieuNhapNVL.maPhieuNhapNVL as maPhieu', DB::raw("'Nhập NVL từ NCC' as loaiGiaoDich"), 'ChiTietPhieuNhapNVL.soLuong')
            ->get();

        $xuatNVL = ChiTietPhieuXuatNVL::where('maTonKho', $maTonKho)
            ->join('PhieuXuatNVL', 'ChiTietPhieuXuatNVL.maPhieuXuatNVL', '=', 'PhieuXuatNVL.maPhieuXuatNVL')
            ->select('PhieuXuatNVL.ngayXuat as ngay', 'PhieuXuatNVL.maPhieuXuatNVL as maPhieu', DB::raw("'Xuất NVL cho Xưởng' as loaiGiaoDich"), 'ChiTietPhieuXuatNVL.soLuong')
            ->get();

        $movements = $nhapNVL->concat($xuatNVL)->sortBy('ngay')->values();

        return response()->json([
            'success' => true,
            'lot' => $lot,
            'movements' => $movements,
        ]);
    }
}
