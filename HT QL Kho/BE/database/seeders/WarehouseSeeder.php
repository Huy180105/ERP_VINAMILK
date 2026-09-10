<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clean out legacy or temporary data
        DB::table('ChiTietPhieuXuatSP')->truncate();
        DB::table('PhieuXuatSP')->truncate();
        DB::table('ChiTietPhieuXuatNVL')->truncate();
        DB::table('PhieuXuatNVL')->truncate();
        DB::table('ChiTietPhieuNhapSP')->truncate();
        DB::table('PhieuNhapSP')->truncate();
        DB::table('ChiTietPhieuNhapNVL')->truncate();
        DB::table('PhieuNhapNVL')->truncate();
        DB::table('KhoNguyenVatLieu')->truncate();
        DB::table('KhoSanPham')->truncate();
        DB::table('TonKho')->truncate();
        DB::table('NguyenVatLieu')->truncate();
        DB::table('LoaiNVL')->truncate();
        DB::table('SanPham')->truncate();
        DB::table('NhaCungCap')->truncate();
        DB::table('KhachHang')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Seed LoaiNVL (6 Categories)
        DB::table('LoaiNVL')->insert([
            ['maLoaiNVL' => 'LNVL01', 'tenLoaiNVL' => 'Sữa Tươi Thô & Nguyên Liệu Lỏng', 'ghiChu' => 'Sữa tươi thô thu mua từ trang trại Green Farm Vinamilk'],
            ['maLoaiNVL' => 'LNVL02', 'tenLoaiNVL' => 'Nguyên Liệu Khô & Phụ Gia', 'ghiChu' => 'Đường tinh luyện, vi chất dinh dưỡng, hương liệu nhập khẩu'],
            ['maLoaiNVL' => 'LNVL03', 'tenLoaiNVL' => 'Bao Bì & Vật Tư Đóng Gói', 'ghiChu' => 'Vỏ hộp giấy Tetra Pak, nắp nhựa, cuộn màng co'],
            ['maLoaiNVL' => 'LNVL04', 'tenLoaiNVL' => 'Bột Sữa & Béo Dinh Dưỡng', 'ghiChu' => 'Bột sữa gầy NZMP New Zealand, béo sữa chua'],
            ['maLoaiNVL' => 'LNVL05', 'tenLoaiNVL' => 'Men Sữa Chua & Enzyme', 'ghiChu' => 'Men Probiotics LGG nhập khẩu Đan Mạch'],
            ['maLoaiNVL' => 'LNVL06', 'tenLoaiNVL' => 'Trái Cây & Hạt Tự Nhiên', 'ghiChu' => 'Mứt dâu tây Đà Lạt, cốt dừa, bơ hạnh nhân'],
        ]);

        // 2. Seed NguyenVatLieu (10 Items)
        DB::table('NguyenVatLieu')->insert([
            ['maNVL' => 'NVL001', 'maLoaiNVL' => 'LNVL01', 'tenNVL' => 'Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)', 'donVi' => 'Lít', 'ghiChu' => 'Bảo quản lạnh 2-4 độ C'],
            ['maNVL' => 'NVL002', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Đường Tinh Luyện Biên Hòa Grade A', 'donVi' => 'Kg', 'ghiChu' => 'Bảo quản kho khô ráo'],
            ['maNVL' => 'NVL003', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Hương Liệu Dâu Tự Nhiên Firmenich', 'donVi' => 'Kg', 'ghiChu' => 'Nhập khẩu Thụy Sĩ'],
            ['maNVL' => 'NVL004', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml', 'donVi' => 'Cái', 'ghiChu' => 'Đạt chuẩn tiệt trùng UHT'],
            ['maNVL' => 'NVL005', 'maLoaiNVL' => 'LNVL04', 'tenNVL' => 'Bột Sữa Gầy Skim Milk Powder NZMP', 'donVi' => 'Kg', 'ghiChu' => 'Nhập khẩu Fonterra New Zealand'],
            ['maNVL' => 'NVL006', 'maLoaiNVL' => 'LNVL05', 'tenNVL' => 'Men Probiotics LGG Chr. Hansen', 'donVi' => 'Kg', 'ghiChu' => 'Men sống lên men sữa chua Đan Mạch'],
            ['maNVL' => 'NVL007', 'maLoaiNVL' => 'LNVL06', 'tenNVL' => 'Mứt Dâu Tây Tự Nhiên Đà Lạt', 'donVi' => 'Kg', 'ghiChu' => 'Cốt trái cây tươi chín mộng'],
            ['maNVL' => 'NVL008', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Thùng Carton 24 Hộp Sữa 180ml', 'donVi' => 'Cái', 'ghiChu' => 'Bao bì carton sóng 5 lớp'],
            ['maNVL' => 'NVL009', 'maLoaiNVL' => 'LNVL01', 'tenNVL' => 'Sữa Tươi Thô Trang Trại Green Farm Tây Ninh', 'donVi' => 'Lít', 'ghiChu' => 'Đạt chuẩn Organic Châu Âu'],
            ['maNVL' => 'NVL010', 'maLoaiNVL' => 'LNVL06', 'tenNVL' => 'Bơ Hạnh Nhân Tự Nhiên Nhập Khẩu Mỹ', 'donVi' => 'Kg', 'ghiChu' => 'Phục vụ dòng Sữa Hạt cao cấp'],
        ]);

        // 3. Seed SanPham (10 Finished Products)
        DB::table('SanPham')->insert([
            ['maSanPham' => 'SP001', 'tenSanPham' => 'Sữa Tươi Tiệt Trùng 100% Vinamilk Ít Đường 180ml', 'donViTinh' => 'Thùng', 'donGia' => 385000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP002', 'tenSanPham' => 'Sữa Tươi Tiệt Trùng 100% Vinamilk Có Đường 110ml', 'donViTinh' => 'Thùng', 'donGia' => 260000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP003', 'tenSanPham' => 'Sữa Chua Ăn Vinamilk Có Đường 100g', 'donViTinh' => 'Lốc', 'donGia' => 28000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP004', 'tenSanPham' => 'Sữa Hạt Tách Béo Vinamilk Hạnh Nhân 180ml', 'donViTinh' => 'Thùng', 'donGia' => 450000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP005', 'tenSanPham' => 'Sữa Tươi Nguyên Chất Vinamilk Green Farm 180ml', 'donViTinh' => 'Thùng', 'donGia' => 420000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP006', 'tenSanPham' => 'Sữa Chua Uống Men Sống Probi 65ml', 'donViTinh' => 'Lốc', 'donGia' => 24500, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP007', 'tenSanPham' => 'Sữa Bột Dielac Alpha Gold Step 3 900g', 'donViTinh' => 'Hộp', 'donGia' => 310000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP008', 'tenSanPham' => 'Sữa Đặc Có Đường Phương Nam 1284g', 'donViTinh' => 'Lon', 'donGia' => 62000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP009', 'tenSanPham' => 'Sữa Tươi Tiệt Trùng Hương Dâu Vinamilk 180ml', 'donViTinh' => 'Thùng', 'donGia' => 385000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP010', 'tenSanPham' => 'Phô Mai Con Bò Cười Vinamilk 112g (8 Miếng)', 'donViTinh' => 'Hộp', 'donGia' => 35000, 'trangThai' => 'Đang kinh doanh'],
        ]);

        // 4. Seed NhaCungCap (6 Suppliers)
        DB::table('NhaCungCap')->insert([
            ['maNCC' => 'NCC001', 'tenNCC' => 'Tập Đoàn Bao Bì Tetra Pak Việt Nam', 'maSoThue' => '0301458999', 'diaChi' => 'KCN Việt Nam - Singapore, Bình Dương', 'soDienThoai' => '02743756888', 'email' => 'contact.vn@tetrapak.com'],
            ['maNCC' => 'NCC002', 'tenNCC' => 'Công Ty Cổ Phần Đường Biên Hòa (TTC Sugar)', 'maSoThue' => '3600258147', 'diaChi' => 'KCN Biên Hòa 1, Đồng Nai', 'soDienThoai' => '02513836121', 'email' => 'sales@ttcsugar.com.vn'],
            ['maNCC' => 'NCC003', 'tenNCC' => 'Hợp Tác Xã Nông Trại Bò Sữa Mộc Châu Farm', 'maSoThue' => '2600147258', 'diaChi' => 'Thị trấn Mộc Châu, Sơn La', 'soDienThoai' => '02123866112', 'email' => 'supply@mocchaudairy.com.vn'],
            ['maNCC' => 'NCC004', 'tenNCC' => 'Tập Đoàn Dinh Dưỡng Fonterra New Zealand Ltd', 'maSoThue' => '9900112233', 'diaChi' => 'Auckland, New Zealand / CN TP.HCM', 'soDienThoai' => '02838279999', 'email' => 'nzmp.vietnam@fonterra.com'],
            ['maNCC' => 'NCC005', 'tenNCC' => 'Công Ty Men Sống Chr. Hansen Denmark A/S', 'maSoThue' => '9900445566', 'diaChi' => 'Hoersholm, Đan Mạch', 'soDienThoai' => '02839101122', 'email' => 'chrhansen@danishmicrobiology.dk'],
            ['maNCC' => 'NCC006', 'tenNCC' => 'Trang Trại Sinh Thái Vinamilk Green Farm Tây Ninh', 'maSoThue' => '3901234567', 'diaChi' => 'Huyện Bến Cầu, Tây Ninh', 'soDienThoai' => '02763888999', 'email' => 'greenfarm.tayninh@vinamilk.com.vn'],
        ]);

        // 5. Seed KhachHang (6 Supermarket Chains / Distributors)
        DB::table('KhachHang')->insert([
            ['maKhachHang' => 'KH001', 'tenKhachHang' => 'Hệ Thống Siêu Thị Co.opmart Toàn Quốc (Saigon Co.op)', 'soDienThoai' => '02838360143', 'diaChi' => '131 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM', 'hanMucCongNo' => 500000000],
            ['maKhachHang' => 'KH002', 'tenKhachHang' => 'Chuỗi Cửa Hàng Vinamilk Giấc Mơ Sữa Việt', 'soDienThoai' => '1900636979', 'diaChi' => '10 Tân Trào, Tân Phú, Quận 7, TP.HCM', 'hanMucCongNo' => 1000000000],
            ['maKhachHang' => 'KH003', 'tenKhachHang' => 'Hệ Thống Siêu Thị WinMart / WinMart+ (Masan Group)', 'soDienThoai' => '02471066866', 'diaChi' => 'Số 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM', 'hanMucCongNo' => 800000000],
            ['maKhachHang' => 'KH004', 'tenKhachHang' => 'Đại Lý Tổng Phân Phối Sữa Miền Tây (Hậu Giang)', 'soDienThoai' => '02933878999', 'diaChi' => 'KCN Sông Hậu, Huyện Châu Thành, Hậu Giang', 'hanMucCongNo' => 350000000],
            ['maKhachHang' => 'KH005', 'tenKhachHang' => 'Tập Đoàn Bách Hóa Xanh (MWG)', 'soDienThoai' => '19001908', 'diaChi' => 'KCN Tân Bình, Tân Phú, TP.HCM', 'hanMucCongNo' => 600000000],
            ['maKhachHang' => 'KH006', 'tenKhachHang' => 'Hệ Thống Đại Lý Xuất Khẩu Sữa Trung Đông (Dubai UAE)', 'soDienThoai' => '00971432100', 'diaChi' => 'Jebel Ali Free Zone, Dubai, UAE', 'hanMucCongNo' => 2000000000],
        ]);

        // 6. Seed TonKho (12 Lots - FEFO priority, near expiry, low stock & normal)
        DB::table('TonKho')->insert([
            [
                'maTonKho' => 'LOT-NVL-20260901-01',
                'maNVL' => 'NVL001',
                'maSP' => null,
                'tenTonKho' => 'Lô Sữa Tươi Nguyên Chất Thô Mộc Châu - Đợt 1',
                'soLuongNhap' => 20000,
                'soLuongTonHienTai' => 15500,
                'ngaySanXuat' => Carbon::now()->subDays(10)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(15)->toDateString(), // FEFO Alert
                'trangThai' => 'Ưu tiên xuất FEFO',
                'ghiChu' => 'Bảo quản kho lạnh UHT 2-4 độ C',
            ],
            [
                'maTonKho' => 'LOT-NVL-20260905-02',
                'maNVL' => 'NVL002',
                'maSP' => null,
                'tenTonKho' => 'Lô Đường Tinh Luyện Biên Hòa Grade A',
                'soLuongNhap' => 10000,
                'soLuongTonHienTai' => 8500,
                'ngaySanXuat' => Carbon::now()->subDays(30)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(365)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Kho khô ráo',
            ],
            [
                'maTonKho' => 'LOT-NVL-20260907-03',
                'maNVL' => 'NVL003',
                'maSP' => null,
                'tenTonKho' => 'Lô Hương Liệu Dâu Tự Nhiên Firmenich',
                'soLuongNhap' => 500,
                'soLuongTonHienTai' => 80, // Low stock alert
                'ngaySanXuat' => Carbon::now()->subDays(60)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(180)->toDateString(),
                'trangThai' => 'Tồn kho thấp',
                'ghiChu' => 'Cần nhập bổ sung khẩn cấp',
            ],
            [
                'maTonKho' => 'LOT-NVL-20260908-04',
                'maNVL' => 'NVL004',
                'maSP' => null,
                'tenTonKho' => 'Lô Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml',
                'soLuongNhap' => 500000,
                'soLuongTonHienTai' => 420000,
                'ngaySanXuat' => Carbon::now()->subDays(15)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(720)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Kho bao bì tiệt trùng',
            ],
            [
                'maTonKho' => 'LOT-SP-20260902-FEFO1',
                'maNVL' => null,
                'maSP' => 'SP001',
                'tenTonKho' => 'Lô Thành Phẩm Sữa Tươi 100% Ít Đường 180ml (Batch FEFO-1)',
                'soLuongNhap' => 5000,
                'soLuongTonHienTai' => 1200, // FEFO Priority 1: Expiry in 10 days
                'ngaySanXuat' => Carbon::now()->subDays(45)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(10)->toDateString(),
                'trangThai' => 'Ưu tiên xuất FEFO',
                'ghiChu' => 'Xuất ngay cho siêu thị Co.opmart',
            ],
            [
                'maTonKho' => 'LOT-SP-20260908-FEFO2',
                'maNVL' => null,
                'maSP' => 'SP001',
                'tenTonKho' => 'Lô Thành Phẩm Sữa Tươi 100% Ít Đường 180ml (Batch FEFO-2)',
                'soLuongNhap' => 15000,
                'soLuongTonHienTai' => 14200,
                'ngaySanXuat' => Carbon::now()->subDays(5)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(120)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Kho tổng thành phẩm UHT',
            ],
            [
                'maTonKho' => 'LOT-SP-20260904-SC01',
                'maNVL' => null,
                'maSP' => 'SP003',
                'tenTonKho' => 'Lô Thành Phẩm Sữa Chua Ăn Vinamilk Có Đường 100g',
                'soLuongNhap' => 3000,
                'soLuongTonHienTai' => 850, // Near expiry alert: Expiry in 8 days
                'ngaySanXuat' => Carbon::now()->subDays(22)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(8)->toDateString(),
                'trangThai' => 'Ưu tiên xuất FEFO',
                'ghiChu' => 'Kho lạnh 4-8 độ C',
            ],
            [
                'maTonKho' => 'LOT-SP-20260909-GF01',
                'maNVL' => null,
                'maSP' => 'SP005',
                'tenTonKho' => 'Lô Sữa Tươi Nguyên Chất Vinamilk Green Farm 180ml',
                'soLuongNhap' => 8000,
                'soLuongTonHienTai' => 7600,
                'ngaySanXuat' => Carbon::now()->subDays(3)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(150)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Dòng sữa tươi sinh thái cao cấp',
            ],
            [
                'maTonKho' => 'LOT-SP-20260903-PB01',
                'maNVL' => null,
                'maSP' => 'SP006',
                'tenTonKho' => 'Lô Sữa Chua Uống Men Sống Probi 65ml',
                'soLuongNhap' => 12000,
                'soLuongTonHienTai' => 11000,
                'ngaySanXuat' => Carbon::now()->subDays(8)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(35)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Bảo quản mát 6-8 độ C',
            ],
            [
                'maTonKho' => 'LOT-SP-20260906-DA01',
                'maNVL' => null,
                'maSP' => 'SP007',
                'tenTonKho' => 'Lô Sữa Bột Dielac Alpha Gold Step 3 900g',
                'soLuongNhap' => 2000,
                'soLuongTonHienTai' => 1850,
                'ngaySanXuat' => Carbon::now()->subDays(20)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(730)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Sữa bột công thức lon thiếc',
            ],
            [
                'maTonKho' => 'LOT-NVL-20260910-05',
                'maNVL' => 'NVL005',
                'maSP' => null,
                'tenTonKho' => 'Lô Bột Sữa Gầy Skim Milk Powder NZMP Fonterra',
                'soLuongNhap' => 5000,
                'soLuongTonHienTai' => 4500,
                'ngaySanXuat' => Carbon::now()->subDays(40)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(365)->toDateString(),
                'trangThai' => 'Còn hạn',
                'ghiChu' => 'Nhập khẩu chính ngạch New Zealand',
            ],
            [
                'maTonKho' => 'LOT-NVL-20260902-06',
                'maNVL' => 'NVL006',
                'maSP' => null,
                'tenTonKho' => 'Lô Men Probiotics LGG Chr. Hansen Đan Mạch',
                'soLuongNhap' => 200,
                'soLuongTonHienTai' => 45, // Low stock alert
                'ngaySanXuat' => Carbon::now()->subDays(15)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(90)->toDateString(),
                'trangThai' => 'Tồn kho thấp',
                'ghiChu' => 'Men vi sinh sống đông khô',
            ]
        ]);

        // 7. Seed KhoNguyenVatLieu & KhoSanPham
        DB::table('KhoNguyenVatLieu')->insert([
            ['maKhoNVL' => 'KNVL01', 'maTonKho' => 'LOT-NVL-20260901-01', 'tinhTrangKhoNVL' => 'Bình thường', 'ghiChu' => 'Kho UHT Sữa Thô'],
            ['maKhoNVL' => 'KNVL02', 'maTonKho' => 'LOT-NVL-20260905-02', 'tinhTrangKhoNVL' => 'Bình thường', 'ghiChu' => 'Kho Khô Đường Tinh Luyện'],
            ['maKhoNVL' => 'KNVL03', 'maTonKho' => 'LOT-NVL-20260907-03', 'tinhTrangKhoNVL' => 'Tồn kho thấp', 'ghiChu' => 'Kho Phụ Gia Hương Liệu'],
            ['maKhoNVL' => 'KNVL04', 'maTonKho' => 'LOT-NVL-20260908-04', 'tinhTrangKhoNVL' => 'Bình thường', 'ghiChu' => 'Kho Bao Bì Vỏ Hộp'],
        ]);

        DB::table('KhoSanPham')->insert([
            ['maKhoSP' => 'KSP01', 'maTonKho' => 'LOT-SP-20260902-FEFO1', 'tinhTrangKhoSP' => 'Bình thường', 'ghiChu' => 'Khu vực ưu tiên xuất FEFO'],
            ['maKhoSP' => 'KSP02', 'maTonKho' => 'LOT-SP-20260904-SC01', 'tinhTrangKhoSP' => 'Bình thường', 'ghiChu' => 'Kho Lạnh Sữa Chua 4-8 độ C'],
            ['maKhoSP' => 'KSP03', 'maTonKho' => 'LOT-SP-20260909-GF01', 'tinhTrangKhoSP' => 'Bình thường', 'ghiChu' => 'Kho Tổng Thành Phẩm Green Farm'],
            ['maKhoSP' => 'KSP04', 'maTonKho' => 'LOT-SP-20260906-DA01', 'tinhTrangKhoSP' => 'Bình thường', 'ghiChu' => 'Kho Sữa Bột Dielac'],
        ]);

        // 8. Seed PhieuNhapNVL & ChiTietPhieuNhapNVL
        DB::table('PhieuNhapNVL')->insert([
            [
                'maPhieuNhapNVL' => 'PNNVL2026090101',
                'maNCC' => 'NCC003',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV001',
                'ngayNhap' => Carbon::now()->subDays(10)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Nhập 20,000 lít sữa tươi thô Mộc Châu kiểm nghiệm đạt ISO',
            ],
            [
                'maPhieuNhapNVL' => 'PNNVL2026090502',
                'maNCC' => 'NCC002',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV001',
                'ngayNhap' => Carbon::now()->subDays(5)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Nhập 10,000 kg đường tinh luyện Biên Hòa Grade A',
            ],
            [
                'maPhieuNhapNVL' => 'PNNVL2026090803',
                'maNCC' => 'NCC001',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV001',
                'ngayNhap' => Carbon::now()->subDays(2)->toDateString(),
                'trangThai' => 'Đã duyệt',
                'ghiChu' => 'Nhập 500,000 vỏ hộp Tetra Pak Brik Aseptic 180ml',
            ],
        ]);

        DB::table('ChiTietPhieuNhapNVL')->insert([
            [
                'maPhieuNhapNVL' => 'PNNVL2026090101',
                'maTonKho' => 'LOT-NVL-20260901-01',
                'soLuong' => 20000,
                'donGia' => 14500,
                'thanhTien' => 290000000,
                'ngaySanXuat' => Carbon::now()->subDays(10)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(15)->toDateString(),
                'ghiChu' => 'Kiểm nghiệm vi sinh đạt 100%',
            ],
            [
                'maPhieuNhapNVL' => 'PNNVL2026090502',
                'maTonKho' => 'LOT-NVL-20260905-02',
                'soLuong' => 10000,
                'donGia' => 21000,
                'thanhTien' => 210000000,
                'ngaySanXuat' => Carbon::now()->subDays(30)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(365)->toDateString(),
                'ghiChu' => 'Bao 50kg đóng kín',
            ],
            [
                'maPhieuNhapNVL' => 'PNNVL2026090803',
                'maTonKho' => 'LOT-NVL-20260908-04',
                'soLuong' => 500000,
                'donGia' => 450,
                'thanhTien' => 225000000,
                'ngaySanXuat' => Carbon::now()->subDays(15)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(720)->toDateString(),
                'ghiChu' => 'Cuộn màng tiệt trùng UHT',
            ]
        ]);

        // 9. Seed PhieuNhapSP & ChiTietPhieuNhapSP (Inbound Finished Goods from Factory)
        DB::table('PhieuNhapSP')->insert([
            [
                'maPhieuNhapSP' => 'PNSP2026090201',
                'maXuong' => 'XUONG-UHT-01',
                'maNVTao' => 'NV003',
                'maNVNhan' => 'NV001',
                'ngayNhap' => Carbon::now()->subDays(45)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Nhập 5,000 thùng Sữa tươi tiệt trùng 100% 180ml',
            ],
            [
                'maPhieuNhapSP' => 'PNSP2026090402',
                'maXuong' => 'XUONG-SUACHUA-02',
                'maNVTao' => 'NV003',
                'maNVNhan' => 'NV001',
                'ngayNhap' => Carbon::now()->subDays(22)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Nhập 3,000 lốc Sữa chua ăn có đường 100g',
            ],
            [
                'maPhieuNhapSP' => 'PNSP2026090803',
                'maXuong' => 'XUONG-UHT-01',
                'maNVTao' => 'NV003',
                'maNVNhan' => 'NV001',
                'ngayNhap' => Carbon::now()->subDays(5)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Nhập 15,000 thùng Sữa tươi tiệt trùng 100% 180ml (Batch FEFO-2)',
            ],
        ]);

        DB::table('ChiTietPhieuNhapSP')->insert([
            [
                'maPhieuNhapSP' => 'PNSP2026090201',
                'maTonKho' => 'LOT-SP-20260902-FEFO1',
                'soLuong' => 5000,
                'ngaySanXuat' => Carbon::now()->subDays(45)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(10)->toDateString(),
                'ghiChu' => 'QC đạt chuẩn Monde Selection',
            ],
            [
                'maPhieuNhapSP' => 'PNSP2026090402',
                'maTonKho' => 'LOT-SP-20260904-SC01',
                'soLuong' => 3000,
                'ngaySanXuat' => Carbon::now()->subDays(22)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(8)->toDateString(),
                'ghiChu' => 'Bảo quản kho mát ngay',
            ],
            [
                'maPhieuNhapSP' => 'PNSP2026090803',
                'maTonKho' => 'LOT-SP-20260908-FEFO2',
                'soLuong' => 15000,
                'ngaySanXuat' => Carbon::now()->subDays(5)->toDateString(),
                'hanSuDung' => Carbon::now()->addDays(120)->toDateString(),
                'ghiChu' => 'Nhập kho tổng',
            ]
        ]);

        // 10. Seed PhieuXuatNVL & ChiTietPhieuXuatNVL (Dispatch Raw Materials to Factory)
        DB::table('PhieuXuatNVL')->insert([
            [
                'maPhieuXuatNVL' => 'PXNVL2026090301',
                'maXuong' => 'XUONG-UHT-01',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV003',
                'ngayXuat' => Carbon::now()->subDays(4)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Xuất 4,500 lít sữa tươi thô cấp phát cho dây chuyền tiệt trùng UHT',
            ],
            [
                'maPhieuXuatNVL' => 'PXNVL2026090602',
                'maXuong' => 'XUONG-SUACHUA-02',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV003',
                'ngayXuat' => Carbon::now()->subDays(2)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Xuất 1,500 kg đường Biên Hòa phục vụ nấu mẻ sữa chua ăn',
            ],
        ]);

        DB::table('ChiTietPhieuXuatNVL')->insert([
            [
                'maPhieuXuatNVL' => 'PXNVL2026090301',
                'maTonKho' => 'LOT-NVL-20260901-01',
                'soLuong' => 4500,
                'ghiChu' => 'Xuất theo lệnh sản xuất LSX-UHT-20260903',
            ],
            [
                'maPhieuXuatNVL' => 'PXNVL2026090602',
                'maTonKho' => 'LOT-NVL-20260905-02',
                'soLuong' => 1500,
                'ghiChu' => 'Xuất theo lệnh sản xuất LSX-SC-20260906',
            ]
        ]);

        // 11. Seed PhieuXuatSP & ChiTietPhieuXuatSP (FEFO Dispatches to Supermarkets)
        DB::table('PhieuXuatSP')->insert([
            [
                'maPhieuXuatSP' => 'PXSP2026090501',
                'maKhachHang' => 'KH001', // Co.opmart
                'maNVTao' => 'NV001',
                'ngayXuat' => Carbon::now()->subDays(3)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Xuất 3,800 thùng Sữa tươi 180ml ưu tiên thuật toán FEFO lô HSD gần nhất',
            ],
            [
                'maPhieuXuatSP' => 'PXSP2026090702',
                'maKhachHang' => 'KH003', // WinMart
                'maNVTao' => 'NV001',
                'ngayXuat' => Carbon::now()->subDays(1)->toDateString(),
                'trangThai' => 'Đã hoàn thành',
                'ghiChu' => 'Xuất 2,150 lốc Sữa chua ăn Vinamilk cho siêu thị WinMart',
            ],
            [
                'maPhieuXuatSP' => 'PXSP2026091003',
                'maKhachHang' => 'KH002', // Cửa hàng Giấc Mơ Sữa Việt
                'maNVTao' => 'NV001',
                'ngayXuat' => Carbon::now()->toDateString(),
                'trangThai' => 'Chờ duyệt',
                'ghiChu' => 'Xuất 800 thùng Sữa tươi tiệt trùng FEFO đợt mới',
            ],
        ]);

        DB::table('ChiTietPhieuXuatSP')->insert([
            [
                'maPhieuXuatSP' => 'PXSP2026090501',
                'maTonKho' => 'LOT-SP-20260902-FEFO1',
                'soLuong' => 3800,
                'ghiChu' => 'Ưu tiên xuất lô gần HSD theo chuẩn ISO/HACCP',
            ],
            [
                'maPhieuXuatSP' => 'PXSP2026090702',
                'maTonKho' => 'LOT-SP-20260904-SC01',
                'soLuong' => 2150,
                'ghiChu' => 'Vận chuyển xe xe đông lạnh Vinamilk Express',
            ],
            [
                'maPhieuXuatSP' => 'PXSP2026091003',
                'maTonKho' => 'LOT-SP-20260908-FEFO2',
                'soLuong' => 800,
                'ghiChu' => 'Bàn giao cửa hàng Giấc Mơ Sữa Việt',
            ]
        ]);
    }
}
