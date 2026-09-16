<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PhieuChi;
use App\Models\ChiTietPhieuChi;
use App\Models\TaiKhoanQuy;
use App\Models\PhieuNhapNVL;
use App\Models\BangLuong;
use App\Models\DoiTuongGiaoDich;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PhieuChiController extends Controller
{
    /**
     * Helper kiểm tra thẩm quyền phê duyệt / hủy phiếu
     */
    private function isApproverAuthorized(Request $request): bool
    {
        $userRole = $request->header('X-User-Role') ?? $request->input('role', 'KeToanTruong');
        return in_array($userRole, ['KeToanTruong', 'Admin'], true);
    }

    /**
     * Danh sách phiếu chi (FI-FR03)
     */
    public function getPayments(Request $request)
    {
        $query = PhieuChi::with([
            'doiTuong',
            'taiKhoanQuy',
            'nhanVienLap',
            'nhanVienDuyet',
            'chiTiets.danhMucChi',
            'phieuNhapNVL.nhaCungCap',
            'bangLuong.nhanVien'
        ]);

        if ($request->filled('trangThai')) $query->where('trangThai', $request->input('trangThai'));
        if ($request->filled('maDoiTuong')) $query->where('maDoiTuong', $request->input('maDoiTuong'));
        if ($request->filled('tuNgay')) $query->whereDate('ngayChi', '>=', $request->input('tuNgay'));
        if ($request->filled('denNgay')) $query->whereDate('ngayChi', '<=', $request->input('denNgay'));
        if ($request->filled('maPhieuNhapNVL')) $query->where('maPhieuNhapNVL', $request->input('maPhieuNhapNVL'));
        if ($request->filled('maBangLuong')) $query->where('maBangLuong', $request->input('maBangLuong'));

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayChi', 'desc')->get(),
        ]);
    }

    /**
     * Chi tiết 1 phiếu chi
     */
    public function getPayment($id)
    {
        $payment = PhieuChi::with([
            'doiTuong',
            'taiKhoanQuy',
            'nhanVienLap',
            'nhanVienDuyet',
            'chiTiets.danhMucChi',
            'phieuNhapNVL.nhaCungCap',
            'phieuNhapNVL.chiTiets',
            'bangLuong.nhanVien'
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $payment]);
    }

    /**
     * Lấy danh sách Phiếu Nhập NVL (Kho) chờ thanh toán (FI-BR02)
     */
    public function getPendingPurchasePayments(Request $request)
    {
        $linkedPnnvlIds = PhieuChi::whereNotNull('maPhieuNhapNVL')
            ->where('trangThai', '!=', 'Huy')
            ->pluck('maPhieuNhapNVL');

        $receipts = PhieuNhapNVL::with(['nhaCungCap', 'chiTiets'])
            ->whereNotIn('maPhieuNhapNVL', $linkedPnnvlIds)
            ->when($request->filled('maNCC'), fn($q) => $q->where('maNCC', $request->input('maNCC')))
            ->orderBy('ngayNhap', 'desc')
            ->get();

        $data = $receipts->map(fn($pn) => [
            'maPhieuNhapNVL' => $pn->maPhieuNhapNVL,
            'ngayNhap' => $pn->ngayNhap,
            'maNCC' => $pn->maNCC,
            'tenNCC' => $pn->nhaCungCap?->tenNCC ?? 'N/A',
            'trangThai' => $pn->trangThai,
            'tongTien' => $pn->chiTiets->sum('thanhTien'),
            'ghiChu' => $pn->ghiChu,
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Lấy danh sách Bảng Lương (Nhân sự) chờ thanh toán (FI-BR02)
     */
    public function getPendingPayrollPayments(Request $request)
    {
        $linkedPayrollIds = PhieuChi::whereNotNull('maBangLuong')
            ->where('trangThai', '!=', 'Huy')
            ->pluck('maBangLuong');

        $payrolls = BangLuong::with('nhanVien')
            ->whereNotIn('maBangLuong', $linkedPayrollIds)
            ->when($request->filled('thangNam'), fn($q) => $q->where('thangNam', $request->input('thangNam')))
            ->orderBy('thangNam', 'desc')
            ->get();

        $data = $payrolls->map(fn($bl) => [
            'maBangLuong' => $bl->maBangLuong,
            'thangNam' => $bl->thangNam,
            'maNV' => $bl->maNV,
            'tenNV' => $bl->nhanVien?->hoTen ?? 'N/A',
            'thucLanh' => $bl->thucLanh,
            'trangThai' => $bl->trangThai,
            'ngayLap' => $bl->ngayLap,
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Lập phiếu chi tiền mới (FI-FR03, FI-BR02)
     */
    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'maPhieuChi' => 'required|string|max:50|unique:PhieuChi,maPhieuChi',
            'ngayChi' => 'required|date',
            'maDoiTuong' => 'nullable|string|max:50',
            'lyDoChi' => 'nullable|string|max:255',
            'soTien' => 'required|numeric|min:0.01',
            'phuongThucChi' => 'required|string|in:TM,CK',
            'maTaiKhoanQuy' => 'nullable|string|max:50|exists:TaiKhoanQuy,maTaiKhoanQuy',
            'nguoiLap' => 'nullable|string|max:50',
            'maPhieuNhapNVL' => 'nullable|string|max:50',
            'maBangLuong' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.maChiTietChi' => 'required|string|max:50',
            'items.*.maDanhMucChi' => 'nullable|string|max:50|exists:DanhMucChi,maDanhMucChi',
            'items.*.dienGiai' => 'nullable|string|max:255',
            'items.*.soTien' => 'required|numeric|min:0',
        ]);

        // FI-BR02: Kiểm tra chống trùng lặp chứng từ nguồn
        if (!empty($validated['maPhieuNhapNVL'])) {
            $duplicate = PhieuChi::where('maPhieuNhapNVL', $validated['maPhieuNhapNVL'])->where('trangThai', '!=', 'Huy')->first();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => "Phiếu nhập NVL {$validated['maPhieuNhapNVL']} đã được lập phiếu chi {$duplicate->maPhieuChi}."
                ], 400);
            }
        }

        if (!empty($validated['maBangLuong'])) {
            $duplicate = PhieuChi::where('maBangLuong', $validated['maBangLuong'])->where('trangThai', '!=', 'Huy')->first();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => "Bảng lương {$validated['maBangLuong']} đã được lập phiếu chi {$duplicate->maPhieuChi}."
                ], 400);
            }
        }

        // Tự động tìm hoặc tạo ánh xạ DoiTuongGiaoDich nếu liên kết nguồn
        $maDoiTuong = $validated['maDoiTuong'] ?? null;
        if (!empty($validated['maPhieuNhapNVL'])) {
            $pn = PhieuNhapNVL::find($validated['maPhieuNhapNVL']);
            if ($pn?->maNCC) {
                $dt = DoiTuongGiaoDich::firstOrCreate(
                    ['loaiDoiTuong' => 'NCC', 'maThamChieu' => $pn->maNCC],
                    ['maDoiTuong' => $maDoiTuong ?: ('DT-NCC-' . $pn->maNCC), 'trangThai' => true]
                );
                $maDoiTuong = $dt->maDoiTuong;
            }
        } elseif (!empty($validated['maBangLuong'])) {
            $bl = BangLuong::find($validated['maBangLuong']);
            if ($bl?->maNV) {
                $dt = DoiTuongGiaoDich::firstOrCreate(
                    ['loaiDoiTuong' => 'NV', 'maThamChieu' => $bl->maNV],
                    ['maDoiTuong' => $maDoiTuong ?: ('DT-NV-' . $bl->maNV), 'trangThai' => true]
                );
                $maDoiTuong = $dt->maDoiTuong;
            }
        }

        DB::beginTransaction();
        try {
            $payment = PhieuChi::create([
                'maPhieuChi' => $validated['maPhieuChi'],
                'ngayChi' => $validated['ngayChi'],
                'maDoiTuong' => $maDoiTuong,
                'lyDoChi' => $validated['lyDoChi'] ?? null,
                'soTien' => $validated['soTien'],
                'phuongThucChi' => $validated['phuongThucChi'],
                'maTaiKhoanQuy' => $validated['maTaiKhoanQuy'] ?? null,
                'trangThai' => 'Moi',
                'nguoiLap' => $validated['nguoiLap'] ?? 'NV002',
                'ngayLap' => Carbon::now(),
                'maPhieuNhapNVL' => $validated['maPhieuNhapNVL'] ?? null,
                'maBangLuong' => $validated['maBangLuong'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                ChiTietPhieuChi::create([
                    'maChiTietChi' => $item['maChiTietChi'],
                    'maPhieuChi' => $payment->maPhieuChi,
                    'maDanhMucChi' => $item['maDanhMucChi'] ?? null,
                    'dienGiai' => $item['dienGiai'] ?? null,
                    'soTien' => $item['soTien'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu chi thành công (Trạng thái: Mới)',
                'data' => $payment->load('chiTiets'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lập phiếu chi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Phê duyệt phiếu chi (Kế toán trưởng duyệt - FI-BR03, FI-BR04, FI-FR07)
     */
    public function approvePayment(Request $request, $id)
    {
        if (!$this->isApproverAuthorized($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền phê duyệt phiếu chi tiền (Quy tắc 2.5.4.3 d).',
            ], 403);
        }

        $payment = PhieuChi::findOrFail($id);

        if ($payment->trangThai === 'DaDuyet') {
            return response()->json(['success' => false, 'message' => 'Phiếu chi này đã được phê duyệt trước đó'], 400);
        }

        if ($payment->trangThai === 'Huy') {
            return response()->json(['success' => false, 'message' => 'Không thể duyệt phiếu chi đã bị hủy'], 400);
        }

        DB::beginTransaction();
        try {
            // FI-BR04 & FI-FR07: Kiểm tra hạn mức và số dư tài khoản quỹ trước khi duyệt
            if ($payment->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $payment->maTaiKhoanQuy)->lockForUpdate()->first();
                if (!$account) {
                    return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản quỹ chỉ định'], 400);
                }

                if ($account->soDuHienTai < $payment->soTien) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hạn mức không đủ: Số dư tài khoản quỹ hiện tại (' . number_format($account->soDuHienTai) . ' VNĐ) không đủ để chi ' . number_format($payment->soTien) . ' VNĐ (FI-BR04 / FI-FR07).',
                    ], 400);
                }

                // Cập nhật số dư atomic (FI-BR03)
                $account->soDuHienTai -= $payment->soTien;
                $account->save();
            }

            $payment->update([
                'trangThai' => 'DaDuyet',
                'nguoiDuyet' => $request->input('nguoiDuyet', 'NV001'),
                'ngayDuyet' => Carbon::now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phê duyệt phiếu chi thành công! Đã tự động trừ ' . number_format($payment->soTien) . ' VNĐ.',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi phê duyệt phiếu chi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Hủy phiếu chi và hoàn nguyên số dư (nếu đã duyệt)
     */
    public function cancelPayment(Request $request, $id)
    {
        if (!$this->isApproverAuthorized($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền hủy phiếu chi.',
            ], 403);
        }

        $payment = PhieuChi::findOrFail($id);

        if ($payment->trangThai === 'Huy') {
            return response()->json(['success' => false, 'message' => 'Phiếu chi này đã bị hủy trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            if ($payment->trangThai === 'DaDuyet' && $payment->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $payment->maTaiKhoanQuy)->first();
                if ($account) {
                    $account->soDuHienTai += $payment->soTien;
                    $account->save();
                }
            }

            $payment->update([
                'trangThai' => 'Huy',
                'lyDoChi' => ($payment->lyDoChi ? $payment->lyDoChi . ' - ' : '') . '[ĐÃ HỦY: ' . $request->input('lyDoHuy', 'Hủy theo yêu cầu') . ']',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy phiếu chi và hoàn nguyên số dư quỹ thành công.',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hủy phiếu chi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Xóa phiếu chi (chỉ khi trạng thái là Mới)
     */
    public function deletePayment($id)
    {
        $payment = PhieuChi::findOrFail($id);

        if ($payment->trangThai !== 'Moi') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ được phép xóa phiếu chi ở trạng thái Mới. Phiếu đã duyệt xin hãy dùng chức năng Hủy.',
            ], 400);
        }

        DB::beginTransaction();
        try {
            ChiTietPhieuChi::where('maPhieuChi', $id)->delete();
            $payment->delete();
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Đã xóa phiếu chi thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xóa phiếu chi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Chuyển trạng thái phiếu chi sang Chờ đối soát ngân hàng (FI-FR06)
     */
    public function sendToReconcile($id)
    {
        $payment = PhieuChi::findOrFail($id);
        $payment->update(['trangThai' => 'ChoDoiSoat']);
        return response()->json([
            'success' => true,
            'message' => 'Phiếu chi đã được chuyển sang trạng thái "Chờ đối soát" (FI-FR06)',
            'data' => $payment,
        ]);
    }
}
