<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\PhieuNhapNVL;
use App\Models\ChiTietPhieuNhapNVL;
use App\Models\PhieuNhapSP;
use App\Models\ChiTietPhieuNhapSP;
use App\Models\PhieuYeuCauXuatSP;
use App\Models\TonKho;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InboundController extends Controller
{
    /**
     * Lấy danh sách Phiếu Yêu Cầu Xuất (Bàn giao thành phẩm) từ Sản Xuất chưa xử lý
     */
    public function getPendingProductionHandovers()
    {
        $handovers = PhieuYeuCauXuatSP::with(['chiTiets.sanPham', 'phieuNghiemThu', 'nhanVien'])
            ->where('trangThai', 'Chưa xử lý')
            ->orderBy('ngayYeuCau', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $handovers,
        ]);
    }
    // =========================================================================
    // 1. NHẬP KHO NGUYÊN VẬT LIỆU TỪ NHÀ CUNG CẤP (CF-FR11 đến CF-FR19)
    // =========================================================================

    public function getRawMaterialReceipts(Request $request)
    {
        $receipts = PhieuNhapNVL::with(['nhaCungCap', 'nhanVienTao', 'nhanVienNhan', 'chiTiets.tonKho'])
            ->when($request->filled('trangThai'), fn($q) => $q->where('trangThai', $request->input('trangThai')))
            ->orderBy('ngayNhap', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $receipts,
        ]);
    }

    public function createRawMaterialReceipt(Request $request)
    {
        $validated = $request->validate([
            'maPhieuNhapNVL'      => 'required|string|unique:PhieuNhapNVL,maPhieuNhapNVL',
            'maNCC'               => 'required|string|exists:NhaCungCap,maNCC',
            'maNVTao'             => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan'            => 'nullable|string|exists:NhanVien,maNV',
            'ngayNhap'            => 'required|date',
            'ghiChu'              => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.maTonKho'    => 'required|string',
            'items.*.maNVL'       => 'required|string|exists:NguyenVatLieu,maNVL',
            'items.*.soLuong'     => 'required|integer|min:1',
            'items.*.donGia'      => 'nullable|numeric',
            'items.*.ngaySanXuat' => 'required|date',
            'items.*.hanSuDung'   => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            $receipt = PhieuNhapNVL::create([
                'maPhieuNhapNVL' => $validated['maPhieuNhapNVL'],
                'maNCC'          => $validated['maNCC'],
                'maNVTao'        => $validated['maNVTao'] ?? null,
                'maNVNhan'       => $validated['maNVNhan'] ?? null,
                'ngayNhap'       => $validated['ngayNhap'],
                'trangThai'      => 'Chờ duyệt',
                'ghiChu'         => $validated['ghiChu'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                TonKho::updateOrCreate(
                    ['maTonKho' => $item['maTonKho']],
                    [
                        'tenTonKho'         => 'Lô NVL ' . $item['maNVL'],
                        'maNVL'             => $item['maNVL'],
                        'ngaySanXuat'       => $item['ngaySanXuat'],
                        'hanSuDung'         => $item['hanSuDung'],
                        'soLuongNhap'       => $item['soLuong'],
                        'soLuongTonHienTai' => 0, // Chưa cộng tồn kho cho tới khi hoàn thành
                        'trangThai'         => 'Còn hạn',
                    ]
                );

                $donGia = $item['donGia'] ?? 0;
                ChiTietPhieuNhapNVL::create([
                    'maPhieuNhapNVL' => $receipt->maPhieuNhapNVL,
                    'maTonKho'       => $item['maTonKho'],
                    'soLuong'        => $item['soLuong'],
                    'donGia'         => $donGia,
                    'thanhTien'      => $donGia * $item['soLuong'],
                    'ngaySanXuat'    => $item['ngaySanXuat'],
                    'hanSuDung'      => $item['hanSuDung'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu nhập nguyên vật liệu thành công (Trạng thái: Chờ duyệt)',
                'data'    => $receipt->load('chiTiets'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi lập phiếu: ' . $e->getMessage()], 500);
        }
    }

    public function approveRawMaterialReceipt($id)
    {
        $receipt = PhieuNhapNVL::findOrFail($id);
        $receipt->update(['trangThai' => 'Đã duyệt']);

        return response()->json([
            'success' => true,
            'message' => 'Đã phê duyệt phiếu nhập nguyên vật liệu',
            'data'    => $receipt,
        ]);
    }

    // Xác nhận hoàn thành phiếu nhập -> Tự động cộng tồn kho theo lô (CF-FR18)
    public function completeRawMaterialReceipt($id)
    {
        $receipt = PhieuNhapNVL::with('chiTiets')->findOrFail($id);

        if ($receipt->trangThai === 'Hoàn thành') {
            return response()->json(['success' => false, 'message' => 'Phiếu nhập đã được xác nhận hoàn thành trước đó'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($receipt->chiTiets as $detail) {
                TonKho::where('maTonKho', $detail->maTonKho)->increment('soLuongTonHienTai', $detail->soLuong);
            }

            $receipt->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận hoàn thành nhập kho NVL thành công! Tồn kho đã được tự động cộng.',
                'data'    => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi cộng tồn kho: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // 2. NHẬP KHO SẢN PHẨM TỪ XƯỞNG SẢN XUẤT (PhieuNhapSP & ChiTietPhieuNhapSP)
    // =========================================================================

    public function getNextProductReceiptCode()
    {
        return response()->json([
            'success' => true,
            'code'    => $this->generateProductReceiptCode(),
        ]);
    }

    public function getProductReceipts(Request $request)
    {
        $receipts = PhieuNhapSP::with(['nhanVienTao', 'nhanVienNhan', 'chiTiets.sanPham'])
            ->when($request->filled('trangThai'), fn($q) => $q->where('trangThai', $request->input('trangThai')))
            ->when($request->filled('keyword'), function ($q) use ($request) {
                $kw = $request->input('keyword');
                $q->where(fn($sub) => $sub->where('maPhieuNhapSP', 'LIKE', "%{$kw}%")
                    ->orWhere('ghiChu', 'LIKE', "%{$kw}%")
                    ->orWhere('maPhieuYCXSP', 'LIKE', "%{$kw}%"));
            })
            ->orderBy('ngayNhap', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $receipts,
        ]);
    }

    public function createProductReceipt(Request $request)
    {
        $validated = $this->validateProductReceiptRequest($request);

        if ($dateErr = $this->validateProductItemDates($validated['items'])) {
            return response()->json(['success' => false, 'message' => $dateErr], 422);
        }

        DB::beginTransaction();
        try {
            $maPhieu = $validated['maPhieuNhapSP'] ?: $this->generateProductReceiptCode();

            $receipt = PhieuNhapSP::create([
                'maPhieuNhapSP' => $maPhieu,
                'maNVTao'       => $validated['maNVTao'] ?? 'NV001',
                'maNVNhan'      => $validated['maNVNhan'] ?? 'NV001',
                'ngayNhap'      => Carbon::today()->toDateString(),
                'trangThai'     => 'Chờ duyệt',
                'ghiChu'        => $validated['ghiChu'],
                'maPhieuYCXSP'  => $validated['maPhieuYCXSP'] ?? null,
            ]);

<<<<<<< HEAD
            if (!empty($validated['maPhieuYCXSP'])) {
                PhieuYeuCauXuatSP::where('maPhieuYCXSP', $validated['maPhieuYCXSP'])
                    ->update(['trangThai' => 'Đã nhập kho']);
            }
=======
            $today = Carbon::today();
            $dateStr = Carbon::now()->format('Ymd');
            $prefix = "LOT-SP-{$dateStr}-";

            $lastLot = TonKho::where('maTonKho', 'LIKE', "{$prefix}%")
                ->orderBy('maTonKho', 'desc')
                ->value('maTonKho');

            $counter = ($lastLot ? (int) str_replace($prefix, '', $lastLot) : 0) + 1;
>>>>>>> origin/duc

            foreach ($validated['items'] as $item) {
                $maTonKho = sprintf("LOT-SP-%s-%02d", $dateStr, $counter++);
                $spId = $item['maSanPham'] ?? $item['maSP'];
                $sp = SanPham::where('maSanPham', $spId)->first();
                $spName = $sp?->tenSanPham ?? ("Sản phẩm " . $spId);

                TonKho::create([
                    'maTonKho'             => $maTonKho,
                    'tenTonKho'            => "Lô {$spName} ({$item['ngaySanXuat']})",
                    'maKho'                => $item['maKho'] ?? 'KHO-TONG',
                    'maSanPham'            => $spId,
                    'maNVL'                => null,
                    'ngaySanXuat'          => $item['ngaySanXuat'],
                    'hanSuDung'            => $item['hanSuDung'],
                    'soLuongNhap'          => $item['soLuongNhap'],
                    'soLuongTonHienTai'    => 0,
                    'trangThai'            => 'Còn hạn',
                    'trangThaiHSD'         => 'Còn hạn',
                    'trangThaiChatLuong'   => 'Chờ kiểm tra',
                    'ghiChu'               => "Tạo tự động từ phiếu nhập {$receipt->maPhieuNhapSP}",
                ]);

                ChiTietPhieuNhapSP::create([
                    'maPhieuNhapSP' => $receipt->maPhieuNhapSP,
                    'maTonKho'      => $maTonKho,
                    'soLuong'       => $item['soLuongNhap'],
                    'ngaySanXuat'   => $item['ngaySanXuat'],
                    'hanSuDung'     => $item['hanSuDung'],
                    'ghiChu'        => $item['ghiChu'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo phiếu nhập sản phẩm thành công! Trạng thái: Chờ duyệt.',
                'data'    => $receipt->load(['nhanVienTao', 'chiTiets.tonKho']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi tạo phiếu nhập sản phẩm: ' . $e->getMessage()], 500);
        }
    }

    public function updateProductReceipt(Request $request, $id)
    {
        $receipt = PhieuNhapSP::with('chiTiets')->findOrFail($id);

        if (!in_array($receipt->trangThai, ['Chờ duyệt', 'Từ chối'])) {
            return response()->json([
                'success' => false,
                'message' => "Chỉ được phép sửa phiếu nhập khi đang ở trạng thái 'Chờ duyệt' hoặc 'Từ chối'.",
            ], 400);
        }

        $validated = $this->validateProductReceiptRequest($request);

        if ($dateErr = $this->validateProductItemDates($validated['items'])) {
            return response()->json(['success' => false, 'message' => $dateErr], 422);
        }

        DB::beginTransaction();
        try {
            $receipt->update([
                'ghiChu'       => $validated['ghiChu'],
                'maPhieuYCXSP' => $validated['maPhieuYCXSP'] ?? null,
                'trangThai'    => 'Chờ duyệt',
            ]);

            $oldDetails = ChiTietPhieuNhapSP::where('maPhieuNhapSP', $receipt->maPhieuNhapSP)->get();
            ChiTietPhieuNhapSP::where('maPhieuNhapSP', $receipt->maPhieuNhapSP)->delete();
            foreach ($oldDetails as $od) {
                TonKho::where('maTonKho', $od->maTonKho)->where('soLuongTonHienTai', 0)->delete();
            }

            $today = Carbon::today();
            $dateStr = Carbon::now()->format('Ymd');
            $prefix = "LOT-SP-{$dateStr}-";

            $lastLot = TonKho::where('maTonKho', 'LIKE', "{$prefix}%")
                ->orderBy('maTonKho', 'desc')
                ->value('maTonKho');

            $counter = ($lastLot ? (int) str_replace($prefix, '', $lastLot) : 0) + 1;

            foreach ($validated['items'] as $item) {
                $maTonKho = sprintf("LOT-SP-%s-%02d", $dateStr, $counter++);
                $spId = $item['maSanPham'] ?? $item['maSP'];
                $sp = SanPham::where('maSanPham', $spId)->first();
                $spName = $sp?->tenSanPham ?? ("Sản phẩm " . $spId);

                TonKho::create([
                    'maTonKho'             => $maTonKho,
                    'tenTonKho'            => "Lô {$spName} ({$item['ngaySanXuat']})",
                    'maKho'                => $item['maKho'] ?? 'KHO-TONG',
                    'maSanPham'            => $spId,
                    'maNVL'                => null,
                    'ngaySanXuat'          => $item['ngaySanXuat'],
                    'hanSuDung'            => $item['hanSuDung'],
                    'soLuongNhap'          => $item['soLuongNhap'],
                    'soLuongTonHienTai'    => 0,
                    'trangThai'            => 'Còn hạn',
                    'trangThaiHSD'         => 'Còn hạn',
                    'trangThaiChatLuong'   => 'Chờ kiểm tra',
                    'ghiChu'               => "Tạo tự động từ phiếu nhập {$receipt->maPhieuNhapSP}",
                ]);

                ChiTietPhieuNhapSP::create([
                    'maPhieuNhapSP' => $receipt->maPhieuNhapSP,
                    'maTonKho'      => $maTonKho,
                    'soLuong'       => $item['soLuongNhap'],
                    'ngaySanXuat'   => $item['ngaySanXuat'],
                    'hanSuDung'     => $item['hanSuDung'],
                    'ghiChu'        => $item['ghiChu'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật phiếu nhập sản phẩm thành công!',
                'data'    => $receipt->load(['nhanVienTao', 'chiTiets.tonKho']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi cập nhật phiếu nhập: ' . $e->getMessage()], 500);
        }
    }

    public function deleteProductReceipt($id)
    {
        $receipt = PhieuNhapSP::findOrFail($id);

        if (!in_array($receipt->trangThai, ['Chờ duyệt', 'Từ chối'])) {
            return response()->json([
                'success' => false,
                'message' => "Chỉ được phép xóa phiếu nhập ở trạng thái 'Chờ duyệt' hoặc 'Từ chối'.",
            ], 400);
        }

        DB::beginTransaction();
        try {
            $oldDetails = ChiTietPhieuNhapSP::where('maPhieuNhapSP', $receipt->maPhieuNhapSP)->get();
            ChiTietPhieuNhapSP::where('maPhieuNhapSP', $receipt->maPhieuNhapSP)->delete();
            foreach ($oldDetails as $od) {
                TonKho::where('maTonKho', $od->maTonKho)->where('soLuongTonHienTai', 0)->delete();
            }
            $receipt->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa phiếu nhập sản phẩm thành công!',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xóa phiếu nhập: ' . $e->getMessage()], 500);
        }
    }

    public function approveProductReceipt($id)
    {
        $receipt = PhieuNhapSP::findOrFail($id);

        if ($receipt->trangThai !== 'Chờ duyệt') {
            return response()->json([
                'success' => false,
                'message' => "Phiếu nhập đang ở trạng thái '{$receipt->trangThai}', không thể duyệt.",
            ], 400);
        }

        $receipt->update(['trangThai' => 'Đã duyệt']);

        return response()->json([
            'success' => true,
            'message' => 'Quản lý kho đã duyệt phiếu nhập sản phẩm thành công!',
            'data'    => $receipt,
        ]);
    }

    public function rejectProductReceipt($id)
    {
        $receipt = PhieuNhapSP::findOrFail($id);

        if ($receipt->trangThai !== 'Chờ duyệt') {
            return response()->json([
                'success' => false,
                'message' => "Phiếu nhập đang ở trạng thái '{$receipt->trangThai}', không thể từ chối.",
            ], 400);
        }

        $receipt->update(['trangThai' => 'Từ chối']);

        return response()->json([
            'success' => true,
            'message' => 'Quản lý kho đã từ chối phiếu nhập sản phẩm!',
            'data'    => $receipt,
        ]);
    }

    public function confirmGoodsReceived($id)
    {
        $receipt = PhieuNhapSP::with(['chiTiets.sanPham'])->findOrFail($id);

        if ($receipt->trangThai !== 'Đã duyệt') {
            return response()->json([
                'success' => false,
                'message' => "Phiếu nhập phải ở trạng thái 'Đã duyệt' mới có thể lấy hàng thành công. Trạng thái hiện tại: {$receipt->trangThai}",
            ], 400);
        }

        DB::beginTransaction();
        try {
            $today = Carbon::today();
            foreach ($receipt->chiTiets as $detail) {
                $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
                if ($tonKho) {
                    $expDate = Carbon::parse($detail->hanSuDung);
                    $daysToExpiry = $today->diffInDays($expDate, false);
                    $trangThaiTon = ($daysToExpiry <= 30) ? 'Ưu tiên xuất FEFO' : 'Còn hạn';
                    $tonKho->update([
                        'soLuongTonHienTai' => $detail->soLuong,
                        'trangThai'         => $trangThaiTon,
                    ]);
                }
            }

            $receipt->update(['trangThai' => 'Thành công']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận lấy hàng thành công! Trạng thái phiếu chuyển thành Thành công và lô tồn kho mới đã được tạo.',
                'data'    => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xác nhận lấy hàng thành công: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private function generateProductReceiptCode(): string
    {
        $prefix = 'PNSP' . Carbon::now()->format('Ymd');
        $last = PhieuNhapSP::where('maPhieuNhapSP', 'LIKE', "{$prefix}%")
            ->orderBy('maPhieuNhapSP', 'desc')
            ->value('maPhieuNhapSP');

        $nextNum = $last ? str_pad(((int) substr($last, -2)) + 1, 2, '0', STR_PAD_LEFT) : '01';
        return $prefix . $nextNum;
    }

    private function validateProductReceiptRequest(Request $request): array
    {
        return $request->validate([
            'maPhieuNhapSP'       => 'nullable|string',
            'maNVTao'             => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan'            => 'nullable|string|exists:NhanVien,maNV',
            'ghiChu'              => 'required|string',
            'maPhieuYCXSP'        => 'nullable|string',
            'items'               => 'required|array|min:1',
            'items.*.maSP'        => 'nullable|string|exists:SanPham,maSanPham',
            'items.*.maSanPham'   => 'nullable|string|exists:SanPham,maSanPham',
            'items.*.soLuongNhap' => 'required|integer|min:1',
            'items.*.ngaySanXuat' => 'required|date',
            'items.*.hanSuDung'   => 'required|date',
            'items.*.ghiChu'      => 'nullable|string',
        ], [
            'ghiChu.required'         => 'Ghi chú phiếu nhập không được để trống.',
            'items.required'           => 'Danh sách sản phẩm nhập không được để trống.',
            'items.*.maSP.required'    => 'Sản phẩm không được để trống.',
            'items.*.soLuongNhap.min'  => 'Số lượng nhập phải lớn hơn 0.',
            'items.*.ngaySanXuat.required' => 'Ngày sản xuất không được để trống.',
        ]);
    }

    private function validateProductItemDates(array $items): ?string
    {
        $today = Carbon::today();
        $minExp = $today->copy()->addDays(180);

        foreach ($items as $idx => $item) {
            $mfg = Carbon::parse($item['ngaySanXuat']);
            $exp = Carbon::parse($item['hanSuDung']);
            $line = $idx + 1;

            if ($mfg->gt($today)) {
                return "Sản phẩm dòng thứ {$line}: Ngày sản xuất không được lớn hơn ngày hiện tại.";
            }
            if ($exp->lte($minExp)) {
                return "Sản phẩm dòng thứ {$line}: Hạn sử dụng ({$exp->toDateString()}) không hợp lệ. Phải lớn hơn 180 ngày (sau ngày {$minExp->toDateString()}).";
            }
        }
        return null;
    }
}
