<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Danh Mục Thu (FI-FR01)
        DB::table('DanhMucThu')->insertOrIgnore([
            ['maDanhMucThu' => 'DMT01', 'tenDanhMucThu' => 'Thu tiền bán hàng / đại lý', 'moTa' => 'Thu hồi tiền từ các đơn phân phối sữa', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT02', 'tenDanhMucThu' => 'Thu tiền lãi tiền gửi ngân hàng', 'moTa' => 'Lãi phát sinh định kỳ tài khoản ngân hàng', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT03', 'tenDanhMucThu' => 'Thu thanh lý bao bì & phế liệu', 'moTa' => 'Thanh lý thùng carton, vỏ hộp hỏng', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT04', 'tenDanhMucThu' => 'Thu tiền đặt cọc đại lý', 'moTa' => 'Tiền ký quỹ mở đại lý phân phối', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT05', 'tenDanhMucThu' => 'Thu hoàn ứng công tác', 'moTa' => 'Nhân viên hoàn ứng chi phí đi công tác', 'trangThai' => 1],
        ]);

        // 2. Danh Mục Chi (FI-FR01)
        DB::table('DanhMucChi')->insertOrIgnore([
            ['maDanhMucChi' => 'DMC01', 'tenDanhMucChi' => 'Chi mua nguyên vật liệu thô', 'moTa' => 'Thanh toán tiền sữa bò tươi, đường tinh luyện', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC02', 'tenDanhMucChi' => 'Chi trả lương & phụ cấp nhân viên', 'moTa' => 'Chi lương theo kỳ phân hệ HRM', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC03', 'tenDanhMucChi' => 'Chi phí vận chuyển & logistic', 'moTa' => 'Cước vận chuyển hàng về kho và đi đại lý', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC04', 'tenDanhMucChi' => 'Chi tiền điện, nước, hạ tầng', 'moTa' => 'Hóa đơn điện lạnh kho bãi và văn phòng', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC05', 'tenDanhMucChi' => 'Chi tiếp khách & công tác phí', 'moTa' => 'Hội nghị khách hàng, công tác đại lý', 'trangThai' => 1],
        ]);

        // 3. Đối Tượng Giao Dịch - Bảng ánh xạ thuần túy, không lưu trùng thông tin (FI-BR05)
        DB::table('DoiTuongGiaoDich')->insertOrIgnore([
            [
                'maDoiTuong' => 'DT-KH001',
                'maThamChieu' => 'KH001',
                'loaiDoiTuong' => 'KH',
                'trangThai' => 1,
            ],
            [
                'maDoiTuong' => 'DT-NCC001',
                'maThamChieu' => 'NCC001',
                'loaiDoiTuong' => 'NCC',
                'trangThai' => 1,
            ],
            [
                'maDoiTuong' => 'DT-NV001',
                'maThamChieu' => 'NV001',
                'loaiDoiTuong' => 'NV',
                'trangThai' => 1,
            ],
            [
                'maDoiTuong' => 'DT-NV002',
                'maThamChieu' => 'NV002',
                'loaiDoiTuong' => 'NV',
                'trangThai' => 1,
            ],
        ]);

        // 4. Tài Khoản Quỹ / Ngân Hàng (FI-FR04)
        DB::table('TaiKhoanQuy')->insertOrIgnore([
            [
                'maTaiKhoanQuy' => 'TKQ-TM',
                'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Trụ Sở Chính',
                'loaiTaiKhoan' => 'TM',
                'soTaiKhoan' => null,
                'nganHang' => null,
                'soDuHienTai' => 350000000.00,
                'trangThai' => 1,
            ],
            [
                'maTaiKhoanQuy' => 'TKQ-VCB',
                'tenTaiKhoanQuy' => 'Vietcombank - TK Thanh Toán Công Ty',
                'loaiTaiKhoan' => 'NH',
                'soTaiKhoan' => '0071001234567',
                'nganHang' => 'Ngân Hàng Ngoại Thương VN (Vietcombank)',
                'soDuHienTai' => 2450000000.00,
                'trangThai' => 1,
            ],
            [
                'maTaiKhoanQuy' => 'TKQ-BIDV',
                'tenTaiKhoanQuy' => 'BIDV - TK Chi Lương & Bảo Hiểm',
                'loaiTaiKhoan' => 'NH',
                'soTaiKhoan' => '1201000998877',
                'nganHang' => 'Ngân Hàng Đầu Tư & Phát Triển VN (BIDV)',
                'soDuHienTai' => 1200000000.00,
                'trangThai' => 1,
            ],
        ]);

        // 5. Phiếu Thu mẫu (FI-FR02, FI-BR01, FI-FR06)
        DB::table('PhieuThu')->insertOrIgnore([
            [
                'maPhieuThu' => 'PT-202609-001',
                'ngayThu' => '2026-09-05 10:30:00',
                'maDoiTuong' => 'DT-KH001',
                'lyDoThu' => 'Thu tiền đợt 1 phân phối lô Sữa Tươi 180ml',
                'soTien' => 95000000.00,
                'phuongThucThu' => 'CK',
                'maTaiKhoanQuy' => 'TKQ-VCB',
                'trangThai' => 'DaDuyet',
                'nguoiLap' => 'NV002',
                'ngayLap' => '2026-09-05 10:00:00',
                'nguoiDuyet' => 'NV001',
                'ngayDuyet' => '2026-09-05 11:00:00',
                'maThanhToan' => null,
                'maCongNo' => null,
                'maHoaDon' => null,
            ],
            [
                'maPhieuThu' => 'PT-202609-002',
                'ngayThu' => '2026-09-10 14:15:00',
                'maDoiTuong' => 'DT-NV001',
                'lyDoThu' => 'Hoàn ứng công tác hội chợ sữa sạch Quốc tế',
                'soTien' => 4500000.00,
                'phuongThucThu' => 'TM',
                'maTaiKhoanQuy' => 'TKQ-TM',
                'trangThai' => 'DaDuyet',
                'nguoiLap' => 'NV002',
                'ngayLap' => '2026-09-10 14:00:00',
                'nguoiDuyet' => 'NV001',
                'ngayDuyet' => '2026-09-10 14:30:00',
                'maThanhToan' => null,
                'maCongNo' => null,
                'maHoaDon' => null,
            ],
            [
                'maPhieuThu' => 'PT-202609-003',
                'ngayThu' => '2026-09-15 09:30:00',
                'maDoiTuong' => 'DT-KH001',
                'lyDoThu' => 'Thu cọc hợp đồng mở rộng chuỗi phân phối Quý 4/2026 (Chờ đối soát sổ phụ)',
                'soTien' => 50000000.00,
                'phuongThucThu' => 'CK',
                'maTaiKhoanQuy' => 'TKQ-VCB',
                'trangThai' => 'ChoDoiSoat',
                'nguoiLap' => 'NV002',
                'ngayLap' => '2026-09-15 09:00:00',
                'nguoiDuyet' => null,
                'ngayDuyet' => null,
                'maThanhToan' => null,
                'maCongNo' => null,
                'maHoaDon' => null,
            ],
        ]);

        DB::table('ChiTietPhieuThu')->insertOrIgnore([
            [
                'maChiTietThu' => 'CTPT-001-1',
                'maPhieuThu' => 'PT-202609-001',
                'maDanhMucThu' => 'DMT01',
                'dienGiai' => 'Thanh toán tiền hàng xuất đợt 1',
                'soTien' => 95000000.00,
            ],
            [
                'maChiTietThu' => 'CTPT-002-1',
                'maPhieuThu' => 'PT-202609-002',
                'maDanhMucThu' => 'DMT05',
                'dienGiai' => 'Hoàn ứng chi phí khách sạn & vé máy bay thừa',
                'soTien' => 4500000.00,
            ],
            [
                'maChiTietThu' => 'CTPT-003-1',
                'maPhieuThu' => 'PT-202609-003',
                'maDanhMucThu' => 'DMT04',
                'dienGiai' => 'Tiền ký quỹ đặt cọc đại lý phân phối',
                'soTien' => 50000000.00,
            ],
        ]);

        // 6. Phiếu Chi mẫu (FI-FR03, FI-BR02)
        DB::table('PhieuChi')->insertOrIgnore([
            [
                'maPhieuChi' => 'PC-202609-001',
                'ngayChi' => '2026-09-06 09:00:00',
                'maDoiTuong' => 'DT-NCC001',
                'lyDoChi' => 'Thanh toán tiền nhập 5000L sữa bò tươi đợt Th9/2026',
                'soTien' => 70000000.00,
                'phuongThucChi' => 'CK',
                'maTaiKhoanQuy' => 'TKQ-VCB',
                'trangThai' => 'DaDuyet',
                'nguoiLap' => 'NV002',
                'ngayLap' => '2026-09-06 08:30:00',
                'nguoiDuyet' => 'NV001',
                'ngayDuyet' => '2026-09-06 09:15:00',
                'maPhieuNhapNVL' => null,
                'maBangLuong' => null,
            ],
            [
                'maPhieuChi' => 'PC-202609-002',
                'ngayChi' => '2026-09-08 16:00:00',
                'maDoiTuong' => 'DT-NV002',
                'lyDoChi' => 'Chi tiền điện nước điều hòa kho lưu trữ sữa lạnh',
                'soTien' => 15600000.00,
                'phuongThucChi' => 'TM',
                'maTaiKhoanQuy' => 'TKQ-TM',
                'trangThai' => 'DaDuyet',
                'nguoiLap' => 'NV002',
                'ngayLap' => '2026-09-08 15:30:00',
                'nguoiDuyet' => 'NV001',
                'ngayDuyet' => '2026-09-08 16:30:00',
                'maPhieuNhapNVL' => null,
                'maBangLuong' => null,
            ],
        ]);

        DB::table('ChiTietPhieuChi')->insertOrIgnore([
            [
                'maChiTietChi' => 'CTPC-001-1',
                'maPhieuChi' => 'PC-202609-001',
                'maDanhMucChi' => 'DMC01',
                'dienGiai' => 'Thanh toán tiền sữa tươi thô nông trại Mộc Châu',
                'soTien' => 70000000.00,
            ],
            [
                'maChiTietChi' => 'CTPC-002-1',
                'maPhieuChi' => 'PC-202609-002',
                'maDanhMucChi' => 'DMC04',
                'dienGiai' => 'Hóa đơn điện lực EVN kỳ tháng 08/2026',
                'soTien' => 15600000.00,
            ],
        ]);

        // 7. BaoCaoThuChi
        DB::table('BaoCaoThuChi')->truncate();
        DB::table('BaoCaoThuChi')->insert([
            [
                'maBaoCao' => 'BCTC-2026-Q2',
                'loaiBaoCao' => 'TongHop',
                'tuNgay' => '2026-04-01',
                'denNgay' => '2026-06-30',
                'ngayLap' => '2026-07-05 10:00:00',
                'nguoiLap' => 'NV002',
            ],
            [
                'maBaoCao' => 'BCTC-2026-T08',
                'loaiBaoCao' => 'ThuChiThang',
                'tuNgay' => '2026-08-01',
                'denNgay' => '2026-08-31',
                'ngayLap' => '2026-09-02 09:30:00',
                'nguoiLap' => 'NV002',
            ],
            [
                'maBaoCao' => 'BCTC-2026-T09',
                'loaiBaoCao' => 'DoiChieuQuy',
                'tuNgay' => '2026-09-01',
                'denNgay' => '2026-09-30',
                'ngayLap' => Carbon::now()->toDateTimeString(),
                'nguoiLap' => 'NV002',
            ],
        ]);
    }
}
