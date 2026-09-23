<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PhieuChi;
use App\Models\ChiTietPhieuChi;
use App\Models\TaiKhoanQuy;
use App\Models\PhieuNhapNVL;
use App\Models\BangLuong;
use App\Models\DoiTuongGiaoDich;
use App\Models\NhatKyThuChi;
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
        $userRole = $request->header('X-User-Role') ?: $request->input('role');
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
            ->when($request->filled('thangNam'), fn($q) => $q->where('thang', $request->input('thangNam')))
            ->orderBy('thang', 'desc')
            ->get();

        $data = $payrolls->map(fn($bl) => [
            'maBangLuong' => $bl->maBangLuong,
            'thangNam' => $bl->thang,
            'maNV' => $bl->maNV,
            'tenNV' => $bl->nhanVien?->hoTen ?? 'N/A',
            'thucLanh' => $bl->tongThucNhan,
            'trangThai' => $bl->trangThai,
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

        $itemsTotal = collect($validated['items'])->sum(fn ($item) => (float) $item['soTien']);
        if (abs($itemsTotal - (float) $validated['soTien']) > 0.01) {
            return response()->json(['success' => false, 'message' => 'Tổng tiền các dòng chi tiết phải bằng số tiền phiếu chi.'], 422);
        }
        if (!empty($validated['maTaiKhoanQuy']) && !TaiKhoanQuy::where('maTaiKhoanQuy', $validated['maTaiKhoanQuy'])->where('trangThai', 1)->exists()) {
            return response()->json(['success' => false, 'message' => 'Tài khoản quỹ không tồn tại hoặc đã ngừng hoạt động.'], 422);
        }

        // FI-BR02: Kiểm tra chống trùng lặp chứng từ nguồn
        if (!empty($validated['maPhieuNhapNVL'])) {
            if (!PhieuNhapNVL::where('maPhieuNhapNVL', $validated['maPhieuNhapNVL'])->exists()) {
                return response()->json(['success' => false, 'message' => 'Phiếu nhập NVL nguồn không tồn tại.'], 422);
            }
            $duplicate = PhieuChi::where('maPhieuNhapNVL', $validated['maPhieuNhapNVL'])->where('trangThai', '!=', 'Huy')->first();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => "Phiếu nhập NVL {$validated['maPhieuNhapNVL']} đã được lập phiếu chi {$duplicate->maPhieuChi}."
                ], 400);
            }
        }

        if (!empty($validated['maBangLuong'])) {
            if (!BangLuong::where('maBangLuong', $validated['maBangLuong'])->exists()) {
                return response()->json(['success' => false, 'message' => 'Bảng lương nguồn không tồn tại.'], 422);
            }
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

    /** Sửa phiếu chi ở trạng thái Mới (FI-FR04). */
    public function updatePayment(Request $request, $id)
    {
        $payment = PhieuChi::findOrFail($id);
        if ($payment->trangThai !== 'Moi') {
            return response()->json(['success' => false, 'message' => 'Chỉ được sửa phiếu chi ở trạng thái Mới.'], 400);
        }
        $validated = $request->validate([
            'ngayChi' => 'required|date', 'maDoiTuong' => 'nullable|string|max:50',
            'lyDoChi' => 'nullable|string|max:255', 'soTien' => 'required|numeric|min:0.01',
            'phuongThucChi' => 'required|string|in:TM,CK',
            'maTaiKhoanQuy' => 'nullable|string|max:50|exists:TaiKhoanQuy,maTaiKhoanQuy',
            'items' => 'required|array|min:1', 'items.*.maChiTietChi' => 'required|string|max:50',
            'items.*.maDanhMucChi' => 'nullable|string|max:50|exists:DanhMucChi,maDanhMucChi',
            'items.*.dienGiai' => 'nullable|string|max:255', 'items.*.soTien' => 'required|numeric|min:0',
        ]);
        $itemsTotal = collect($validated['items'])->sum(fn ($item) => (float) $item['soTien']);
        if (abs($itemsTotal - (float) $validated['soTien']) > 0.01) {
            return response()->json(['success' => false, 'message' => 'Tổng tiền các dòng chi tiết phải bằng số tiền phiếu chi.'], 422);
        }
        if (!empty($validated['maTaiKhoanQuy']) && !TaiKhoanQuy::where('maTaiKhoanQuy', $validated['maTaiKhoanQuy'])->where('trangThai', 1)->exists()) {
            return response()->json(['success' => false, 'message' => 'Tài khoản quỹ không tồn tại hoặc đã ngừng hoạt động.'], 422);
        }

        DB::transaction(function () use ($payment, $validated) {
            $payment->update(collect($validated)->except('items')->all());
            ChiTietPhieuChi::where('maPhieuChi', $payment->maPhieuChi)->delete();
            foreach ($validated['items'] as $item) {
                ChiTietPhieuChi::create($item + ['maPhieuChi' => $payment->maPhieuChi]);
            }
        });
        return response()->json(['success' => true, 'message' => 'Cập nhật phiếu chi thành công.', 'data' => $payment->fresh()->load('chiTiets')]);
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

        if (!in_array($payment->trangThai, ['Moi', 'ChoDoiSoat'], true)) {
            return response()->json(['success' => false, 'message' => 'Chỉ phiếu mới hoặc chờ đối soát mới được phê duyệt'], 400);
        }

        DB::beginTransaction();
        try {
            $oldStatus = $payment->trangThai;
            $balanceBefore = null;
            $balanceAfter = null;
            // FI-BR04 & FI-FR07: Kiểm tra hạn mức và số dư tài khoản quỹ trước khi duyệt
            if ($payment->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $payment->maTaiKhoanQuy)->lockForUpdate()->first();
                if (!$account) {
                    throw new \RuntimeException('Không tìm thấy tài khoản quỹ hoạt động được chỉ định.');
                }

                if ($account->soDuHienTai < $payment->soTien) {
                    throw new \RuntimeException('Hạn mức không đủ: Số dư tài khoản quỹ hiện tại không đủ để thực hiện phiếu chi (FI-BR04).');
                }

                // Cập nhật số dư atomic (FI-BR03)
                $balanceBefore = (float) $account->soDuHienTai;
                $account->soDuHienTai -= $payment->soTien;
                $account->save();
                $balanceAfter = (float) $account->soDuHienTai;
            }

            $payment->update([
                'trangThai' => 'DaDuyet',
                'nguoiDuyet' => $request->input('nguoiDuyet', 'NV001'),
                'ngayDuyet' => Carbon::now(),
            ]);
            NhatKyThuChi::ghi('PhieuChi', $payment->maPhieuChi, 'PheDuyet', $oldStatus, 'DaDuyet', $payment->maTaiKhoanQuy, $balanceBefore, $balanceAfter, $request->input('nguoiDuyet'), ['soTien' => (float) $payment->soTien]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phê duyệt phiếu chi thành công! Đã tự động trừ ' . number_format($payment->soTien) . ' VNĐ.',
                'data' => $payment,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi phê duyệt phiếu chi: ' . $e->getMessage()], $e instanceof \RuntimeException ? 400 : 500);
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
            $oldStatus = $payment->trangThai;
            $balanceBefore = null;
            $balanceAfter = null;
            if ($payment->trangThai === 'DaDuyet' && $payment->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $payment->maTaiKhoanQuy)->lockForUpdate()->first();
                if ($account) {
                    $balanceBefore = (float) $account->soDuHienTai;
                    $account->soDuHienTai += $payment->soTien;
                    $account->save();
                    $balanceAfter = (float) $account->soDuHienTai;
                }
            }

            $payment->update([
                'trangThai' => 'Huy',
                'lyDoChi' => ($payment->lyDoChi ? $payment->lyDoChi . ' - ' : '') . '[ĐÃ HỦY: ' . $request->input('lyDoHuy', 'Hủy theo yêu cầu') . ']',
            ]);
            NhatKyThuChi::ghi('PhieuChi', $payment->maPhieuChi, 'Huy', $oldStatus, 'Huy', $payment->maTaiKhoanQuy, $balanceBefore, $balanceAfter, $request->input('nguoiDuyet'), ['lyDoHuy' => $request->input('lyDoHuy')]);

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
    public function sendToReconcile(Request $request, $id)
    {
        if (!$this->isApproverAuthorized($request)) {
            return response()->json(['success' => false, 'message' => 'Chỉ Kế toán trưởng mới được chuyển phiếu sang đối soát.'], 403);
        }
        $payment = PhieuChi::findOrFail($id);
        if ($payment->trangThai !== 'Moi') {
            return response()->json(['success' => false, 'message' => 'Chỉ phiếu mới được chuyển sang chờ đối soát.'], 400);
        }
        $payment->update(['trangThai' => 'ChoDoiSoat']);
        NhatKyThuChi::ghi('PhieuChi', $payment->maPhieuChi, 'ChuyenDoiSoat', 'Moi', 'ChoDoiSoat', $payment->maTaiKhoanQuy, null, null, $request->input('nguoiDuyet'));
        return response()->json([
            'success' => true,
            'message' => 'Phiếu chi đã được chuyển sang trạng thái "Chờ đối soát" (FI-FR06)',
            'data' => $payment,
        ]);
    }

    public function completeReconciliation(Request $request, $id)
    {
        $payment = PhieuChi::findOrFail($id);
        if ($payment->trangThai !== 'ChoDoiSoat') {
            return response()->json(['success' => false, 'message' => 'Phiếu chi không ở trạng thái chờ đối soát.'], 400);
        }
        return $this->approvePayment($request, $id);
    }
}
