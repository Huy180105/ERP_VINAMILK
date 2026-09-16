-- ============================================================================
-- Force UTF-8 encoding for Vietnamese diacritics
-- ============================================================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================================
-- CƠ SỞ DỮ LIỆU ERP TỔNG THỂ VINAMILK (TÍCH HỢP 5 PHÂN HỆ HỆ THỐNG)
-- ============================================================================
-- Phân hệ 1: QUẢN LÝ NHÂN SỰ (HRM)
-- Phân hệ 2: QUẢN LÝ SẢN XUẤT (PRODUCTION)
-- Phân hệ 3: QUẢN LÝ KHO (WAREHOUSE & INVENTORY)
-- Phân hệ 4: QUẢN LÝ BÁN HÀNG (SALES & DISTRIBUTION)
-- Phân hệ 5: QUẢN LÝ THU CHI (FINANCE & CASH/BANK)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `quanly_erp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quanly_erp`;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- PHẦN 1: PHÂN HỆ QUẢN LÝ NHÂN SỰ (HRM)
-- ============================================================================

-- 1. Bảng Phòng Ban
DROP TABLE IF EXISTS `PhongBan`;
CREATE TABLE `PhongBan` (
  `maPhongBan` VARCHAR(20) NOT NULL COMMENT 'Mã phòng ban',
  `tenPhongBan` NVARCHAR(100) NOT NULL COMMENT 'Tên phòng ban',
  PRIMARY KEY (`maPhongBan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Phòng Ban';

-- 2. Bảng Chức Vụ
DROP TABLE IF EXISTS `ChucVu`;
CREATE TABLE `ChucVu` (
  `maChucVu` VARCHAR(20) NOT NULL COMMENT 'Mã chức vụ',
  `tenChucVu` NVARCHAR(100) NOT NULL COMMENT 'Tên chức vụ',
  `phuCap` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Phụ cấp chức vụ',
  PRIMARY KEY (`maChucVu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Chức Vụ';

-- 3. Bảng Nhân Viên (Dùng chung cho toàn bộ Hệ thống ERP)
DROP TABLE IF EXISTS `NhanVien`;
CREATE TABLE `NhanVien` (
  `maNV` VARCHAR(20) NOT NULL COMMENT 'Mã nhân viên',
  `hoTen` NVARCHAR(100) NOT NULL COMMENT 'Họ và tên nhân viên',
  `maPhongBan` VARCHAR(20) DEFAULT NULL COMMENT 'Mã phòng ban trực thuộc',
  `maChucVu` VARCHAR(20) DEFAULT NULL COMMENT 'Mã chức vụ hiện tại',
  `ngayVaoLam` DATE DEFAULT NULL COMMENT 'Ngày bắt đầu làm việc',
  `trangThai` NVARCHAR(50) DEFAULT 'Đang làm việc' COMMENT 'Trạng thái làm việc',
  PRIMARY KEY (`maNV`),
  CONSTRAINT `fk_nv_pb` FOREIGN KEY (`maPhongBan`) REFERENCES `PhongBan` (`maPhongBan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nv_cv` FOREIGN KEY (`maChucVu`) REFERENCES `ChucVu` (`maChucVu`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hồ sơ Nhân Viên';

-- 4. Bảng Hợp Đồng Lao Động
DROP TABLE IF EXISTS `HopDong`;
CREATE TABLE `HopDong` (
  `maHopDong` VARCHAR(20) NOT NULL COMMENT 'Mã hợp đồng lao động',
  `maNV` VARCHAR(20) NOT NULL COMMENT 'Mã nhân viên ký hợp đồng',
  `loaiHopDong` NVARCHAR(50) DEFAULT NULL COMMENT 'Loại hợp đồng (Thử việc/Xác định thời hạn/Không xác định)',
  `ngayHieuLuc` DATE DEFAULT NULL COMMENT 'Ngày hợp đồng có hiệu lực',
  `mucLuongCoBan` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Mức lương cơ bản theo hợp đồng',
  PRIMARY KEY (`maHopDong`),
  CONSTRAINT `fk_hd_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hợp đồng lao động';

-- 5. Bảng Chấm Công
DROP TABLE IF EXISTS `BangCong`;
CREATE TABLE `BangCong` (
  `maBangCong` VARCHAR(20) NOT NULL COMMENT 'Mã bảng chấm công',
  `maNV` VARCHAR(20) NOT NULL COMMENT 'Mã nhân viên',
  `thang` VARCHAR(7) NOT NULL COMMENT 'Tháng chấm công (MM/YYYY)',
  `soNgayCong` INT DEFAULT 0 COMMENT 'Số ngày công thực tế',
  `soGioTangCa` DECIMAL(6,2) DEFAULT 0.00 COMMENT 'Số giờ tăng ca trong tháng',
  PRIMARY KEY (`maBangCong`),
  CONSTRAINT `fk_bc_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chấm công hàng tháng';

-- 6. Bảng Lương
DROP TABLE IF EXISTS `BangLuong`;
CREATE TABLE `BangLuong` (
  `maBangLuong` VARCHAR(20) NOT NULL COMMENT 'Mã bảng lương',
  `maNV` VARCHAR(20) NOT NULL COMMENT 'Mã nhân viên nhận lương',
  `maBangCong` VARCHAR(20) DEFAULT NULL COMMENT 'Bảng công căn cứ',
  `maHopDong` VARCHAR(20) DEFAULT NULL COMMENT 'Hợp đồng căn cứ mức lương',
  `thang` VARCHAR(7) NOT NULL COMMENT 'Tháng tính lương (MM/YYYY)',
  `tongThucNhan` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Tổng lương thực nhận',
  PRIMARY KEY (`maBangLuong`),
  CONSTRAINT `fk_bl_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bl_bc` FOREIGN KEY (`maBangCong`) REFERENCES `BangCong` (`maBangCong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bl_hd` FOREIGN KEY (`maHopDong`) REFERENCES `HopDong` (`maHopDong`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng tổng hợp lương hàng tháng';


-- ============================================================================
-- PHẦN 2: PHÂN HỆ QUẢN LÝ SẢN XUẤT (PRODUCTION)
-- ============================================================================

-- 7. Bảng Sản Phẩm (Dùng chung Sản xuất, Kho, Bán hàng)
DROP TABLE IF EXISTS `SanPham`;
CREATE TABLE `SanPham` (
  `maSanPham` VARCHAR(20) NOT NULL COMMENT 'Mã sản phẩm',
  `tenSanPham` NVARCHAR(255) NOT NULL COMMENT 'Tên sản phẩm',
  `donViTinh` NVARCHAR(50) DEFAULT 'Hộp' COMMENT 'Đơn vị tính',
  `donGia` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Đơn giá bán niêm yết',
  `trangThai` NVARCHAR(50) DEFAULT 'Đang kinh doanh' COMMENT 'Trạng thái sản phẩm',
  `ghiChu` NVARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maSanPham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Sản Phẩm hoàn chỉnh';

-- 8. Bảng Lệnh Sản Xuất
DROP TABLE IF EXISTS `LenhSanXuat`;
CREATE TABLE `LenhSanXuat` (
  `maLenh` VARCHAR(20) NOT NULL COMMENT 'Mã lệnh sản xuất',
  `maNhanVien` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên phụ trách/tạo lệnh',
  `tenLenh` NVARCHAR(255) DEFAULT NULL COMMENT 'Tên/Mô tả lệnh sản xuất',
  `ngayTaoLenh` DATE DEFAULT NULL COMMENT 'Ngày tạo lệnh',
  `trangThai` NVARCHAR(50) DEFAULT 'Chờ duyệt' COMMENT 'Trạng thái (Chờ duyệt, Đã duyệt, Đang thực hiện, Hoàn thành, Hủy)',
  PRIMARY KEY (`maLenh`),
  CONSTRAINT `fk_lsx_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Lệnh Sản Xuất';

-- 9. Bảng Chi Tiết Lệnh Sản Xuất
DROP TABLE IF EXISTS `ChiTietLenhSanXuat`;
CREATE TABLE `ChiTietLenhSanXuat` (
  `maLenh` VARCHAR(20) NOT NULL COMMENT 'Mã lệnh sản xuất',
  `maSanPham` VARCHAR(20) NOT NULL COMMENT 'Mã sản phẩm cần sản xuất',
  `soLuong` INT DEFAULT 0 COMMENT 'Số lượng sản xuất kế hoạch',
  `ghiChu` NVARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maLenh`, `maSanPham`),
  CONSTRAINT `fk_ctl_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctl_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết sản phẩm thuộc Lệnh Sản Xuất';

-- 10. Bảng Công Đoạn Sản Xuất
DROP TABLE IF EXISTS `CongDoan`;
CREATE TABLE `CongDoan` (
  `maCongDoan` VARCHAR(20) NOT NULL COMMENT 'Mã công đoạn',
  `maLenh` VARCHAR(20) NOT NULL COMMENT 'Mã lệnh sản xuất liên quan',
  `maNhanVien` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên quản lý công đoạn',
  `tenLenh` NVARCHAR(255) DEFAULT NULL COMMENT 'Tên công đoạn (Phối trộn, Tiệt trùng, Đồng hóa, Chiết rót, Đóng gói)',
  `nhanCong` INT DEFAULT 0 COMMENT 'Số lượng nhân công phân công',
  `ngayBatDau` DATE DEFAULT NULL COMMENT 'Ngày bắt đầu công đoạn',
  `ngayKetThuc` DATE DEFAULT NULL COMMENT 'Ngày kết thúc công đoạn',
  `chiPhi` DECIMAL(18,2) DEFAULT 0.00 COMMENT 'Chi phí thực hiện công đoạn',
  `thanhPham` NVARCHAR(255) DEFAULT NULL COMMENT 'Tên bán thành phẩm / sản phẩm đầu ra',
  `soLuongThanhPham` INT DEFAULT 0 COMMENT 'Số lượng thành phẩm công đoạn',
  `khau` INT DEFAULT 1 COMMENT 'Số thứ tự khâu/bước',
  `trangThai` NVARCHAR(50) DEFAULT 'Chờ thực hiện' COMMENT 'Trạng thái công đoạn',
  PRIMARY KEY (`maCongDoan`),
  CONSTRAINT `fk_cd_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cd_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Các công đoạn trong quy trình sản xuất';

-- 11. Bảng Phiếu Yêu Cầu Nguyên Vật Liệu (Phân hệ Sản xuất xin NVL)
DROP TABLE IF EXISTS `PhieuYeuCauNVL`;
CREATE TABLE `PhieuYeuCauNVL` (
  `maPhieuYCNVL` VARCHAR(20) NOT NULL COMMENT 'Mã phiếu yêu cầu NVL',
  `maCongDoan` VARCHAR(20) DEFAULT NULL COMMENT 'Công đoạn yêu cầu',
  `maLenh` VARCHAR(20) DEFAULT NULL COMMENT 'Lệnh sản xuất liên quan',
  `maNhanVien` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên lập yêu cầu',
  `ngayYeuCau` DATE DEFAULT NULL COMMENT 'Ngày lập yêu cầu',
  `trangThai` NVARCHAR(50) DEFAULT 'Chưa xử lý' COMMENT 'Trạng thái (Chưa xử lý, Đã xuất kho, Từ chối)',
  `ghiChu` NVARCHAR(255) DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maPhieuYCNVL`),
  CONSTRAINT `fk_pycnvl_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycnvl_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycnvl_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu yêu cầu nguyên vật liệu từ xưởng';

-- 12. Bảng Chi Tiết Phiếu Yêu Cầu NVL
DROP TABLE IF EXISTS `ChiTietPhieuYeuCauNVL`;
CREATE TABLE `ChiTietPhieuYeuCauNVL` (
  `maPhieuYCNVL` VARCHAR(20) NOT NULL,
  `maNVL` VARCHAR(20) NOT NULL,
  `tenNVL` NVARCHAR(255) DEFAULT NULL,
  `soLuong` INT DEFAULT 0,
  PRIMARY KEY (`maPhieuYCNVL`, `maNVL`),
  CONSTRAINT `fk_ctpycnvl_phieu` FOREIGN KEY (`maPhieuYCNVL`) REFERENCES `PhieuYeuCauNVL` (`maPhieuYCNVL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết danh mục NVL cần cấp phát';

-- 13. Bảng Phiếu Yêu Cầu Bán Thành Phẩm
DROP TABLE IF EXISTS `PhieuYeuCauBTP`;
CREATE TABLE `PhieuYeuCauBTP` (
  `maPhieuYCBTP` VARCHAR(20) NOT NULL,
  `maCongDoan` VARCHAR(20) DEFAULT NULL,
  `maLenh` VARCHAR(20) DEFAULT NULL,
  `maNhanVien` VARCHAR(20) DEFAULT NULL,
  `ngayYeuCau` DATE DEFAULT NULL,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCBTP`),
  CONSTRAINT `fk_pycbtp_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycbtp_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycbtp_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu yêu cầu bán thành phẩm giữa các công đoạn';

-- 14. Bảng Chi Tiết Phiếu Yêu Cầu BTP
DROP TABLE IF EXISTS `ChiTietPhieuYeuCauBTP`;
CREATE TABLE `ChiTietPhieuYeuCauBTP` (
  `maPhieuYCBTP` VARCHAR(20) NOT NULL,
  `maBTP` VARCHAR(20) NOT NULL,
  `tenBTP` NVARCHAR(255) DEFAULT NULL,
  `soLuong` INT DEFAULT 0,
  PRIMARY KEY (`maPhieuYCBTP`, `maBTP`),
  CONSTRAINT `fk_ctpycbtp_phieu` FOREIGN KEY (`maPhieuYCBTP`) REFERENCES `PhieuYeuCauBTP` (`maPhieuYCBTP`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Bảng Tiến Độ Sản Xuất
DROP TABLE IF EXISTS `TienDoSanXuat`;
CREATE TABLE `TienDoSanXuat` (
  `maTienDoSX` VARCHAR(20) NOT NULL,
  `maCongDoan` VARCHAR(20) DEFAULT NULL,
  `maLenh` VARCHAR(20) DEFAULT NULL,
  `maNhanVien` VARCHAR(20) DEFAULT NULL,
  `ngaySX` DATE DEFAULT NULL,
  PRIMARY KEY (`maTienDoSX`),
  CONSTRAINT `fk_tdsx_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tdsx_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tdsx_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Theo dõi tiến độ sản xuất';

-- 16. Bảng Chi Tiết Tiến Độ Sản Xuất
DROP TABLE IF EXISTS `ChiTietTienDoSanXuat`;
CREATE TABLE `ChiTietTienDoSanXuat` (
  `maTienDoSX` VARCHAR(20) NOT NULL,
  `maBTP` VARCHAR(20) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `trangThai` NVARCHAR(50) DEFAULT 'Đạt',
  PRIMARY KEY (`maTienDoSX`, `maBTP`),
  CONSTRAINT `fk_cttdsx_phieu` FOREIGN KEY (`maTienDoSX`) REFERENCES `TienDoSanXuat` (`maTienDoSX`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Bảng Phiếu Nghiệm Thu Sản Phẩm (QC)
DROP TABLE IF EXISTS `PhieuNghiemThu`;
CREATE TABLE `PhieuNghiemThu` (
  `maPhieuNghiemThu` VARCHAR(20) NOT NULL COMMENT 'Mã phiếu nghiệm thu chất lượng',
  `maCongDoan` VARCHAR(20) DEFAULT NULL,
  `maLenh` VARCHAR(20) DEFAULT NULL,
  `maNhanVien` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên QC nghiệm thu',
  `tongSoLuongSanPham` INT DEFAULT 0,
  `tongSoLuongDat` INT DEFAULT 0,
  `tongSoLuongKhongDat` INT DEFAULT 0,
  `ngayNghiemThu` DATE DEFAULT NULL,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuNghiemThu`),
  CONSTRAINT `fk_pnt_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnt_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnt_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nghiệm thu chất lượng sản phẩm hoàn thành';

-- 18. Bảng Phiếu Yêu Cầu Xuất Sản Phẩm (Bàn giao cho Kho)
DROP TABLE IF EXISTS `PhieuYeuCauXuatSP`;
CREATE TABLE `PhieuYeuCauXuatSP` (
  `maPhieuYCXSP` VARCHAR(20) NOT NULL COMMENT 'Mã phiếu yêu cầu nhập kho thành phẩm',
  `maPhieuNghiemThu` VARCHAR(20) DEFAULT NULL COMMENT 'Căn cứ biên bản nghiệm thu QC',
  `maNhanVien` VARCHAR(20) DEFAULT NULL,
  `ngayYeuCau` DATE DEFAULT NULL,
  `trangThai` NVARCHAR(50) DEFAULT 'Chưa xử lý' COMMENT 'Trạng thái (Chưa xử lý, Đã nhập kho)',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCXSP`),
  CONSTRAINT `fk_pycxsp_pnt` FOREIGN KEY (`maPhieuNghiemThu`) REFERENCES `PhieuNghiemThu` (`maPhieuNghiemThu`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycxsp_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu bàn giao thành phẩm từ Xưởng sang Kho';

-- 19. Bảng Chi Tiết Phiếu Yêu Cầu Xuất Sản Phẩm
DROP TABLE IF EXISTS `ChiTietPhieuYeuCauXuatSP`;
CREATE TABLE `ChiTietPhieuYeuCauXuatSP` (
  `maPhieuYCXSP` VARCHAR(20) NOT NULL,
  `maSanPham` VARCHAR(20) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCXSP`, `maSanPham`),
  CONSTRAINT `fk_ctpycxsp_phieu` FOREIGN KEY (`maPhieuYCXSP`) REFERENCES `PhieuYeuCauXuatSP` (`maPhieuYCXSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpycxsp_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Bảng Phiếu Sản Xuất Bù
DROP TABLE IF EXISTS `PhieuSanXuatBu`;
CREATE TABLE `PhieuSanXuatBu` (
  `maLenh` VARCHAR(20) NOT NULL,
  `maSanPham` VARCHAR(20) NOT NULL,
  `maPhieuNghiemThu` VARCHAR(20) NOT NULL,
  `soLuongKhongDat` INT DEFAULT 0,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maLenh`, `maSanPham`, `maPhieuNghiemThu`),
  CONSTRAINT `fk_psxb_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_psxb_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_psxb_pnt` FOREIGN KEY (`maPhieuNghiemThu`) REFERENCES `PhieuNghiemThu` (`maPhieuNghiemThu`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lệnh sản xuất bù cho lượng sản phẩm lỗi';


-- ============================================================================
-- PHẦN 3: PHÂN HỆ QUẢN LÝ KHO (WAREHOUSE & INVENTORY)
-- ============================================================================

-- 21. Bảng Loại Nguyên Vật Liệu
DROP TABLE IF EXISTS `LoaiNVL`;
CREATE TABLE `LoaiNVL` (
  `maLoaiNVL` VARCHAR(20) NOT NULL,
  `tenLoaiNVL` NVARCHAR(100) NOT NULL,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maLoaiNVL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Bảng Nguyên Vật Liệu
DROP TABLE IF EXISTS `NguyenVatLieu`;
CREATE TABLE `NguyenVatLieu` (
  `maNVL` VARCHAR(20) NOT NULL,
  `maLoaiNVL` VARCHAR(20) DEFAULT NULL,
  `tenNVL` NVARCHAR(100) NOT NULL,
  `donVi` NVARCHAR(20) DEFAULT 'Kg',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maNVL`),
  CONSTRAINT `fk_nvl_loai` FOREIGN KEY (`maLoaiNVL`) REFERENCES `LoaiNVL` (`maLoaiNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Bảng Nhà Cung Cấp
DROP TABLE IF EXISTS `NhaCungCap`;
CREATE TABLE `NhaCungCap` (
  `maNCC` VARCHAR(20) NOT NULL,
  `tenNCC` NVARCHAR(100) NOT NULL,
  `maSoThue` VARCHAR(20) DEFAULT NULL,
  `diaChi` NVARCHAR(200) DEFAULT NULL,
  `soDienThoai` VARCHAR(15) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`maNCC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Bảng Tồn Kho (Quản lý Lô Hàng FEFO)
DROP TABLE IF EXISTS `TonKho`;
CREATE TABLE `TonKho` (
  `maTonKho` VARCHAR(50) NOT NULL COMMENT 'Mã lô tồn kho',
  `tenTonKho` NVARCHAR(100) DEFAULT NULL COMMENT 'Nhãn mô tả lô',
  `maSP` VARCHAR(20) DEFAULT NULL COMMENT 'Mã SP (nếu là lô thành phẩm)',
  `maNVL` VARCHAR(20) DEFAULT NULL COMMENT 'Mã NVL (nếu là lô nguyên vật liệu)',
  `ngaySanXuat` DATE DEFAULT NULL COMMENT 'Ngày sản xuất lô',
  `hanSuDung` DATE DEFAULT NULL COMMENT 'Hạn sử dụng lô',
  `soLuongNhap` INT DEFAULT 0 COMMENT 'Số lượng ban đầu nhập',
  `soLuongTonHienTai` INT DEFAULT 0 COMMENT 'Số lượng tồn khả dụng hiện tại',
  `trangThai` NVARCHAR(50) DEFAULT 'Còn hạn' COMMENT 'Trạng thái (Còn hạn, Sắp hết hạn, Hết hạn)',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maTonKho`),
  CONSTRAINT `fk_tk_sp` FOREIGN KEY (`maSP`) REFERENCES `SanPham` (`maSanPham`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tk_nvl` FOREIGN KEY (`maNVL`) REFERENCES `NguyenVatLieu` (`maNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý chi tiết tồn kho theo Lô và HSD';

-- 25. Bảng Vị Trí Kho Sản Phẩm
DROP TABLE IF EXISTS `KhoSanPham`;
CREATE TABLE `KhoSanPham` (
  `maKhoSP` VARCHAR(20) NOT NULL,
  `maTonKho` VARCHAR(50) NOT NULL,
  `tinhTrangKhoSP` NVARCHAR(50) DEFAULT 'Bình thường',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maKhoSP`),
  CONSTRAINT `fk_khosp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Bảng Vị Trí Kho Nguyên Vật Liệu
DROP TABLE IF EXISTS `KhoNguyenVatLieu`;
CREATE TABLE `KhoNguyenVatLieu` (
  `maKhoNVL` VARCHAR(20) NOT NULL,
  `maTonKho` VARCHAR(50) NOT NULL,
  `tinhTrangKhoNVL` NVARCHAR(50) DEFAULT 'Bình thường',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maKhoNVL`),
  CONSTRAINT `fk_khonvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Bảng Phiếu Nhập Nguyên Vật Liệu (từ Nhà cung cấp)
DROP TABLE IF EXISTS `PhieuNhapNVL`;
CREATE TABLE `PhieuNhapNVL` (
  `maPhieuNhapNVL` VARCHAR(20) NOT NULL,
  `maNCC` VARCHAR(20) DEFAULT NULL,
  `maNVTao` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên lập phiếu',
  `maNVNhan` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên tiếp nhận kho',
  `ngayNhap` DATE DEFAULT NULL,
  `trangThai` NVARCHAR(50) DEFAULT 'Chờ duyệt',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapNVL`),
  CONSTRAINT `fk_pnnvl_ncc` FOREIGN KEY (`maNCC`) REFERENCES `NhaCungCap` (`maNCC`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnnvl_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnnvl_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. Bảng Chi Tiết Phiếu Nhập NVL
DROP TABLE IF EXISTS `ChiTietPhieuNhapNVL`;
CREATE TABLE `ChiTietPhieuNhapNVL` (
  `maPhieuNhapNVL` VARCHAR(20) NOT NULL,
  `maTonKho` VARCHAR(50) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `donGia` FLOAT DEFAULT 0,
  `thanhTien` FLOAT DEFAULT 0,
  `ngaySanXuat` DATE DEFAULT NULL,
  `hanSuDung` DATE DEFAULT NULL,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapNVL`, `maTonKho`),
  CONSTRAINT `fk_ctpnnvl_phieu` FOREIGN KEY (`maPhieuNhapNVL`) REFERENCES `PhieuNhapNVL` (`maPhieuNhapNVL`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpnnvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. Bảng Phiếu Xuất Nguyên Vật Liệu (Cấp phát cho Sản xuất)
DROP TABLE IF EXISTS `PhieuXuatNVL`;
CREATE TABLE `PhieuXuatNVL` (
  `maPhieuXuatNVL` VARCHAR(20) NOT NULL,
  `maXuong` VARCHAR(20) DEFAULT NULL COMMENT 'Mã xưởng/dây chuyền nhận',
  `maNVTao` VARCHAR(20) DEFAULT NULL,
  `maNVNhan` VARCHAR(20) DEFAULT NULL,
  `ngayXuat` DATE DEFAULT NULL,
  `trangThai` NVARCHAR(50) DEFAULT 'Chờ duyệt',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  `maPhieuYeuCauNVL` VARCHAR(20) DEFAULT NULL COMMENT 'Nối với Yêu cầu bên Sản xuất',
  PRIMARY KEY (`maPhieuXuatNVL`),
  CONSTRAINT `fk_pxnvl_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxnvl_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxnvl_pycnvl` FOREIGN KEY (`maPhieuYeuCauNVL`) REFERENCES `PhieuYeuCauNVL` (`maPhieuYCNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. Bảng Chi Tiết Phiếu Xuất NVL
DROP TABLE IF EXISTS `ChiTietPhieuXuatNVL`;
CREATE TABLE `ChiTietPhieuXuatNVL` (
  `maPhieuXuatNVL` VARCHAR(20) NOT NULL,
  `maTonKho` VARCHAR(50) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuXuatNVL`, `maTonKho`),
  CONSTRAINT `fk_ctpxnvl_phieu` FOREIGN KEY (`maPhieuXuatNVL`) REFERENCES `PhieuXuatNVL` (`maPhieuXuatNVL`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpxnvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. Bảng Phiếu Nhập Sản Phẩm (Nhập từ Xưởng Sản xuất)
DROP TABLE IF EXISTS `PhieuNhapSP`;
CREATE TABLE `PhieuNhapSP` (
  `maPhieuNhapSP` VARCHAR(20) NOT NULL,
  `maXuong` VARCHAR(20) DEFAULT NULL,
  `maNVTao` VARCHAR(20) DEFAULT NULL,
  `maNVNhan` VARCHAR(20) DEFAULT NULL,
  `ngayNhap` DATE DEFAULT NULL,
  `trangThai` NVARCHAR(50) DEFAULT 'Chờ duyệt',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  `maPhieuYCXSP` VARCHAR(20) DEFAULT NULL COMMENT 'Nối với Phiếu bàn giao bên Sản xuất',
  PRIMARY KEY (`maPhieuNhapSP`),
  CONSTRAINT `fk_pnsp_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnsp_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnsp_pycxsp` FOREIGN KEY (`maPhieuYCXSP`) REFERENCES `PhieuYeuCauXuatSP` (`maPhieuYCXSP`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. Bảng Chi Tiết Phiếu Nhập SP
DROP TABLE IF EXISTS `ChiTietPhieuNhapSP`;
CREATE TABLE `ChiTietPhieuNhapSP` (
  `maPhieuNhapSP` VARCHAR(20) NOT NULL,
  `maTonKho` VARCHAR(50) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `ngaySanXuat` DATE DEFAULT NULL,
  `hanSuDung` DATE DEFAULT NULL,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapSP`, `maTonKho`),
  CONSTRAINT `fk_ctpnsp_phieu` FOREIGN KEY (`maPhieuNhapSP`) REFERENCES `PhieuNhapSP` (`maPhieuNhapSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpnsp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. Bảng Phiếu Xuất Sản Phẩm (Xuất bán cho Khách hàng/Đại lý)
DROP TABLE IF EXISTS `PhieuXuatSP`;
CREATE TABLE `PhieuXuatSP` (
  `maPhieuXuatSP` VARCHAR(20) NOT NULL,
  `maKhachHang` VARCHAR(20) DEFAULT NULL,
  `maNVTao` VARCHAR(20) DEFAULT NULL,
  `ngayXuat` DATE DEFAULT NULL,
  `trangThai` NVARCHAR(50) DEFAULT 'Chờ duyệt',
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  `maDonHang` VARCHAR(20) DEFAULT NULL COMMENT 'Nối với Đơn hàng bên Bán hàng',
  PRIMARY KEY (`maPhieuXuatSP`),
  CONSTRAINT `fk_pxsp_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. Bảng Chi Tiết Phiếu Xuất SP
DROP TABLE IF EXISTS `ChiTietPhieuXuatSP`;
CREATE TABLE `ChiTietPhieuXuatSP` (
  `maPhieuXuatSP` VARCHAR(20) NOT NULL,
  `maTonKho` VARCHAR(50) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `ghiChu` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maPhieuXuatSP`, `maTonKho`),
  CONSTRAINT `fk_ctpxsp_phieu` FOREIGN KEY (`maPhieuXuatSP`) REFERENCES `PhieuXuatSP` (`maPhieuXuatSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpxsp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- PHẦN 4: PHÂN HỆ QUẢN LÝ BÁN HÀNG (SALES & DISTRIBUTION)
-- ============================================================================

-- 35. Bảng Khách Hàng / Nhà Phân Phối
DROP TABLE IF EXISTS `KhachHang`;
CREATE TABLE `KhachHang` (
  `maKhachHang` VARCHAR(20) NOT NULL,
  `tenKhachHang` NVARCHAR(100) NOT NULL,
  `soDienThoai` VARCHAR(15) DEFAULT NULL,
  `diaChi` NVARCHAR(255) DEFAULT NULL,
  `hanMucCongNo` DECIMAL(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maKhachHang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Khách Hàng & Nhà Phân Phối';

-- 36. Bảng Kho Tổng Quan (Cho Bán hàng tra cứu)
DROP TABLE IF EXISTS `Kho`;
CREATE TABLE `Kho` (
  `maKho` VARCHAR(20) NOT NULL,
  `tenKho` NVARCHAR(100) NOT NULL,
  `diaChi` NVARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`maKho`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. Bảng Đơn Bán Hàng
DROP TABLE IF EXISTS `DonHang`;
CREATE TABLE `DonHang` (
  `maDonHang` VARCHAR(20) NOT NULL,
  `ngayMua` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `tongTien` DECIMAL(18,2) DEFAULT 0.00,
  `thanhTien` DECIMAL(18,2) DEFAULT 0.00,
  `trangThai` VARCHAR(30) DEFAULT 'Chờ xác nhận',
  `maKhachHang` VARCHAR(20) DEFAULT NULL,
  `maNhanVien` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên kinh doanh tạo đơn',
  PRIMARY KEY (`maDonHang`),
  CONSTRAINT `fk_dh_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `KhachHang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dh_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Đơn Bán Hàng';

-- 38. Bảng Chi Tiết Đơn Hàng
DROP TABLE IF EXISTS `ChiTietDonHang`;
CREATE TABLE `ChiTietDonHang` (
  `maDonHang` VARCHAR(20) NOT NULL,
  `maSanPham` VARCHAR(20) NOT NULL,
  `soLuong` INT DEFAULT 0,
  `donGia` DECIMAL(18,2) DEFAULT 0.00,
  `thanhTien` DECIMAL(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maDonHang`, `maSanPham`),
  CONSTRAINT `fk_ctdh_dh` FOREIGN KEY (`maDonHang`) REFERENCES `DonHang` (`maDonHang`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. Bảng Quản Lý Giao Hàng
DROP TABLE IF EXISTS `GiaoHang`;
CREATE TABLE `GiaoHang` (
  `maGiaoHang` VARCHAR(20) NOT NULL,
  `ngayGiao` DATETIME DEFAULT NULL,
  `diaChiGiao` NVARCHAR(255) DEFAULT NULL,
  `trangThai` VARCHAR(30) DEFAULT 'Đang giao',
  `maDonHang` VARCHAR(20) DEFAULT NULL,
  `maPhieuXuat` VARCHAR(20) DEFAULT NULL,
  `maKhachHang` VARCHAR(20) DEFAULT NULL,
  `maNhanVien` VARCHAR(20) DEFAULT NULL COMMENT 'Nhân viên giao hàng',
  PRIMARY KEY (`maGiaoHang`),
  CONSTRAINT `fk_gh_dh` FOREIGN KEY (`maDonHang`) REFERENCES `DonHang` (`maDonHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_px` FOREIGN KEY (`maPhieuXuat`) REFERENCES `PhieuXuatSP` (`maPhieuXuatSP`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `KhachHang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 40. Bảng Hóa Đơn Bán Hàng
DROP TABLE IF EXISTS `HoaDon`;
CREATE TABLE `HoaDon` (
  `maHoaDon` VARCHAR(20) NOT NULL,
  `ngayLap` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `tongTien` DECIMAL(18,2) DEFAULT 0.00,
  `maGiaoHang` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (`maHoaDon`),
  CONSTRAINT `fk_hd_gh` FOREIGN KEY (`maGiaoHang`) REFERENCES `GiaoHang` (`maGiaoHang`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 41. Bảng Quản Lý Công Nợ Bán Hàng
DROP TABLE IF EXISTS `CongNo`;
CREATE TABLE `CongNo` (
  `maCongNo` VARCHAR(20) NOT NULL,
  `soTienNo` DECIMAL(18,2) DEFAULT 0.00,
  `soTienDaTra` DECIMAL(18,2) DEFAULT 0.00,
  `soTienConLai` DECIMAL(18,2) DEFAULT 0.00,
  `hanThanhToan` DATE DEFAULT NULL,
  `trangThai` VARCHAR(30) DEFAULT 'Còn nợ',
  `maHoaDon` VARCHAR(20) DEFAULT NULL,
  `maKhachHang` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (`maCongNo`),
  CONSTRAINT `fk_cn_hd` FOREIGN KEY (`maHoaDon`) REFERENCES `HoaDon` (`maHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cn_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `KhachHang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 42. Bảng Lịch Sử Thanh Toán
DROP TABLE IF EXISTS `ThanhToan`;
CREATE TABLE `ThanhToan` (
  `maThanhToan` VARCHAR(20) NOT NULL,
  `maCongNo` VARCHAR(20) DEFAULT NULL,
  `ngayThanhToan` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `phuongThuc` VARCHAR(30) DEFAULT 'Tiền mặt',
  PRIMARY KEY (`maThanhToan`),
  CONSTRAINT `fk_tt_cn` FOREIGN KEY (`maCongNo`) REFERENCES `CongNo` (`maCongNo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- PHẦN 5: PHÂN HỆ QUẢN LÝ THU CHI (FINANCE & CASH/BANK)
-- ============================================================================

-- 43. Bảng Danh Mục Thu
DROP TABLE IF EXISTS `DanhMucThu`;
CREATE TABLE `DanhMucThu` (
  `maDanhMucThu` VARCHAR(50) NOT NULL,
  `tenDanhMucThu` VARCHAR(100) NOT NULL,
  `moTa` VARCHAR(255) DEFAULT NULL,
  `trangThai` BIT(1) DEFAULT b'1',
  PRIMARY KEY (`maDanhMucThu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 44. Bảng Danh Mục Chi
DROP TABLE IF EXISTS `DanhMucChi`;
CREATE TABLE `DanhMucChi` (
  `maDanhMucChi` VARCHAR(50) NOT NULL,
  `tenDanhMucChi` VARCHAR(100) NOT NULL,
  `moTa` VARCHAR(255) DEFAULT NULL,
  `trangThai` BIT(1) DEFAULT b'1',
  PRIMARY KEY (`maDanhMucChi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 45. Bảng Đối Tượng Giao Dịch (Mapping KH, NCC, NV với Thu Chi)
DROP TABLE IF EXISTS `DoiTuongGiaoDich`;
CREATE TABLE `DoiTuongGiaoDich` (
  `maDoiTuong` VARCHAR(50) NOT NULL,
  `maThamChieu` VARCHAR(50) DEFAULT NULL COMMENT 'Mã thật từ bảng KhachHang/NhaCungCap/NhanVien',
  `loaiDoiTuong` VARCHAR(20) DEFAULT 'KH' COMMENT 'KH, NCC, NV, Khac',
  `tenDoiTuong` NVARCHAR(150) NOT NULL,
  `maSoThue` VARCHAR(20) DEFAULT NULL,
  `diaChi` NVARCHAR(255) DEFAULT NULL,
  `soDienThoai` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `soTaiKhoan` VARCHAR(50) DEFAULT NULL,
  `nganHang` VARCHAR(100) DEFAULT NULL,
  `trangThai` BIT(1) DEFAULT b'1',
  PRIMARY KEY (`maDoiTuong`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 46. Bảng Tài Khoản Quỹ / Ngân Hàng
DROP TABLE IF EXISTS `TaiKhoanQuy`;
CREATE TABLE `TaiKhoanQuy` (
  `maTaiKhoanQuy` VARCHAR(50) NOT NULL,
  `tenTaiKhoanQuy` NVARCHAR(150) NOT NULL,
  `loaiTaiKhoan` VARCHAR(20) DEFAULT 'TM' COMMENT 'TM (Tiền mặt), NH (Ngân hàng)',
  `soTaiKhoan` VARCHAR(50) DEFAULT NULL,
  `nganHang` NVARCHAR(100) DEFAULT NULL,
  `soDuHienTai` DECIMAL(18,2) DEFAULT 0.00,
  `trangThai` BIT(1) DEFAULT b'1',
  PRIMARY KEY (`maTaiKhoanQuy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 47. Bảng Phiếu Thu Tiền
DROP TABLE IF EXISTS `PhieuThu`;
CREATE TABLE `PhieuThu` (
  `maPhieuThu` VARCHAR(50) NOT NULL,
  `ngayThu` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `maDoiTuong` VARCHAR(50) DEFAULT NULL,
  `lyDoThu` NVARCHAR(255) DEFAULT NULL,
  `soTien` DECIMAL(18,2) DEFAULT 0.00,
  `phuongThucThu` VARCHAR(20) DEFAULT 'TM',
  `maTaiKhoanQuy` VARCHAR(50) DEFAULT NULL,
  `trangThai` VARCHAR(20) DEFAULT 'Moi',
  `nguoiLap` VARCHAR(20) DEFAULT NULL,
  `ngayLap` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `nguoiDuyet` VARCHAR(20) DEFAULT NULL,
  `ngayDuyet` DATETIME DEFAULT NULL,
  PRIMARY KEY (`maPhieuThu`),
  CONSTRAINT `fk_pt_dt` FOREIGN KEY (`maDoiTuong`) REFERENCES `DoiTuongGiaoDich` (`maDoiTuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_tkq` FOREIGN KEY (`maTaiKhoanQuy`) REFERENCES `TaiKhoanQuy` (`maTaiKhoanQuy`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_nvlap` FOREIGN KEY (`nguoiLap`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_nvduyet` FOREIGN KEY (`nguoiDuyet`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 48. Bảng Chi Tiết Phiếu Thu
DROP TABLE IF EXISTS `ChiTietPhieuThu`;
CREATE TABLE `ChiTietPhieuThu` (
  `maChiTietThu` VARCHAR(50) NOT NULL,
  `maPhieuThu` VARCHAR(50) NOT NULL,
  `maDanhMucThu` VARCHAR(50) DEFAULT NULL,
  `dienGiai` NVARCHAR(255) DEFAULT NULL,
  `soTien` DECIMAL(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maChiTietThu`),
  CONSTRAINT `fk_ctpt_pt` FOREIGN KEY (`maPhieuThu`) REFERENCES `PhieuThu` (`maPhieuThu`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpt_dmt` FOREIGN KEY (`maDanhMucThu`) REFERENCES `DanhMucThu` (`maDanhMucThu`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 49. Bảng Phiếu Chi Tiền
DROP TABLE IF EXISTS `PhieuChi`;
CREATE TABLE `PhieuChi` (
  `maPhieuChi` VARCHAR(50) NOT NULL,
  `ngayChi` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `maDoiTuong` VARCHAR(50) DEFAULT NULL,
  `lyDoChi` NVARCHAR(255) DEFAULT NULL,
  `soTien` DECIMAL(18,2) DEFAULT 0.00,
  `phuongThucChi` VARCHAR(20) DEFAULT 'TM',
  `maTaiKhoanQuy` VARCHAR(50) DEFAULT NULL,
  `trangThai` VARCHAR(20) DEFAULT 'Moi',
  `nguoiLap` VARCHAR(20) DEFAULT NULL,
  `ngayLap` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `nguoiDuyet` VARCHAR(20) DEFAULT NULL,
  `ngayDuyet` DATETIME DEFAULT NULL,
  PRIMARY KEY (`maPhieuChi`),
  CONSTRAINT `fk_pc_dt` FOREIGN KEY (`maDoiTuong`) REFERENCES `DoiTuongGiaoDich` (`maDoiTuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_tkq` FOREIGN KEY (`maTaiKhoanQuy`) REFERENCES `TaiKhoanQuy` (`maTaiKhoanQuy`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_nvlap` FOREIGN KEY (`nguoiLap`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_nvduyet` FOREIGN KEY (`nguoiDuyet`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 50. Bảng Chi Tiết Phiếu Chi
DROP TABLE IF EXISTS `ChiTietPhieuChi`;
CREATE TABLE `ChiTietPhieuChi` (
  `maChiTietChi` VARCHAR(50) NOT NULL,
  `maPhieuChi` VARCHAR(50) NOT NULL,
  `maDanhMucChi` VARCHAR(50) DEFAULT NULL,
  `dienGiai` NVARCHAR(255) DEFAULT NULL,
  `soTien` DECIMAL(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maChiTietChi`),
  CONSTRAINT `fk_ctpc_pc` FOREIGN KEY (`maPhieuChi`) REFERENCES `PhieuChi` (`maPhieuChi`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpc_dmc` FOREIGN KEY (`maDanhMucChi`) REFERENCES `DanhMucChi` (`maDanhMucChi`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 51. Bảng Báo Cáo Thu Chi
DROP TABLE IF EXISTS `BaoCaoThuChi`;
CREATE TABLE `BaoCaoThuChi` (
  `maBaoCao` VARCHAR(50) NOT NULL,
  `loaiBaoCao` VARCHAR(20) DEFAULT 'TongHop',
  `tuNgay` DATE DEFAULT NULL,
  `denNgay` DATE DEFAULT NULL,
  `ngayLap` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `nguoiLap` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (`maBaoCao`),
  CONSTRAINT `fk_bctc_nv` FOREIGN KEY (`nguoiLap`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- DỮ LIỆU MẪU (SAMPLE DATA INTEGRATED FOR ALL 5 MODULES)
-- ============================================================================

-- Sample HRM
INSERT INTO `PhongBan` (`maPhongBan`, `tenPhongBan`) VALUES ('PB01', 'Phòng Kế Toán'), ('PB02', 'Phòng Sản Xuất'), ('PB03', 'Phòng Kho'), ('PB04', 'Phòng Kinh Doanh');
INSERT INTO `ChucVu` (`maChucVu`, `tenChucVu`, `phuCap`) VALUES ('CV01', 'Giám Đốc', 5000000.00), ('CV02', 'Trưởng Phòng', 3000000.00), ('CV03', 'Nhân Viên', 1000000.00);
INSERT INTO `NhanVien` (`maNV`, `hoTen`, `maPhongBan`, `maChucVu`, `ngayVaoLam`, `trangThai`) VALUES 
('NV001', 'Nguyễn Văn Hùng', 'PB03', 'CV02', '2022-01-15', 'Đang làm việc'),
('NV002', 'Trần Thị Thu Thảo', 'PB01', 'CV03', '2023-03-10', 'Đang làm việc'),
('NV003', 'Lê Minh Tuấn', 'PB02', 'CV03', '2021-06-20', 'Đang làm việc'),
('NV004', 'Phạm Hoàng Nam', 'PB04', 'CV03', '2024-02-01', 'Đang làm việc');

-- Sample Products & Materials
INSERT INTO `SanPham` (`maSanPham`, `tenSanPham`, `donViTinh`, `donGia`, `trangThai`) VALUES 
('SP001', 'Sữa Tươi Tiệt Trùng Vinamilk 100% 180ml', 'Hộp', 9500.00, 'Đang kinh doanh'),
('SP002', 'Sữa Chua Ăn Vinamilk Có Đường 100g', 'Hũ', 7500.00, 'Đang kinh doanh');

INSERT INTO `LoaiNVL` (`maLoaiNVL`, `tenLoaiNVL`) VALUES ('LNVL01', 'Sữa Thô & Đường'), ('LNVL02', 'Bao Bì & Đóng Gói');
INSERT INTO `NguyenVatLieu` (`maNVL`, `maLoaiNVL`, `tenNVL`, `donVi`) VALUES 
('NVL001', 'LNVL01', 'Sữa Bò Tươi Nguyên Chất', 'Lít'),
('NVL002', 'LNVL01', 'Đường Tinh Luyện', 'Kg');

INSERT INTO `NhaCungCap` (`maNCC`, `tenNCC`, `maSoThue`, `diaChi`, `soDienThoai`, `email`) VALUES 
('NCC001', 'Nông Trại Sữa Vinamilk Mộc Châu', '0101234999', 'Mộc Châu, Sơn La', '02438889999', 'mocchau@vinamilk.com.vn');

INSERT INTO `KhachHang` (`maKhachHang`, `tenKhachHang`, `soDienThoai`, `diaChi`, `hanMucCongNo`) VALUES 
('KH001', 'Đại Lý Phân Phối Miền Nam', '02837776666', '45 Nguyễn Thị Minh Khai, TP.HCM', 50000000.00);

-- Sample Inventory Lots
INSERT INTO `TonKho` (`maTonKho`, `tenTonKho`, `maSP`, `maNVL`, `ngaySanXuat`, `hanSuDung`, `soLuongNhap`, `soLuongTonHienTai`, `trangThai`) VALUES
('TK-SP001-202609', 'Lô Sữa Tươi 180ml Th9/2026', 'SP001', NULL, '2026-09-01', '2027-03-01', 10000, 8000, 'Còn hạn'),
('TK-NVL001-202609', 'Lô Sữa Bò Tươi Nhập Th9/2026', NULL, 'NVL001', '2026-09-01', '2026-09-15', 5000, 3500, 'Còn hạn');

SET FOREIGN_KEY_CHECKS = 1;
