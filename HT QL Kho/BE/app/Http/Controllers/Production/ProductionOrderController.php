<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\LenhSanXuat;
use App\Models\ChiTietLenhSanXuat;
use App\Models\CongDoan;
use App\Models\PhieuYeuCauNVL;
use App\Models\ChiTietPhieuYeuCauNVL;
use App\Models\SanPham;
use App\Models\NguyenVatLieu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductionOrderController extends Controller
{
    /**
     * Lấy danh sách Lệnh Sản Xuất (hỗ trợ tìm kiếm, lọc trạng thái, phân trang)
     */
    public function getOrders(Request $request)
    {
        $query = LenhSanXuat::with(['nhanVien', 'chiTiets.sanPham', 'congDoans', 'phieuNghiemThus']);

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function ($q) use ($keyword) {
                $q->where('maLenh', 'like', "%{$keyword}%")
                  ->orWhere('tenLenh', 'like', "%{$keyword}%")
                  ->orWhereHas('chiTiets.sanPham', function ($sq) use ($keyword) {
                      $sq->where('tenSanPham', 'like', "%{$keyword}%");
                  });
            });
        }

        if ($request->filled('trangThai')) {
            $query->where('trangThai', $request->trangThai);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('ngayTaoLenh', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('ngayTaoLenh', '<=', $request->to_date);
        }

        $orders = $query->orderBy('ngayTaoLenh', 'desc')->get();

        // Calculate progress percentage for each order based on stages
        $orders->transform(function ($order) {
            $totalStages = $order->congDoans->count();
            $completedStages = $order->congDoans->where('trangThai', 'Hoàn thành')->count();
            $order->tienDoPhanTram = $totalStages > 0 ? round(($completedStages / $totalStages) * 100) : 0;
            return $order;
        });

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Lấy chi tiết 1 Lệnh Sản Xuất
     */
    public function getOrderById($id)
    {
        $order = LenhSanXuat::with([
            'nhanVien',
            'chiTiets.sanPham',
            'congDoans.nhanVien',
            'phieuYeuCauNVLs.chiTiets.nguyenVatLieu',
            'phieuYeuCauBTPs.chiTiets',
            'phieuNghiemThus.nhanVien',
            'phieuSanXuatBus.sanPham'
        ])->where('maLenh', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Tạo Lệnh Sản Xuất mới (PR-FR07, PR-BR01, PR-BR02)
     */
    public function createOrder(Request $request)
    {
        $validated = $request->validate([
            'maLenh' => 'nullable|string|unique:LenhSanXuat,maLenh',
            'tenLenh' => 'required|string|max:255',
            'maNhanVien' => 'nullable|string|exists:NhanVien,maNV',
            'ngayTaoLenh' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.maSanPham' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.ghiChu' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            // Auto generate maLenh if not provided
            $maLenh = $validated['maLenh'];
            if (!$maLenh) {
                $count = LenhSanXuat::count() + 1;
                $maLenh = 'LSX' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }

            $order = LenhSanXuat::create([
                'maLenh' => $maLenh,
                'maNhanVien' => $validated['maNhanVien'] ?? 'NV001',
                'tenLenh' => $validated['tenLenh'],
                'ngayTaoLenh' => $validated['ngayTaoLenh'],
                'trangThai' => 'Chờ duyệt',
            ]);

            foreach ($validated['items'] as $item) {
                ChiTietLenhSanXuat::create([
                    'maLenh' => $maLenh,
                    'maSanPham' => $item['maSanPham'],
                    'soLuong' => $item['soLuong'],
                    'ghiChu' => $item['ghiChu'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo Lệnh Sản Xuất thành công!',
                'data' => $this->getOrderById($maLenh)->original['data']
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tạo lệnh: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sửa Lệnh Sản Xuất (PR-FR08, chỉ khi Chưa triển khai)
     */
    public function updateOrder(Request $request, $id)
    {
        $order = LenhSanXuat::where('maLenh', $id)->firstOrFail();

        if (in_array($order->trangThai, ['Đang thực hiện', 'Hoàn thành'])) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể sửa lệnh đang triển khai hoặc đã hoàn thành!'
            ], 422);
        }

        $validated = $request->validate([
            'tenLenh' => 'required|string|max:255',
            'maNhanVien' => 'nullable|string|exists:NhanVien,maNV',
            'ngayTaoLenh' => 'required|date',
            'items' => 'sometimes|array|min:1',
            'items.*.maSanPham' => 'required|string|exists:SanPham,maSanPham',
            'items.*.soLuong' => 'required|integer|min:1',
            'items.*.ghiChu' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $order->update([
                'tenLenh' => $validated['tenLenh'],
                'maNhanVien' => $validated['maNhanVien'] ?? $order->maNhanVien,
                'ngayTaoLenh' => $validated['ngayTaoLenh'],
            ]);

            if (isset($validated['items'])) {
                ChiTietLenhSanXuat::where('maLenh', $id)->delete();
                foreach ($validated['items'] as $item) {
                    ChiTietLenhSanXuat::create([
                        'maLenh' => $id,
                        'maSanPham' => $item['maSanPham'],
                        'soLuong' => $item['soLuong'],
                        'ghiChu' => $item['ghiChu'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật Lệnh Sản Xuất thành công!',
                'data' => $this->getOrderById($id)->original['data']
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa Lệnh Sản Xuất (PR-FR09, chỉ khi Chờ duyệt)
     */
    public function deleteOrder($id)
    {
        $order = LenhSanXuat::where('maLenh', $id)->firstOrFail();

        if ($order->trangThai !== 'Chờ duyệt' && $order->trangThai !== 'Từ chối') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ được xóa lệnh ở trạng thái Chờ duyệt hoặc Từ chối!'
            ], 422);
        }

        DB::beginTransaction();
        try {
            ChiTietLenhSanXuat::where('maLenh', $id)->delete();
            CongDoan::where('maLenh', $id)->delete();
            $order->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa lệnh sản xuất {$id} thành công!"
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xóa lệnh: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duyệt & Khởi chạy Lệnh Sản Xuất (PR-FR11, PR-BR04)
     * Tự động khởi tạo 6 công đoạn chuẩn sữa Vinamilk & Phiếu yêu cầu NVL
     */
    public function approveOrder(Request $request, $id)
    {
        $order = LenhSanXuat::with('chiTiets.sanPham')->where('maLenh', $id)->firstOrFail();

        if ($order->trangThai === 'Đã duyệt' || $order->trangThai === 'Đang thực hiện') {
            return response()->json([
                'success' => false,
                'message' => 'Lệnh này đã được duyệt trước đó!'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order->trangThai = 'Đang thực hiện';
            $order->save();

            // Total target units
            $totalQuantity = $order->chiTiets->sum('soLuong');

            // Standard Vinamilk Milk Processing 6 Stages
            $standardStages = [
                ['khau' => 1, 'ten' => 'Chuẩn bị & Kiểm tra NVL', 'btp' => 'NVL Đầu Vào Đạt Chuẩn', 'cost' => 1500000, 'nhanCong' => 4],
                ['khau' => 2, 'ten' => 'Xử lý & Phối trộn', 'btp' => 'Sữa Phối Trộn Tiêu Chuẩn', 'cost' => 2800000, 'nhanCong' => 6],
                ['khau' => 3, 'ten' => 'Gia nhiệt & Tiệt trùng UHT', 'btp' => 'Sữa Tiệt Trùng Vô Trùng', 'cost' => 4500000, 'nhanCong' => 5],
                ['khau' => 4, 'ten' => 'Đồng hóa áp lực cao', 'btp' => 'Sữa Đồng Hóa Mịn', 'cost' => 3200000, 'nhanCong' => 4],
                ['khau' => 5, 'ten' => 'Chiết rót vô trùng Tetra Pak', 'btp' => 'Hộp Sữa Vô Trùng', 'cost' => 5000000, 'nhanCong' => 8],
                ['khau' => 6, 'ten' => 'Đóng thùng carton & Kiểm tra', 'btp' => 'Thùng Thành Phẩm', 'cost' => 2000000, 'nhanCong' => 6],
            ];

            // If no stages exist yet, create standard stages
            if ($order->congDoans->count() === 0) {
                $today = Carbon::today()->format('Y-m-d');
                $stageCounter = CongDoan::count() + 1;

                foreach ($standardStages as $index => $stg) {
                    $cdCode = 'CD' . str_pad($stageCounter++, 3, '0', STR_PAD_LEFT);
                    CongDoan::create([
                        'maCongDoan' => $cdCode,
                        'maLenh' => $id,
                        'maNhanVien' => $order->maNhanVien ?? 'NV001',
                        'tenLenh' => $stg['ten'],
                        'nhanCong' => $stg['nhanCong'],
                        'ngayBatDau' => $today,
                        'ngayKetThuc' => Carbon::today()->addDays($index + 1)->format('Y-m-d'),
                        'chiPhi' => $stg['cost'],
                        'thanhPham' => $stg['btp'],
                        'soLuongThanhPham' => $totalQuantity,
                        'khau' => $stg['khau'],
                        'trangThai' => $index === 0 ? 'Đang thực hiện' : 'Chờ thực hiện',
                    ]);
                }
            }

            // Create initial Material Request (PhieuYeuCauNVL) for Stage 1 if not exists
            if ($order->phieuYeuCauNVLs->count() === 0) {
                $firstStage = CongDoan::where('maLenh', $id)->where('khau', 1)->first();
                $reqCode = 'YCNVL' . str_pad(PhieuYeuCauNVL::count() + 1, 3, '0', STR_PAD_LEFT);

                $matReq = PhieuYeuCauNVL::create([
                    'maPhieuYCNVL' => $reqCode,
                    'maCongDoan' => $firstStage ? $firstStage->maCongDoan : null,
                    'maLenh' => $id,
                    'maNhanVien' => $order->maNhanVien ?? 'NV001',
                    'ngayYeuCau' => Carbon::today()->format('Y-m-d'),
                    'trangThai' => 'Chưa xử lý',
                    'ghiChu' => "Cấp phát NVL phục vụ Lệnh sản xuất {$id}",
                ]);

                // Auto populate standard materials (Raw milk, sugar, packaging)
                ChiTietPhieuYeuCauNVL::create([
                    'maPhieuYCNVL' => $reqCode,
                    'maNVL' => 'NVL001',
                    'tenNVL' => 'Sữa Bò Tươi Nguyên Chất',
                    'soLuong' => intval($totalQuantity * 0.9),
                ]);

                ChiTietPhieuYeuCauNVL::create([
                    'maPhieuYCNVL' => $reqCode,
                    'maNVL' => 'NVL002',
                    'tenNVL' => 'Đường Tinh Luyện',
                    'soLuong' => intval($totalQuantity * 0.1),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã duyệt và kích hoạt Lệnh sản xuất {$id} cùng 6 công đoạn dây chuyền!",
                'data' => $this->getOrderById($id)->original['data']
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi duyệt lệnh: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Từ chối / Hủy Lệnh Sản Xuất
     */
    public function rejectOrder(Request $request, $id)
    {
        $order = LenhSanXuat::where('maLenh', $id)->firstOrFail();
        $order->trangThai = 'Từ chối';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => "Đã từ chối Lệnh sản xuất {$id}",
            'data' => $order
        ]);
    }

    /**
     * Đánh dấu Hoàn thành Lệnh Sản Xuất (PR-BR11)
     */
    public function completeOrder(Request $request, $id)
    {
        $order = LenhSanXuat::where('maLenh', $id)->firstOrFail();
        $order->trangThai = 'Hoàn thành';
        $order->save();

        // Mark all remaining stages as completed
        CongDoan::where('maLenh', $id)->update(['trangThai' => 'Hoàn thành']);

        return response()->json([
            'success' => true,
            'message' => "Lệnh sản xuất {$id} đã được xác nhận hoàn thành toàn bộ!",
            'data' => $this->getOrderById($id)->original['data']
        ]);
    }
}
