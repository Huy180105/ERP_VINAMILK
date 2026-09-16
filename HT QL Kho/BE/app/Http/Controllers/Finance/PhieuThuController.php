<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\PhieuThu;
use App\Models\ChiTietPhieuThu;
use App\Models\TaiKhoanQuy;
use App\Models\ThanhToan;
use App\Models\CongNo;
use App\Models\HoaDon;
use App\Models\DoiTuongGiaoDich;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PhieuThuController extends Controller
{
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

        if ($request->has('trangThai') && $request->input('trangThai') !== '') {
            $query->where('trangThai', $request->input('trangThai'));
        }

        if ($request->has('maDoiTuong') && $request->input('maDoiTuong') !== '') {
            $query->where('maDoiTuong', $request->input('maDoiTuong'));
        }

        if ($request->has('tuNgay') && $request->input('tuNgay') !== '') {
            $query->whereDate('ngayThu', '>=', $request->input('tuNgay'));
        }

        if ($request->has('denNgay') && $request->input('denNgay') !== '') {
            $query->whereDate('ngayThu', '<=', $request->input('denNgay'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('ngayThu', 'desc')->get(),
        ]);
    }

    public function getPendingSalesReceipts()
    {
        // Lấy danh sách ThanhToan chưa có PhieuThu hiệu lực (FI-FR03, FI-BR01)
        $mappedThanhToanIds = PhieuThu::whereNotNull('maThanhToan')
            ->where('trangThai', '!=', 'Huy')
            ->pluck('maThanhToan')
            ->toArray();

        $pendingThanhToans = ThanhToan::with(['congNo.khachHang'])
            ->whereNotIn('maThanhToan', $mappedThanhToanIds)
            ->get();

        $data = $pendingThanhToans->map(function ($tt) {
            $khachHang = null;
            if ($tt->congNo && $tt->congNo->khachHang) {
                $khachHang = $tt->congNo->khachHang;
            } elseif ($tt->maKhachHang) {
                $khachHang = \App\Models\KhachHang::find($tt->maKhachHang);
            }

            return [
                'maThanhToan' => $tt->maThanhToan,
                'ngayThanhToan' => $tt->ngayThanhToan,
                'maDonHang' => $tt->maDonHang,
                'maKhachHang' => $tt->maKhachHang,
                'tenKhachHang' => $khachHang ? $khachHang->tenKhachHang : 'Khách vãng lai',
                'soTien' => (float)$tt->soTien,
                'phuongThucThanhToan' => $tt->phuongThucThanhToan,
                'trangThai' => $tt->trangThai,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

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

        return response()->json([
            'success' => true,
            'data' => $receipt,
        ]);
    }

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

        // FI-BR01: Một bản ghi ThanhToan chỉ được gắn với tối đa một phiếu thu đang hiệu lực
        if (!empty($validated['maThanhToan'])) {
            $duplicate = PhieuThu::where('maThanhToan', $validated['maThanhToan'])
                ->where('trangThai', '!=', 'Huy')
                ->first();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => "Chứng từ thanh toán {$validated['maThanhToan']} đã được gắn với phiếu thu {$duplicate->maPhieuThu}. Không thể tạo trùng."
                ], 400);
            }
        }

        // Tự động tìm hoặc tạo DoiTuongGiaoDich mapping nếu cần
        $maDoiTuong = $validated['maDoiTuong'] ?? null;
        if (!empty($validated['maThanhToan'])) {
            $tt = ThanhToan::find($validated['maThanhToan']);
            if ($tt && $tt->maKhachHang) {
                $dt = DoiTuongGiaoDich::firstOrCreate(
                    ['loaiDoiTuong' => 'KH', 'maThamChieu' => $tt->maKhachHang],
                    ['maDoiTuong' => $maDoiTuong ?: ('DT-KH-' . $tt->maKhachHang), 'trangThai' => true]
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
            return response()->json([
                'success' => false,
                'message' => 'Lỗi lập phiếu thu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approveReceipt(Request $request, $id)
    {
        // Kiểm tra vai trò: Chỉ Kế toán trưởng mới có quyền duyệt (Use Case 2.5.4.2 d)
        $userRole = $request->header('X-User-Role') ?? $request->input('role', 'KeToanTruong');
        if ($userRole !== 'KeToanTruong' && $userRole !== 'Admin') {
            return response()->json([
                'success' => false,
                'message' => 'Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền phê duyệt phiếu thu tiền (Quy tắc 2.5.4.2 d).',
            ], 403);
        }

        $receipt = PhieuThu::findOrFail($id);

        if ($receipt->trangThai === 'DaDuyet') {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu thu này đã được phê duyệt trước đó',
            ], 400);
        }

        if ($receipt->trangThai === 'Huy') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể duyệt phiếu thu đã bị hủy',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Cập nhật số dư quỹ atomic (FI-BR03)
            if ($receipt->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $receipt->maTaiKhoanQuy)->first();
                if ($account) {
                    $account->soDuHienTai += $receipt->soTien;
                    $account->save();
                }
            }

            // Cập nhật trạng thái công nợ liên quan nếu có
            if ($receipt->maCongNo) {
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

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phê duyệt phiếu thu thành công! Số dư quỹ đã được tự động cộng thêm ' . number_format($receipt->soTien) . ' VNĐ.',
                'data' => $receipt,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi phê duyệt phiếu thu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancelReceipt(Request $request, $id)
    {
        $userRole = $request->header('X-User-Role') ?? $request->input('role', 'KeToanTruong');
        if ($userRole !== 'KeToanTruong' && $userRole !== 'Admin') {
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
            // Nếu đã duyệt thì rollback số dư quỹ
            if ($receipt->trangThai === 'DaDuyet' && $receipt->maTaiKhoanQuy) {
                $account = TaiKhoanQuy::where('maTaiKhoanQuy', $receipt->maTaiKhoanQuy)->first();
                if ($account) {
                    $account->soDuHienTai -= $receipt->soTien;
                    $account->save();
                }

                // Rollback công nợ
                if ($receipt->maCongNo) {
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

    public function sendToReconcile($id)
    {
        $receipt = PhieuThu::findOrFail($id);
        $receipt->update(['trangThai' => 'ChoDoiSoat']);
        return response()->json([
            'success' => true,
            'message' => 'Phiếu thu đã được chuyển sang trạng thái "Chờ đối soát" (FI-FR06)',
            'data' => $receipt,
        ]);
    }

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

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa phiếu thu thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xóa phiếu thu: ' . $e->getMessage()
            ], 500);
        }
    }
}
