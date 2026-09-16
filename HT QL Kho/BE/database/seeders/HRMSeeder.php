<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HRMSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 1. PhongBan (6 Departments)
        DB::table('PhongBan')->truncate();
        DB::table('PhongBan')->insert([
            ['maPhongBan' => 'PB01', 'tenPhongBan' => 'Ban Giám Đốc & Điều Hành Tập Đoàn'],
            ['maPhongBan' => 'PB02', 'tenPhongBan' => 'Phòng Quản Lý Kho Vận & Chuỗi Cung Ứng'],
            ['maPhongBan' => 'PB03', 'tenPhongBan' => 'Phòng Tài Chính - Kế Toán Doanh Nghiệp'],
            ['maPhongBan' => 'PB04', 'tenPhongBan' => 'Phòng Kỹ Thuật Sản Xuất & Siêu Nhà Máy Mega'],
            ['maPhongBan' => 'PB05', 'tenPhongBan' => 'Phòng Kinh Doanh & Mạng Lưới Phân Phối'],
            ['maPhongBan' => 'PB06', 'tenPhongBan' => 'Phòng Nhân Sự & Đào Tạo Nguồn Nhân Lực'],
        ]);

        // 2. ChucVu (8 Positions)
        DB::table('ChucVu')->truncate();
        DB::table('ChucVu')->insert([
            ['maChucVu' => 'CV01', 'tenChucVu' => 'Tổng Giám Đốc Điều Hành (CEO)', 'phuCap' => 15000000],
            ['maChucVu' => 'CV02', 'tenChucVu' => 'Giám Đốc Tài Chính (CFO)', 'phuCap' => 10000000],
            ['maChucVu' => 'CV03', 'tenChucVu' => 'Trưởng Phòng Kho Vận', 'phuCap' => 5000000],
            ['maChucVu' => 'CV04', 'tenChucVu' => 'Kế Toán Trưởng', 'phuCap' => 6000000],
            ['maChucVu' => 'CV05', 'tenChucVu' => 'Trưởng Ca Kỹ Thuật Sản Xuất', 'phuCap' => 4500000],
            ['maChucVu' => 'CV06', 'tenChucVu' => 'Thủ Kho Trưởng / Kiểm Soát FEFO', 'phuCap' => 3000000],
            ['maChucVu' => 'CV07', 'tenChucVu' => 'Kế Toán Thanh Toán & Kho', 'phuCap' => 2500000],
            ['maChucVu' => 'CV08', 'tenChucVu' => 'Chuyên Viên KCS / Kiểm Định Chất Lượng', 'phuCap' => 2500000],
        ]);

        // 3. NhanVien (10 Key Staff Members)
        DB::table('NhanVien')->truncate();
        DB::table('NhanVien')->insert([
            ['maNV' => 'NV001', 'hoTen' => 'Nguyễn Văn Hùng', 'maPhongBan' => 'PB02', 'maChucVu' => 'CV03', 'ngayVaoLam' => '2020-03-15', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV002', 'hoTen' => 'Trần Thị Thu Thảo', 'maPhongBan' => 'PB03', 'maChucVu' => 'CV04', 'ngayVaoLam' => '2021-06-10', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV003', 'hoTen' => 'Lê Minh Tuấn', 'maPhongBan' => 'PB04', 'maChucVu' => 'CV05', 'ngayVaoLam' => '2019-11-01', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV004', 'hoTen' => 'Phạm Hoàng Nam', 'maPhongBan' => 'PB05', 'maChucVu' => 'CV07', 'ngayVaoLam' => '2022-02-20', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV005', 'hoTen' => 'Trịnh Đình Đức', 'maPhongBan' => 'PB01', 'maChucVu' => 'CV01', 'ngayVaoLam' => '2018-01-01', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV006', 'hoTen' => 'Đặng Mai Phương', 'maPhongBan' => 'PB02', 'maChucVu' => 'CV06', 'ngayVaoLam' => '2022-08-15', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV007', 'hoTen' => 'Vũ Quốc Bảo', 'maPhongBan' => 'PB04', 'maChucVu' => 'CV08', 'ngayVaoLam' => '2021-09-05', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV008', 'hoTen' => 'Hoàng Kim Ngân', 'maPhongBan' => 'PB03', 'maChucVu' => 'CV07', 'ngayVaoLam' => '2023-04-12', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV009', 'hoTen' => 'Bùi Tuấn Kiệt', 'maPhongBan' => 'PB05', 'maChucVu' => 'CV07', 'ngayVaoLam' => '2023-01-10', 'trangThai' => 'Đang làm việc'],
            ['maNV' => 'NV010', 'hoTen' => 'Ngô Thị Thanh Trúc', 'maPhongBan' => 'PB06', 'maChucVu' => 'CV07', 'ngayVaoLam' => '2022-10-01', 'trangThai' => 'Đang làm việc'],
        ]);

        // 4. HopDong (10 Contracts)
        DB::table('HopDong')->truncate();
        DB::table('HopDong')->insert([
            ['maHopDong' => 'HD2020-001', 'maNV' => 'NV001', 'loaiHopDong' => 'Không xác định thời hạn', 'ngayHieuLuc' => '2020-03-15', 'mucLuongCoBan' => 28000000],
            ['maHopDong' => 'HD2021-002', 'maNV' => 'NV002', 'loaiHopDong' => 'Không xác định thời hạn', 'ngayHieuLuc' => '2021-06-10', 'mucLuongCoBan' => 32000000],
            ['maHopDong' => 'HD2019-003', 'maNV' => 'NV003', 'loaiHopDong' => 'Không xác định thời hạn', 'ngayHieuLuc' => '2019-11-01', 'mucLuongCoBan' => 26000000],
            ['maHopDong' => 'HD2022-004', 'maNV' => 'NV004', 'loaiHopDong' => 'Xác định thời hạn 3 năm', 'ngayHieuLuc' => '2022-02-20', 'mucLuongCoBan' => 16000000],
            ['maHopDong' => 'HD2018-005', 'maNV' => 'NV005', 'loaiHopDong' => 'Không xác định thời hạn', 'ngayHieuLuc' => '2018-01-01', 'mucLuongCoBan' => 60000000],
            ['maHopDong' => 'HD2022-006', 'maNV' => 'NV006', 'loaiHopDong' => 'Xác định thời hạn 3 năm', 'ngayHieuLuc' => '2022-08-15', 'mucLuongCoBan' => 15000000],
            ['maHopDong' => 'HD2021-007', 'maNV' => 'NV007', 'loaiHopDong' => 'Xác định thời hạn 3 năm', 'ngayHieuLuc' => '2021-09-05', 'mucLuongCoBan' => 18000000],
            ['maHopDong' => 'HD2023-008', 'maNV' => 'NV008', 'loaiHopDong' => 'Xác định thời hạn 1 năm', 'ngayHieuLuc' => '2023-04-12', 'mucLuongCoBan' => 14000000],
            ['maHopDong' => 'HD2023-009', 'maNV' => 'NV009', 'loaiHopDong' => 'Xác định thời hạn 1 năm', 'ngayHieuLuc' => '2023-01-10', 'mucLuongCoBan' => 15000000],
            ['maHopDong' => 'HD2022-010', 'maNV' => 'NV010', 'loaiHopDong' => 'Không xác định thời hạn', 'ngayHieuLuc' => '2022-10-01', 'mucLuongCoBan' => 16000000],
        ]);

        // 5. BangCong (Tháng 08/2026 & Tháng 09/2026)
        DB::table('BangCong')->truncate();
        $staffIds = ['NV001', 'NV002', 'NV003', 'NV004', 'NV005', 'NV006', 'NV007', 'NV008', 'NV009', 'NV010'];
        $bangCongList = [];
        $bangLuongList = [];

        foreach ($staffIds as $idx => $nv) {
            // Month 08/2026
            $bc08 = 'BC-202608-' . ($idx + 1);
            $bangCongList[] = [
                'maBangCong' => $bc08,
                'maNV' => $nv,
                'thang' => '08/2026',
                'soNgayCong' => 22,
                'soGioTangCa' => ($idx % 3 === 0) ? 12 : 6,
            ];

            // Month 09/2026
            $bc09 = 'BC-202609-' . ($idx + 1);
            $bangCongList[] = [
                'maBangCong' => $bc09,
                'maNV' => $nv,
                'thang' => '09/2026',
                'soNgayCong' => 21,
                'soGioTangCa' => ($idx % 2 === 0) ? 8 : 4,
            ];
        }
        DB::table('BangCong')->insert($bangCongList);

        // 6. BangLuong (Tháng 08/2026 & Tháng 09/2026)
        DB::table('BangLuong')->truncate();
        $salaryMap = [
            'NV001' => [33000000, 32500000],
            'NV002' => [38000000, 37000000],
            'NV003' => [30500000, 29800000],
            'NV004' => [18500000, 18000000],
            'NV005' => [75000000, 75000000],
            'NV006' => [18000000, 17500000],
            'NV007' => [20500000, 20000000],
            'NV008' => [16500000, 16000000],
            'NV009' => [17500000, 17000000],
            'NV010' => [18500000, 18000000],
        ];

        foreach ($staffIds as $idx => $nv) {
            $hdId = sprintf('HD20%02d-%03d', ($idx >= 7 ? 23 : ($idx >= 3 ? 22 : ($idx === 4 ? 18 : ($idx === 2 ? 19 : 20)))), $idx + 1);
            // 08/2026
            $bangLuongList[] = [
                'maBangLuong' => 'BL-202608-' . ($idx + 1),
                'maNV' => $nv,
                'maBangCong' => 'BC-202608-' . ($idx + 1),
                'maHopDong' => $hdId,
                'thang' => '08/2026',
                'tongThucNhan' => $salaryMap[$nv][0],
            ];
            // 09/2026
            $bangLuongList[] = [
                'maBangLuong' => 'BL-202609-' . ($idx + 1),
                'maNV' => $nv,
                'maBangCong' => 'BC-202609-' . ($idx + 1),
                'maHopDong' => $hdId,
                'thang' => '09/2026',
                'tongThucNhan' => $salaryMap[$nv][1],
            ];
        }
        DB::table('BangLuong')->insert($bangLuongList);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
