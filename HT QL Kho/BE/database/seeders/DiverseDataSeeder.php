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

        // 1. MASTER DATA: SẢN PHẨM MỚI (5 SP)
        $products = [
            [
                'maSanPham' => 'SP011',
                'tenSanPham' => 'Sữa Tươi 100% Không Đường Vinamilk 1L',
                'donViTinh' => 'Hộp',
                'hanSuDung' => '2027-03-25',
                'donGia' => 35000,
                'trangThai' => 'Đang kinh doanh',
            ],
            [
                'maSanPham' => 'SP012',
                'tenSanPham' => 'Sữa Hạt Óc Chó Vinamilk 180ml',
                'donViTinh' => 'Lốc',
                'hanSuDung' => '2027-04-10',
                'donGia' => 28000,
                'trangThai' => 'Đang kinh doanh',
            ],
            [
                'maSanPham' => 'SP013',
                'tenSanPham' => 'Sữa Chua Ăn Vinamilk Nếp Cẩm 100g',
                'donViTinh' => 'Hủ',
                'hanSuDung' => '2026-11-15',
                'donGia' => 9500,
                'trangThai' => 'Đang kinh doanh',
            ],
            [
                'maSanPham' => 'SP014',
                'tenSanPham' => 'Sữa Bột Dielac Alpha Gold Step 3 900g',
                'donViTinh' => 'Lon',
                'hanSuDung' => '2028-01-20',
                'donGia' => 385000,
                'trangThai' => 'Đang kinh doanh',
            ],
            [
                'maSanPham' => 'SP015',
                'tenSanPham' => 'Nước Cam Ép Vfresh 100% Vinamilk 1L',
                'donViTinh' => 'Hộp',
                'hanSuDung' => '2027-02-28',
                'donGia' => 42000,
                'trangThai' => 'Đang kinh doanh',
            ],
        ];

        foreach ($products as $p) {
            DB::table('SanPham')->updateOrInsert(['maSanPham' => $p['maSanPham']], $p);
        }

        // 2. MASTER DATA: NGUYÊN VẬT LIỆU MỚI (5 NVL)
        $materials = [
            [
                'maNVL' => 'NVL011',
                'maLoaiNVL' => 'LNVL02',
                'tenNVL' => 'Bột Ca Cao Nguyên Chất Nhập Khẩu Bỉ',
                'donVi' => 'Kg',
                'ghiChu' => 'Bột ca cao hương vị đậm đà nguyên chất 100%',
            ],
            [
                'maNVL' => 'NVL012',
                'maLoaiNVL' => 'LNVL06',
                'tenNVL' => 'Hạt Óc Chó Hữu Cơ Nhập Khẩu Mỹ',
                'donVi' => 'Kg',
                'ghiChu' => 'Hạt óc chó sấy khô tuyển chọn đạt chứng nhận USDA Organic',
            ],
            [
                'maNVL' => 'NVL013',
                'maLoaiNVL' => 'LNVL06',
                'tenNVL' => 'Nếp Cẩm Tây Bắc Dẻo Thơm',
                'donVi' => 'Kg',
                'ghiChu' => 'Hạt nếp cẩm chọn lọc từ vùng cao Điện Biên',
            ],
            [
                'maNVL' => 'NVL014',
                'maLoaiNVL' => 'LNVL02',
                'tenNVL' => 'Hương Vani Tự Nhiên Pháp',
                'donVi' => 'Lít',
                'ghiChu' => 'Tinh chất hương vani chiết xuất tự nhiên dùng cho sữa chua',
            ],
            [
                'maNVL' => 'NVL015',
                'maLoaiNVL' => 'LNVL03',
                'tenNVL' => 'Màng Nhôm Niêm Phong Lon Sữa 900g',
                'donVi' => 'Cuộn',
                'ghiChu' => 'Màng nhôm vô trùng đóng lon sữa bột Dielac Alpha Gold',
            ],
        ];

        foreach ($materials as $m) {
            DB::table('NguyenVatLieu')->updateOrInsert(['maNVL' => $m['maNVL']], $m);
        }

        // 3. TỒN KHO THEO LÔ (8 LOTS)
        $lots = [
            [
                'maTonKho' => "LOT-SP-{$dateStr}-01",
                'maSanPham' => 'SP011',
                'maNVL' => null,
                'tenTonKho' => 'Lô Sữa Tươi Không Đường 1L - Ca Sáng',
                'maKho' => 'K004',
                'soLuongTonHienTai' => 2500,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addMonths(6)->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
            [
                'maTonKho' => "LOT-SP-{$dateStr}-02",
                'maSanPham' => 'SP012',
                'maNVL' => null,
                'tenTonKho' => 'Lô Sữa Hạt Óc Chó 180ml',
                'maKho' => 'K004',
                'soLuongTonHienTai' => 4000,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addMonths(8)->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
            [
                'maTonKho' => "LOT-SP-{$dateStr}-03",
                'maSanPham' => 'SP013',
                'maNVL' => null,
                'tenTonKho' => 'Lô Sữa Chua Nếp Cẩm 100g',
                'maKho' => 'K004',
                'soLuongTonHienTai' => 3200,
                'ngaySanXuat' => Carbon::today()->subDays(20)->toDateString(),
                'hanSuDung' => Carbon::today()->addDays(25)->toDateString(),
                'trangThai' => 'Ưu tiên xuất FEFO',
            ],
            [
                'maTonKho' => "LOT-SP-{$dateStr}-04",
                'maSanPham' => 'SP014',
                'maNVL' => null,
                'tenTonKho' => 'Lô Lon Sữa Bột Dielac Step 3',
                'maKho' => 'K004',
                'soLuongTonHienTai' => 1200,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addYears(2)->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
            [
                'maTonKho' => "LOT-SP-{$dateStr}-05",
                'maSanPham' => 'SP015',
                'maNVL' => null,
                'tenTonKho' => 'Lô Nước Cam Ép Vfresh 1L',
                'maKho' => 'K004',
                'soLuongTonHienTai' => 1800,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addYear()->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
            [
                'maTonKho' => "LOT-NVL-{$dateStr}-01",
                'maSanPham' => null,
                'maNVL' => 'NVL011',
                'tenTonKho' => 'Lô Bột Ca Cao Bỉ Nhập Khẩu',
                'maKho' => 'K001',
                'soLuongTonHienTai' => 800,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addYear()->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
            [
                'maTonKho' => "LOT-NVL-{$dateStr}-02",
                'maSanPham' => null,
                'maNVL' => 'NVL012',
                'tenTonKho' => 'Lô Hạt Óc Chó Mỹ Hữu Cơ',
                'maKho' => 'K001',
                'soLuongTonHienTai' => 600,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addMonths(10)->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
            [
                'maTonKho' => "LOT-NVL-{$dateStr}-03",
                'maSanPham' => null,
                'maNVL' => 'NVL013',
                'tenTonKho' => 'Lô Nếp Cẩm Điện Biên',
                'maKho' => 'K002',
                'soLuongTonHienTai' => 1500,
                'ngaySanXuat' => $today,
                'hanSuDung' => Carbon::today()->addMonths(8)->toDateString(),
                'trangThai' => 'Còn hạn',
            ],
        ];

        foreach ($lots as $l) {
            DB::table('TonKho')->updateOrInsert(['maTonKho' => $l['maTonKho']], $l);
        }

        // 4. KHO & CHỨNG TỪ NHẬP/XUẤT (8 RECORDS)
        DB::table('PhieuNhapNVL')->updateOrInsert(['maPhieuNhapNVL' => "PNNVL{$dateStr}01"], [
            'maPhieuNhapNVL' => "PNNVL{$dateStr}01",
            'maNCC' => 'NCC001',
            'maNVTao' => 'NV001',
            'maNVNhan' => 'NV002',
            'ngayNhap' => $today,
            'trangThai' => 'Hoàn thành',
            'ghiChu' => 'Nhập kho ca cao Bỉ nhập khẩu đợt 1',
        ]);
        DB::table('ChiTietPhieuNhapNVL')->updateOrInsert(['maPhieuNhapNVL' => "PNNVL{$dateStr}01", 'maTonKho' => "LOT-NVL-{$dateStr}-01"], [
            'maPhieuNhapNVL' => "PNNVL{$dateStr}01",
            'maTonKho' => "LOT-NVL-{$dateStr}-01",
            'soLuong' => 800,
            'ngaySanXuat' => $today,
            'hanSuDung' => Carbon::today()->addYear()->toDateString(),
        ]);

        DB::table('PhieuNhapNVL')->updateOrInsert(['maPhieuNhapNVL' => "PNNVL{$dateStr}02"], [
            'maPhieuNhapNVL' => "PNNVL{$dateStr}02",
            'maNCC' => 'NCC002',
            'maNVTao' => 'NV001',
            'maNVNhan' => 'NV002',
            'ngayNhap' => $today,
            'trangThai' => 'Chờ duyệt',
            'ghiChu' => 'Nhập kho hạt óc chó Mỹ đợt 2',
        ]);

        DB::table('PhieuNhapSP')->updateOrInsert(['maPhieuNhapSP' => "PNSP{$dateStr}01"], [
            'maPhieuNhapSP' => "PNSP{$dateStr}01",
            'maNVTao' => 'NV001',
            'maNVNhan' => 'NV002',
            'ngayNhap' => $today,
            'trangThai' => 'Hoàn thành',
            'ghiChu' => 'Bàn giao sản phẩm sữa tươi không đường 1L từ xưởng sản xuất',
        ]);
        DB::table('ChiTietPhieuNhapSP')->updateOrInsert(['maPhieuNhapSP' => "PNSP{$dateStr}01", 'maTonKho' => "LOT-SP-{$dateStr}-01"], [
            'maPhieuNhapSP' => "PNSP{$dateStr}01",
            'maTonKho' => "LOT-SP-{$dateStr}-01",
            'soLuongNhap' => 2500,
            'ngaySanXuat' => $today,
            'hanSuDung' => Carbon::today()->addMonths(6)->toDateString(),
        ]);

        DB::table('PhieuNhapSP')->updateOrInsert(['maPhieuNhapSP' => "PNSP{$dateStr}02"], [
            'maPhieuNhapSP' => "PNSP{$dateStr}02",
            'maNVTao' => 'NV001',
            'maNVNhan' => 'NV002',
            'ngayNhap' => $today,
            'trangThai' => 'Chờ duyệt',
            'ghiChu' => 'Bàn giao sản phẩm sữa hạt óc chó 180ml',
        ]);

        DB::table('PhieuXuatNVL')->updateOrInsert(['maPhieuXuatNVL' => "PXNVL{$dateStr}01"], [
            'maPhieuXuatNVL' => "PXNVL{$dateStr}01",
            'maXuong' => 'X001',
            'maNVTao' => 'NV001',
            'maNVNhan' => 'NV003',
            'ngayXuat' => $today,
            'trangThai' => 'Hoàn thành',
            'ghiChu' => 'Xuất nếp cẩm cấp phát xưởng sản xuất sữa chua',
        ]);

        DB::table('PhieuXuatSP')->updateOrInsert(['maPhieuXuatSP' => "PXSP{$dateStr}01"], [
            'maPhieuXuatSP' => "PXSP{$dateStr}01",
            'maKhachHang' => 'KH001',
            'maNVTao' => 'NV001',
            'ngayXuat' => $today,
            'trangThai' => 'Hoàn thành',
            'ghiChu' => 'Xuất kho sữa tươi 1L cho chuỗi Co.opmart',
        ]);

        // 5. PHÂN HỆ BÁN HÀNG (SALES) (8 RECORDS)
        DB::table('KhachHang')->updateOrInsert(['maKhachHang' => 'KH006'], [
            'maKhachHang' => 'KH006',
            'tenKhachHang' => 'Chuỗi Siêu Thị WinMart Landmark 81',
            'soDienThoai' => '02838221199',
            'diaChi' => 'Tầng B1, Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM',
            'hanMucCongNo' => 200000000,
        ]);

        DB::table('KhachHang')->updateOrInsert(['maKhachHang' => 'KH007'], [
            'maKhachHang' => 'KH007',
            'tenKhachHang' => 'Hệ Thống Cửa Hàng Tiện Lợi Circle K Việt Nam',
            'soDienThoai' => '02839401188',
            'diaChi' => '160 Bùi Thị Xuân, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
            'hanMucCongNo' => 150000000,
        ]);

        DB::table('DonHang')->updateOrInsert(['maDonHang' => "DH{$dateStr}01"], [
            'maDonHang' => "DH{$dateStr}01",
            'maKhachHang' => 'KH006',
            'maNhanVien' => 'NV001',
            'ngayMua' => $today,
            'tongTien' => 25900000,
            'trangThai' => 'Đã xác nhận',
        ]);
        DB::table('ChiTietDonHang')->updateOrInsert(['maDonHang' => "DH{$dateStr}01", 'maSanPham' => 'SP011'], [
            'maDonHang' => "DH{$dateStr}01",
            'maSanPham' => 'SP011',
            'soLuong' => 500,
            'donGia' => 35000,
        ]);

        DB::table('DonHang')->updateOrInsert(['maDonHang' => "DH{$dateStr}02"], [
            'maDonHang' => "DH{$dateStr}02",
            'maKhachHang' => 'KH007',
            'maNhanVien' => 'NV001',
            'ngayMua' => $today,
            'tongTien' => 15950000,
            'trangThai' => 'Chờ xác nhận',
        ]);

        DB::table('GiaoHang')->updateOrInsert(['maGiaoHang' => "GH{$dateStr}01"], [
            'maGiaoHang' => "GH{$dateStr}01",
            'maDonHang' => "DH{$dateStr}01",
            'maPhieuXuatSP' => "PXSP{$dateStr}01",
            'maKhachHang' => 'KH006',
            'maNV' => 'NV004',
            'ngayGiao' => $today,
            'diaChiGiao' => 'Tầng B1, Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM',
            'trangThai' => 'Đang giao',
        ]);

        DB::table('HoaDon')->updateOrInsert(['maHoaDon' => "HD{$dateStr}01"], [
            'maHoaDon' => "HD{$dateStr}01",
            'maGiaoHang' => "GH{$dateStr}01",
            'tongTien' => 25900000,
            'ngayLap' => $today,
        ]);

        // 6. PHÂN HỆ SẢN XUẤT (PRODUCTION) (6 RECORDS)
        DB::table('LenhSanXuat')->updateOrInsert(['maLenh' => "LSX{$dateStr}01"], [
            'maLenh' => "LSX{$dateStr}01",
            'tenLenh' => 'Kế hoạch sản xuất Sữa tươi không đường 1L tiêu chuẩn ISO',
            'maNhanVien' => 'NV001',
            'ngayTaoLenh' => $today,
            'trangThai' => 'Đang sản xuất',
        ]);
        DB::table('ChiTietLenhSanXuat')->updateOrInsert(['maLenh' => "LSX{$dateStr}01", 'maSanPham' => 'SP011'], [
            'maLenh' => "LSX{$dateStr}01",
            'maSanPham' => 'SP011',
            'soLuong' => 10000,
            'ghiChu' => 'Sản xuất theo đơn hàng WinMart',
        ]);

        DB::table('LenhSanXuat')->updateOrInsert(['maLenh' => "LSX{$dateStr}02"], [
            'maLenh' => "LSX{$dateStr}02",
            'tenLenh' => 'Kế hoạch sản xuất Sữa chua nếp cẩm đợt 2',
            'maNhanVien' => 'NV001',
            'ngayTaoLenh' => $today,
            'trangThai' => 'Chờ duyệt',
        ]);

        DB::table('PhieuNghiemThu')->updateOrInsert(['maPhieuNghiemThu' => "PNT{$dateStr}01"], [
            'maPhieuNghiemThu' => "PNT{$dateStr}01",
            'maLenh' => "LSX{$dateStr}01",
            'maNhanVien' => 'NV001',
            'ngayNghiemThu' => $today,
            'tongSoLuongSanPham' => 10000,
            'tongSoLuongDat' => 10000,
            'tongSoLuongKhongDat' => 0,
            'ghiChu' => 'Đạt chuẩn 100% xuất xưởng',
        ]);

        DB::table('PhieuYeuCauXuatSP')->updateOrInsert(['maPhieuYCXSP' => "YCXSP{$dateStr}01"], [
            'maPhieuYCXSP' => "YCXSP{$dateStr}01",
            'maPhieuNghiemThu' => "PNT{$dateStr}01",
            'maNhanVien' => 'NV001',
            'ngayYeuCau' => $today,
            'trangThai' => 'Chưa xử lý',
            'ghiChu' => "Tự động bàn giao 10,000 hộp Sữa tươi từ PNT{$dateStr}01",
        ]);

        DB::table('DeNghiBoSungSanPham')->updateOrInsert(['maDeNghi' => "DNSP{$dateStr}01"], [
            'maDeNghi' => "DNSP{$dateStr}01",
            'maSanPham' => 'SP013',
            'maKho' => 'K004',
            'soLuong' => 5000,
            'ngayCanHang' => Carbon::today()->addDays(7)->toDateString(),
            'ngayDeNghi' => $today,
            'trangThai' => 'ChoDuyet',
            'maNV' => 'NV001',
            'ghiChu' => 'Tồn kho Sữa chua nếp cẩm xuống dưới định mức tối thiểu',
        ]);

        // 7. PHÂN HỆ TÀI CHÍNH (FINANCE) (4 RECORDS)
        // Ensure DoiTuongGiaoDich exists
        $counterparties = [
            ['maDoiTuong' => 'DT-KH006', 'maThamChieu' => 'KH006', 'loaiDoiTuong' => 'KhachHang', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH007', 'maThamChieu' => 'KH007', 'loaiDoiTuong' => 'KhachHang', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC001', 'maThamChieu' => 'NCC001', 'loaiDoiTuong' => 'NhaCungCap', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC002', 'maThamChieu' => 'NCC002', 'loaiDoiTuong' => 'NhaCungCap', 'trangThai' => 1],
        ];
        foreach ($counterparties as $cp) {
            DB::table('DoiTuongGiaoDich')->updateOrInsert(['maDoiTuong' => $cp['maDoiTuong']], $cp);
        }

        // Get first cash and bank account
        $cashAcc = DB::table('TaiKhoanQuy')->where('loaiTaiKhoan', 'TM')->first();
        $bankAcc = DB::table('TaiKhoanQuy')->where('loaiTaiKhoan', 'NH')->first();
        $cashAccId = $cashAcc ? $cashAcc->maTaiKhoanQuy : 'TKQ-TM01';
        $bankAccId = $bankAcc ? $bankAcc->maTaiKhoanQuy : 'TKQ-VCB01';

        DB::table('PhieuThu')->updateOrInsert(['maPhieuThu' => "PT{$dateStr}01"], [
            'maPhieuThu' => "PT{$dateStr}01",
            'ngayThu' => $today,
            'maDoiTuong' => 'DT-KH006',
            'lyDoThu' => 'Thu tiền đợt 1 đơn hàng siêu thị WinMart Landmark 81',
            'phuongThucThu' => 'CK',
            'maTaiKhoanQuy' => $bankAccId,
            'soTien' => 15000000,
            'trangThai' => 'Moi',
            'nguoiLap' => 'NV001',
        ]);

        DB::table('PhieuThu')->updateOrInsert(['maPhieuThu' => "PT{$dateStr}02"], [
            'maPhieuThu' => "PT{$dateStr}02",
            'ngayThu' => $today,
            'maDoiTuong' => 'DT-KH007',
            'lyDoThu' => 'Thu tiền thanh toán đơn hàng Circle K',
            'phuongThucThu' => 'TM',
            'maTaiKhoanQuy' => $cashAccId,
            'soTien' => 10000000,
            'trangThai' => 'DaDuyet',
            'nguoiLap' => 'NV001',
        ]);

        DB::table('PhieuChi')->updateOrInsert(['maPhieuChi' => "PC{$dateStr}01"], [
            'maPhieuChi' => "PC{$dateStr}01",
            'ngayChi' => $today,
            'maDoiTuong' => 'DT-NCC001',
            'lyDoChi' => 'Thanh toán tiền nguyên liệu ca cao Bỉ đợt 1',
            'phuongThucChi' => 'CK',
            'maTaiKhoanQuy' => $bankAccId,
            'soTien' => 28000000,
            'trangThai' => 'Moi',
            'nguoiLap' => 'NV001',
        ]);

        DB::table('PhieuChi')->updateOrInsert(['maPhieuChi' => "PC{$dateStr}02"], [
            'maPhieuChi' => "PC{$dateStr}02",
            'ngayChi' => $today,
            'maDoiTuong' => 'DT-NCC002',
            'lyDoChi' => 'Tạm ứng tiền mua đường Biên Hòa đợt 2',
            'phuongThucChi' => 'TM',
            'maTaiKhoanQuy' => $cashAccId,
            'soTien' => 12000000,
            'trangThai' => 'DaDuyet',
            'nguoiLap' => 'NV001',
        ]);

        echo "[INFO] Đã nạp bổ sung 44 dữ liệu ERP mới đa dạng thành công!\n";
    }
}
