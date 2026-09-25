<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DiverseDataSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today()->toDateString();
        $dateStr = Carbon::today()->format('Ymd');

        echo "=======================================================================\n";
        echo " TIẾN HÀNH NẠP 40+ DỮ LIỆU MỚI CHO MỖI PHÂN HỆ ERP (TỔNG > 200 BẢN GHI)\n";
        echo "=======================================================================\n";

        // =========================================================================
        // PHÂN HỆ 1: MASTER DATA & KHO TỒN (45 BẢN GHI)
        // =========================================================================
        echo "[1/5] Nạp dữ liệu Phân hệ Master Data & Kho Tồn...\n";

        $products = [
            ['maSanPham' => 'SP016', 'tenSanPham' => 'Sữa Tươi Tiệt Trùng Có Đường Vinamilk 180ml', 'donViTinh' => 'Lốc', 'hanSuDung' => '2027-05-15', 'donGia' => 32000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP017', 'tenSanPham' => 'Sữa Tươi Tiệt Trùng Hương Dâu Vinamilk 110ml', 'donViTinh' => 'Lốc', 'hanSuDung' => '2027-06-20', 'donGia' => 22000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP018', 'tenSanPham' => 'Sữa Chua Uống Men Sống Probi Có Đường 65ml', 'donViTinh' => 'Lốc', 'hanSuDung' => '2026-12-10', 'donGia' => 26500, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP019', 'tenSanPham' => 'Sữa Đặc Có Đường Ông Thọ Nhãn Xanh 380g', 'donViTinh' => 'Lon', 'hanSuDung' => '2028-02-15', 'donGia' => 24000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP020', 'tenSanPham' => 'Sữa Đặc Ngôi Sao Phương Nam Nhãn Xanh Lá 1280g', 'donViTinh' => 'Hộp', 'hanSuDung' => '2028-03-01', 'donGia' => 68000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP021', 'tenSanPham' => 'Sữa Hạt Dinh Dưỡng Super Nut 9 Loại Hạt 180ml', 'donViTinh' => 'Lốc', 'hanSuDung' => '2027-07-10', 'donGia' => 34000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP022', 'tenSanPham' => 'Kem Ăn Vinamilk Đậu Xanh Tràng Tiền 450ml', 'donViTinh' => 'Hộp', 'hanSuDung' => '2027-08-20', 'donGia' => 48000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP023', 'tenSanPham' => 'Phô Mai Miếng Vinamilk Hộp 8 Miếng 120g', 'donViTinh' => 'Hộp', 'hanSuDung' => '2027-09-15', 'donGia' => 39500, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP024', 'tenSanPham' => 'Sữa Bột Dielac Mama Gold Dành Cho Mẹ Mang Thể 900g', 'donViTinh' => 'Lon', 'hanSuDung' => '2028-05-10', 'donGia' => 415000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP025', 'tenSanPham' => 'Sữa Bột Sure Prevent Gold Cho Người Lớn Tuổi 850g', 'donViTinh' => 'Lon', 'hanSuDung' => '2028-06-01', 'donGia' => 560000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP026', 'tenSanPham' => 'Nước Táo Ép Nguyên Chất Vfresh 1L', 'donViTinh' => 'Hộp', 'hanSuDung' => '2027-04-25', 'donGia' => 44000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP027', 'tenSanPham' => 'Sữa Tươi 100% Organic Đà Lạt Hộp 1L', 'donViTinh' => 'Hộp', 'hanSuDung' => '2027-03-30', 'donGia' => 49000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP028', 'tenSanPham' => 'Sữa Chua Ăn Vinamilk Nha Đam 100g', 'donViTinh' => 'Hủ', 'hanSuDung' => '2026-11-20', 'donGia' => 9000, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP029', 'tenSanPham' => 'Sữa Chua Ăn Vinamilk Trái Cây Mới 100g', 'donViTinh' => 'Hủ', 'hanSuDung' => '2026-11-28', 'donGia' => 9800, 'trangThai' => 'Đang kinh doanh'],
            ['maSanPham' => 'SP030', 'tenSanPham' => 'Bơ Lạt Cao Cấp Vinamilk Chế Biến 200g', 'donViTinh' => 'Thỏi', 'hanSuDung' => '2027-07-01', 'donGia' => 62000, 'trangThai' => 'Đang kinh doanh'],
        ];
        foreach ($products as $p) {
            DB::table('SanPham')->updateOrInsert(['maSanPham' => $p['maSanPham']], $p);
        }

        $materials = [
            ['maNVL' => 'NVL016', 'maLoaiNVL' => 'LNVL01', 'tenNVL' => 'Sữa Bột Nguyên Kem Nhập Khẩu New Zealand Fonterra', 'donVi' => 'Bao 25kg', 'ghiChu' => 'Sữa bột tiêu chuẩn quốc tế ISO 22000'],
            ['maNVL' => 'NVL017', 'maLoaiNVL' => 'LNVL01', 'tenNVL' => 'Sữa Bột Gầy Skimmed Milk Powder Châu Âu', 'donVi' => 'Bao 25kg', 'ghiChu' => 'Dùng chế biến các dòng sữa tách béo'],
            ['maNVL' => 'NVL018', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Đường Tinh Luyện Biên Hòa RE Cao Cấp', 'donVi' => 'Bao 50kg', 'ghiChu' => 'Đường độ tinh khiết 99.9%'],
            ['maNVL' => 'NVL019', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Nước Táo Ép Cô Đặc Nhập Khẩu Ba Lan', 'donVi' => 'Phuy 200L', 'ghiChu' => 'Nguyên liệu làm nước trái cây Vfresh'],
            ['maNVL' => 'NVL020', 'maLoaiNVL' => 'LNVL06', 'tenNVL' => 'Thạch Nha Đam Cắt Hạt Mạch Tiệt Trùng', 'donVi' => 'Túi 5kg', 'ghiChu' => 'Thạch nha đam tươi dùng cho sữa chua nha đam'],
            ['maNVL' => 'NVL021', 'maLoaiNVL' => 'LNVL06', 'tenNVL' => 'Hạt Hạnh Nhân Sấy Chín Nhập Khẩu California Mỹ', 'donVi' => 'Kg', 'ghiChu' => 'Nguyên liệu chính cho dòng Super Nut'],
            ['maNVL' => 'NVL022', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Men Sống Probiotics Lactobacillus Chr. Hansen Đan Mạch', 'donVi' => 'Lọ 500g', 'ghiChu' => 'Chủng men vi sinh Probi độc quyền'],
            ['maNVL' => 'NVL023', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Hương Dâu Tự Nhiên Nhập Khẩu Thụy Sĩ', 'donVi' => 'Lít', 'ghiChu' => 'Tạo hương vị cho dòng sữa dâu'],
            ['maNVL' => 'NVL024', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Vỏ Hộp Giấy Tetra Pak Aseptic 180ml Tiệt Trùng', 'donVi' => 'Cuộn 5000 vỏ', 'ghiChu' => 'Vỏ hộp màng 6 lớp bảo quản tiệt trùng'],
            ['maNVL' => 'NVL025', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Vỏ Hộp Giấy Combibloc 1L Tiệt Trùng Kèm Nắp', 'donVi' => 'Cuộn 3000 vỏ', 'ghiChu' => 'Đóng gói dòng sữa 1L và Vfresh'],
            ['maNVL' => 'NVL026', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Thùng Carton Vinamilk In Offset 48 Hộp 180ml', 'donVi' => 'Cái', 'ghiChu' => 'Thùng carton 3 lớp chịu lực xuất khẩu'],
            ['maNVL' => 'NVL027', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Hủ Nhựa PP Vô Trùng Đóng Sữa Chua 100g', 'donVi' => 'Bộ 4 hủ', 'ghiChu' => 'Hủ nhựa đạt chuẩn an toàn thực phẩm FDA'],
            ['maNVL' => 'NVL028', 'maLoaiNVL' => 'LNVL03', 'tenNVL' => 'Lon Thiếc 900g Nắp Bật Đóng Sữa Bột Dielac', 'donVi' => 'Cái', 'ghiChu' => 'Vỏ lon thiếc chống oxy hóa'],
            ['maNVL' => 'NVL029', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Dầu Thực Vật Tinh Luyện Ovisure', 'donVi' => 'Can 25L', 'ghiChu' => 'Bổ sung chất béo cho sữa bột dinh dưỡng'],
            ['maNVL' => 'NVL030', 'maLoaiNVL' => 'LNVL02', 'tenNVL' => 'Bộ Vi Chất Dinh Dưỡng Vitamin A, D3, K2 & Ca-Mg', 'donVi' => 'Kg', 'ghiChu' => 'Vi chất bổ sung cho dòng Dielac Alpha Gold'],
        ];
        foreach ($materials as $m) {
            DB::table('NguyenVatLieu')->updateOrInsert(['maNVL' => $m['maNVL']], $m);
        }

        $lots = [];
        for ($i = 10; $i <= 17; $i++) {
            $spId = sprintf('SP%03d', $i + 6);
            $lots[] = [
                'maTonKho' => "LOT-SP-{$dateStr}-{$i}",
                'maSanPham' => $spId,
                'maNVL' => null,
                'tenTonKho' => "Lô Sản Phẩm Vinamilk Đợt {$i} - Tiêu chuẩn ISO",
                'maKho' => 'K004',
                'soLuongTonHienTai' => 1500 + ($i * 200),
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addMonths(6)->toDateString(),
                'trangThai' => 'Còn hạn',
            ];
        }
        for ($i = 10; $i <= 16; $i++) {
            $nvlId = sprintf('NVL%03d', $i + 6);
            $lots[] = [
                'maTonKho' => "LOT-NVL-{$dateStr}-{$i}",
                'maSanPham' => null,
                'maNVL' => $nvlId,
                'tenTonKho' => "Lô Nguyên Vật Liệu Nhập Kho Đợt {$i}",
                'maKho' => 'K001',
                'soLuongTonHienTai' => 800 + ($i * 100),
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addYear()->toDateString(),
                'trangThai' => 'Còn hạn',
            ];
        }
        foreach ($lots as $l) {
            DB::table('TonKho')->updateOrInsert(['maTonKho' => $l['maTonKho']], $l);
        }

        // =========================================================================
        // PHÂN HỆ 2: CHỨNG TỪ KHO NHẬP XUẤT (40 CHỨNG TỪ + DETAILS)
        // =========================================================================
        echo "[2/5] Nạp dữ liệu Phân hệ Chứng Từ Nhập/Xuất Kho (40 Phiếu)...\n";

        for ($i = 10; $i <= 19; $i++) {
            $pnnvlId = "PNNVL{$dateStr}{$i}";
            $lotId = "LOT-NVL-{$dateStr}-" . ($i % 7 + 10);
            DB::table('PhieuNhapNVL')->updateOrInsert(['maPhieuNhapNVL' => $pnnvlId], [
                'maPhieuNhapNVL' => $pnnvlId,
                'maNCC' => ($i % 2 == 0) ? 'NCC001' : 'NCC002',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV002',
                'ngayNhap' => $today,
                'trangThai' => ($i % 3 == 0) ? 'Chờ duyệt' : 'Hoàn thành',
                'ghiChu' => "Nhập kho nguyên liệu sản xuất lô số {$i}",
            ]);
            DB::table('ChiTietPhieuNhapNVL')->updateOrInsert(['maPhieuNhapNVL' => $pnnvlId, 'maTonKho' => $lotId], [
                'maPhieuNhapNVL' => $pnnvlId,
                'maTonKho' => $lotId,
                'soLuong' => 500 + ($i * 50),
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addYear()->toDateString(),
            ]);
        }

        for ($i = 10; $i <= 19; $i++) {
            $pnspId = "PNSP{$dateStr}{$i}";
            $lotId = "LOT-SP-{$dateStr}-" . ($i % 8 + 10);
            DB::table('PhieuNhapSP')->updateOrInsert(['maPhieuNhapSP' => $pnspId], [
                'maPhieuNhapSP' => $pnspId,
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV002',
                'ngayNhap' => $today,
                'trangThai' => ($i % 3 == 0) ? 'Chờ duyệt' : 'Hoàn thành',
                'ghiChu' => "Bàn giao thành phẩm từ xưởng sản xuất ca {$i}",
            ]);
            DB::table('ChiTietPhieuNhapSP')->updateOrInsert(['maPhieuNhapSP' => $pnspId, 'maTonKho' => $lotId], [
                'maPhieuNhapSP' => $pnspId,
                'maTonKho' => $lotId,
                'soLuongNhap' => 1000 + ($i * 100),
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addMonths(6)->toDateString(),
            ]);
        }

        for ($i = 10; $i <= 19; $i++) {
            $pxnvlId = "PXNVL{$dateStr}{$i}";
            $lotId = "LOT-NVL-{$dateStr}-" . ($i % 7 + 10);
            DB::table('PhieuXuatNVL')->updateOrInsert(['maPhieuXuatNVL' => $pxnvlId], [
                'maPhieuXuatNVL' => $pxnvlId,
                'maXuong' => 'X001',
                'maNVTao' => 'NV001',
                'maNVNhan' => 'NV003',
                'ngayXuat' => $today,
                'trangThai' => ($i % 4 == 0) ? 'Chờ duyệt' : 'Hoàn thành',
                'ghiChu' => "Xuất kho nguyên liệu cấp phát ca sản xuất {$i}",
            ]);
            DB::table('ChiTietPhieuXuatNVL')->updateOrInsert(['maPhieuXuatNVL' => $pxnvlId, 'maTonKho' => $lotId], [
                'maPhieuXuatNVL' => $pxnvlId,
                'maTonKho' => $lotId,
                'soLuong' => 300 + ($i * 30),
                'ghiChu' => 'Xuất cấp phát nguyên liệu xưởng',
            ]);
        }

        for ($i = 10; $i <= 19; $i++) {
            $pxspId = "PXSP{$dateStr}{$i}";
            $lotId = "LOT-SP-{$dateStr}-" . ($i % 8 + 10);
            DB::table('PhieuXuatSP')->updateOrInsert(['maPhieuXuatSP' => $pxspId], [
                'maPhieuXuatSP' => $pxspId,
                'maKhachHang' => 'KH001',
                'maNVTao' => 'NV001',
                'ngayXuat' => $today,
                'trangThai' => ($i % 4 == 0) ? 'Chờ duyệt' : 'Hoàn thành',
                'ghiChu' => "Xuất kho giao đại lý / siêu thị đợt {$i}",
            ]);
            DB::table('ChiTietPhieuXuatSP')->updateOrInsert(['maPhieuXuatSP' => $pxspId, 'maTonKho' => $lotId], [
                'maPhieuXuatSP' => $pxspId,
                'maTonKho' => $lotId,
                'soLuong' => 400 + ($i * 40),
                'ghiChu' => 'Xuất kho thành phẩm thương mại',
            ]);
        }

        // =========================================================================
        // PHÂN HỆ 3: BÁN HÀNG & PHÂN PHỐI (41 BẢN GHI)
        // =========================================================================
        echo "[3/5] Nạp dữ liệu Phân hệ Bán Hàng (41 Bản ghi)...\n";

        $customers = [
            ['maKhachHang' => 'KH008', 'tenKhachHang' => 'Chuỗi Đại Siêu Thị GO! An Lạc (Central Retail)', 'soDienThoai' => '02837541122', 'diaChi' => '1231 Quốc Lộ 1A, Khu Phố 5, Phường Bình Trị Đông B, Quận Bình Tân, TP.HCM', 'hanMucCongNo' => 300000000],
            ['maKhachHang' => 'KH009', 'tenKhachHang' => 'Hệ Thống Siêu Thị MM Mega Market An Phú', 'soDienThoai' => '02837400999', 'diaChi' => 'Khu đô thị mới An Phú - An Khánh, Phường An Phú, TP. Thủ Đức, TP.HCM', 'hanMucCongNo' => 250000000],
            ['maKhachHang' => 'KH010', 'tenKhachHang' => 'Trung Tâm Thương Mại AEON Mall Tân Phú Celadon', 'soDienThoai' => '02862887722', 'diaChi' => '30 Bờ Bao Tân Thắng, Phường Sơn Kỳ, Quận Tân Phú, TP.HCM', 'hanMucCongNo' => 400000000],
            ['maKhachHang' => 'KH011', 'tenKhachHang' => 'Chuỗi Cửa Hàng Tiện Lợi Bách Hóa Xanh Khu Vực Miền Nam', 'soDienThoai' => '19001908', 'diaChi' => '128 Trần Quang Khải, Phường Tân Định, Quận 1, TP.HCM', 'hanMucCongNo' => 500000000],
            ['maKhachHang' => 'KH012', 'tenKhachHang' => 'Hệ Thống Cửa Hàng GS25 Việt Nam', 'soDienThoai' => '02873001825', 'diaChi' => '106 Nguyễn Văn Trỗi, Phường 8, Quận Phú Nhuận, TP.HCM', 'hanMucCongNo' => 120000000],
            ['maKhachHang' => 'KH013', 'tenKhachHang' => 'Hệ Thống Tiện Lợi 7-Eleven Việt Nam', 'soDienThoai' => '02871007711', 'diaChi' => '412 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP.HCM', 'hanMucCongNo' => 180000000],
            ['maKhachHang' => 'KH014', 'tenKhachHang' => 'Nhà Phân Phối Độc Quyền Vinamilk Cần Thơ - Nam Sông Hậu', 'soDienThoai' => '02923838999', 'diaChi' => 'Khu Công Nghiệp Trà Nóc 1, Phường Trà Nóc, Quận Bình Thủy, Cần Thơ', 'hanMucCongNo' => 600000000],
            ['maKhachHang' => 'KH015', 'tenKhachHang' => 'Tổng Đại Lý Tiêu Dùng Miền Bắc - Chi Nhánh Hà Nội', 'soDienThoai' => '02438521188', 'diaChi' => 'Số 9 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, Hà Nội', 'hanMucCongNo' => 800000000],
            ['maKhachHang' => 'KH016', 'tenKhachHang' => 'Công Ty CP Thương Mại Dịch Vụ Lotte Mart Việt Nam', 'soDienThoai' => '02837753232', 'diaChi' => '469 Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP.HCM', 'hanMucCongNo' => 350000000],
            ['maKhachHang' => 'KH017', 'tenKhachHang' => 'Ban Điều Hành Chương Trình Sữa Học Đường TP.HCM', 'soDienThoai' => '02838291122', 'diaChi' => '66-68 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP.HCM', 'hanMucCongNo' => 1000000000],
        ];
        foreach ($customers as $c) {
            DB::table('KhachHang')->updateOrInsert(['maKhachHang' => $c['maKhachHang']], $c);
        }

        for ($i = 10; $i <= 24; $i++) {
            $dhId = "DH{$dateStr}{$i}";
            $khId = sprintf('KH%03d', ($i % 10) + 8);
            $spId = sprintf('SP%03d', ($i % 15) + 16);
            $amount = 12000000 + ($i * 1500000);
            DB::table('DonHang')->updateOrInsert(['maDonHang' => $dhId], [
                'maDonHang' => $dhId,
                'maKhachHang' => $khId,
                'maNhanVien' => 'NV001',
                'ngayMua' => $today,
                'tongTien' => $amount,
                'trangThai' => ($i % 3 == 0) ? 'Chờ xác nhận' : 'Đã xác nhận',
            ]);
            DB::table('ChiTietDonHang')->updateOrInsert(['maDonHang' => $dhId, 'maSanPham' => $spId], [
                'maDonHang' => $dhId,
                'maSanPham' => $spId,
                'soLuong' => 300 + ($i * 20),
                'donGia' => 32000,
            ]);
        }

        for ($i = 10; $i <= 17; $i++) {
            $ghId = "GH{$dateStr}{$i}";
            $dhId = "DH{$dateStr}{$i}";
            $pxspId = "PXSP{$dateStr}{$i}";
            $khId = sprintf('KH%03d', ($i % 10) + 8);
            DB::table('GiaoHang')->updateOrInsert(['maGiaoHang' => $ghId], [
                'maGiaoHang' => $ghId,
                'maDonHang' => $dhId,
                'maPhieuXuatSP' => $pxspId,
                'maKhachHang' => $khId,
                'maNV' => 'NV004',
                'ngayGiao' => $today,
                'diaChiGiao' => 'Khu trung chuyển logistics Vinamilk',
                'trangThai' => ($i % 2 == 0) ? 'Đã giao' : 'Đang giao',
            ]);

            $hdId = "HD{$dateStr}{$i}";
            DB::table('HoaDon')->updateOrInsert(['maHoaDon' => $hdId], [
                'maHoaDon' => $hdId,
                'maGiaoHang' => $ghId,
                'tongTien' => 15000000 + ($i * 1000000),
                'ngayLap' => $today,
            ]);
        }

        // =========================================================================
        // PHÂN HỆ 4: QUẢN LÝ SẢN XUẤT (40 BẢN GHI)
        // =========================================================================
        echo "[4/5] Nạp dữ liệu Phân hệ Quản Lý Sản Xuất (40 Bản ghi)...\n";

        for ($i = 10; $i <= 21; $i++) {
            $lsxId = "LSX{$dateStr}{$i}";
            $spId = sprintf('SP%03d', ($i % 15) + 16);
            DB::table('LenhSanXuat')->updateOrInsert(['maLenh' => $lsxId], [
                'maLenh' => $lsxId,
                'tenLenh' => "Kế hoạch sản xuất dòng sản phẩm tiệt trùng ca {$i}",
                'maNhanVien' => 'NV001',
                'ngayTaoLenh' => $today,
                'trangThai' => ($i % 3 == 0) ? 'Chờ duyệt' : 'Đang sản xuất',
            ]);
            DB::table('ChiTietLenhSanXuat')->updateOrInsert(['maLenh' => $lsxId, 'maSanPham' => $spId], [
                'maLenh' => $lsxId,
                'maSanPham' => $spId,
                'soLuong' => 5000 + ($i * 500),
                'ghiChu' => "Sản xuất theo kế hoạch đợt {$i}",
            ]);
        }

        for ($i = 10; $i <= 19; $i++) {
            $pntId = "PNT{$dateStr}{$i}";
            $lsxId = "LSX{$dateStr}" . ($i % 12 + 10);
            DB::table('PhieuNghiemThu')->updateOrInsert(['maPhieuNghiemThu' => $pntId], [
                'maPhieuNghiemThu' => $pntId,
                'maLenh' => $lsxId,
                'maNhanVien' => 'NV001',
                'ngayNghiemThu' => $today,
                'tongSoLuongSanPham' => 8000,
                'tongSoLuongDat' => 7980,
                'tongSoLuongKhongDat' => 20,
                'ghiChu' => 'Đạt tiêu chuẩn QC ISO/HACCP 99.75%',
            ]);
        }

        for ($i = 10; $i <= 19; $i++) {
            $ycxspId = "YCXSP{$dateStr}{$i}";
            $pntId = "PNT{$dateStr}{$i}";
            DB::table('PhieuYeuCauXuatSP')->updateOrInsert(['maPhieuYCXSP' => $ycxspId], [
                'maPhieuYCXSP' => $ycxspId,
                'maPhieuNghiemThu' => $pntId,
                'maNhanVien' => 'NV001',
                'ngayYeuCau' => $today,
                'trangThai' => ($i % 2 == 0) ? 'Đã nhập kho' : 'Chưa xử lý',
                'ghiChu' => "Bàn giao sản phẩm đạt QC từ PNT{$dateStr}{$i}",
            ]);
        }

        for ($i = 10; $i <= 17; $i++) {
            $dnId = "DNSP{$dateStr}{$i}";
            $spId = sprintf('SP%03d', ($i % 15) + 16);
            DB::table('DeNghiBoSungSanPham')->updateOrInsert(['maDeNghi' => $dnId], [
                'maDeNghi' => $dnId,
                'maSanPham' => $spId,
                'maKho' => 'K004',
                'soLuong' => 3000 + ($i * 200),
                'ngayCanHang' => Carbon::today()->addDays(5)->toDateString(),
                'ngayDeNghi' => $today,
                'trangThai' => 'ChoDuyet',
                'maNV' => 'NV001',
                'ghiChu' => "Tồn kho {$spId} sắp chạm ngưỡng an toàn tối thiểu",
            ]);
        }

        // =========================================================================
        // PHÂN HỆ 5: TÀI CHÍNH - KẾ TOÁN (40 BẢN GHI)
        // =========================================================================
        echo "[5/5] Nạp dữ liệu Phân hệ Tài Chính - Kế Toán (40 Bản ghi)...\n";

        for ($i = 8; $i <= 17; $i++) {
            $khId = sprintf('KH%03d', $i);
            DB::table('DoiTuongGiaoDich')->updateOrInsert(['maDoiTuong' => "DT-{$khId}"], [
                'maDoiTuong' => "DT-{$khId}",
                'maThamChieu' => $khId,
                'loaiDoiTuong' => 'KhachHang',
                'trangThai' => 1,
            ]);
        }

        $cashAcc = DB::table('TaiKhoanQuy')->where('loaiTaiKhoan', 'TM')->first();
        $bankAcc = DB::table('TaiKhoanQuy')->where('loaiTaiKhoan', 'NH')->first();
        $cashAccId = $cashAcc ? $cashAcc->maTaiKhoanQuy : 'TKQ-TM01';
        $bankAccId = $bankAcc ? $bankAcc->maTaiKhoanQuy : 'TKQ-VCB01';

        for ($i = 10; $i <= 24; $i++) {
            $ptId = "PT{$dateStr}{$i}";
            $khId = sprintf('DT-KH%03d', ($i % 10) + 8);
            DB::table('PhieuThu')->updateOrInsert(['maPhieuThu' => $ptId], [
                'maPhieuThu' => $ptId,
                'ngayThu' => $today,
                'maDoiTuong' => $khId,
                'lyDoThu' => "Thu tiền thanh toán đơn hàng đợt {$i} từ đối tác phân phối Vinamilk",
                'phuongThucThu' => ($i % 2 == 0) ? 'CK' : 'TM',
                'maTaiKhoanQuy' => ($i % 2 == 0) ? $bankAccId : $cashAccId,
                'soTien' => 10000000 + ($i * 2000000),
                'trangThai' => ($i % 3 == 0) ? 'Moi' : 'DaDuyet',
                'nguoiLap' => 'NV001',
            ]);
        }

        for ($i = 10; $i <= 24; $i++) {
            $pcId = "PC{$dateStr}{$i}";
            $dtId = ($i % 2 == 0) ? 'DT-NCC001' : 'DT-NCC002';
            DB::table('PhieuChi')->updateOrInsert(['maPhieuChi' => $pcId], [
                'maPhieuChi' => $pcId,
                'ngayChi' => $today,
                'maDoiTuong' => $dtId,
                'lyDoChi' => "Thanh toán tiền mua nguyên liệu & bao bì đóng gói đợt {$i}",
                'phuongThucChi' => ($i % 2 == 0) ? 'CK' : 'TM',
                'maTaiKhoanQuy' => ($i % 2 == 0) ? $bankAccId : $cashAccId,
                'soTien' => 15000000 + ($i * 2500000),
                'trangThai' => ($i % 3 == 0) ? 'Moi' : 'DaDuyet',
                'nguoiLap' => 'NV001',
            ]);
        }

        echo "\n>>> HOÀN THÀNH: ĐÃ NẠP THÀNH CÔNG HƠN 200 DỮ LIỆU ERP MỚI ĐA DẠNG CHO 5 PHÂN HỆ! <<<\n";
    }
}
