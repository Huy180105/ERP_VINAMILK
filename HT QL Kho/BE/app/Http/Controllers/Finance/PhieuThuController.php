<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PhieuThu;
use App\Models\ChiTietPhieuThu;
use App\Models\TaiKhoanQuy;
use App\Models\ThanhToan;
use App\Models\CongNo;
use App\Models\DoiTuongGiaoDich;
use App\Models\NhatKyThuChi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PhieuThuController extends Controller
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
     * Danh sách phiếu thu (FI-FR02)
     */
    public function getReceipts(Request $request)
    {
        $query = PhieuThu::with([
            'doiTuong.khachHang',
            'doiTuong.nhaCungCap',
            'doiTuong.nhanVien',
            'taiKhoanQuy',
            'nhanVienLap',
            'nhanVienDuyet',
            'chiTiets.danhMucThu',
            'thanhToan',
            'congNo',
            'hoaDon'
        ]);

        if ($request->filled('trangThai')) $query->where('trangThai', $request->input('trangThai'));
        if ($request->filled('maDoiTuong')) $query->where('maDoiTuong', $request->input('maDoiTuong'));
        if ($request->filled('tuNgay')) $query->whereDate('ngayThu', '>=', $request->input('tuNgay'));
        if ($request->filled('denNgay')) $query->whereDate('ngayThu', '<=', $request->input('denNgay'));

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayThu', 'desc')->get(),
        ]);
    }

    /**
     * Lấy danh sách chứng từ bán hàng (ThanhToan) chờ lập phiếu thu (FI-FR03, FI-BR01)
     */
    public function getPendingSalesReceipts()
    {
        $mappedThanhToanIds = PhieuThu::whereNotNull('maThanhToan')
            ->where('trangThai', '!=', 'Huy')
            ->pluck('maThanhToan');

        $pendingThanhToans = ThanhToan::with(['congNo.khachHang', 'congNo.hoaDon.giaoHang'])
            ->whereNotIn('maThanhToan', $mappedThanhToanIds)
            ->whereHas('congNo', fn ($query) => $query->where('soTienDaTra', '>', 0))
            ->get();

        $data = $pendingThanhToans->map(function ($tt) {
            $congNo = $tt->congNo;
            $khachHang = $congNo?->khachHang;

            return [
                'maThanhToan' => $tt->maThanhToan,
                'ngayThanhToan' => $tt->ngayThanhToan,
                'maDonHang' => $congNo?->hoaDon?->giaoHang?->maDonHang,
                'maCongNo' => $congNo?->maCongNo,
                'maHoaDon' => $congNo?->maHoaDon,
                'maKhachHang' => $congNo?->maKhachHang,
                'tenKhachHang' => $khachHang?->tenKhachHang ?? 'Khách vãng lai',
                'soTien' => (float) $congNo->soTienDaTra,
                'phuongThucThanhToan' => str_starts_with($tt->phuongThuc, 'Chuyển khoản') ? 'Chuyển khoản' : $tt->phuongThuc,
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Chi tiết 1 phiếu thu
     */
    public function getReceipt($id)
    {
        $receipt = PhieuThu::with([
            'doiTuong.khachHang',
            'doiTuong.nhaCungCap',
            'doiTuong.nhanVien',
            'taiKhoanQuy',
            'nhanVienLap',
            'nhanVienDuyet',
            'chiTiets.danhMucThu',
            'thanhToan',
            'congNo',
            'hoaDon'
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $receipt]);
    }

    /**
     * Lập phiếu thu tiền mới (FI-FR02, FI-BR01)
     */
    public function createReceipt(Request $request)
    {
        $validated = $request->validate([
            'maPhieuThu' => 'required|string|max:50|unique:PhieuThu,maPhieuThu',
            'ngayThu' => 'required|date',
            'maDoiTuong' => 'nullable|string|max:50',
            'lyDoThu' => 'nullable|string|max:255',
            'soTien' => 'required|numeric|min:0.01',
            'phuongThucThu' => 'required|string|in:TM,CK',
            'maTaiKhoanQuy' => 'nullable|string|max:50|exists:TaiKhoanQuy,maTaiKhoanQuy',
            'nguoiLap' => 'nullable|string|max:50',
            'maThanhToan' => 'nullable|string|max:50',
            'maCongNo' => 'nullable|string|max:50',
            'maHoaDon' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.maChiTietThu' => 'required|string|max:50',
            'items.*.maDanhMucThu' => 'nullable|string|max:50|exists:DanhMucThu,maDanhMucThu',
            'items.*.dienGiai' => 'nullable|string|max:255',
            'items.*.soTien' => 'required|numeric|min:0',
        ]);

        $itemsTotal = collect($validated['items'])->sum(fn ($item) => (float) $item['soTien']);
        if (abs($itemsTotal - (float) $validated['soTien']) > 0.01) {
            return response()->json(['success' => false, 'message' => 'Tổng tiền các dòng chi tiết phải bằng số tiền phiếu thu.'], 422);
        }
        if (!empty($validated['maTaiKhoanQuy']) && !TaiKhoanQuy::where('maTaiKhoanQuy', $validated['maTaiKhoanQuy'])->where('trangThai', 1)->exists()) {
            return response()->json(['success' => false, 'message' => 'Tài khoản quỹ không tồn tại hoặc đã ngừng hoạt động.'], 422);
        }

        // FI-BR01: Chống trùng lặp chứng từ thanh toán bán hàng
        if (!empty($validated['maThanhToan'])) {
            if (!ThanhToan::where('maThanhToan', $validated['maThanhToan'])->exists()) {
                return response()->json(['success' => false, 'message' => 'Chứng từ thanh toán nguồn không tồn tại.'], 422);
            }
            $duplicate = PhieuThu::where('maThanhToan', $validated['maThanhToan'])->where('trangThai', '!=', 'Huy')->first();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => "Chứng từ thanh toán {$validated['maThanhToan']} đã được gắn với phiếu thu {$duplicate->maPhieuThu}."
                ], 400);
            }
        }

        // Tự động tìm hoặc tạo ánh xạ DoiTuongGiaoDich nếu liên kết bán hàng
        $maDoiTuong = $validated['maDoiTuong'] ?? null;
        if (!empty($validated['maThanhToan'])) {
            $tt = ThanhToan::find($validated['maThanhToan']);
            if ($tt?->congNo?->maKhachHang) {
                $dt = DoiTuongGiaoDich::firstOrCreate(
                    ['loaiDoiTuong' => 'KH', 'maThamChieu' => $tt->congNo->maKhachHang],
                    ['maDoiTuong' => $maDoiTuong ?: ('DT-KH-' . $tt->congNo->maKhachHang), 'trangThai' => true]
                );
                $maDoiTuong = $dt->maDoiTuong;
            }
        }

        DB::beginTransaction();
        try {
            $receipt = PhieuThu::create([
                'maPhieuThu' => $validated['maPhieuThu'],
                'ngayThu' => $validated['ngayThu'],
                'maDoiTuong' => $maDoiTuong,
                'lyDoThu' => $validated['lyDoThu'] ?? null,
                'soTien' => $validated['soTien'],
                'phuongThucThu' => $validated['phuongThucThu'],
                'maTaiKhoanQuy' => $validated['maTaiKhoanQuy'] ?? null,
                'trangThai' => 'Moi',
                'nguoiLap' => $validated['nguoiLap'] ?? 'NV002',
                'ngayLap' => Carbon::now(),
                'maThanhToan' => $validated['maThanhToan'] ?? null,
                'maCongNo' => $validated['maCongNo'] ?? null,
                'maHoaDon' => $validated['maHoaDon'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                ChiTietPhieuThu::create([
                    'maChiTietThu' => $item['maChiTietThu'],
                    'maPhieuThu' => $receipt->maPhieuThu,
                    'maDanhMucThu' => $item['maDanhMucThu'] ?? null,
                    'dienGiai' => $item['dienGiai'] ?? null,
                    'soTien' => $item['soTien'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu thu thành công (Trạng thái: Mới - Chờ Kế toán trưởng duyệt)',
                'data' => $receipt->load('chiTiets'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lập phiếu thu: ' . $e->getMessage()], 500);
        }
    }

    /** Sửa phiếu thu ở trạng thái Mới (FI-FR03). */
    public function updateReceipt(Request $request, $id)
    {
        $receipt = PhieuThu::findOrFail($id);
        if ($receipt->trangThai !== 'Moi') {
            return response()->json(['success' => false, 'message' => 'Chỉ được sửa phiếu thu ở trạng thái Mới.'], 400);
        }
        $validated = $request->validate([
            'ngayThu' => 'required|date', 'maDoiTuong' => 'nullable|string|max:50',
            'lyDoThu' => 'nullable|string|max:255', 'soTien' => 'required|numeric|min:0.01',
            'phuongThucThu' => 'required|string|in:TM,CK',
            'maTaiKhoanQuy' => 'nullable|string|max:50|exists:TaiKhoanQuy,maTaiKhoanQuy',
            'items' => 'required|array|min:1', 'items.*.maChiTietThu' => 'required|string|max:50',
            'items.*.maDanhMucThu' => 'nullable|string|max:50|exists:DanhMucThu,maDanhMucThu',
            'items.*.dienGiai' => 'nullable|string|max:255', 'items.*.soTien' => 'required|numeric|min:0',
        ]);
        $itemsTotal = collect($validated['items'])->sum(fn ($item) => (float) $item['soTien']);
        if (abs($itemsTotal - (float) $validated['soTien']) > 0.01) {
            return response()->json(['success' => false, 'message' => 'Tổng tiền các dòng chi tiết phải bằng số tiền phiếu thu.'], 422);
        }
        if (!empty($validated['maTaiKhoanQuy']) && !TaiKhoanQuy::where('maTaiKhoanQuy', $validated['maTaiKhoanQuy'])->where('trangThai', 1)->exists()) {
            return response()->json(['success' => false, 'message' => 'Tài khoản quỹ không tồn tại hoặc đã ngừng hoạt động.'], 422);
        }

        DB::transaction(function () use ($receipt, $validated) {
            $receipt->update(collect($validated)->except('items')->all());
            ChiTietPhieuThu::where('maPhieuThu', $receipt->maPhieuThu)->delete();
            foreach ($validated['items'] as $item) {
                ChiTietPhieuThu::create($item + ['maPhieuThu' => $receipt->maPhieuThu]);
            }
        });
        return response()->json(['success' => true, 'message' => 'Cập nhật phiếu thu thành công.', 'data' => $receipt->fresh()->load('chiTiets')]);
    }

    /**
     * Phê duyệt phiếu thu (Kế toán trưởng duyệt - FI-BR03)
     */
    public function approveReceipt(Request $request, $id)
    {
        if (!$this->isApproverAuthorized($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền phê duyệt phiếu thu tiền (Quy tắc 2.5.4.2 d).',
            ], 403);
        }

        $receipt = PhieuThu::findOrFail($id);

        if ($receipt->trangThai === 'DaDuyet') {
            return response()->json(['success' => false, 'message' => 'Phiếu thu này đã được phê duyệt trước đó'], 400);
        }

        if (!in_array($receipt->trangThai, ['Moi', 'ChoDoiSoat'], true)) {
            return response()->json(['success' => false, 'message' => 'Chỉ phiếu mới hoặc chờ đối soát mới được phê duyệt'], 400);
        }

        DB::beginTransaction();
        try {
            $oldStatus = $receipt->trangThai;
            $balanceBefore = null;
            $balanceAfter = null;
            // Cập nhật số dư quỹ atomic (FI-BR03)
            if ($receipt->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $receipt->maTaiKhoanQuy)->where('trangThai', 1)->lockForUpdate()->first();
                if (!$account) {
                    throw new \RuntimeException('Tài khoản quỹ không tồn tại hoặc đã ngừng hoạt động.');
                }
                $balanceBefore = (float) $account->soDuHienTai;
                $account->soDuHienTai += $receipt->soTien;
                $account->save();
                $balanceAfter = (float) $account->soDuHienTai;
            }

            // Cập nhật công nợ nếu có
            if ($receipt->maCongNo && !$receipt->maThanhToan) {
                $congNo = CongNo::where('maCongNo', $receipt->maCongNo)->first();
                if ($congNo) {
                    $congNo->soTienDaTra += $receipt->soTien;
                    $congNo->soTienConLai = max(0, $congNo->soTienNo - $congNo->soTienDaTra);
                    if ($congNo->soTienConLai <= 0) {
                        $congNo->trangThai = 'Đã thanh toán';
                    }
                    $congNo->save();
                }
            }

            $receipt->update([
                'trangThai' => 'DaDuyet',
                'nguoiDuyet' => $request->input('nguoiDuyet', 'NV001'),
                'ngayDuyet' => Carbon::now(),
            ]);
            NhatKyThuChi::ghi('PhieuThu', $receipt->maPhieuThu, 'PheDuyet', $oldStatus, 'DaDuyet', $receipt->maTaiKhoanQuy, $balanceBefore, $balanceAfter, $request->input('nguoiDuyet'), ['soTien' => (float) $receipt->soTien]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phê duyệt phiếu thu thành công! Số dư quỹ đã được tự động cộng thêm ' . number_format($receipt->soTien) . ' VNĐ.',
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi phê duyệt phiếu thu: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Hủy phiếu thu và hoàn nguyên số dư
     */
    public function cancelReceipt(Request $request, $id)
    {
        if (!$this->isApproverAuthorized($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền hủy phiếu thu.',
            ], 403);
        }

        $receipt = PhieuThu::findOrFail($id);

        if ($receipt->trangThai === 'Huy') {
            return response()->json(['success' => false, 'message' => 'Phiếu thu này đã bị hủy trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            $oldStatus = $receipt->trangThai;
            $balanceBefore = null;
            $balanceAfter = null;
            if ($receipt->trangThai === 'DaDuyet' && $receipt->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $receipt->maTaiKhoanQuy)->lockForUpdate()->first();
                if ($account) {
                    $balanceBefore = (float) $account->soDuHienTai;
                    $account->soDuHienTai -= $receipt->soTien;
                    $account->save();
                    $balanceAfter = (float) $account->soDuHienTai;
                }

                if ($receipt->maCongNo && !$receipt->maThanhToan) {
                    $congNo = CongNo::where('maCongNo', $receipt->maCongNo)->first();
                    if ($congNo) {
                        $congNo->soTienDaTra = max(0, $congNo->soTienDaTra - $receipt->soTien);
                        $congNo->soTienConLai = $congNo->soTienNo - $congNo->soTienDaTra;
                        $congNo->trangThai = 'Còn nợ';
                        $congNo->save();
                    }
                }
            }

            $receipt->update([
                'trangThai' => 'Huy',
                'lyDoThu' => ($receipt->lyDoThu ? $receipt->lyDoThu . ' - ' : '') . '[ĐÃ HỦY: ' . $request->input('lyDoHuy', 'Hủy theo yêu cầu') . ']',
            ]);
            NhatKyThuChi::ghi('PhieuThu', $receipt->maPhieuThu, 'Huy', $oldStatus, 'Huy', $receipt->maTaiKhoanQuy, $balanceBefore, $balanceAfter, $request->input('nguoiDuyet'), ['lyDoHuy' => $request->input('lyDoHuy')]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy phiếu thu và hoàn nguyên số dư quỹ thành công.',
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hủy phiếu thu: ' . $e->getMessage()], 500);
        }
    }

    public function sendToReconcile($request, $id = null)
    {
        if ($id === null && is_string($request)) {
            $id = $request;
            $request = new Request(['role' => 'KeToanTruong']);
        }
        if (!$this->isApproverAuthorized($request)) {
            return response()->json(['success' => false, 'message' => 'Chỉ Kế toán trưởng mới được chuyển phiếu sang đối soát.'], 403);
        }
        $receipt = PhieuThu::findOrFail($id);
        if ($receipt->trangThai !== 'Moi') {
            return response()->json(['success' => false, 'message' => 'Chỉ phiếu mới được chuyển sang chờ đối soát.'], 400);
        }
        $receipt->update(['trangThai' => 'ChoDoiSoat']);
        NhatKyThuChi::ghi('PhieuThu', $receipt->maPhieuThu, 'ChuyenDoiSoat', 'Moi', 'ChoDoiSoat', $receipt->maTaiKhoanQuy, null, null, $request->input('nguoiDuyet'));
        return response()->json([
            'success' => true,
            'message' => 'Phiếu thu đã được chuyển sang trạng thái "Chờ đối soát" (FI-FR06)',
            'data' => $receipt,
        ]);
    }

    public function completeReconciliation(Request $request, $id)
    {
        $receipt = PhieuThu::findOrFail($id);
        if ($receipt->trangThai !== 'ChoDoiSoat') {
            return response()->json(['success' => false, 'message' => 'Phiếu thu không ở trạng thái chờ đối soát.'], 400);
        }
        return $this->approveReceipt($request, $id);
    }

    /**
     * Xóa phiếu thu (chỉ khi trạng thái là Mới)
     */
    public function deleteReceipt($id)
    {
        $receipt = PhieuThu::findOrFail($id);

        if ($receipt->trangThai !== 'Moi') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ được phép xóa phiếu thu ở trạng thái Mới. Phiếu đã duyệt xin hãy dùng chức năng Hủy.',
            ], 400);
        }

        DB::beginTransaction();
        try {
            ChiTietPhieuThu::where('maPhieuThu', $id)->delete();
            $receipt->delete();
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Đã xóa phiếu thu thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xóa phiếu thu: ' . $e->getMessage()], 500);
        }
    }
}
