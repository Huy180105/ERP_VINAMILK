<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\PhieuNghiemThu;
use App\Models\PhieuSanXuatBu;
use App\Models\PhieuYeuCauXuatSP;
use App\Models\ChiTietPhieuYeuCauXuatSP;
use App\Models\LenhSanXuat;
use App\Models\ChiTietLenhSanXuat;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QualityControlController extends Controller
{
    /**
     * Lấy danh sách Phiếu Nghiệm Thu QC (PR-FR28)
     */
    public function getQCReports(Request $request)
    {
        $query = PhieuNghiemThu::with([
            'lenhSanXuat.chiTiets.sanPham',
            'congDoan',
            'nhanVien',
            'phieuSanXuatBus.sanPham',
            'phieuYeuCauXuatSPs'
        ]);

        if ($request->filled('maLenh')) {
            $query->where('maLenh', $request->maLenh);
        }

        $reports = $query->orderBy('ngayNghiemThu', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    /**
     * Lập Phiếu Nghiệm Thu QC & Tự động tạo Lệnh Sản Xuất Bù nếu có phế phẩm (PR-FR28, PR-FR29, PR-FR31, PR-BR10)
     */
    public function createQCReport(Request $request)
    {
        $validated = $request->validate([
            'maPhieuNghiemThu' => 'nullable|string|unique:PhieuNghiemThu,maPhieuNghiemThu',
            'maLenh' => 'required|string|exists:LenhSanXuat,maLenh',
            'maCongDoan' => 'nullable|string|exists:CongDoan,maCongDoan',
            'maNhanVien' => 'nullable|string|exists:NhanVien,maNV',
            'tongSoLuongSanPham' => 'required|integer|min:1',
            'tongSoLuongDat' => 'required|integer|min:0',
            'tongSoLuongKhongDat' => 'required|integer|min:0',
            'ngayNghiemThu' => 'required|date',
            'ghiChu' => 'nullable|string|max:255',
            'lyDoKhongDat' => 'nullable|string|max:255',
        ]);

        if ($validated['tongSoLuongDat'] + $validated['tongSoLuongKhongDat'] !== $validated['tongSoLuongSanPham']) {
            return response()->json([
                'success' => false,
                'message' => 'Tổng số lượng Đạt và Không đạt phải bằng Tổng số lượng nghiệm thu!'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $pntCode = $validated['maPhieuNghiemThu'];
            if (!$pntCode) {
                $count = PhieuNghiemThu::count() + 1;
                $pntCode = 'QC' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }

            $report = PhieuNghiemThu::create([
                'maPhieuNghiemThu' => $pntCode,
                'maCongDoan' => $validated['maCongDoan'] ?? null,
                'maLenh' => $validated['maLenh'],
                'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
                'tongSoLuongSanPham' => $validated['tongSoLuongSanPham'],
                'tongSoLuongDat' => $validated['tongSoLuongDat'],
                'tongSoLuongKhongDat' => $validated['tongSoLuongKhongDat'],
                'ngayNghiemThu' => $validated['ngayNghiemThu'],
                'ghiChu' => $validated['ghiChu'] ?? 'Nghiệm thu chất lượng sản phẩm Vinamilk sau đóng gói',
            ]);

            // If there are defective / failed products, auto-generate PhieuSanXuatBu
            if ($validated['tongSoLuongKhongDat'] > 0) {
                $orderDetail = ChiTietLenhSanXuat::where('maLenh', $validated['maLenh'])->first();
                $spId = $orderDetail ? $orderDetail->maSanPham : 'SP001';

                PhieuSanXuatBu::create([
                    'maLenh' => $validated['maLenh'],
                    'maSanPham' => $spId,
                    'maPhieuNghiemThu' => $pntCode,
                    'soLuongKhongDat' => $validated['tongSoLuongKhongDat'],
                    'ghiChu' => $validated['lyDoKhongDat'] ?? 'Lệnh sản xuất bù do lỗi phế phẩm nghiệm thu',
                ]);
            }

            // PR-BR12 & Section 2.2.3.1 e: Tự động tạo Phiếu yêu cầu xuất sản phẩm sang Kho nếu soLuongDat > 0
            if ($validated['tongSoLuongDat'] > 0) {
                $orderDetail = ChiTietLenhSanXuat::where('maLenh', $validated['maLenh'])->first();
                $spId = $orderDetail ? $orderDetail->maSanPham : 'SP001';

                $countReq = PhieuYeuCauXuatSP::count() + 1;
                $reqCode = 'YCXSP' . Carbon::now()->format('Ymd') . str_pad($countReq, 3, '0', STR_PAD_LEFT);
                $mfgDate = $validated['ngayNghiemThu'];
                $expDate = Carbon::parse($mfgDate)->addDays(365)->toDateString();

                PhieuYeuCauXuatSP::create([
                    'maPhieuYCXSP' => $reqCode,
                    'maPhieuNghiemThu' => $pntCode,
                    'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
                    'ngayYeuCau' => $validated['ngayNghiemThu'],
                    'trangThai' => 'Chưa xác nhận',
                    'ghiChu' => "Tự động bàn giao thành phẩm đạt từ biên bản QC {$pntCode}",
                ]);

                ChiTietPhieuYeuCauXuatSP::create([
                    'maPhieuYCXSP' => $reqCode,
                    'maSanPham' => $spId,
                    'soLuong' => $validated['tongSoLuongDat'],
                    'ngaySanXuat' => $mfgDate,
                    'hanSuDung' => $expDate,
                    'ghiChu' => 'Thành phẩm đạt chuẩn QC',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Lập biên bản nghiệm thu QC ({$pntCode}) thành công!" . ($validated['tongSoLuongKhongDat'] > 0 ? " Đã tự động tạo Lệnh Sản Xuất Bù cho {$validated['tongSoLuongKhongDat']} sản phẩm lỗi." : ""),
                'data' => PhieuNghiemThu::with(['lenhSanXuat', 'phieuSanXuatBus.sanPham', 'nhanVien'])->where('maPhieuNghiemThu', $pntCode)->first()
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lập biên bản QC: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách Lệnh Sản Xuất Bù (PR-FR31)
     */
    public function getCompensationOrders(Request $request)
    {
        $compensations = PhieuSanXuatBu::with(['lenhSanXuat', 'sanPham', 'phieuNghiemThu'])->get();

        return response()->json([
            'success' => true,
            'data' => $compensations
        ]);
    }

    /**
     * Lấy danh sách Phiếu Yêu Cầu Xuất Sản Phẩm (Bàn giao kho)
     */
    public function getHandovers(Request $request)
    {
        $handovers = PhieuYeuCauXuatSP::with(['chiTiets.sanPham', 'phieuNghiemThu', 'nhanVien'])
            ->orderBy('ngayYeuCau', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $handovers
        ]);
    }

    /**
     * Bàn giao thành phẩm Đạt sang Phân hệ Kho (PR-FR30, PR-BR12)
     * Lập Phiếu Yêu Cầu Xuất Sản Phẩm (PhieuYeuCauXuatSP) để Kho tiến hành nhập kho thành phẩm
     */
    public function handoverToWarehouse(Request $request)
    {
        $validated = $request->validate([
            'maPhieuNghiemThu' => 'required|string|exists:PhieuNghiemThu,maPhieuNghiemThu',
            'maNhanVien' => 'nullable|string|exists:NhanVien,maNV',
            'ngayYeuCau' => 'required|date',
            'ghiChu' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.maSanPham' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.ghiChu' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $count = PhieuYeuCauXuatSP::count() + 1;
            $reqCode = 'BGK' . str_pad($count, 3, '0', STR_PAD_LEFT);

            $handover = PhieuYeuCauXuatSP::create([
                'maPhieuYCXSP' => $reqCode,
                'maPhieuNghiemThu' => $validated['maPhieuNghiemThu'],
                'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
                'ngayYeuCau' => $validated['ngayYeuCau'],
                'trangThai' => 'Chưa xác nhận',
                'ghiChu' => $validated['ghiChu'] ?? 'Bàn giao thành phẩm đạt chất lượng sang Kho Vinamilk',
            ]);

            $pnt = PhieuNghiemThu::where('maPhieuNghiemThu', $validated['maPhieuNghiemThu'])->first();
            $defaultMfg = $pnt ? $pnt->ngayNghiemThu : $validated['ngayYeuCau'];

            foreach ($validated['items'] as $item) {
                $mfgDate = $item['ngaySanXuat'] ?? $defaultMfg;
                $expDate = $item['hanSuDung'] ?? Carbon::parse($mfgDate)->addDays(180)->toDateString();

                ChiTietPhieuYeuCauXuatSP::create([
                    'maPhieuYCXSP' => $reqCode,
                    'maSanPham' => $item['maSanPham'],
                    'soLuong' => $item['soLuong'],
                    'ngaySanXuat' => $mfgDate,
                    'hanSuDung' => $expDate,
                    'ghiChu' => $item['ghiChu'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã tạo Phiếu bàn giao thành phẩm ({$reqCode}) gửi sang Phân hệ Kho thành công!",
                'data' => PhieuYeuCauXuatSP::with(['chiTiets.sanPham', 'nhanVien'])->where('maPhieuYCXSP', $reqCode)->first()
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo phiếu bàn giao: ' . $e->getMessage()
            ], 500);
        }
    }
}
