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
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Kế hoạch sản xuất Sữa tươi tiệt trùng UHT 100% 180ml (Batch A)',
                'ngayTaoLenh' => Carbon::now()->subDays(14)->toDateString(),
                'trangThai' => 'Hoàn thành',
                'items' => [
                    ['maSanPham' => 'SP001', 'soLuong' => 20000, 'ghiChu' => 'Tiệt trùng UHT vô trùng Aseptic'],
                ]
            ],
            [
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Kế hoạch sản xuất Sữa tươi tiệt trùng Có Đường 110ml (Batch B)',
                'ngayTaoLenh' => Carbon::now()->subDays(11)->toDateString(),
                'trangThai' => 'Hoàn thành',
                'items' => [
                    ['maSanPham' => 'SP002', 'soLuong' => 15000, 'ghiChu' => 'Đóng gói quy cách 110ml tiện lợi'],
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
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Kế hoạch sản xuất Sữa tươi nguyên chất Green Farm 180ml',
                'ngayTaoLenh' => Carbon::now()->subDays(5)->toDateString(),
                'trangThai' => 'Đang thực hiện',
                'items' => [
                    ['maSanPham' => 'SP005', 'soLuong' => 10000, 'ghiChu' => 'Tiêu chuẩn Clean Label quốc tế'],
                ]
            ],
            [
                'maLenh' => 'LSX20260910',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Kế hoạch sản xuất Sữa hạt tách béo Hạnh Nhân 180ml',
                'ngayTaoLenh' => Carbon::now()->subDays(3)->toDateString(),
                'trangThai' => 'Đang thực hiện',
                'items' => [
                    ['maSanPham' => 'SP004', 'soLuong' => 8000, 'ghiChu' => 'Bơ hạnh nhân nhập khẩu Mỹ'],
                ]
            ],
            [
                'maLenh' => 'LSX20260912',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Kế hoạch sản xuất Sữa chua uống men sống Probi 65ml',
                'ngayTaoLenh' => Carbon::now()->subDays(2)->toDateString(),
                'trangThai' => 'Đã duyệt',
                'items' => [
                    ['maSanPham' => 'SP006', 'soLuong' => 15000, 'ghiChu' => 'Chủng men sống L.Casei 431'],
                ]
            ],
            [
                'maLenh' => 'LSX20260915',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Kế hoạch sản xuất Sữa bột Dielac Alpha Gold Step 3 900g',
                'ngayTaoLenh' => Carbon::now()->subDays(1)->toDateString(),
                'trangThai' => 'Đã duyệt',
                'items' => [
                    ['maSanPham' => 'SP007', 'soLuong' => 3000, 'ghiChu' => 'Bổ sung Bột sữa gầy NZMP & vi chất DSM'],
                ]
            ],
            [
                'maLenh' => 'LSX20260918',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Kế hoạch sản xuất Sữa tươi tiệt trùng Hương Dâu 180ml',
                'ngayTaoLenh' => Carbon::now()->toDateString(),
                'trangThai' => 'Chờ duyệt',
                'items' => [
                    ['maSanPham' => 'SP009', 'soLuong' => 12000, 'ghiChu' => 'Hương liệu dâu Firmenich Thụy Sĩ'],
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
                'ngayBatDau' => Carbon::now()->subDays(14)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(14)->toDateString(),
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
                'ngayBatDau' => Carbon::now()->subDays(13)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(13)->toDateString(),
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
                'ngayBatDau' => Carbon::now()->subDays(12)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(10)->toDateString(),
                'chiPhi' => 32000000,
                'thanhPham' => 'Thùng Sữa Tươi Tiệt Trùng 100% 180ml',
                'soLuongThanhPham' => 20000,
                'khau' => 3,
                'trangThai' => 'Đã hoàn thành',
            ],

            // Stages for LSX20260903
            [
                'maCongDoan' => 'CD03-01',
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Xử lý sữa thô Mộc Châu & Bổ sung đường tinh luyện',
                'nhanCong' => 5,
                'ngayBatDau' => Carbon::now()->subDays(11)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(10)->toDateString(),
                'chiPhi' => 18000000,
                'thanhPham' => 'BTP Sữa tươi ngọt',
                'soLuongThanhPham' => 15000,
                'khau' => 1,
                'trangThai' => 'Đã hoàn thành',
            ],
            [
                'maCongDoan' => 'CD03-02',
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Tiệt trùng UHT & Chiết rót bao bì Tetra Pak 110ml',
                'nhanCong' => 6,
                'ngayBatDau' => Carbon::now()->subDays(9)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(8)->toDateString(),
                'chiPhi' => 22000000,
                'thanhPham' => 'Thùng Sữa Tươi Tiệt Trùng Có Đường 110ml',
                'soLuongThanhPham' => 15000,
                'khau' => 2,
                'trangThai' => 'Đã hoàn thành',
            ],

            // Stages for LSX20260905
            [
                'maCongDoan' => 'CD05-01',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Phối trộn bơ sữa & Bổ sung men vi sinh Chr. Hansen',
                'nhanCong' => 4,
                'ngayBatDau' => Carbon::now()->subDays(8)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(8)->toDateString(),
                'chiPhi' => 14000000,
                'thanhPham' => 'BTP Dịch sữa lên men',
                'soLuongThanhPham' => 5000,
                'khau' => 1,
                'trangThai' => 'Đã hoàn thành',
            ],
            [
                'maCongDoan' => 'CD05-02',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Ủ men sống 42 độ C 8 tiếng & Đóng hũ 100g',
                'nhanCong' => 6,
                'ngayBatDau' => Carbon::now()->subDays(7)->toDateString(),
                'ngayKetThuc' => Carbon::now()->subDays(6)->toDateString(),
                'chiPhi' => 16000000,
                'thanhPham' => 'Lốc Sữa Chua Ăn Có Đường 100g',
                'soLuongThanhPham' => 5000,
                'khau' => 2,
                'trangThai' => 'Đã hoàn thành',
            ],

            // Stages for LSX20260908
            [
                'maCongDoan' => 'CD08-01',
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
                'trangThai' => 'Đã hoàn thành',
            ],
            [
                'maCongDoan' => 'CD08-02',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV003',
                'tenLenh' => 'Tiệt trùng UHT Clean Label & Đóng bao bì Eco',
                'nhanCong' => 6,
                'ngayBatDau' => Carbon::now()->subDays(2)->toDateString(),
                'ngayKetThuc' => Carbon::now()->toDateString(),
                'chiPhi' => 28000000,
                'thanhPham' => 'Thùng Sữa Tươi Nguyên Chất Green Farm 180ml',
                'soLuongThanhPham' => 10000,
                'khau' => 2,
                'trangThai' => 'Đang thực hiện',
            ],

            // Stages for LSX20260910
            [
                'maCongDoan' => 'CD10-01',
                'maLenh' => 'LSX20260910',
                'maNhanVien' => 'NV007',
                'tenLenh' => 'Trích xuất dịch hạt hạnh nhân Mỹ & Phối trộn tách béo',
                'nhanCong' => 5,
                'ngayBatDau' => Carbon::now()->subDays(2)->toDateString(),
                'ngayKetThuc' => Carbon::now()->toDateString(),
                'chiPhi' => 20000000,
                'thanhPham' => 'BTP Sữa hạnh nhân tách béo',
                'soLuongThanhPham' => 8000,
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
                'ngayYeuCau' => Carbon::now()->subDays(14)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát nguyên liệu cho Lệnh LSX20260901',
            ],
            [
                'maPhieuYCNVL' => 'YCNVL20260903',
                'maCongDoan' => 'CD03-01',
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(11)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát sữa thô và đường tinh luyện cho LSX20260903',
            ],
            [
                'maPhieuYCNVL' => 'YCNVL20260905',
                'maCongDoan' => 'CD05-01',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(8)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát bột sữa NZMP và men vi sinh LGG',
            ],
            [
                'maPhieuYCNVL' => 'YCNVL20260908',
                'maCongDoan' => 'CD08-01',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'ngayYeuCau' => Carbon::now()->subDays(4)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát vỏ hộp Tetra Pak và sữa tươi thô Green Farm',
            ],
            [
                'maPhieuYCNVL' => 'YCNVL20260910',
                'maCongDoan' => 'CD10-01',
                'maLenh' => 'LSX20260910',
                'maNhanVien' => 'NV007',
                'ngayYeuCau' => Carbon::now()->subDays(2)->toDateString(),
                'trangThai' => 'Đã xuất kho',
                'ghiChu' => 'Cấp phát bơ hạnh nhân và phụ gia dinh dưỡng',
            ],
            [
                'maPhieuYCNVL' => 'YCNVL20260912',
                'maCongDoan' => null,
                'maLenh' => 'LSX20260912',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(1)->toDateString(),
                'trangThai' => 'Chờ duyệt',
                'ghiChu' => 'Đề xuất nguyên liệu cho lô Sữa chua uống men sống Probi',
            ],
        ]);

        DB::table('ChiTietPhieuYeuCauNVL')->insert([
            ['maPhieuYCNVL' => 'YCNVL20260901', 'maNVL' => 'NVL001', 'tenNVL' => 'Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)', 'soLuong' => 18000],
            ['maPhieuYCNVL' => 'YCNVL20260901', 'maNVL' => 'NVL002', 'tenNVL' => 'Đường Tinh Luyện Biên Hòa Grade A', 'soLuong' => 1500],
            ['maPhieuYCNVL' => 'YCNVL20260903', 'maNVL' => 'NVL001', 'tenNVL' => 'Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)', 'soLuong' => 13500],
            ['maPhieuYCNVL' => 'YCNVL20260903', 'maNVL' => 'NVL002', 'tenNVL' => 'Đường Tinh Luyện Biên Hòa Grade A', 'soLuong' => 1200],
            ['maPhieuYCNVL' => 'YCNVL20260905', 'maNVL' => 'NVL005', 'tenNVL' => 'Bột Sữa Gầy Skim Milk Powder NZMP', 'soLuong' => 800],
            ['maPhieuYCNVL' => 'YCNVL20260905', 'maNVL' => 'NVL006', 'tenNVL' => 'Men Probiotics LGG Chr. Hansen', 'soLuong' => 50],
            ['maPhieuYCNVL' => 'YCNVL20260908', 'maNVL' => 'NVL009', 'tenNVL' => 'Sữa Tươi Thô Trang Trại Green Farm Tây Ninh', 'soLuong' => 9500],
            ['maPhieuYCNVL' => 'YCNVL20260908', 'maNVL' => 'NVL004', 'tenNVL' => 'Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml', 'soLuong' => 10000],
            ['maPhieuYCNVL' => 'YCNVL20260910', 'maNVL' => 'NVL010', 'tenNVL' => 'Bơ Hạnh Nhân Tự Nhiên Nhập Khẩu Mỹ', 'soLuong' => 600],
            ['maPhieuYCNVL' => 'YCNVL20260912', 'maNVL' => 'NVL006', 'tenNVL' => 'Men Probiotics LGG Chr. Hansen', 'soLuong' => 120],
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
                'ngayYeuCau' => Carbon::now()->subDays(12)->toDateString(),
                'ghiChu' => 'Chuyển BTP tiệt trùng sang phân xưởng chiết rót Aseptic',
            ],
            [
                'maPhieuYCBTP' => 'YCBTP20260903',
                'maCongDoan' => 'CD03-02',
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(9)->toDateString(),
                'ghiChu' => 'Chuyển BTP sữa ngọt sang dây chuyền đóng gói 110ml',
            ],
            [
                'maPhieuYCBTP' => 'YCBTP20260905',
                'maCongDoan' => 'CD05-02',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(7)->toDateString(),
                'ghiChu' => 'Chuyển BTP dịch sữa chua sang hầm ủ men tự động',
            ],
            [
                'maPhieuYCBTP' => 'YCBTP20260908',
                'maCongDoan' => 'CD08-02',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'ngayYeuCau' => Carbon::now()->subDays(2)->toDateString(),
                'ghiChu' => 'Chuyển BTP sữa Green Farm sang máy chiết vô trùng Eco',
            ],
        ]);

        DB::table('ChiTietPhieuYeuCauBTP')->insert([
            ['maPhieuYCBTP' => 'YCBTP20260901', 'maBTP' => 'BTP-SUA-UHT', 'tenBTP' => 'Sữa tươi tiệt trùng UHT', 'soLuong' => 20000],
            ['maPhieuYCBTP' => 'YCBTP20260903', 'maBTP' => 'BTP-SUA-110ML', 'tenBTP' => 'Sữa tươi có đường 110ml', 'soLuong' => 15000],
            ['maPhieuYCBTP' => 'YCBTP20260905', 'maBTP' => 'BTP-SUACHUA-MEN', 'tenBTP' => 'Dịch sữa chua lên men', 'soLuong' => 5000],
            ['maPhieuYCBTP' => 'YCBTP20260908', 'maBTP' => 'BTP-GREEN-FARM', 'tenBTP' => 'Sữa tươi Green Farm đã tiệt trùng', 'soLuong' => 10000],
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
                'maTienDoSX' => 'TDSX20260903',
                'maCongDoan' => 'CD03-02',
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV007',
                'ngaySX' => Carbon::now()->subDays(8)->toDateString(),
            ],
            [
                'maTienDoSX' => 'TDSX20260905',
                'maCongDoan' => 'CD05-02',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV003',
                'ngaySX' => Carbon::now()->subDays(6)->toDateString(),
            ],
            [
                'maTienDoSX' => 'TDSX20260908',
                'maCongDoan' => 'CD08-02',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'ngaySX' => Carbon::now()->subDays(1)->toDateString(),
            ],
            [
                'maTienDoSX' => 'TDSX20260910',
                'maCongDoan' => 'CD10-01',
                'maLenh' => 'LSX20260910',
                'maNhanVien' => 'NV007',
                'ngaySX' => Carbon::now()->toDateString(),
            ],
        ]);

        DB::table('ChiTietTienDoSanXuat')->insert([
            ['maTienDoSX' => 'TDSX20260901', 'maBTP' => 'BTP-SUA-UHT', 'soLuong' => 20000, 'trangThai' => 'Đạt chuẩn 100%'],
            ['maTienDoSX' => 'TDSX20260903', 'maBTP' => 'BTP-SUA-110ML', 'soLuong' => 15000, 'trangThai' => 'Đạt chuẩn 100%'],
            ['maTienDoSX' => 'TDSX20260905', 'maBTP' => 'BTP-SUACHUA-MEN', 'soLuong' => 5000, 'trangThai' => 'Đạt chuẩn vi sinh'],
            ['maTienDoSX' => 'TDSX20260908', 'maBTP' => 'BTP-GREEN-FARM', 'soLuong' => 10000, 'trangThai' => 'Đang chiết rót 80%'],
            ['maTienDoSX' => 'TDSX20260910', 'maBTP' => 'BTP-HANHNHAN', 'soLuong' => 8000, 'trangThai' => 'Đang trích xuất hạt'],
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
                'maPhieuNghiemThu' => 'PNT20260903',
                'maCongDoan' => 'CD03-02',
                'maLenh' => 'LSX20260903',
                'maNhanVien' => 'NV007',
                'tongSoLuongSanPham' => 15000,
                'tongSoLuongDat' => 14970,
                'tongSoLuongKhongDat' => 30,
                'ngayNghiemThu' => Carbon::now()->subDays(8)->toDateString(),
                'ghiChu' => 'Nghiệm thu thể tích và niêm phong dán màng nhôm',
            ],
            [
                'maPhieuNghiemThu' => 'PNT20260905',
                'maCongDoan' => 'CD05-02',
                'maLenh' => 'LSX20260905',
                'maNhanVien' => 'NV007',
                'tongSoLuongSanPham' => 5000,
                'tongSoLuongDat' => 5000,
                'tongSoLuongKhongDat' => 0,
                'ngayNghiemThu' => Carbon::now()->subDays(6)->toDateString(),
                'ghiChu' => 'Đạt chuẩn vi sinh Probiotics 100%',
            ],
            [
                'maPhieuNghiemThu' => 'PNT20260908',
                'maCongDoan' => 'CD08-01',
                'maLenh' => 'LSX20260908',
                'maNhanVien' => 'NV007',
                'tongSoLuongSanPham' => 10000,
                'tongSoLuongDat' => 9985,
                'tongSoLuongKhongDat' => 15,
                'ngayNghiemThu' => Carbon::now()->subDays(1)->toDateString(),
                'ghiChu' => 'Kiểm định chất lượng sữa tươi thô Green Farm đạt chuẩn Organic',
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
            [
                'maPhieuYCXSP' => 'YCXSP20260903',
                'maPhieuNghiemThu' => 'PNT20260903',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(8)->toDateString(),
                'trangThai' => 'Đã nhập kho',
                'ghiChu' => 'Bàn giao 14,970 hộp sữa tươi 110ml sang Kho Thành Phẩm Thống Nhất',
            ],
            [
                'maPhieuYCXSP' => 'YCXSP20260905',
                'maPhieuNghiemThu' => 'PNT20260905',
                'maNhanVien' => 'NV003',
                'ngayYeuCau' => Carbon::now()->subDays(6)->toDateString(),
                'trangThai' => 'Đã nhập kho',
                'ghiChu' => 'Bàn giao 5,000 lốc sữa chua ăn sang Kho Lạnh Sóng Thần',
            ],
            [
                'maPhieuYCXSP' => 'YCXSP20260908',
                'maPhieuNghiemThu' => 'PNT20260908',
                'maNhanVien' => 'NV007',
                'ngayYeuCau' => Carbon::now()->subDays(1)->toDateString(),
                'trangThai' => 'Chưa xử lý',
                'ghiChu' => 'Bàn giao 9,985 thùng sữa Green Farm sang Kho Tổng Bình Dương',
            ],
        ]);

        DB::table('ChiTietPhieuYeuCauXuatSP')->insert([
            [
                'maPhieuYCXSP' => 'YCXSP20260901',
                'maSanPham' => 'SP001',
                'soLuong' => 19980,
                'ngaySanXuat' => Carbon::now()->subDays(10)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(355)->toDateString(),
                'ghiChu' => 'Đã nhập vào Lô LOT-SP-20260908-FEFO2',
            ],
            [
                'maPhieuYCXSP' => 'YCXSP20260903',
                'maSanPham' => 'SP002',
                'soLuong' => 14970,
                'ngaySanXuat' => Carbon::now()->subDays(8)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(357)->toDateString(),
                'ghiChu' => 'Đã nhập vào Lô LOT-SP-20260910-01',
            ],
            [
                'maPhieuYCXSP' => 'YCXSP20260905',
                'maSanPham' => 'SP003',
                'soLuong' => 5000,
                'ngaySanXuat' => Carbon::now()->subDays(6)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(204)->toDateString(),
                'ghiChu' => 'Đã nhập vào Lô LOT-SP-20260912-01',
            ],
            [
                'maPhieuYCXSP' => 'YCXSP20260908',
                'maSanPham' => 'SP005',
                'soLuong' => 9985,
                'ngaySanXuat' => Carbon::now()->subDays(1)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(364)->toDateString(),
                'ghiChu' => 'Chờ Thủ kho tiếp nhận và lập phiếu nhập kho',
            ],
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
            ],
            [
                'maLenh' => 'LSX20260903',
                'maSanPham' => 'SP002',
                'maPhieuNghiemThu' => 'PNT20260903',
                'soLuongKhongDat' => 30,
                'ghiChu' => 'Bù 30 hộp hỏng dán màng nhôm niêm phong',
            ],
            [
                'maLenh' => 'LSX20260908',
                'maSanPham' => 'SP005',
                'maPhieuNghiemThu' => 'PNT20260908',
                'soLuongKhongDat' => 15,
                'ghiChu' => 'Bù 15 thùng bị mờ ngày sản xuất trên vỏ Eco',
            ],
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
