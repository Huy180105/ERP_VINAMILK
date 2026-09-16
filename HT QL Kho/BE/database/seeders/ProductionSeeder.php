<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 1. LenhSanXuat & ChiTietLenhSanXuat
        DB::table('ChiTietLenhSanXuat')->truncate();
        DB::table('LenhSanXuat')->truncate();

        $productionOrders = [
            [
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV003', // Le Minh Tuan
                'tenLenh' => 'Kế hoạch sản xuất Sữa tươi tiệt trùng UHT 100% 180ml (Batch A)',
                'ngayTaoLenh' => Carbon::now()->subDays(12)->toDateString(),
                'trangThai' => 'Hoàn thành',
                'items' => [
                    ['maSanPham' => 'SP001', 'soLuong' => 20000, 'ghiChu' => 'Tiệt trùng UHT vô trùng'],
                ]
            ],
            [
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Kế hoạch sản xuất Sữa chua ăn có đường 100g (Batch Probiotics)',
                'ngayTaoLenh' => Carbon::now()->subDays(8)->toDateString(),
                'trangThai' => 'Hoàn thành',
                'items' => [
                    ['maSanPham' => 'SP003', 'soLuong' => 5000, 'ghiChu' => 'Ủ men sống Bulgaricus 8 tiếng'],
                ]
            ],
            [
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007', // Vu Quoc Bao
                'tenLenh' => 'Kế hoạch sản xuất Sữa tươi sinh thái Green Farm 180ml',
                'ngayTaoLenh' => Carbon::now()->subDays(5)->toDateString(),
                'trangThai' => 'Đang thực hiện',
                'items' => [
                    ['maSanPham' => 'SP005', 'soLuong' => 10000, 'ghiChu' => 'Tiêu chuẩn Clean Label quốc tế'],
                ]
            ],
            [
                'maLenh' => 'LSX20260912',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Kế hoạch sản xuất Sữa chua uống men sống Probi 65ml',
                'ngayTaoLenh' => Carbon::now()->subDays(2)->toDateString(),
                'trangThai' => 'Đã duyệt',
                'items' => [
                    ['maSanPham' => 'SP006', 'soLuong' => 15000, 'ghiChu' => 'Men sống L.Casei 431'],
                ]
            ],
        ];

        foreach ($productionOrders as $po) {
            DB::table('LenhSanXuat')->insert([
                'maLenh' => $po['maLenh'],
                'maNhanVien' => $po['maNhanVien'],
                'tenLenh' => $po['tenLenh'],
                'ngayTaoLenh' => $po['ngayTaoLenh'],
                'trangThai' => $po['trangThai'],
            ]);
            foreach ($po['items'] as $it) {
                DB::table('ChiTietLenhSanXuat')->insert([
                    'maLenh' => $po['maLenh'],
                    'maSanPham' => $it['maSanPham'],
                    'soLuong' => $it['soLuong'],
                    'ghiChu' => $it['ghiChu'],
                ]);
            }
        }

        // 2. CongDoan (Work Stages)
        DB::table('CongDoan')->truncate();
        DB::table('CongDoan')->insert([
            // Stages for LSX20260901
            [
                'maCongDoan' => 'CD01-01',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Phối trộn & Gia nhiệt ban đầu',
                'nhanCong' => 6,
                'ngayBatDau' => Carbon::now()->subDays(12)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(12)->toDateString(),
                'chiPhi' => 12000000,
                'thanhPham' => 'BTP Sữa tươi đã phối trộn',
                'soLuongThanhPham' => 20000,
                'khau' => 1,
                'trangThai' => 'Đã hoàn thành',
            ],
            [
                'maCongDoan' => 'CD01-02',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Tiệt trùng UHT 140 độ C & Đồng hóa áp suất cao',
                'nhanCong' => 4,
                'ngayBatDau' => Carbon::now()->subDays(11)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(11)->toDateString(),
                'chiPhi' => 25000000,
                'thanhPham' => 'BTP Sữa tươi tiệt trùng UHT',
                'soLuongThanhPham' => 20000,
                'khau' => 2,
                'trangThai' => 'Đã hoàn thành',
            ],
            [
                'maCongDoan' => 'CD01-03',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Chiết rót vô trùng Aseptic & Đóng gói thùng carton',
                'nhanCong' => 8,
                'ngayBatDau' => Carbon::now()->subDays(11)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(10)->toDateString(),
                'chiPhi' => 32000000,
                'thanhPham' => 'Thùng Sữa Tươi Tiệt Trùng 100% 180ml',
                'soLuongThanhPham' => 20000,
                'khau' => 3,
                'trangThai' => 'Đã hoàn thành',
            ],
            // Stage for LSX20260908
            [
                'maCongDoan' => 'CD03-01',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Kiểm định & Xử lý sữa thô Green Farm Tây Ninh',
                'nhanCong' => 5,
                'ngayBatDau' => Carbon::now()->subDays(4)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(3)->toDateString(),
                'chiPhi' => 15000000,
                'thanhPham' => 'BTP Sữa tươi Green Farm đạt chuẩn',
                'soLuongThanhPham' => 10000,
                'khau' => 1,
                'trangThai' => 'Đang thực hiện',
            ],
        ]);

        // 3. PhieuYeuCauNVL & ChiTietPhieuYeuCauNVL
        DB::table('ChiTietPhieuYeuCauNVL')->truncate();
        DB::table('PhieuYeuCauNVL')->truncate();
        DB::table('PhieuYeuCauNVL')->insert([
            [
                'maPhieuYCNVL' => 'YCNVL20260901',
                'maCongDoan' => 'CD01-01',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(12)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát nguyên liệu cho Lệnh LSX20260901',
            ],
            [
                'maPhieuYCNVL' => 'YCNVL20260908',
                'maCongDoan' => 'CD03-01',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'ngayYeuCau' => Carbon::now()->subDays(4)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát vỏ hộp Tetra Pak và hương liệu tự nhiên',
            ],
        ]);

        DB::table('ChiTietPhieuYeuCauNVL')->insert([
            ['maPhieuYCNVL' => 'YCNVL20260901', 'maNVL' => 'NVL001', 'tenNVL' => 'Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)', 'soLuong' => 18000],
            ['maPhieuYCNVL' => 'YCNVL20260901', 'maNVL' => 'NVL002', 'tenNVL' => 'Đường Tinh Luyện Biên Hòa Grade A', 'soLuong' => 1500],
            ['maPhieuYCNVL' => 'YCNVL20260908', 'maNVL' => 'NVL004', 'tenNVL' => 'Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml', 'soLuong' => 10000],
        ]);

        // 4. PhieuYeuCauBTP & ChiTietPhieuYeuCauBTP
        DB::table('ChiTietPhieuYeuCauBTP')->truncate();
        DB::table('PhieuYeuCauBTP')->truncate();
        DB::table('PhieuYeuCauBTP')->insert([
            [
                'maPhieuYCBTP' => 'YCBTP20260901',
                'maCongDoan' => 'CD01-03',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(11)->toDateString(),
                'ghiChu' => 'Chuyển BTP tiệt trùng sang phân xưởng chiết rót Aseptic',
            ],
        ]);

        DB::table('ChiTietPhieuYeuCauBTP')->insert([
            ['maPhieuYCBTP' => 'YCBTP20260901', 'maBTP' => 'BTP-SUA-UHT', 'tenBTP' => 'Sữa tươi tiệt trùng UHT', 'soLuong' => 20000],
        ]);

        // 5. TienDoSanXuat & ChiTietTienDoSanXuat
        DB::table('ChiTietTienDoSanXuat')->truncate();
        DB::table('TienDoSanXuat')->truncate();
        DB::table('TienDoSanXuat')->insert([
            [
                'maTienDoSX' => 'TDSX20260901',
                'maCongDoan' => 'CD01-03',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV007',
                'ngaySX' => Carbon::now()->subDays(10)->toDateString(),
            ],
            [
                'maTienDoSX' => 'TDSX20260908',
                'maCongDoan' => 'CD03-01',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'ngaySX' => Carbon::now()->subDays(3)->toDateString(),
            ],
        ]);

        DB::table('ChiTietTienDoSanXuat')->insert([
            ['maTienDoSX' => 'TDSX20260901', 'maBTP' => 'BTP-SUA-UHT', 'soLuong' => 20000, 'trangThai' => 'Đạt chuẩn 100%'],
            ['maTienDoSX' => 'TDSX20260908', 'maBTP' => 'BTP-GREEN-FARM', 'soLuong' => 10000, 'trangThai' => 'Đang kiểm nghiệm'],
        ]);

        // 6. PhieuNghiemThu (QC Quality Assurance)
        DB::table('PhieuNghiemThu')->truncate();
        DB::table('PhieuNghiemThu')->insert([
            [
                'maPhieuNghiemThu' => 'PNT20260901',
                'maCongDoan' => 'CD01-03',
                'maLenh' => 'LSX20260901',
                'maNhanVien' => 'NV007',
                'tongSoLuongSanPham' => 20000,
                'tongSoLuongDat' => 19980,
                'tongSoLuongKhongDat' => 20,
                'ngayNghiemThu' => Carbon::now()->subDays(10)->toDateString(),
                'ghiChu' => 'Nghiệm thu đạt chuẩn ISO 22000, hao hụt bao bì 20 hộp',
            ],
            [
                'maPhieuNghiemThu' => 'PNT20260905',
                'maCongDoan' => 'CD01-02',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV007',
                'tongSoLuongSanPham' => 5000,
                'tongSoLuongDat' => 5000,
                'tongSoLuongKhongDat' => 0,
                'ngayNghiemThu' => Carbon::now()->subDays(6)->toDateString(),
                'ghiChu' => 'Đạt chuẩn vi sinh Probiotics 100%',
            ],
        ]);

        // 7. PhieuYeuCauXuatSP & ChiTietPhieuYeuCauXuatSP (Handover from Production to Warehouse)
        DB::table('ChiTietPhieuYeuCauXuatSP')->truncate();
        DB::table('PhieuYeuCauXuatSP')->truncate();
        DB::table('PhieuYeuCauXuatSP')->insert([
            [
                'maPhieuYCXSP' => 'YCXSP20260901',
                'maPhieuNghiemThu' => 'PNT20260901',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(10)->toDateString(),
                'trangThai' => 'Đã nhập kho',
                'ghiChu' => 'Bàn giao 19,980 hộp sữa tiệt trùng sang Kho Tổng Bình Dương',
            ],
        ]);

        DB::table('ChiTietPhieuYeuCauXuatSP')->insert([
            [
                'maPhieuYCXSP' => 'YCXSP20260901',
                'maSanPham' => 'SP001',
                'soLuong' => 19980,
                'ghiChu' => 'Đã nhập vào Lô LOT-SP-20260908-FEFO2',
            ]
        ]);

        // 8. PhieuSanXuatBu
        DB::table('PhieuSanXuatBu')->truncate();
        DB::table('PhieuSanXuatBu')->insert([
            [
                'maLenh' => 'LSX20260901',
                'maSanPham' => 'SP001',
                'maPhieuNghiemThu' => 'PNT20260901',
                'soLuongKhongDat' => 20,
                'ghiChu' => 'Bù 20 hộp hỏng trong khâu chiết rót bao bì',
            ]
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}

