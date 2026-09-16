<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductionSeeder extends Seeder
{
    /**
     * Seed initial demonstration data for Vinamilk Production Module
     */
    public function run(): void
    {
        // 1. Seed BanThanhPham
        DB::table('BanThanhPham')->truncate();
        DB::table('BanThanhPham')->insert([
            ['maBTP' => 'BTP001', 'tenBTP' => 'Sữa Tươi Thô Đã Lọc & Tiêu Chuẩn Hóa', 'maCongDoan' => 'CD001', 'soLuong' => 15000, 'donVi' => 'Lít', 'trangThai' => 'Đạt chuẩn', 'ghiChu' => 'Hàm lượng béo 3.5%'],
            ['maBTP' => 'BTP002', 'tenBTP' => 'Sữa Phối Trộn Hương Dâu', 'maCongDoan' => 'CD002', 'soLuong' => 8000, 'donVi' => 'Lít', 'trangThai' => 'Đạt chuẩn', 'ghiChu' => 'Đã bổ sung vi chất & đường'],
            ['maBTP' => 'BTP003', 'tenBTP' => 'Sữa Tiệt Trùng UHT 140°C Vô Trùng', 'maCongDoan' => 'CD003', 'soLuong' => 12000, 'donVi' => 'Lít', 'trangThai' => 'Đạt chuẩn', 'ghiChu' => 'Bồn chứa vô trùng Aseptic'],
            ['maBTP' => 'BTP004', 'tenBTP' => 'Sữa Đồng Hóa Áp Suất Cao 200 bar', 'maCongDoan' => 'CD004', 'soLuong' => 12000, 'donVi' => 'Lít', 'trangThai' => 'Đạt chuẩn', 'ghiChu' => 'Độ mịn hạt cầu béo < 1µm'],
            ['maBTP' => 'BTP005', 'tenBTP' => 'Hộp Sữa 180ml Vô Trùng Chưa Dán Nhãn Thùng', 'maCongDoan' => 'CD005', 'soLuong' => 20000, 'donVi' => 'Hộp', 'trangThai' => 'Đạt chuẩn', 'ghiChu' => 'Chiết rót máy Tetra Pak A3/Speed'],
        ]);

        // 2. Seed Lệnh Sản Xuất (LenhSanXuat)
        DB::table('PhieuSanXuatBu')->delete();
        DB::table('PhieuNghiemThu')->delete();
        DB::table('ChiTietPhieuYeuCauNVL')->delete();
        DB::table('PhieuYeuCauNVL')->delete();
        DB::table('ChiTietLenhSanXuat')->delete();
        DB::table('CongDoan')->delete();
        DB::table('LenhSanXuat')->delete();

        $orders = [
            [
                'maLenh' => 'LSX001',
                'maNhanVien' => 'NV001',
                'tenLenh' => 'Sản xuất 10.000 hộp Sữa Tươi Tiệt Trùng 100% 180ml (Mẻ Sáng)',
                'ngayTaoLenh' => Carbon::today()->subDays(2)->format('Y-m-d'),
                'trangThai' => 'Đang thực hiện',
            ],
            [
                'maLenh' => 'LSX002',
                'maNhanVien' => 'NV002',
                'tenLenh' => 'Sản xuất 5.000 hũ Sữa Chua Ăn Có Đường 100g',
                'ngayTaoLenh' => Carbon::today()->subDays(1)->format('Y-m-d'),
                'trangThai' => 'Chờ duyệt',
            ],
            [
                'maLenh' => 'LSX003',
                'maNhanVien' => 'NV001',
                'tenLenh' => 'Sản xuất 8.000 hộp Sữa Hạt Hạnh Nhân 180ml Green Farm',
                'ngayTaoLenh' => Carbon::today()->subDays(4)->format('Y-m-d'),
                'trangThai' => 'Hoàn thành',
            ],
            [
                'maLenh' => 'LSX004',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Sản xuất 12.000 hộp Sữa Tươi Tiệt Trùng Hương Dâu 180ml',
                'ngayTaoLenh' => Carbon::today()->format('Y-m-d'),
                'trangThai' => 'Đang thực hiện',
            ]
        ];
        DB::table('LenhSanXuat')->insert($orders);

        // 3. Seed Chi Tiết Lệnh (ChiTietLenhSanXuat)
        DB::table('ChiTietLenhSanXuat')->insert([
            ['maLenh' => 'LSX001', 'maSanPham' => 'SP001', 'soLuong' => 10000, 'ghiChu' => 'Kế hoạch cung ứng đợt 1'],
            ['maLenh' => 'LSX002', 'maSanPham' => 'SP002', 'soLuong' => 5000, 'ghiChu' => 'Dòng sữa chua ăn lên men tự nhiên'],
            ['maLenh' => 'LSX003', 'maSanPham' => 'SP001', 'soLuong' => 8000, 'ghiChu' => 'Dây chuyền sữa hạt cao cấp'],
            ['maLenh' => 'LSX004', 'maSanPham' => 'SP001', 'soLuong' => 12000, 'ghiChu' => 'Sản xuất phục vụ trường học'],
        ]);

        // 4. Seed Công Đoạn (CongDoan) cho LSX001
        $today = Carbon::today()->format('Y-m-d');
        DB::table('CongDoan')->insert([
            ['maCongDoan' => 'CD001', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV001', 'tenLenh' => 'Chuẩn bị & Kiểm tra NVL', 'nhanCong' => 4, 'ngayBatDau' => Carbon::today()->subDays(2)->format('Y-m-d'), 'ngayKetThuc' => Carbon::today()->subDays(2)->format('Y-m-d'), 'chiPhi' => 1200000, 'thanhPham' => 'Sữa thô đạt kiểm nghiệm', 'soLuongThanhPham' => 10000, 'khau' => 1, 'trangThai' => 'Hoàn thành'],
            ['maCongDoan' => 'CD002', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV001', 'tenLenh' => 'Xử lý & Phối trộn', 'nhanCong' => 5, 'ngayBatDau' => Carbon::today()->subDays(1)->format('Y-m-d'), 'ngayKetThuc' => Carbon::today()->subDays(1)->format('Y-m-d'), 'chiPhi' => 2500000, 'thanhPham' => 'Sữa phối trộn đường & vi chất', 'soLuongThanhPham' => 10000, 'khau' => 2, 'trangThai' => 'Hoàn thành'],
            ['maCongDoan' => 'CD003', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV002', 'tenLenh' => 'Gia nhiệt & Tiệt trùng UHT', 'nhanCong' => 4, 'ngayBatDau' => $today, 'ngayKetThuc' => $today, 'chiPhi' => 4000000, 'thanhPham' => 'Sữa tiệt trùng vô trùng 140°C', 'soLuongThanhPham' => 10000, 'khau' => 3, 'trangThai' => 'Đang thực hiện'],
            ['maCongDoan' => 'CD004', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV002', 'tenLenh' => 'Đồng hóa áp lực cao', 'nhanCong' => 3, 'ngayBatDau' => null, 'ngayKetThuc' => null, 'chiPhi' => 3000000, 'thanhPham' => 'Sữa mịn đồng nhất', 'soLuongThanhPham' => 10000, 'khau' => 4, 'trangThai' => 'Chờ thực hiện'],
            ['maCongDoan' => 'CD005', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV003', 'tenLenh' => 'Chiết rót vô trùng Tetra Pak', 'nhanCong' => 8, 'ngayBatDau' => null, 'ngayKetThuc' => null, 'chiPhi' => 5500000, 'thanhPham' => 'Hộp sữa 180ml vô trùng', 'soLuongThanhPham' => 10000, 'khau' => 5, 'trangThai' => 'Chờ thực hiện'],
            ['maCongDoan' => 'CD006', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV003', 'tenLenh' => 'Đóng thùng carton & Kiểm tra QC', 'nhanCong' => 6, 'ngayBatDau' => null, 'ngayKetThuc' => null, 'chiPhi' => 2000000, 'thanhPham' => 'Thùng sữa thành phẩm', 'soLuongThanhPham' => 10000, 'khau' => 6, 'trangThai' => 'Chờ thực hiện'],
            
            // Công đoạn cho LSX003 (Hoàn thành)
            ['maCongDoan' => 'CD007', 'maLenh' => 'LSX003', 'maNhanVien' => 'NV001', 'tenLenh' => 'Toàn bộ quy trình khép kín Sữa Hạt', 'nhanCong' => 15, 'ngayBatDau' => Carbon::today()->subDays(4)->format('Y-m-d'), 'ngayKetThuc' => Carbon::today()->subDays(3)->format('Y-m-d'), 'chiPhi' => 18000000, 'thanhPham' => '8.000 Hộp Sữa Hạt Hạnh Nhân', 'soLuongThanhPham' => 8000, 'khau' => 1, 'trangThai' => 'Hoàn thành'],
        ]);

        // 5. Seed Phiếu Yêu Cầu NVL (PhieuYeuCauNVL & ChiTiet)
        DB::table('PhieuYeuCauNVL')->insert([
            ['maPhieuYCNVL' => 'YCNVL001', 'maCongDoan' => 'CD001', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV001', 'ngayYeuCau' => Carbon::today()->subDays(2)->format('Y-m-d'), 'trangThai' => 'Đã xuất kho', 'ghiChu' => 'Cấp phát Sữa tươi & Đường cho LSX001'],
            ['maPhieuYCNVL' => 'YCNVL002', 'maCongDoan' => 'CD005', 'maLenh' => 'LSX001', 'maNhanVien' => 'NV003', 'ngayYeuCau' => Carbon::today()->format('Y-m-d'), 'trangThai' => 'Chưa xử lý', 'ghiChu' => 'Yêu cầu Vỏ hộp Tetra Pak & Thùng carton cho chiết rót'],
        ]);

        DB::table('ChiTietPhieuYeuCauNVL')->insert([
            ['maPhieuYCNVL' => 'YCNVL001', 'maNVL' => 'NVL001', 'tenNVL' => 'Sữa Bò Tươi Nguyên Chất', 'soLuong' => 9500],
            ['maPhieuYCNVL' => 'YCNVL001', 'maNVL' => 'NVL002', 'tenNVL' => 'Đường Tinh Luyện', 'soLuong' => 500],
            ['maPhieuYCNVL' => 'YCNVL002', 'maNVL' => 'NVL001', 'tenNVL' => 'Sữa Bò Tươi Nguyên Chất', 'soLuong' => 10000],
        ]);

        // 6. Seed Phiếu Nghiệm Thu QC (PhieuNghiemThu)
        DB::table('PhieuNghiemThu')->insert([
            [
                'maPhieuNghiemThu' => 'QC001',
                'maCongDoan' => 'CD007',
                'maLenh' => 'LSX003',
                'maNhanVien' => 'NV001',
                'tongSoLuongSanPham' => 8000,
                'tongSoLuongDat' => 7920,
                'tongSoLuongKhongDat' => 80,
                'ngayNghiemThu' => Carbon::today()->subDays(3)->format('Y-m-d'),
                'ghiChu' => 'Kiểm tra độ vô trùng UHT & bao bì đạt chuẩn ISO/HACCP',
            ]
        ]);

        // 7. Seed Phiếu Sản Xuất Bù (PhieuSanXuatBu)
        DB::table('PhieuSanXuatBu')->insert([
            [
                'maLenh' => 'LSX003',
                'maSanPham' => 'SP001',
                'maPhieuNghiemThu' => 'QC001',
                'soLuongKhongDat' => 80,
                'ghiChu' => 'Sản xuất bù do lỗi rò rỉ mép dán vỏ hộp màng nhôm',
            ]
        ]);
    }
}
