<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\PhieuNhapNVL;
use App\Models\ChiTietPhieuNhapNVL;
use App\Models\PhieuNhapSP;
use App\Models\ChiTietPhieuNhapSP;
use App\Models\TonKho;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InboundController extends Controller
{
    // =========================================================================
    // 1. NHẬP KHO NGUYÊN VẬT LIỆU TỪ NHÀ CUNG CẤP (CF-FR11 đến CF-FR19)
    // =========================================================================

    public function getRawMaterialReceipts(Request $request)
    {
        $query = PhieuNhapNVL::with(['nhaCungCap', 'nhanVienTao', 'nhanVienNhan', 'chiTiets.tonKho']);

        if ($request->has('trangThai')) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayNhap', 'desc')->get(),
        ]);
    }

    public function createRawMaterialReceipt(Request $request)
    {
        $validated = $request->validate([
            'maPhieuNhapNVL' => 'required|string|unique:PhieuNhapNVL,maPhieuNhapNVL',
            'maNCC' => 'required|string|exists:NhaCungCap,maNCC',
            'maNVTao' => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan' => 'nullable|string|exists:NhanVien,maNV',
            'ngayNhap' => 'required|date',
            'ghiChu' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.maTonKho' => 'required|string',
            'items.*.maNVL' => 'required|string|exists:NguyenVatLieu,maNVL',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.donGia' => 'nullable|numeric',
            'items.*.ngaySanXuat' => 'required|date',
            'items.*.hanSuDung' => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            $receipt = PhieuNhapNVL::create([
                'maPhieuNhapNVL' => $validated['maPhieuNhapNVL'],
                'maNCC' => $validated['maNCC'],
                'maNVTao' => $validated['maNVTao'] ?? null,
                'maNVNhan' => $validated['maNVNhan'] ?? null,
                'ngayNhap' => $validated['ngayNhap'],
                'trangThai' => 'Chờ duyệt',
                'ghiChu' => $validated['ghiChu'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                // Tạo hoặc cập nhật thông tin Lô tồn kho (TonKho)
                TonKho::updateOrCreate(
                    ['maTonKho' => $item['maTonKho']],
                    [
                        'tenTonKho' => 'Lô NVL ' . $item['maNVL'],
                        'maNVL' => $item['maNVL'],
                        'ngaySanXuat' => $item['ngaySanXuat'],
                        'hanSuDung' => $item['hanSuDung'],
                        'soLuongNhap' => $item['soLuong'],
                        'soLuongTonHienTai' => 0, // Chưa cộng tồn kho cho tới khi xác nhận hoàn thành
                        'trangThai' => 'Còn hạn',
                    ]
                );

                $donGia = $item['donGia'] ?? 0;
                ChiTietPhieuNhapNVL::create([
                    'maPhieuNhapNVL' => $receipt->maPhieuNhapNVL,
                    'maTonKho' => $item['maTonKho'],
                    'soLuong' => $item['soLuong'],
                    'donGia' => $donGia,
                    'thanhTien' => $donGia * $item['soLuong'],
                    'ngaySanXuat' => $item['ngaySanXuat'],
                    'hanSuDung' => $item['hanSuDung'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lập phiếu nhập nguyên vật liệu thành công (Trạng thái: Chờ duyệt)',
                'data' => $receipt->load('chiTiets'),
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
            'data' => $receipt,
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
                $tonKho = TonKho::where('maTonKho', $detail->maTonKho)->first();
                if ($tonKho) {
                    $tonKho->soLuongTonHienTai += $detail->soLuong;
                    $tonKho->save();
                }
            }

            $receipt->update(['trangThai' => 'Hoàn thành']);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận hoàn thành nhập kho NVL thành công! Tồn kho đã được tự động cộng.',
                'data' => $receipt,
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
        $todayStr = Carbon::now()->format('Ymd');
        $prefix = 'PNSP' . $todayStr;
        
        $lastReceipt = PhieuNhapSP::where('maPhieuNhapSP', 'LIKE', "{$prefix}%")
            ->orderBy('maPhieuNhapSP', 'desc')
            ->first();

        if ($lastReceipt) {
            $lastNum = (int) substr($lastReceipt->maPhieuNhapSP, -2);
            $nextNum = str_pad($lastNum + 1, 2, '0', STR_PAD_LEFT);
        } else {
            $nextNum = '01';
        }

        return response()->json([
            'success' => true,
            'code' => $prefix . $nextNum,
        ]);
    }

    public function getProductReceipts(Request $request)
    {
        $query = PhieuNhapSP::with(['nhanVienTao', 'nhanVienNhan', 'chiTiets.sanPham']);

        if ($request->has('trangThai') && !empty($request->input('trangThai'))) {
            $query->where('trangThai', $request->input('trangThai'));
        }

        if ($request->has('keyword') && !empty($request->input('keyword'))) {
            $keyword = $request->input('keyword');
            $query->where(function($q) use ($keyword) {
                $q->where('maPhieuNhapSP', 'LIKE', "%{$keyword}%")
                  ->orWhere('ghiChu', 'LIKE', "%{$keyword}%")
                  ->orWhere('maPhieuYCXSP', 'LIKE', "%{$keyword}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayNhap', 'desc')->get(),
        ]);
    }

    public function createProductReceipt(Request $request)
    {
        $validated = $request->validate([
            'maPhieuNhapSP' => 'nullable|string',
            'maNVTao' => 'nullable|string|exists:NhanVien,maNV',
            'maNVNhan' => 'nullable|string|exists:NhanVien,maNV',
            'ghiChu' => 'required|string',
            'maPhieuYCXSP' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.maSP' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuongNhap' => 'required|integer|min:1',
            'items.*.ngaySanXuat' => 'required|date',
            'items.*.hanSuDung' => 'required|date',
            'items.*.ghiChu' => 'nullable|string',
        ], [
            'ghiChu.required' => 'Ghi chú phiếu nhập không được để trống.',
            'items.required' => 'Danh sách sản phẩm nhập không được để trống.',
            'items.*.maSP.required' => 'Sản phẩm không được để trống.',
            'items.*.soLuongNhap.min' => 'Số lượng nhập phải lớn hơn 0.',
            'items.*.ngaySanXuat.required' => 'Ngày sản xuất không được để trống.',
        ]);

        $today = Carbon::today();
        $todayStr = $today->toDateString();
        $minExpiryDate = $today->copy()->addDays(180);

        foreach ($validated['items'] as $index => $item) {
            $mfgDate = Carbon::parse($item['ngaySanXuat']);
            $expDate = Carbon::parse($item['hanSuDung']);

            if ($mfgDate->gt($today)) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm dòng thứ " . ($index + 1) . ": Ngày sản xuất (" . $mfgDate->toDateString() . ") không được lớn hơn ngày hiện tại ($todayStr).",
                ], 422);
            }

            if ($expDate->lte($minExpiryDate)) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm dòng thứ " . ($index + 1) . ": Hạn sử dụng (" . $expDate->toDateString() . ") không hợp lệ. Hạn sử dụng phải lớn hơn 180 ngày tính từ hôm nay (sau ngày " . $minExpiryDate->toDateString() . ").",
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            $maPhieu = $validated['maPhieuNhapSP'] ?? null;
            if (!$maPhieu) {
                $prefix = 'PNSP' . Carbon::now()->format('Ymd');
                $lastReceipt = PhieuNhapSP::where('maPhieuNhapSP', 'LIKE', "{$prefix}%")
                    ->orderBy('maPhieuNhapSP', 'desc')
                    ->first();
                $nextNum = $lastReceipt ? str_pad(((int)substr($lastReceipt->maPhieuNhapSP, -2)) + 1, 2, '0', STR_PAD_LEFT) : '01';
                $maPhieu = $prefix . $nextNum;
            }

            $receipt = PhieuNhapSP::create([
                'maPhieuNhapSP' => $maPhieu,
                'maNVTao' => $validated['maNVTao'] ?? 'NV001',
                'maNVNhan' => $validated['maNVNhan'] ?? 'NV001',
                'ngayNhap' => $todayStr,
                'trangThai' => 'Chờ duyệt',
                'ghiChu' => $validated['ghiChu'],
                'maPhieuYCXSP' => $validated['maPhieuYCXSP'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                ChiTietPhieuNhapSP::create([
                    'maPhieuNhapSP' => $receipt->maPhieuNhapSP,
                    'maSP' => $item['maSP'],
                    'soLuongNhap' => $item['soLuongNhap'],
                    'ngaySanXuat' => $item['ngaySanXuat'],
                    'hanSuDung' => $item['hanSuDung'],
                    'ghiChu' => $item['ghiChu'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo phiếu nhập sản phẩm thành công! Trạng thái: Chờ duyệt.',
                'data' => $receipt->load(['nhanVienTao', 'chiTiets.sanPham']),
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
                'message' => "Chỉ được phép sửa phiếu nhập khi đang ở trạng thái 'Chờ duyệt' hoặc 'Từ chối'. Phiếu hiện tại: {$receipt->trangThai}",
            ], 400);
        }

        $validated = $request->validate([
            'ghiChu' => 'required|string',
            'maPhieuYCXSP' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.maSP' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuongNhap' => 'required|integer|min:1',
            'items.*.ngaySanXuat' => 'required|date',
            'items.*.hanSuDung' => 'required|date',
            'items.*.ghiChu' => 'nullable|string',
        ]);

        $today = Carbon::today();
        $minExpiryDate = $today->copy()->addDays(180);

        foreach ($validated['items'] as $index => $item) {
            $mfgDate = Carbon::parse($item['ngaySanXuat']);
            $expDate = Carbon::parse($item['hanSuDung']);

            if ($mfgDate->gt($today)) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm dòng thứ " . ($index + 1) . ": Ngày sản xuất không được lớn hơn ngày hiện tại.",
                ], 422);
            }

            if ($expDate->lte($minExpiryDate)) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm dòng thứ " . ($index + 1) . ": Hạn sử dụng (" . $expDate->toDateString() . ") không hợp lệ. Hạn sử dụng phải lớn hơn 180 ngày tính từ hôm nay (sau ngày " . $minExpiryDate->toDateString() . ").",
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            $receipt->update([
                'ghiChu' => $validated['ghiChu'],
                'maPhieuYCXSP' => $validated['maPhieuYCXSP'] ?? null,
                'trangThai' => 'Chờ duyệt',
            ]);

            ChiTietPhieuNhapSP::where('maPhieuNhapSP', $receipt->maPhieuNhapSP)->delete();

            foreach ($validated['items'] as $item) {
                ChiTietPhieuNhapSP::create([
                    'maPhieuNhapSP' => $receipt->maPhieuNhapSP,
                    'maSP' => $item['maSP'],
                    'soLuongNhap' => $item['soLuongNhap'],
                    'ngaySanXuat' => $item['ngaySanXuat'],
                    'hanSuDung' => $item['hanSuDung'],
                    'ghiChu' => $item['ghiChu'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật phiếu nhập sản phẩm thành công!',
                'data' => $receipt->load(['nhanVienTao', 'chiTiets.sanPham']),
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
            ChiTietPhieuNhapSP::where('maPhieuNhapSP', $receipt->maPhieuNhapSP)->delete();
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
            'data' => $receipt,
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
            'data' => $receipt,
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
            $dateStr = Carbon::now()->format('Ymd');
            $prefix = "LOT-SP-{$dateStr}-";

            // Tìm mã số thứ tự lô lớn nhất đã tồn tại trong ngày để tránh trùng khóa chính TonKho.PRIMARY
            $existingLots = TonKho::where('maTonKho', 'LIKE', "{$prefix}%")->get();
            $maxCounter = 0;
            foreach ($existingLots as $lot) {
                $suffix = str_replace($prefix, '', $lot->maTonKho);
                if (is_numeric($suffix)) {
                    $num = (int) $suffix;
                    if ($num > $maxCounter) {
                        $maxCounter = $num;
                    }
                }
            }
            $counter = $maxCounter + 1;

            foreach ($receipt->chiTiets as $detail) {
                $maTonKho = sprintf("LOT-SP-%s-%02d", $dateStr, $counter++);
                $spName = $detail->sanPham ? $detail->sanPham->tenSanPham : "Sản phẩm " . $detail->maSP;

                $expDate = Carbon::parse($detail->hanSuDung);
                $daysToExpiry = $today->diffInDays($expDate, false);
                $trangThaiTon = ($daysToExpiry <= 30) ? 'Ưu tiên xuất FEFO' : 'Còn hạn';

                TonKho::create([
                    'maTonKho' => $maTonKho,
                    'tenTonKho' => "Lô {$spName} ({$detail->ngaySanXuat})",
                    'maSP' => $detail->maSP,
                    'maNVL' => null,
                    'ngaySanXuat' => $detail->ngaySanXuat,
                    'hanSuDung' => $detail->hanSuDung,
                    'soLuongNhap' => $detail->soLuongNhap,
                    'soLuongTonHienTai' => $detail->soLuongNhap,
                    'trangThai' => $trangThaiTon,
                    'ghiChu' => "Tạo tự động từ phiếu nhập {$receipt->maPhieuNhapSP} (Lấy hàng thành công)",
                    'maChiTietPhieuNhapSP' => $detail->maChiTietPhieuNhapSP,
                ]);
            }

            $receipt->update(['trangThai' => 'Thành công']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận lấy hàng thành công! Trạng thái phiếu chuyển thành Thành công và lô tồn kho mới đã được tạo.',
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xác nhận lấy hàng thành công: ' . $e->getMessage()], 500);
        }
    }
}
