/* ERP VINAMILK - Chuẩn 51 bảng CSDL Logic theo Chương 3 */
CREATE DATABASE IF NOT EXISTS `quanly_erp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quanly_erp`;

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

--
-- Cấu trúc bảng `bangcong`
--
DROP TABLE IF EXISTS `bangcong`;
CREATE TABLE `bangcong` (
  `maBangCong` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã nhân viên',
  `thang` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tháng chấm công (MM/YYYY)',
  `soNgayCong` int DEFAULT '0' COMMENT 'Số ngày công thực tế',
  `soGioTangCa` decimal(6,2) DEFAULT '0.00' COMMENT 'Số giờ tăng ca trong tháng',
  `soNgayNghiPhep` int DEFAULT '0',
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'DangChot',
  `lyDoGiaiTrinh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maBangCong`),
  KEY `fk_bc_nv` (`maNV`),
  CONSTRAINT `fk_bc_nv` FOREIGN KEY (`maNV`) REFERENCES `nhanvien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chấm công hàng tháng';

--
-- Dữ liệu bảng `bangcong` (20 bản ghi)
--
INSERT INTO `bangcong` (`maBangCong`, `maNV`, `thang`, `soNgayCong`, `soGioTangCa`, `soNgayNghiPhep`, `trangThai`, `lyDoGiaiTrinh`) VALUES
('BC-202608-1', 'NV001', '08/2026', 22, 12.00, '0', 'DangChot', NULL),
('BC-202608-10', 'NV010', '08/2026', 22, 12.00, '0', 'DangChot', NULL),
('BC-202608-2', 'NV002', '08/2026', 22, 6.00, '0', 'DangChot', NULL),
('BC-202608-3', 'NV003', '08/2026', 22, 6.00, '0', 'DangChot', NULL),
('BC-202608-4', 'NV004', '08/2026', 22, 12.00, '0', 'DangChot', NULL),
('BC-202608-5', 'NV005', '08/2026', 22, 6.00, '0', 'DangChot', NULL),
('BC-202608-6', 'NV006', '08/2026', 22, 6.00, '0', 'DangChot', NULL),
('BC-202608-7', 'NV007', '08/2026', 22, 12.00, '0', 'DangChot', NULL),
('BC-202608-8', 'NV008', '08/2026', 22, 6.00, '0', 'DangChot', NULL),
('BC-202608-9', 'NV009', '08/2026', 22, 6.00, '0', 'DangChot', NULL),
('BC-202609-1', 'NV001', '09/2026', 21, 8.00, '0', 'DangChot', NULL),
('BC-202609-10', 'NV010', '09/2026', 21, 4.00, '0', 'DangChot', NULL),
('BC-202609-2', 'NV002', '09/2026', 21, 4.00, '0', 'DangChot', NULL),
('BC-202609-3', 'NV003', '09/2026', 21, 8.00, '0', 'DangChot', NULL),
('BC-202609-4', 'NV004', '09/2026', 21, 4.00, '0', 'DangChot', NULL),
('BC-202609-5', 'NV005', '09/2026', 21, 8.00, '0', 'DangChot', NULL),
('BC-202609-6', 'NV006', '09/2026', 21, 4.00, '0', 'DangChot', NULL),
('BC-202609-7', 'NV007', '09/2026', 21, 8.00, '0', 'DangChot', NULL),
('BC-202609-8', 'NV008', '09/2026', 21, 4.00, '0', 'DangChot', NULL),
('BC-202609-9', 'NV009', '09/2026', 21, 8.00, '0', 'DangChot', NULL);

--
-- Cấu trúc bảng `bangluong`
--
DROP TABLE IF EXISTS `bangluong`;
CREATE TABLE `bangluong` (
  `maBangLuong` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã nhân viên nhận lương',
  `maBangCong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maHopDong` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hợp đồng căn cứ mức lương',
  `thang` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tháng tính lương (MM/YYYY)',
  `luongCoBan` decimal(15,2) DEFAULT '0.00',
  `phuCap` decimal(15,2) DEFAULT '0.00',
  `luongTangCa` decimal(15,2) DEFAULT '0.00',
  `khauTru` decimal(15,2) DEFAULT '0.00',
  `tongThucNhan` decimal(15,2) DEFAULT '0.00' COMMENT 'Tổng lương thực nhận',
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'TamTinh',
  `nguoiSua` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lyDoSua` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maBangLuong`),
  KEY `fk_bl_nv` (`maNV`),
  KEY `fk_bl_hd` (`maHopDong`),
  KEY `fk_bl_bc` (`maBangCong`),
  CONSTRAINT `fk_bl_bc` FOREIGN KEY (`maBangCong`) REFERENCES `bangcong` (`maBangCong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bl_hd` FOREIGN KEY (`maHopDong`) REFERENCES `hopdong` (`maHopDong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bl_nv` FOREIGN KEY (`maNV`) REFERENCES `nhanvien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng tổng hợp lương hàng tháng';

--
-- Dữ liệu bảng `bangluong` (20 bản ghi)
--
INSERT INTO `bangluong` (`maBangLuong`, `maNV`, `maBangCong`, `maHopDong`, `thang`, `luongCoBan`, `phuCap`, `luongTangCa`, `khauTru`, `tongThucNhan`, `trangThai`, `nguoiSua`, `lyDoSua`) VALUES
('BL-202608-1', 'NV001', 'BC-202608-1', 'HD2020-001', '08/2026', '0.00', '0.00', '0.00', '0.00', 33000000.00, 'TamTinh', NULL, NULL),
('BL-202608-10', 'NV010', 'BC-202608-10', 'HD2023-010', '08/2026', '0.00', '0.00', '0.00', '0.00', 18500000.00, 'TamTinh', NULL, NULL),
('BL-202608-2', 'NV002', 'BC-202608-2', 'HD2020-002', '08/2026', '0.00', '0.00', '0.00', '0.00', 38000000.00, 'TamTinh', NULL, NULL),
('BL-202608-3', 'NV003', 'BC-202608-3', 'HD2019-003', '08/2026', '0.00', '0.00', '0.00', '0.00', 30500000.00, 'TamTinh', NULL, NULL),
('BL-202608-4', 'NV004', 'BC-202608-4', 'HD2022-004', '08/2026', '0.00', '0.00', '0.00', '0.00', 18500000.00, 'TamTinh', NULL, NULL),
('BL-202608-5', 'NV005', 'BC-202608-5', 'HD2022-005', '08/2026', '0.00', '0.00', '0.00', '0.00', 75000000.00, 'TamTinh', NULL, NULL),
('BL-202608-6', 'NV006', 'BC-202608-6', 'HD2022-006', '08/2026', '0.00', '0.00', '0.00', '0.00', 18000000.00, 'TamTinh', NULL, NULL),
('BL-202608-7', 'NV007', 'BC-202608-7', 'HD2022-007', '08/2026', '0.00', '0.00', '0.00', '0.00', 20500000.00, 'TamTinh', NULL, NULL),
('BL-202608-8', 'NV008', 'BC-202608-8', 'HD2023-008', '08/2026', '0.00', '0.00', '0.00', '0.00', 16500000.00, 'TamTinh', NULL, NULL),
('BL-202608-9', 'NV009', 'BC-202608-9', 'HD2023-009', '08/2026', '0.00', '0.00', '0.00', '0.00', 17500000.00, 'TamTinh', NULL, NULL),
('BL-202609-NV001', 'NV001', 'BC-202609-1', 'HD2020-001', '09/2026', 28000000.00, 5000000.00, 1909091.00, 2940000.00, 30696364.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV002', 'NV002', 'BC-202609-2', 'HD2021-002', '09/2026', 32000000.00, 6000000.00, 1090909.00, 3360000.00, 34276364.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV003', 'NV003', 'BC-202609-3', 'HD2019-003', '09/2026', 26000000.00, 4500000.00, 1772727.00, 2730000.00, 28360909.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV004', 'NV004', 'BC-202609-4', 'HD2022-004', '09/2026', 16000000.00, 2500000.00, 545455.00, 1680000.00, 16638182.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV005', 'NV005', 'BC-202609-5', 'HD2018-005', '09/2026', 60000000.00, 15000000.00, 4090909.00, 6300000.00, 70063636.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV006', 'NV006', 'BC-202609-6', 'HD2022-006', '09/2026', 15000000.00, 3000000.00, 511364.00, 1575000.00, 16254546.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV007', 'NV007', 'BC-202609-7', 'HD2021-007', '09/2026', 18000000.00, 2500000.00, 1227273.00, 1890000.00, 19019091.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV008', 'NV008', 'BC-202609-8', 'HD2023-008', '09/2026', 14000000.00, 2500000.00, 477273.00, 1470000.00, 14870909.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV009', 'NV009', 'BC-202609-9', 'HD2023-009', '09/2026', 15000000.00, 2500000.00, 1022727.00, 1575000.00, 16265909.00, 'DaKhoa', NULL, NULL),
('BL-202609-NV010', 'NV010', 'BC-202609-10', 'HD2022-010', '09/2026', 16000000.00, 2500000.00, 545455.00, 1680000.00, 16638182.00, 'DaKhoa', NULL, NULL);

--
-- Cấu trúc bảng `banthanhpham`
--
DROP TABLE IF EXISTS `banthanhpham`;
CREATE TABLE `banthanhpham` (
  `maBTP` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenBTP` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maCongDoan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soLuong` int DEFAULT '0',
  `donVi` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Lít',
  `trangThai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Đạt chuẩn',
  `ghiChu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maBTP`),
  KEY `fk_btp_cd` (`maCongDoan`),
  CONSTRAINT `fk_btp_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `congdoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `banthanhpham` (2 bản ghi)
--
INSERT INTO `banthanhpham` (`maBTP`, `tenBTP`, `maCongDoan`, `soLuong`, `donVi`, `trangThai`, `ghiChu`) VALUES
('BTP-GREEN-FARM', 'Dịch sữa sinh thái Green Farm đã chuẩn hóa', 'CD03-01', 10000, 'Lít', 'Đang kiểm nghiệm', 'Đang chờ kết quả kiểm định vi sinh phòng Lab'),
('BTP-SUA-UHT', 'Sữa tươi tiệt trùng UHT 140°C', 'CD01-02', 20000, 'Lít', 'Đạt chuẩn', 'Đã hoàn thành công đoạn tiệt trùng và đồng hóa');

--
-- Cấu trúc bảng `chitietdonhang`
--
DROP TABLE IF EXISTS `chitietdonhang`;
CREATE TABLE `chitietdonhang` (
  `maDonHang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `donGia` decimal(18,2) DEFAULT '0.00',
  `thanhTien` decimal(18,2) DEFAULT '0.00',
  PRIMARY KEY (`maDonHang`,`maSanPham`),
  KEY `fk_ctdh_sp` (`maSanPham`),
  CONSTRAINT `fk_ctdh_dh` FOREIGN KEY (`maDonHang`) REFERENCES `donhang` (`maDonHang`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_sp` FOREIGN KEY (`maSanPham`) REFERENCES `sanpham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietdonhang` (14 bản ghi)
--
INSERT INTO `chitietdonhang` (`maDonHang`, `maSanPham`, `soLuong`, `donGia`, `thanhTien`) VALUES
('DH20260901', 'SP001', 1500, 385000.00, 577500000.00),
('DH20260901', 'SP002', 200, 260000.00, 52500000.00),
('DH20260901', 'SP003', 5000, 28000.00, 140000000.00),
('DH20260905', 'SP005', 800, 420000.00, 336000000.00),
('DH20260905', 'SP006', 6000, 24500.00, 147000000.00),
('DH20260905', 'SP010', 1057, 35000.00, 37000000.00),
('DH20260908', 'SP001', 800, 385000.00, 308000000.00),
('DH20260908', 'SP004', 250, 450000.00, 112500000.00),
('DH20260908', 'SP008', 475, 62000.00, 29500000.00),
('DH20260910', 'SP007', 1000, 310000.00, 310000000.00),
('DH20260912', 'SP001', 500, 385000.00, 192500000.00),
('DH20260912', 'SP002', 355, 260000.00, 92500000.00),
('DH20260914', 'SP007', 2500, 310000.00, 775000000.00),
('DH20260914', 'SP008', 7661, 62000.00, 475000000.00);

--
-- Cấu trúc bảng `chitietlenhsanxuat`
--
DROP TABLE IF EXISTS `chitietlenhsanxuat`;
CREATE TABLE `chitietlenhsanxuat` (
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lệnh sản xuất',
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sản phẩm cần sản xuất',
  `soLuong` int DEFAULT '0' COMMENT 'Số lượng sản xuất kế hoạch',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maLenh`,`maSanPham`),
  KEY `fk_ctl_sp` (`maSanPham`),
  CONSTRAINT `fk_ctl_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctl_sp` FOREIGN KEY (`maSanPham`) REFERENCES `sanpham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết sản phẩm thuộc Lệnh Sản Xuất';

--
-- Dữ liệu bảng `chitietlenhsanxuat` (4 bản ghi)
--
INSERT INTO `chitietlenhsanxuat` (`maLenh`, `maSanPham`, `soLuong`, `ghiChu`) VALUES
('LSX20260901', 'SP001', 20000, 'Tiệt trùng UHT vô trùng'),
('LSX20260905', 'SP003', 5000, 'Ủ men sống Bulgaricus 8 tiếng'),
('LSX20260908', 'SP005', 10000, 'Tiêu chuẩn Clean Label quốc tế'),
('LSX20260912', 'SP006', 15000, 'Men sống L.Casei 431');

--
-- Cấu trúc bảng `chitietphieuchi`
--
DROP TABLE IF EXISTS `chitietphieuchi`;
CREATE TABLE `chitietphieuchi` (
  `maChiTietChi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maPhieuChi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maDanhMucChi` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dienGiai` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT '0.00',
  PRIMARY KEY (`maChiTietChi`),
  KEY `fk_ctpc_pc` (`maPhieuChi`),
  KEY `fk_ctpc_dmc` (`maDanhMucChi`),
  CONSTRAINT `fk_ctpc_dmc` FOREIGN KEY (`maDanhMucChi`) REFERENCES `danhmucchi` (`maDanhMucChi`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpc_pc` FOREIGN KEY (`maPhieuChi`) REFERENCES `phieuchi` (`maPhieuChi`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieuchi` (37 bản ghi)
--
INSERT INTO `chitietphieuchi` (`maChiTietChi`, `maPhieuChi`, `maDanhMucChi`, `dienGiai`, `soTien`) VALUES
('CTPC_FIN_1790146179', 'PC_FIN_1790146179', 'DMC_FIN_1790146179', 'Chi thanh toán đợt 1', 3000000.00),
('CTPC_OVER_FIN_1790146179', 'PC_OVER_FIN_1790146179', 'DMC_FIN_1790146179', 'Chi vượt số dư', 999999999.00),
('CTPC-001-1', 'PC-202609-001', 'DMC04', 'Thanh toán tiền mua bao bì tiệt trùng phức hợp Aseptic từ Tetra Pak VN', 450000000.00),
('CTPC-002-1', 'PC-202609-002', 'DMC03', 'Thanh toán tiền nhập 50 tấn đường tinh luyện cao cấp từ TTC Sugar Biên Hòa', 180000000.00),
('CTPC-003-1', 'PC-202609-003', 'DMC01', 'Thanh toán tiền thu mua sữa bò tươi nguyên chất đợt 1 Hợp Tác Xã Mộc Châu', 320000000.00),
('CTPC-004-1', 'PC-202609-004', 'DMC02', 'Thanh toán L/C nhập khẩu 40 tấn bột sữa gầy nguyên chất từ Fonterra New Zealand', 850000000.00),
('CTPC-005-1', 'PC-202609-005', 'DMC05', 'Thanh toán tiền mua men vi sinh sống đông khô từ Chr. Hansen Đan Mạch', 240000000.00),
('CTPC-006-1', 'PC-202609-006', 'DMC01', 'Thanh toán tiền sữa tươi chuẩn organic trang trại Vinamilk Green Farm Tây Ninh', 420000000.00),
('CTPC-007-1', 'PC-202609-007', 'DMC01', 'Thanh toán tiền sữa bò hữu cơ trang trại Organic Đà Lạt kỳ tháng 8', 290000000.00),
('CTPC-008-1', 'PC-202609-008', 'DMC06', 'Thanh toán hương liệu tự nhiên dâu & socola cho Kerry Ingredients VN', 165000000.00),
('CTPC-009-1', 'PC-202609-009', 'DMC06', 'Thanh toán tiền vi chất Canxi nano & Vitamin D3 từ DSM Thụy Sĩ', 210000000.00),
('CTPC-010-1', 'PC-202609-010', 'DMC01', 'Thanh toán tiền sữa tươi thu gom từ Hợp tác xã chăn nuôi Đơn Dương', 195000000.00),
('CTPC-011-1', 'PC-202609-011', 'DMC07', 'Thanh toán tiền mua pallet nhựa và khay chứa sữa từ Nhựa Duy Tân', 88000000.00),
('CTPC-012-1', 'PC-202609-012', 'DMC12', 'Thanh toán cước vận chuyển xe bồn lạnh luân chuyển sữa tươi ABA Cooltrans', 145000000.00),
('CTPC-013-1', 'PC-202609-013', 'DMC01', 'Thanh toán tiền sữa tươi thô trang trại công nghệ cao Yên Định, Thanh Hóa', 260000000.00),
('CTPC-014-1', 'PC-202609-014', 'DMC17', 'Thanh toán bảo dưỡng hệ thống điều hòa không khí kho lạnh REE Corp', 75000000.00),
('CTPC-015-1', 'PC-202609-015', 'DMC07', 'Thanh toán tiền mua 50.000 vỏ thùng carton in offset Tân Á', 68000000.00),
('CTPC-016-1', 'PC-202609-016', 'DMC08', 'Chi trả lương tháng 8/2026 cho Trưởng phòng Kho vận Nguyễn Văn Hùng', 28000000.00),
('CTPC-017-1', 'PC-202609-017', 'DMC08', 'Chi trả lương tháng 8/2026 cho Kế toán trưởng Trần Thị Thu Thảo', 32000000.00),
('CTPC-018-1', 'PC-202609-018', 'DMC08', 'Chi trả lương tháng 8/2026 cho Trưởng ca sản xuất Lê Minh Tuấn', 26000000.00),
('CTPC-019-1', 'PC-202609-019', 'DMC08', 'Chi trả lương tháng 8/2026 cho Chuyên viên kinh doanh Phạm Hoàng Nam', 16000000.00),
('CTPC-020-1', 'PC-202609-020', 'DMC08', 'Chi trả lương tháng 8/2026 cho Ban Giám đốc điều hành Trịnh Đình Đức', 45000000.00),
('CTPC-021-1', 'PC-202609-021', 'DMC14', 'Thanh toán tiền điện sản xuất cho Điện lực Bến Cát (Nhà máy Mega Plant)', 185000000.00),
('CTPC-022-1', 'PC-202609-022', 'DMC15', 'Chi tiền nước sinh hoạt và sản xuất văn phòng Tân Trào kỳ tháng 8', 14500000.00),
('CTPC-023-1', 'PC-202609-023', 'DMC16', 'Chi tiền mua dầu DO vận hành lò hơi tiệt trùng áp suất cao nhà máy', 95000000.00),
('CTPC-024-1', 'PC-202609-024', 'DMC10', 'Trích nộp BHXH, BHYT, BHTN tháng 8/2026 cho cơ quan Bảo hiểm TP.HCM', 168000000.00),
('CTPC-025-1', 'PC-202609-025', 'DMC21', 'Thanh toán chi phí chiến dịch quảng cáo ra mắt dòng Sữa Hạt Super Nut', 250000000.00),
('CTPC-026-1', 'PC-202609-026', 'DMC04', 'Thanh toán tiền mua bao bì đợt 2 tháng 9 cho Tetra Pak (Chờ duyệt CFO)', 380000000.00),
('CTPC-027-1', 'PC-202609-027', 'DMC03', 'Thanh toán đơn hàng 35 tấn đường luyện TTC Sugar (Chờ duyệt)', 140000000.00),
('CTPC-028-1', 'PC-202609-028', 'DMC01', 'Thanh toán tiền sữa bò tươi đợt 1 tháng 9 Nông trại Mộc Châu (Chờ duyệt)', 285000000.00),
('CTPC-029-1', 'PC-202609-029', 'DMC12', 'Thanh toán cước xe tải lạnh giao hàng chuỗi siêu thị miền Trung ABA', 128000000.00),
('CTPC-030-1', 'PC-202609-030', 'DMC29', 'Chi mua sắm trang phục bảo hộ phòng sạch công nhân kho bảo quản UHT', 18500000.00),
('CTPC-031-1', 'PC-202609-031', 'DMC18', 'Chi mua phụ tùng van áp lực thay thế máy tiệt trùng UHT số 2', 45000000.00),
('CTPC-032-1', 'PC-202609-032', 'DMC01', 'Lập phiếu chi mua sữa tươi đợt 2 tháng 9 Green Farm Tây Ninh', 310000000.00),
('CTPC-033-1', 'PC-202609-033', 'DMC06', 'Lập phiếu thanh toán hương vani và hạt dẻ Kerry Ingredients', 92000000.00),
('CTPC-034-1', 'PC-202609-034', 'DMC26', 'Tạm ứng phí dịch vụ kiểm toán bán niên năm 2026 cho PwC Việt Nam', 150000000.00),
('CTPC-035-1', 'PC-202609-035', 'DMC20', 'Chi phí tổ chức chương trình đổi nắp hộp sữa trúng thưởng tại Cần Thơ', 12000000.00);

--
-- Cấu trúc bảng `chitietphieunhapnvl`
--
DROP TABLE IF EXISTS `chitietphieunhapnvl`;
CREATE TABLE `chitietphieunhapnvl` (
  `maPhieuNhapNVL` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maTonKho` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `donGia` float DEFAULT '0',
  `thanhTien` float DEFAULT '0',
  `ngaySanXuat` date DEFAULT NULL,
  `hanSuDung` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapNVL`,`maTonKho`),
  KEY `fk_ctpnnvl_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpnnvl_phieu` FOREIGN KEY (`maPhieuNhapNVL`) REFERENCES `phieunhapnvl` (`maPhieuNhapNVL`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpnnvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `tonkho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieunhapnvl` (3 bản ghi)
--
INSERT INTO `chitietphieunhapnvl` (`maPhieuNhapNVL`, `maTonKho`, `soLuong`, `donGia`, `thanhTien`, `ngaySanXuat`, `hanSuDung`, `ghiChu`) VALUES
('PNNVL2026090101', 'LOT-NVL-20260901-01', 20000, 14500, 290000000, '2026-09-13', '2026-10-08', 'Kiểm nghiệm vi sinh đạt 100%'),
('PNNVL2026090502', 'LOT-NVL-20260905-02', 10000, 21000, 210000000, '2026-08-24', '2027-09-23', 'Bao 50kg đóng kín'),
('PNNVL2026090803', 'LOT-NVL-20260908-04', 500000, 450, 225000000, '2026-09-08', '2028-09-12', 'Cuộn màng tiệt trùng UHT');

--
-- Cấu trúc bảng `chitietphieunhapsp`
--
DROP TABLE IF EXISTS `chitietphieunhapsp`;
CREATE TABLE `chitietphieunhapsp` (
  `maPhieuNhapSP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maTonKho` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `ngaySanXuat` date DEFAULT NULL,
  `hanSuDung` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapSP`,`maTonKho`),
  KEY `fk_ctpnsp_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpnsp_phieu` FOREIGN KEY (`maPhieuNhapSP`) REFERENCES `phieunhapsp` (`maPhieuNhapSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpnsp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `tonkho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieunhapsp` (3 bản ghi)
--
INSERT INTO `chitietphieunhapsp` (`maPhieuNhapSP`, `maTonKho`, `soLuong`, `ngaySanXuat`, `hanSuDung`, `ghiChu`) VALUES
('PNSP2026090201', 'LOT-SP-20260902-FEFO1', 5000, '2026-08-09', '2027-04-11', 'QC đạt chuẩn Monde Selection'),
('PNSP2026090402', 'LOT-SP-20260904-SC01', 3000, '2026-09-01', '2027-04-01', 'Bảo quản kho mát ngay'),
('PNSP2026090803', 'LOT-SP-20260908-FEFO2', 15000, '2026-09-18', '2027-09-23', 'Nhập kho tổng');

--
-- Cấu trúc bảng `chitietphieuthu`
--
DROP TABLE IF EXISTS `chitietphieuthu`;
CREATE TABLE `chitietphieuthu` (
  `maChiTietThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maPhieuThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maDanhMucThu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dienGiai` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT '0.00',
  PRIMARY KEY (`maChiTietThu`),
  KEY `fk_ctpt_pt` (`maPhieuThu`),
  KEY `fk_ctpt_dmt` (`maDanhMucThu`),
  CONSTRAINT `fk_ctpt_dmt` FOREIGN KEY (`maDanhMucThu`) REFERENCES `danhmucthu` (`maDanhMucThu`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpt_pt` FOREIGN KEY (`maPhieuThu`) REFERENCES `phieuthu` (`maPhieuThu`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieuthu` (36 bản ghi)
--
INSERT INTO `chitietphieuthu` (`maChiTietThu`, `maPhieuThu`, `maDanhMucThu`, `dienGiai`, `soTien`) VALUES
('CTPT_FIN_1790146179', 'PT_FIN_1790146179', 'DMT_FIN_1790146179', 'Thu tiền đợt 1', 5000000.00),
('CTPT-001-1', 'PT-202609-001', 'DMT01', 'Thu tiền bán sữa tươi 180ml đợt giao siêu thị Co.opmart miền Nam', 185000000.00),
('CTPT-002-1', 'PT-202609-002', 'DMT12', 'Nộp doanh thu tiền mặt cuối ngày chuỗi Giấc Mơ Sữa Việt Q.1, Q.3', 42000000.00),
('CTPT-003-1', 'PT-202609-003', 'DMT04', 'Thu tiền phân phối sữa chua Probi cho hệ thống WinMart toàn quốc', 245000000.00),
('CTPT-004-1', 'PT-202609-004', 'DMT01', 'Thu công nợ xuất khẩu nội địa nhà phân phối độc quyền Hậu Giang', 310000000.00),
('CTPT-005-1', 'PT-202609-005', 'DMT03', 'Thanh toán tiền sữa đặc có đường Phương Nam cho chuỗi Bách Hóa Xanh', 195000000.00),
('CTPT-006-1', 'PT-202609-006', 'DMT10', 'Thu thanh toán L/C xuất khẩu lô sữa bột Dielac sang Dubai (UAE)', 950000000.00),
('CTPT-007-1', 'PT-202609-007', 'DMT07', 'Thu tiền giao sữa Green Farm cao cấp cho đại siêu thị GO! An Lạc', 178000000.00),
('CTPT-008-1', 'PT-202609-008', 'DMT02', 'Thu thanh toán đơn hàng sữa bột trẻ em trung tâm MM Mega Market', 285000000.00),
('CTPT-009-1', 'PT-202609-009', 'DMT05', 'Thanh toán lô kem ăn Vinamilk giao hệ thống AEON Mall Tân Phú', 125000000.00),
('CTPT-010-1', 'PT-202609-010', 'DMT06', 'Thu tiền phân phối sữa hạt 9 loại Super Nut cho Lotte Mart Nam Sài Gòn', 165000000.00),
('CTPT-011-1', 'PT-202609-011', 'DMT04', 'Thu tiền giao sữa chua uống men sống Probi cho Circle K toàn miền Nam', 88000000.00),
('CTPT-012-1', 'PT-202609-012', 'DMT01', 'Thanh toán đợt 2 sữa tươi tiệt trùng 110ml chuỗi tiện ích GS25', 96000000.00),
('CTPT-013-1', 'PT-202609-013', 'DMT09', 'Thu thanh toán ngân sách Đề án Sữa Học Đường TP.HCM đợt tháng 8/2026', 750000000.00),
('CTPT-014-1', 'PT-202609-014', 'DMT02', 'Thu tiền cung cấp sản phẩm dinh dưỡng y học cho Bệnh viện Chợ Rẫy', 115000000.00),
('CTPT-015-1', 'PT-202609-015', 'DMT01', 'Thu công nợ xuất hàng đợt 1 Tổng đại lý phân phối tiêu dùng miền Bắc', 450000000.00),
('CTPT-016-1', 'PT-202609-016', 'DMT21', 'Hoàn ứng công tác phí giám sát kho lạnh trung chuyển Đà Nẵng', 6500000.00),
('CTPT-017-1', 'PT-202609-017', 'DMT21', 'Hoàn ứng chi phí tiếp khách và khảo sát thị trường đại lý Tây Nam Bộ', 8200000.00),
('CTPT-018-1', 'PT-202609-018', 'DMT20', 'Thu tiền chiết khấu thương mại sản lượng bao bì Aseptic từ Tetra Pak', 85000000.00),
('CTPT-019-1', 'PT-202609-019', 'DMT20', 'Thu tiền thưởng đạt chỉ tiêu thu mua đường tinh luyện từ TTC Sugar', 35000000.00),
('CTPT-020-1', 'PT-202609-020', 'DMT15', 'Thu tiền thanh lý thùng carton phế liệu kho Mega Plant đợt tháng 8', 15500000.00),
('CTPT-021-1', 'PT-202609-021', 'DMT13', 'Thu ký quỹ mở thêm 2 điểm bán mới Cửa hàng Giấc Mơ Sữa Việt Bình Thạnh', 50000000.00),
('CTPT-022-1', 'PT-202609-022', 'DMT01', 'Thu tiền thanh toán đơn hàng sữa tươi tiệt trùng tuần 1 tháng 9/2026', 320000000.00),
('CTPT-023-1', 'PT-202609-023', 'DMT07', 'Thu tiền hàng sữa tươi sinh thái Green Farm đại lý Hậu Giang', 145000000.00),
('CTPT-024-1', 'PT-202609-024', 'DMT04', 'Thu tiền phân phối sữa chua ăn nha đam và có đường Bách Hóa Xanh', 210000000.00),
('CTPT-025-1', 'PT-202609-025', 'DMT29', 'Thu chênh lệch tỷ giá thanh lý hợp đồng xuất khẩu sữa bột Dubai', 28000000.00),
('CTPT-026-1', 'PT-202609-026', 'DMT18', 'Thu lãi tiền gửi ngân hàng phát sinh kỳ tháng 8/2026 tài khoản VCB', 45000000.00),
('CTPT-027-1', 'PT-202609-027', 'DMT01', 'Thu tiền hàng đại siêu thị GO! Nguyễn Thị Thập (Chờ đối soát UNC ngân hàng)', 165000000.00),
('CTPT-028-1', 'PT-202609-028', 'DMT03', 'Thu thanh toán sữa đặc Phương Nam siêu thị MM Mega (Chờ đối soát)', 135000000.00),
('CTPT-029-1', 'PT-202609-029', 'DMT06', 'Thu tiền đợt giao sữa hạt Super Nut cho AEON Mall Bình Tân', 98000000.00),
('CTPT-030-1', 'PT-202609-030', 'DMT04', 'Thu thanh toán sữa chua ăn lốc 4 Lotte Mart (Chờ sổ phụ đối chiếu)', 112000000.00),
('CTPT-031-1', 'PT-202609-031', 'DMT09', 'Thu đợt đầu năm học mới đề án Sữa Học Đường TP.HCM (Chờ xác nhận kho bạc)', 820000000.00),
('CTPT-032-1', 'PT-202609-032', 'DMT01', 'Lập phiếu thu đơn đặt hàng mới tuần 3 tháng 9 chuỗi Circle K', 75000000.00),
('CTPT-033-1', 'PT-202609-033', 'DMT05', 'Lập phiếu thu giao kem ốc quế và phô mai miếng chuỗi GS25', 54000000.00),
('CTPT-034-1', 'PT-202609-034', 'DMT02', 'Thu tiền đợt 2 đơn hàng sữa bột Dielac Gold cho nhà phân phối Hà Nội', 380000000.00),
('CTPT-035-1', 'PT-202609-035', 'DMT12', 'Thu nộp tiền mặt doanh thu bán lẻ cuối ngày Cửa hàng Vinamilk Q.7', 32000000.00);

--
-- Cấu trúc bảng `chitietphieuxuatnvl`
--
DROP TABLE IF EXISTS `chitietphieuxuatnvl`;
CREATE TABLE `chitietphieuxuatnvl` (
  `maPhieuXuatNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maTonKho` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuXuatNVL`,`maTonKho`),
  KEY `fk_ctpxnvl_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpxnvl_phieu` FOREIGN KEY (`maPhieuXuatNVL`) REFERENCES `phieuxuatnvl` (`maPhieuXuatNVL`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpxnvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `tonkho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieuxuatnvl` (2 bản ghi)
--
INSERT INTO `chitietphieuxuatnvl` (`maPhieuXuatNVL`, `maTonKho`, `soLuong`, `ghiChu`) VALUES
('PXNVL2026090301', 'LOT-NVL-20260901-01', 4500, 'Xuất theo lệnh sản xuất LSX-UHT-20260903'),
('PXNVL2026090602', 'LOT-NVL-20260905-02', 1500, 'Xuất theo lệnh sản xuất LSX-SC-20260906');

--
-- Cấu trúc bảng `chitietphieuxuatsp`
--
DROP TABLE IF EXISTS `chitietphieuxuatsp`;
CREATE TABLE `chitietphieuxuatsp` (
  `maPhieuXuatSP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maTonKho` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuXuatSP`,`maTonKho`),
  KEY `fk_ctpxsp_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpxsp_phieu` FOREIGN KEY (`maPhieuXuatSP`) REFERENCES `phieuxuatsp` (`maPhieuXuatSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpxsp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `tonkho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieuxuatsp` (4 bản ghi)
--
INSERT INTO `chitietphieuxuatsp` (`maPhieuXuatSP`, `maTonKho`, `soLuong`, `ghiChu`) VALUES
('PX26090872', 'LOT-SP-20260902-FEFO1', 1, 'Xuất tự động cho SP001'),
('PXSP2026090501', 'LOT-SP-20260902-FEFO1', 3800, 'Ưu tiên xuất lô gần HSD theo chuẩn ISO/HACCP'),
('PXSP2026090702', 'LOT-SP-20260904-SC01', 2150, 'Vận chuyển xe xe đông lạnh Vinamilk Express'),
('PXSP2026091003', 'LOT-SP-20260908-FEFO2', 800, 'Bàn giao cửa hàng Giấc Mơ Sữa Việt');

--
-- Cấu trúc bảng `chitietphieuyeucaubtp`
--
DROP TABLE IF EXISTS `chitietphieuyeucaubtp`;
CREATE TABLE `chitietphieuyeucaubtp` (
  `maPhieuYCBTP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maBTP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenBTP` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soLuong` int DEFAULT '0',
  PRIMARY KEY (`maPhieuYCBTP`,`maBTP`),
  CONSTRAINT `fk_ctpycbtp_phieu` FOREIGN KEY (`maPhieuYCBTP`) REFERENCES `phieuyeucaubtp` (`maPhieuYCBTP`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieuyeucaubtp` (1 bản ghi)
--
INSERT INTO `chitietphieuyeucaubtp` (`maPhieuYCBTP`, `maBTP`, `tenBTP`, `soLuong`) VALUES
('YCBTP20260901', 'BTP-SUA-UHT', 'Sữa tươi tiệt trùng UHT', 20000);

--
-- Cấu trúc bảng `chitietphieuyeucaunvl`
--
DROP TABLE IF EXISTS `chitietphieuyeucaunvl`;
CREATE TABLE `chitietphieuyeucaunvl` (
  `maPhieuYCNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  PRIMARY KEY (`maPhieuYCNVL`,`maNVL`),
  KEY `fk_ctpycnvl_nvl` (`maNVL`),
  CONSTRAINT `fk_ctpycnvl_nvl` FOREIGN KEY (`maNVL`) REFERENCES `nguyenvatlieu` (`maNVL`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpycnvl_phieu` FOREIGN KEY (`maPhieuYCNVL`) REFERENCES `phieuyeucaunvl` (`maPhieuYCNVL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết danh mục NVL cần cấp phát';

--
-- Dữ liệu bảng `chitietphieuyeucaunvl` (3 bản ghi)
--
INSERT INTO `chitietphieuyeucaunvl` (`maPhieuYCNVL`, `maNVL`, `soLuong`) VALUES
('YCNVL20260901', 'NVL001', 18000),
('YCNVL20260901', 'NVL002', 1500),
('YCNVL20260908', 'NVL004', 10000);

--
-- Cấu trúc bảng `chitietphieuyeucauxuatsp`
--
DROP TABLE IF EXISTS `chitietphieuyeucauxuatsp`;
CREATE TABLE `chitietphieuyeucauxuatsp` (
  `maPhieuYCXSP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `ngaySanXuat` date DEFAULT NULL,
  `hanSuDung` date DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCXSP`,`maSanPham`),
  KEY `fk_ctpycxsp_sp` (`maSanPham`),
  CONSTRAINT `fk_ctpycxsp_phieu` FOREIGN KEY (`maPhieuYCXSP`) REFERENCES `phieuyeucauxuatsp` (`maPhieuYCXSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpycxsp_sp` FOREIGN KEY (`maSanPham`) REFERENCES `sanpham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitietphieuyeucauxuatsp` (1 bản ghi)
--
INSERT INTO `chitietphieuyeucauxuatsp` (`maPhieuYCXSP`, `maSanPham`, `soLuong`, `ghiChu`) VALUES
('YCXSP20260901', 'SP001', 19980, 'Đã nhập vào Lô LOT-SP-20260908-FEFO2');

--
-- Cấu trúc bảng `chitiettiendosanxuat`
--
DROP TABLE IF EXISTS `chitiettiendosanxuat`;
CREATE TABLE `chitiettiendosanxuat` (
  `maTienDoSX` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maBTP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuong` int DEFAULT '0',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Đạt',
  PRIMARY KEY (`maTienDoSX`,`maBTP`),
  CONSTRAINT `fk_cttdsx_phieu` FOREIGN KEY (`maTienDoSX`) REFERENCES `tiendosanxuat` (`maTienDoSX`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `chitiettiendosanxuat` (2 bản ghi)
--
INSERT INTO `chitiettiendosanxuat` (`maTienDoSX`, `maBTP`, `soLuong`, `trangThai`) VALUES
('TDSX20260901', 'BTP-SUA-UHT', 20000, 'Đạt chuẩn 100%'),
('TDSX20260908', 'BTP-GREEN-FARM', 10000, 'Đang kiểm nghiệm');

--
-- Cấu trúc bảng `chucvu`
--
DROP TABLE IF EXISTS `chucvu`;
CREATE TABLE `chucvu` (
  `maChucVu` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã chức vụ',
  `tenChucVu` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Tên chức vụ',
  `phuCap` decimal(15,2) DEFAULT '0.00' COMMENT 'Phụ cấp chức vụ',
  PRIMARY KEY (`maChucVu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Chức Vụ';

--
-- Dữ liệu bảng `chucvu` (8 bản ghi)
--
INSERT INTO `chucvu` (`maChucVu`, `tenChucVu`, `phuCap`) VALUES
('CV01', 'Tổng Giám Đốc Điều Hành (CEO)', 15000000.00),
('CV02', 'Giám Đốc Tài Chính (CFO)', 10000000.00),
('CV03', 'Trưởng Phòng Kho Vận', 5000000.00),
('CV04', 'Kế Toán Trưởng', 6000000.00),
('CV05', 'Trưởng Ca Kỹ Thuật Sản Xuất', 4500000.00),
('CV06', 'Thủ Kho Trưởng / Kiểm Soát FEFO', 3000000.00),
('CV07', 'Kế Toán Thanh Toán & Kho', 2500000.00),
('CV08', 'Chuyên Viên KCS / Kiểm Định Chất Lượng', 2500000.00);

--
-- Cấu trúc bảng `congdoan`
--
DROP TABLE IF EXISTS `congdoan`;
CREATE TABLE `congdoan` (
  `maCongDoan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã công đoạn',
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lệnh sản xuất liên quan',
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên quản lý công đoạn',
  `tenLenh` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Tên công đoạn (Phối trộn, Tiệt trùng, Đồng hóa, Chiết rót, Đóng gói)',
  `nhanCong` int DEFAULT '0' COMMENT 'Số lượng nhân công phân công',
  `ngayBatDau` date DEFAULT NULL COMMENT 'Ngày bắt đầu công đoạn',
  `ngayKetThuc` date DEFAULT NULL COMMENT 'Ngày kết thúc công đoạn',
  `chiPhi` decimal(18,2) DEFAULT '0.00' COMMENT 'Chi phí thực hiện công đoạn',
  `thanhPham` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Tên bán thành phẩm / sản phẩm đầu ra',
  `soLuongThanhPham` int DEFAULT '0' COMMENT 'Số lượng thành phẩm công đoạn',
  `khau` int DEFAULT '1' COMMENT 'Số thứ tự khâu/bước',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ thực hiện' COMMENT 'Trạng thái công đoạn',
  PRIMARY KEY (`maCongDoan`),
  KEY `fk_cd_lsx` (`maLenh`),
  KEY `fk_cd_nv` (`maNhanVien`),
  CONSTRAINT `fk_cd_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cd_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Các công đoạn trong quy trình sản xuất';

--
-- Dữ liệu bảng `congdoan` (4 bản ghi)
--
INSERT INTO `congdoan` (`maCongDoan`, `maLenh`, `maNhanVien`, `tenLenh`, `nhanCong`, `ngayBatDau`, `ngayKetThuc`, `chiPhi`, `thanhPham`, `soLuongThanhPham`, `khau`, `trangThai`) VALUES
('CD01-01', 'LSX20260901', 'NV003', 'Phối trộn & Gia nhiệt ban đầu', 6, '2026-09-11', '2026-09-11', 12000000.00, 'BTP Sữa tươi đã phối trộn', 20000, 1, 'Đã hoàn thành'),
('CD01-02', 'LSX20260901', 'NV003', 'Tiệt trùng UHT 140 độ C & Đồng hóa áp suất cao', 4, '2026-09-12', '2026-09-12', 25000000.00, 'BTP Sữa tươi tiệt trùng UHT', 20000, 2, 'Đã hoàn thành'),
('CD01-03', 'LSX20260901', 'NV007', 'Chiết rót vô trùng Aseptic & Đóng gói thùng carton', 8, '2026-09-12', '2026-09-13', 32000000.00, 'Thùng Sữa Tươi Tiệt Trùng 100% 180ml', 20000, 3, 'Đã hoàn thành'),
('CD03-01', 'LSX20260908', 'NV007', 'Kiểm định & Xử lý sữa thô Green Farm Tây Ninh', 5, '2026-09-19', '2026-09-20', 15000000.00, 'BTP Sữa tươi Green Farm đạt chuẩn', 10000, 1, 'Đang thực hiện');

--
-- Cấu trúc bảng `congno`
--
DROP TABLE IF EXISTS `congno`;
CREATE TABLE `congno` (
  `maCongNo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soTienNo` decimal(18,2) DEFAULT '0.00',
  `soTienDaTra` decimal(18,2) DEFAULT '0.00',
  `soTienConLai` decimal(18,2) DEFAULT '0.00',
  `hanThanhToan` date DEFAULT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Còn nợ',
  `maHoaDon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maKhachHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maCongNo`),
  KEY `fk_cn_hd` (`maHoaDon`),
  KEY `fk_cn_kh` (`maKhachHang`),
  CONSTRAINT `fk_cn_hd` FOREIGN KEY (`maHoaDon`) REFERENCES `hoadon` (`maHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cn_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `khachhang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `congno` (3 bản ghi)
--
INSERT INTO `congno` (`maCongNo`, `soTienNo`, `soTienDaTra`, `soTienConLai`, `hanThanhToan`, `trangThai`, `maHoaDon`, `maKhachHang`) VALUES
('CN-KH001-202609', 770000000.00, 500000000.00, 270000000.00, '2026-10-23', 'Còn nợ trong hạn', 'HDGTGT-20260901', 'KH001'),
('CN-KH003-202609', 520000000.00, 520000000.00, '0.00', '2026-10-08', 'Đã thanh toán đủ', 'HDGTGT-20260905', 'KH003'),
('CN-KH005-202609', 450000000.00, '0.00', 450000000.00, '2026-11-07', 'Chưa thanh toán', 'HDGTGT-20260908', 'KH005');

--
-- Cấu trúc bảng `danhmucchi`
--
DROP TABLE IF EXISTS `danhmucchi`;
CREATE TABLE `danhmucchi` (
  `maDanhMucChi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenDanhMucChi` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` bit(1) DEFAULT b'1',
  PRIMARY KEY (`maDanhMucChi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `danhmucchi` (33 bản ghi)
--
INSERT INTO `danhmucchi` (`maDanhMucChi`, `tenDanhMucChi`, `moTa`, `trangThai`) VALUES
('DMC_FIN_1790146179', 'Chi phí thử nghiệm kiểm thử tự động FIN_1790146179', 'Danh mục chi test tự động', 1),
('DMC01', 'Chi mua sữa tươi thô nguyên liệu từ các nông trại', 'Thanh toán tiền sữa bò tươi từ các trang trại công nghệ cao Mộc Châu, Tây Ninh', 1),
('DMC02', 'Chi mua bột sữa gầy nhập khẩu từ Fonterra New Zealand', 'Nhập khẩu bột sữa nguyên kem phục vụ sản xuất sữa bột và sữa đặc', 1),
('DMC03', 'Chi mua đường tinh luyện cao cấp từ TTC Sugar Biên Hòa', 'Nguyên liệu phối trộn cho dòng sữa có đường và nước ngọt tiệt trùng', 1),
('DMC04', 'Chi mua bao bì phức hợp tiệt trùng từ Tetra Pak', 'Vỏ hộp giấy Aseptic 6 lớp vô trùng phục vụ đóng gói sữa tiệt trùng UHT', 1),
('DMC05', 'Chi mua men vi sinh phân giải từ Chr. Hansen Đan Mạch', 'Chủng men sống Probiotics phục vụ dây chuyền sữa chua lên men tự nhiên', 1),
('DMC06', 'Chi mua vi chất dinh dưỡng, Vitamin & Khoáng chất từ DSM', 'Vi chất bổ sung phát triển trí não DHA, Canxi nano, Vitamin A & D3', 1),
('DMC07', 'Chi mua bao bì thùng carton, pallet nhựa từ Duy Tân & Tân Á', 'Bao bì cấp 2 và công cụ bảo quản lưu kho vận chuyển pallet', 1),
('DMC08', 'Chi trả lương cán bộ công nhân viên định kỳ hàng tháng', 'Lương theo hợp đồng phân hệ HRM cho toàn thể cán bộ công nhân viên', 1),
('DMC09', 'Chi thưởng năng suất, lương tháng 13 và lễ Tết', 'Khen thưởng thi đua sản xuất và động viên người lao động', 1),
('DMC10', 'Chi nộp Bảo hiểm Xã hội, Y tế và Thất nghiệp (BHXH)', 'Trích nộp nghĩa vụ bảo hiểm bắt buộc theo luật lao động cho nhân viên', 1),
('DMC11', 'Chi kinh phí Công đoàn và quỹ phúc lợi xã hội', 'Trích nộp 2% kinh phí công đoàn và thăm hỏi ốm đau, hiếu hỷ', 1),
('DMC12', 'Chi cước vận tải lạnh chuyên dụng ABA Cooltrans', 'Cước xe tải lạnh 2-4 độ C luân chuyển sữa tươi từ nông trại về nhà máy', 1),
('DMC13', 'Chi phí thuê kho bãi trung chuyển logistics vùng miền', 'Thuê diện tích kho hàng tại các hub trọng điểm Cần Thơ, Đà Nẵng, Hải Phòng', 1),
('DMC14', 'Chi tiền điện năng lượng vận hành hệ thống kho lạnh UHT', 'Hóa đơn tiền điện sản xuất cho EVN tại Siêu Nhà Máy Mega Plant Bình Dương', 1),
('DMC15', 'Chi tiền nước sản xuất và hệ thống xử lý nước thải', 'Chi phí nước tinh khiết và vận hành trạm tái sinh nước đạt chuẩn Net Zero', 1),
('DMC16', 'Chi mua dầu DO và khí đốt vận hành lò hơi tiệt trùng UHT', 'Nhiên liệu sinh hơi tiệt trùng áp suất cao cho hệ thống gia nhiệt sản xuất', 1),
('DMC17', 'Chi bảo dưỡng định kỳ hệ thống robot tự động Mega Plant', 'Bảo trì dàn máy chiết rót tốc độ cao và cánh tay robot xếp pallet kho thông minh', 1),
('DMC18', 'Chi sửa chữa, thay thế phụ tùng máy cô đặc sữa chân không', 'Vật tư thay thế định kỳ van áp lực, gioăng cao su chịu nhiệt ngành thực phẩm', 1),
('DMC19', 'Chi hoa hồng và chiết khấu bán hàng cho đại lý cấp 1', 'Thanh toán chiết khấu doanh thu cho các nhà phân phối độc quyền', 1),
('DMC20', 'Chi khuyến mại người tiêu dùng và chương trình quà tặng', 'Kinh phí làm ly sứ, đồ chơi trẻ em đính kèm lốc sữa và phiếu cào may mắn', 1),
('DMC21', 'Chi quảng cáo truyền hình (TVC), báo chí và tiếp thị số', 'Chiến dịch truyền thông thương hiệu Vinamilk - Để tâm đến từng giọt sữa', 1),
('DMC22', 'Chi tài trợ chương trình Quỹ Sữa Vươn Cao Việt Nam', 'Trao tặng hàng triệu ly sữa cho trẻ em có hoàn cảnh khó khăn vùng sâu xa', 1),
('DMC23', 'Chi hỗ trợ giống cỏ và thú y cho các hộ nuôi bò sữa', 'Chính sách trợ giá cám dinh dưỡng và vắc xin phòng dịch cho liên kết nông dân', 1),
('DMC24', 'Chi phí kiểm nghiệm KCS, chứng nhận ISO 22000 & Organic', 'Phí đánh giá định kỳ của tổ chức Bureau Veritas và Eurofins quốc tế', 1),
('DMC25', 'Chi phí mua sắm bản quyền phần mềm ERP SAP & hạ tầng số', 'Phí bảo trì license hàng năm hệ thống máy chủ cơ sở dữ liệu doanh nghiệp', 1),
('DMC26', 'Chi phí kiểm toán độc lập báo cáo tài chính thường niên', 'Thù lao dịch vụ kiểm toán cho nhóm công ty Big 4 (PwC / KPMG)', 1),
('DMC27', 'Chi phí thuê văn phòng trụ sở chính Tân Trào và chi nhánh', 'Hợp đồng thuê mặt bằng văn phòng làm việc và phí dịch vụ quản lý tòa nhà', 1),
('DMC28', 'Chi phí đào tạo nâng cao tay nghề và học bổng Vinamilk', 'Chương trình tu nghiệp kỹ sư công nghệ sữa tại Hà Lan và Đan Mạch', 1),
('DMC29', 'Chi trang cấp đồng phục và bảo hộ lao động phòng sạch', 'Bộ quần áo chống bụi vô trùng, giày cách điện, nón trùm tóc công nhân', 1),
('DMC30', 'Chi trả lãi vay vốn lưu động phục vụ chu kỳ sản xuất', 'Tiền lãi vay các ngân hàng thương mại tài trợ vốn thu mua nông sản', 1),
('DMC31', 'Chi phí dịch vụ ngân hàng, phí chuyển tiền và mở L/C', 'Phí thanh toán quốc tế và phí quản lý tài khoản định kỳ ngân hàng', 1),
('DMC32', 'Chi nộp thuế Thu nhập doanh nghiệp (TNDN) và thuế môn bài', 'Nộp ngân sách nhà nước tiền thuế thu nhập doanh nghiệp quý', 1);

--
-- Cấu trúc bảng `danhmucthu`
--
DROP TABLE IF EXISTS `danhmucthu`;
CREATE TABLE `danhmucthu` (
  `maDanhMucThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenDanhMucThu` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `moTa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` bit(1) DEFAULT b'1',
  PRIMARY KEY (`maDanhMucThu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `danhmucthu` (33 bản ghi)
--
INSERT INTO `danhmucthu` (`maDanhMucThu`, `tenDanhMucThu`, `moTa`, `trangThai`) VALUES
('DMT_FIN_1790146179', 'Thu tiền thử nghiệm kiểm thử tự động FIN_1790146179', 'Danh mục test tự động', 1),
('DMT01', 'Thu tiền bán sữa tươi tiệt trùng 100% & ít đường', 'Thu hồi tiền bán lẻ và bán buôn dòng sữa tươi tiệt trùng đóng hộp 110ml, 180ml', 1),
('DMT02', 'Thu tiền bán sữa bột dinh dưỡng Dielac & Alpha Gold', 'Thu tiền phân phối sữa bột trẻ em và người cao tuổi toàn quốc', 1),
('DMT03', 'Thu tiền bán sữa đặc Ông Thọ & Ngôi Sao Phương Nam', 'Thu từ các chuỗi F&B, quán cafe và đại lý làm bánh truyền thống', 1),
('DMT04', 'Thu tiền bán sữa chua ăn & sữa chua uống Probi', 'Thu hồi tiền từ các hệ thống siêu thị chuỗi bán lẻ men sống Probi', 1),
('DMT05', 'Thu tiền bán kem ăn và phô mai Vinamilk', 'Doanh thu sản phẩm đông lạnh, kem cây, kem hộp và phô mai miếng', 1),
('DMT06', 'Thu tiền bán sữa hạt dinh dưỡng Super Nut', 'Doanh thu dòng sản phẩm sữa 9 loại hạt cao cấp thuần thực vật', 1),
('DMT07', 'Thu tiền bán sữa tươi hữu cơ Green Farm & Organic', 'Doanh thu phân khúc sữa cao cấp từ hệ thống trang trại sinh thái', 1),
('DMT08', 'Thu tiền bán bơ lạt & chế phẩm sữa công nghiệp', 'Cung cấp nguyên liệu chế biến bơ sữa cho các nhà máy bánh kẹo', 1),
('DMT09', 'Thu thanh toán hợp đồng đề án Sữa Học Đường', 'Thanh toán từ ngân sách và ban điều hành đề án dinh dưỡng học đường', 1),
('DMT10', 'Thu ngoại tệ xuất khẩu sữa sang Trung Đông & Dubai', 'Nguồn thu thanh toán L/C ngoại tệ từ các đối tác Jebel Ali UAE', 1),
('DMT11', 'Thu ngoại tệ xuất khẩu sữa sang Nhật Bản & Hoa Kỳ', 'Thu kiều hối xuất khẩu sữa chua và nước cốt dừa organic', 1),
('DMT12', 'Thu tiền bán lẻ chuỗi Cửa Hàng Giấc Mơ Sữa Việt', 'Doanh thu thanh toán tiền mặt & POS từ hệ thống showroom Vinamilk', 1),
('DMT13', 'Thu tiền đặt cọc mở mới đại lý phân phối', 'Ký quỹ hợp đồng phân phối độc quyền cấp huyện / tỉnh', 1),
('DMT14', 'Thu tiền bảo lãnh thực hiện hợp đồng tiêu thụ sữa', 'Tiền ký quỹ của các chuỗi siêu thị và đại lý thương mại điện tử', 1),
('DMT15', 'Thu thanh lý bao bì carton và vỏ can nhựa phế liệu', 'Tái chế thu hồi chi phí từ phế phẩm đóng gói tại các nhà máy', 1),
('DMT16', 'Thu thanh lý máy móc cơ khí & thiết bị kho cũ', 'Thanh lý xe nâng, giá kệ kho lạnh sau thời gian khấu hao hết', 1),
('DMT17', 'Thu lãi tiền gửi ngân hàng có kỳ hạn (Fixed Deposits)', 'Lãi suất phát sinh định kỳ từ các khoản tiền gửi quản lý thanh khoản', 1),
('DMT18', 'Thu lãi tiền gửi ngân hàng không kỳ hạn (Demand)', 'Tiền lãi phát sinh hàng tháng trên tài khoản thanh toán vãng lai', 1),
('DMT19', 'Thu cổ tức & lợi nhuận được chia từ công ty liên kết', 'Lợi nhuận từ các công ty bò sữa và chế biến thức ăn chăn nuôi liên kết', 1),
('DMT20', 'Thu chiết khấu thương mại nhận từ nhà cung cấp', 'Thưởng chiết khấu khối lượng từ nhà cung cấp bao bì và nguyên liệu', 1),
('DMT21', 'Thu hoàn ứng công tác phí thị trường miền Bắc', 'Nhân viên kinh doanh hoàn ứng tiền công tác thị trường', 1),
('DMT22', 'Thu hoàn ứng kinh phí tham gia hội chợ triển lãm', 'Hoàn ứng ngân sách triển lãm quốc tế Vietfood & Expo', 1),
('DMT23', 'Thu tiền bồi thường bảo hiểm tài sản và kho bãi', 'Bảo hiểm chi trả bồi thường các tổn thất sự cố vận tải và kho lạnh', 1),
('DMT24', 'Thu tiền phạt vi phạm hợp đồng giao nguyên vật liệu', 'Khoản phạt các nhà cung cấp không đảm bảo tiến độ hoặc chất lượng cam kết', 1),
('DMT25', 'Thu phí cho thuê mặt bằng và dịch vụ kho lạnh', 'Cho đối tác logistics gửi bảo quản tạm thời tại hệ thống kho lạnh trung chuyển', 1),
('DMT26', 'Thu phí nhượng quyền thương mại chuỗi Giấc Mơ Sữa Việt', 'Phí nhượng quyền định kỳ từ các đại lý ủy quyền thương hiệu', 1),
('DMT27', 'Thu tài trợ nghiên cứu khoa học dinh dưỡng học đường', 'Khoản viện trợ không hoàn lại từ các viện nghiên cứu dinh dưỡng quốc tế', 1),
('DMT28', 'Thu hồi nợ khó đòi đã xử lý xóa sổ kế toán', 'Thu hồi các khoản công nợ cũ của các đại lý đã giải thể', 1),
('DMT29', 'Thu chênh lệch tỷ giá ngoại tệ dương khi xuất khẩu sữa', 'Lãi chênh lệch tỷ giá USD/VND khi đáo hạn chứng từ thanh toán xuất khẩu', 1),
('DMT30', 'Thu hoàn thuế Giá trị gia tăng (VAT) hàng nông sản xuất khẩu', 'Cục thuế hoàn tiền thuế VAT theo hồ sơ hoàn thuế định kỳ', 1),
('DMT31', 'Thu thưởng thi đua doanh số kênh bán lẻ hiện đại (MT)', 'Tiền thưởng từ đối tác trung tâm thương mại khi vượt mốc cam kết', 1),
('DMT32', 'Các khoản thu nhập vãng lai và hoạt động tài chính khác', 'Các khoản thu tài chính phát sinh ngoài kế hoạch hoạt động thông thường', 1);

--
-- Cấu trúc bảng `denghibosungsanpham`
--
DROP TABLE IF EXISTS `denghibosungsanpham`;
CREATE TABLE `denghibosungsanpham` (
  `maDeNghi` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã phiếu đề nghị bổ sung SP',
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sản phẩm cần sản xuất thêm',
  `maKho` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kho tiếp nhận đề nghị',
  `soLuong` int NOT NULL DEFAULT '0' COMMENT 'Số lượng đề nghị bổ sung',
  `ngayDeNghi` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày lập phiếu đề nghị',
  `ngayCanHang` date DEFAULT NULL COMMENT 'Thời hạn cần bổ sung hàng',
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'ChoDuyet' COMMENT 'Trạng thái: ChoDuyet, DaDuyet, TuChoi, HoanThanh',
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên thủ kho đề nghị',
  `ghiChu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maDeNghi`),
  KEY `fk_dnbsp_sp` (`maSanPham`),
  KEY `fk_dnbsp_kho` (`maKho`),
  KEY `fk_dnbsp_nv` (`maNV`),
  CONSTRAINT `fk_dnbsp_kho` FOREIGN KEY (`maKho`) REFERENCES `kho` (`maKho`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dnbsp_nv` FOREIGN KEY (`maNV`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dnbsp_sp` FOREIGN KEY (`maSanPham`) REFERENCES `sanpham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu đề nghị bổ sung sản phẩm từ Kho sang Sản xuất';

--
-- Dữ liệu bảng `denghibosungsanpham` (3 bản ghi)
--
INSERT INTO `denghibosungsanpham` (`maDeNghi`, `maSanPham`, `maKho`, `soLuong`, `ngayDeNghi`, `ngayCanHang`, `trangThai`, `maNV`, `ghiChu`) VALUES
('DN20260901', 'SP001', 'KHO-TONG', 5000, '2026-09-18 06:48:40', '2026-09-28', 'DaDuyet', 'NV001', 'Tồn kho UHT 180ml giảm dưới mức an toàn 2,000 thùng'),
('DN20260902', 'SP003', 'KHO-TONG', 3000, '2026-09-20 06:48:40', '2026-09-30', 'HoanThanh', 'NV001', 'Bổ sung phục vụ đơn hàng đối tác siêu thị WinMart'),
('DN20260903', 'SP006', 'KHO-DNG', 4000, '2026-09-22 06:48:40', '2026-10-03', 'ChoDuyet', 'NV002', 'Dự trữ đợt khuyến mãi trung thu Probi');

--
-- Cấu trúc bảng `doituonggiaodich`
--
DROP TABLE IF EXISTS `doituonggiaodich`;
CREATE TABLE `doituonggiaodich` (
  `maDoiTuong` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maThamChieu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã gốc thật sự của KH / NCC / NV',
  `loaiDoiTuong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại đối tượng: KH, NCC, NV, Khac',
  `trangThai` bit(1) DEFAULT b'1' COMMENT 'Trạng thái hoạt động của đối tượng',
  PRIMARY KEY (`maDoiTuong`),
  UNIQUE KEY `uk_dt_loai_thamchieu` (`loaiDoiTuong`,`maThamChieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng ánh xạ đối tượng giao dịch từ Bán hàng, Kho, Nhân sự';

--
-- Dữ liệu bảng `doituonggiaodich` (36 bản ghi)
--
INSERT INTO `doituonggiaodich` (`maDoiTuong`, `maThamChieu`, `loaiDoiTuong`, `trangThai`) VALUES
('DT_FIN_1790146179', 'REF_FIN_1790146179', 'Khac', 1),
('DT-KH001', 'KH001', 'KH', 1),
('DT-KH002', 'KH002', 'KH', 1),
('DT-KH003', 'KH003', 'KH', 1),
('DT-KH004', 'KH004', 'KH', 1),
('DT-KH005', 'KH005', 'KH', 1),
('DT-KH006', 'KH006', 'KH', 1),
('DT-KH007', 'KH007', 'KH', 1),
('DT-KH008', 'KH008', 'KH', 1),
('DT-KH009', 'KH009', 'KH', 1),
('DT-KH010', 'KH010', 'KH', 1),
('DT-KH011', 'KH011', 'KH', 1),
('DT-KH012', 'KH012', 'KH', 1),
('DT-KH013', 'KH013', 'KH', 1),
('DT-KH014', 'KH014', 'KH', 1),
('DT-KH015', 'KH015', 'KH', 1),
('DT-NCC001', 'NCC001', 'NCC', 1),
('DT-NCC002', 'NCC002', 'NCC', 1),
('DT-NCC003', 'NCC003', 'NCC', 1),
('DT-NCC004', 'NCC004', 'NCC', 1),
('DT-NCC005', 'NCC005', 'NCC', 1),
('DT-NCC006', 'NCC006', 'NCC', 1),
('DT-NCC007', 'NCC007', 'NCC', 1),
('DT-NCC008', 'NCC008', 'NCC', 1),
('DT-NCC009', 'NCC009', 'NCC', 1),
('DT-NCC010', 'NCC010', 'NCC', 1),
('DT-NCC011', 'NCC011', 'NCC', 1),
('DT-NCC012', 'NCC012', 'NCC', 1),
('DT-NCC013', 'NCC013', 'NCC', 1),
('DT-NCC014', 'NCC014', 'NCC', 1),
('DT-NCC015', 'NCC015', 'NCC', 1),
('DT-NV001', 'NV001', 'NV', 1),
('DT-NV002', 'NV002', 'NV', 1),
('DT-NV003', 'NV003', 'NV', 1),
('DT-NV004', 'NV004', 'NV', 1),
('DT-NV005', 'NV005', 'NV', 1);

--
-- Cấu trúc bảng `donhang`
--
DROP TABLE IF EXISTS `donhang`;
CREATE TABLE `donhang` (
  `maDonHang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayMua` datetime DEFAULT CURRENT_TIMESTAMP,
  `tongTien` decimal(18,2) DEFAULT '0.00',
  `thanhTien` decimal(18,2) DEFAULT '0.00',
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Chờ xác nhận',
  `maKhachHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên kinh doanh tạo đơn',
  PRIMARY KEY (`maDonHang`),
  KEY `fk_dh_kh` (`maKhachHang`),
  KEY `fk_dh_nv` (`maNhanVien`),
  CONSTRAINT `fk_dh_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `khachhang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dh_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Đơn Bán Hàng';

--
-- Dữ liệu bảng `donhang` (6 bản ghi)
--
INSERT INTO `donhang` (`maDonHang`, `ngayMua`, `tongTien`, `thanhTien`, `trangThai`, `maKhachHang`, `maNhanVien`) VALUES
('DH20260901', '2026-09-09 06:48:40', 770000000.00, 770000000.00, 'Đã giao hàng', 'KH001', 'NV004'),
('DH20260905', '2026-09-13 06:48:40', 520000000.00, 520000000.00, 'Đã giao hàng', 'KH003', 'NV004'),
('DH20260908', '2026-09-16 06:48:40', 450000000.00, 450000000.00, 'Đang giao', 'KH005', 'NV009'),
('DH20260910', '2026-09-18 06:48:40', 310000000.00, 310000000.00, 'Đã xác nhận', 'KH002', 'NV004'),
('DH20260912', '2026-09-20 06:48:40', 285000000.00, 285000000.00, 'Chờ xác nhận', 'KH004', 'NV009'),
('DH20260914', '2026-09-22 06:48:40', 1250000000.00, 1250000000.00, 'Chờ xác nhận', 'KH006', 'NV009');

--
-- Cấu trúc bảng `giaohang`
--
DROP TABLE IF EXISTS `giaohang`;
CREATE TABLE `giaohang` (
  `maGiaoHang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayGiao` datetime DEFAULT NULL,
  `diaChiGiao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Đang giao',
  `maDonHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maPhieuXuatSP` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK trỏ tới PhieuXuatSP (Kho) theo DT05',
  `maKhachHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên giao hàng (NhanVien.maNV theo DT01)',
  PRIMARY KEY (`maGiaoHang`),
  KEY `fk_gh_dh` (`maDonHang`),
  KEY `fk_gh_pxsp` (`maPhieuXuatSP`),
  KEY `fk_gh_kh` (`maKhachHang`),
  KEY `fk_gh_nv` (`maNV`),
  CONSTRAINT `fk_gh_dh` FOREIGN KEY (`maDonHang`) REFERENCES `donhang` (`maDonHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `khachhang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_nv` FOREIGN KEY (`maNV`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_pxsp` FOREIGN KEY (`maPhieuXuatSP`) REFERENCES `phieuxuatsp` (`maPhieuXuatSP`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `giaohang` (3 bản ghi)
--
INSERT INTO `giaohang` (`maGiaoHang`, `ngayGiao`, `diaChiGiao`, `trangThai`, `maDonHang`, `maPhieuXuatSP`, `maKhachHang`, `maNV`) VALUES
('GH20260901', '2026-09-11 06:48:40', 'Kho Tổng Saigon Co.op, KCN Lê Minh Xuân, Bình Chánh, TP.HCM', 'Đã giao thành công', 'DH20260901', 'PXSP2026090501', 'KH001', 'NV004'),
('GH20260905', '2026-09-15 06:48:40', 'Kho Trung Chuyển WinMart, KCN Sóng Thần 2, Dĩ An, Bình Dương', 'Đã giao thành công', 'DH20260905', 'PXSP2026090702', 'KH003', 'NV004'),
('GH20260908', '2026-09-21 06:48:40', 'Kho Bách Hóa Xanh, KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM', 'Đang giao hàng', 'DH20260908', 'PXSP2026091003', 'KH005', 'NV009');

--
-- Cấu trúc bảng `hoadon`
--
DROP TABLE IF EXISTS `hoadon`;
CREATE TABLE `hoadon` (
  `maHoaDon` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayLap` datetime DEFAULT CURRENT_TIMESTAMP,
  `tongTien` decimal(18,2) DEFAULT '0.00',
  `maGiaoHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maHoaDon`),
  KEY `fk_hd_gh` (`maGiaoHang`),
  CONSTRAINT `fk_hd_gh` FOREIGN KEY (`maGiaoHang`) REFERENCES `giaohang` (`maGiaoHang`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `hoadon` (3 bản ghi)
--
INSERT INTO `hoadon` (`maHoaDon`, `ngayLap`, `tongTien`, `maGiaoHang`) VALUES
('HDGTGT-20260901', '2026-09-11 06:48:40', 770000000.00, 'GH20260901'),
('HDGTGT-20260905', '2026-09-15 06:48:40', 520000000.00, 'GH20260905'),
('HDGTGT-20260908', '2026-09-21 06:48:40', 450000000.00, 'GH20260908');

--
-- Cấu trúc bảng `hopdong`
--
DROP TABLE IF EXISTS `hopdong`;
CREATE TABLE `hopdong` (
  `maHopDong` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã hợp đồng lao động',
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã nhân viên ký hợp đồng',
  `loaiHopDong` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Loại hợp đồng (Thử việc/Xác định thời hạn/Không xác định)',
  `ngayHieuLuc` date DEFAULT NULL COMMENT 'Ngày hợp đồng có hiệu lực',
  `ngayHetHan` date DEFAULT NULL,
  `mucLuongCoBan` decimal(15,2) DEFAULT '0.00' COMMENT 'Mức lương cơ bản theo hợp đồng',
  `trangThai` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Hiệu lực',
  PRIMARY KEY (`maHopDong`),
  KEY `fk_hd_nv` (`maNV`),
  CONSTRAINT `fk_hd_nv` FOREIGN KEY (`maNV`) REFERENCES `nhanvien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hợp đồng lao động';

--
-- Dữ liệu bảng `hopdong` (10 bản ghi)
--
INSERT INTO `hopdong` (`maHopDong`, `maNV`, `loaiHopDong`, `ngayHieuLuc`, `ngayHetHan`, `mucLuongCoBan`, `trangThai`) VALUES
('HD2018-005', 'NV005', 'Không xác định thời hạn', '2018-01-01', NULL, 60000000.00, 'Hiệu lực'),
('HD2019-003', 'NV003', 'Không xác định thời hạn', '2019-11-01', NULL, 26000000.00, 'Hiệu lực'),
('HD2020-001', 'NV001', 'Không xác định thời hạn', '2020-03-15', NULL, 28000000.00, 'Hiệu lực'),
('HD2021-002', 'NV002', 'Không xác định thời hạn', '2021-06-10', NULL, 32000000.00, 'Hiệu lực'),
('HD2021-007', 'NV007', 'Xác định thời hạn 3 năm', '2021-09-05', NULL, 18000000.00, 'Hiệu lực'),
('HD2022-004', 'NV004', 'Xác định thời hạn 3 năm', '2022-02-20', NULL, 16000000.00, 'Hiệu lực'),
('HD2022-006', 'NV006', 'Xác định thời hạn 3 năm', '2022-08-15', NULL, 15000000.00, 'Hiệu lực'),
('HD2022-010', 'NV010', 'Không xác định thời hạn', '2022-10-01', NULL, 16000000.00, 'Hiệu lực'),
('HD2023-008', 'NV008', 'Xác định thời hạn 1 năm', '2023-04-12', NULL, 14000000.00, 'Hiệu lực'),
('HD2023-009', 'NV009', 'Xác định thời hạn 1 năm', '2023-01-10', NULL, 15000000.00, 'Hiệu lực');

--
-- Cấu trúc bảng `khachhang`
--
DROP TABLE IF EXISTS `khachhang`;
CREATE TABLE `khachhang` (
  `maKhachHang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenKhachHang` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `soDienThoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `hanMucCongNo` decimal(18,2) DEFAULT '0.00',
  PRIMARY KEY (`maKhachHang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Khách Hàng & Nhà Phân Phối';

--
-- Dữ liệu bảng `khachhang` (15 bản ghi)
--
INSERT INTO `khachhang` (`maKhachHang`, `tenKhachHang`, `soDienThoai`, `diaChi`, `hanMucCongNo`) VALUES
('KH001', 'Hệ Thống Siêu Thị Co.opmart Toàn Quốc (Saigon Co.op)', '02838360143', '131 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM', 500000000.00),
('KH002', 'Chuỗi Cửa Hàng Vinamilk Giấc Mơ Sữa Việt', 1900636979, '10 Tân Trào, Tân Phú, Quận 7, TP.HCM', 1000000000.00),
('KH003', 'Hệ Thống Siêu Thị WinMart / WinMart+ (Masan Group)', '02471066866', 'Số 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM', 800000000.00),
('KH004', 'Đại Lý Tổng Phân Phối Sữa Miền Tây (Hậu Giang)', '02933878999', 'KCN Sông Hậu, Huyện Châu Thành, Hậu Giang', 350000000.00),
('KH005', 'Tập Đoàn Bách Hóa Xanh (MWG)', 19001908, 'KCN Tân Bình, Tân Phú, TP.HCM', 600000000.00),
('KH006', 'Hệ Thống Đại Lý Xuất Khẩu Sữa Trung Đông (Dubai UAE)', '00971432100', 'Jebel Ali Free Zone, Dubai, UAE', 2000000000.00),
('KH007', 'Đại Siêu Thị GO! & Tops Market (Central Retail Việt Nam)', '02839958368', 'Tòa nhà Central Plaza, 163 Phan Đăng Lưu, Phú Nhuận, TP.HCM', 750000000.00),
('KH008', 'Hệ Thống Bán Sỉ MM Mega Market Việt Nam (An Phú)', '02835190390', 'Khu B, KĐT mới An Phú - An Khánh, TP. Thủ Đức, TP.HCM', 900000000.00),
('KH009', 'Chuỗi Siêu Thị AEON Mall Nhật Bản (Tân Phú & Bình Tân)', '02862887733', 'Số 30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM', 1200000000.00),
('KH010', 'Hệ Thống Siêu Thị Lotte Mart Nam Sài Gòn', '02837753232', '469 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, TP.HCM', 650000000.00),
('KH011', 'Chuỗi Cửa Hàng Tiện Lợi Circle K Việt Nam', '02836207070', '160 Bùi Thị Xuân, Phạm Ngũ Lão, Quận 1, TP.HCM', 450000000.00),
('KH012', 'Chuỗi Bán Lẻ Tiện Ích GS25 (Sơn Kim Retail)', '02873022525', 'Toà nhà Empress Tower, 138 Hai Bà Trưng, Quận 1, TP.HCM', 400000000.00),
('KH013', 'Ban Điều Hành Đề Án Sữa Học Đường TP. Hồ Chí Minh', '02838299666', '66-68 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM', 1500000000.00),
('KH014', 'Khoa Dinh Dưỡng & Căn Tin Bệnh Viện Chợ Rẫy', '02838554137', '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM', 300000000.00),
('KH015', 'Công Ty Cổ Phần Phân Phối Tiêu Dùng Miền Bắc (Hà Nội)', '02437896688', 'Khu Công Nghiệp Đài Tư, Sài Đồng, Long Biên, Hà Nội', 850000000.00);

--
-- Cấu trúc bảng `kho`
--
DROP TABLE IF EXISTS `kho`;
CREATE TABLE `kho` (
  `maKho` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenKho` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiKho` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Kho thành phẩm',
  `diaChi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maKho`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `kho` (4 bản ghi)
--
INSERT INTO `kho` (`maKho`, `tenKho`, `loaiKho`, `diaChi`) VALUES
('KHO-CTH', 'Kho Phân Phối Trọng Điểm Tây Nam Bộ (Cần Thơ)', 'Kho thành phẩm', 'KCN Trà Nóc 1, Bình Thủy, Cần Thơ'),
('KHO-DNG', 'Kho Trung Chuyển Miền Trung - Đà Nẵng', 'Kho thành phẩm', 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng'),
('KHO-LTM', 'Kho Lạnh Sữa Tươi Cao Nguyên Mộc Châu', 'Kho NVL', 'Thị trấn Mộc Châu, Sơn La'),
('KHO-TONG', 'Kho Tổng Mega Plant Vinamilk Bình Dương', 'Kho thành phẩm', 'Lô CN-01, KCN Mỹ Phước 2, Bến Cát, Bình Dương');

--
-- Cấu trúc bảng `lenhsanxuat`
--
DROP TABLE IF EXISTS `lenhsanxuat`;
CREATE TABLE `lenhsanxuat` (
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lệnh sản xuất',
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên phụ trách/tạo lệnh',
  `tenLenh` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Tên/Mô tả lệnh sản xuất',
  `ngayTaoLenh` date DEFAULT NULL COMMENT 'Ngày tạo lệnh',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt' COMMENT 'Trạng thái (Chờ duyệt, Đã duyệt, Đang thực hiện, Hoàn thành, Hủy)',
  PRIMARY KEY (`maLenh`),
  KEY `fk_lsx_nv` (`maNhanVien`),
  CONSTRAINT `fk_lsx_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Lệnh Sản Xuất';

--
-- Dữ liệu bảng `lenhsanxuat` (4 bản ghi)
--
INSERT INTO `lenhsanxuat` (`maLenh`, `maNhanVien`, `tenLenh`, `ngayTaoLenh`, `trangThai`) VALUES
('LSX20260901', 'NV003', 'Kế hoạch sản xuất Sữa tươi tiệt trùng UHT 100% 180ml (Batch A)', '2026-09-11', 'Hoàn thành'),
('LSX20260905', 'NV003', 'Kế hoạch sản xuất Sữa chua ăn có đường 100g (Batch Probiotics)', '2026-09-15', 'Hoàn thành'),
('LSX20260908', 'NV007', 'Kế hoạch sản xuất Sữa tươi sinh thái Green Farm 180ml', '2026-09-18', 'Đang thực hiện'),
('LSX20260912', 'NV003', 'Kế hoạch sản xuất Sữa chua uống men sống Probi 65ml', '2026-09-21', 'Đã duyệt');

--
-- Cấu trúc bảng `loainvl`
--
DROP TABLE IF EXISTS `loainvl`;
CREATE TABLE `loainvl` (
  `maLoaiNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenLoaiNVL` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maLoaiNVL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `loainvl` (6 bản ghi)
--
INSERT INTO `loainvl` (`maLoaiNVL`, `tenLoaiNVL`, `ghiChu`) VALUES
('LNVL01', 'Sữa Tươi Thô & Nguyên Liệu Lỏng', 'Sữa tươi thô thu mua từ trang trại Green Farm Vinamilk'),
('LNVL02', 'Nguyên Liệu Khô & Phụ Gia', 'Đường tinh luyện, vi chất dinh dưỡng, hương liệu nhập khẩu'),
('LNVL03', 'Bao Bì & Vật Tư Đóng Gói', 'Vỏ hộp giấy Tetra Pak, nắp nhựa, cuộn màng co'),
('LNVL04', 'Bột Sữa & Béo Dinh Dưỡng', 'Bột sữa gầy NZMP New Zealand, béo sữa chua'),
('LNVL05', 'Men Sữa Chua & Enzyme', 'Men Probiotics LGG nhập khẩu Đan Mạch'),
('LNVL06', 'Trái Cây & Hạt Tự Nhiên', 'Mứt dâu tây Đà Lạt, cốt dừa, bơ hạnh nhân');

--
-- Cấu trúc bảng `nguyenvatlieu`
--
DROP TABLE IF EXISTS `nguyenvatlieu`;
CREATE TABLE `nguyenvatlieu` (
  `maNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maLoaiNVL` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenNVL` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `donVi` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Kg',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maNVL`),
  KEY `fk_nvl_loai` (`maLoaiNVL`),
  CONSTRAINT `fk_nvl_loai` FOREIGN KEY (`maLoaiNVL`) REFERENCES `loainvl` (`maLoaiNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `nguyenvatlieu` (10 bản ghi)
--
INSERT INTO `nguyenvatlieu` (`maNVL`, `maLoaiNVL`, `tenNVL`, `donVi`, `ghiChu`) VALUES
('NVL001', 'LNVL01', 'Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)', 'Lít', 'Bảo quản lạnh 2-4 độ C'),
('NVL002', 'LNVL02', 'Đường Tinh Luyện Biên Hòa Grade A', 'Kg', 'Bảo quản kho khô ráo'),
('NVL003', 'LNVL02', 'Hương Liệu Dâu Tự Nhiên Firmenich', 'Kg', 'Nhập khẩu Thụy Sĩ'),
('NVL004', 'LNVL03', 'Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml', 'Cái', 'Đạt chuẩn tiệt trùng UHT'),
('NVL005', 'LNVL04', 'Bột Sữa Gầy Skim Milk Powder NZMP', 'Kg', 'Nhập khẩu Fonterra New Zealand'),
('NVL006', 'LNVL05', 'Men Probiotics LGG Chr. Hansen', 'Kg', 'Men sống lên men sữa chua Đan Mạch'),
('NVL007', 'LNVL06', 'Mứt Dâu Tây Tự Nhiên Đà Lạt', 'Kg', 'Cốt trái cây tươi chín mộng'),
('NVL008', 'LNVL03', 'Thùng Carton 24 Hộp Sữa 180ml', 'Cái', 'Bao bì carton sóng 5 lớp'),
('NVL009', 'LNVL01', 'Sữa Tươi Thô Trang Trại Green Farm Tây Ninh', 'Lít', 'Đạt chuẩn Organic Châu Âu'),
('NVL010', 'LNVL06', 'Bơ Hạnh Nhân Tự Nhiên Nhập Khẩu Mỹ', 'Kg', 'Phục vụ dòng Sữa Hạt cao cấp');

--
-- Cấu trúc bảng `nhacungcap`
--
DROP TABLE IF EXISTS `nhacungcap`;
CREATE TABLE `nhacungcap` (
  `maNCC` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenNCC` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `maSoThue` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diaChi` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soDienThoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maNCC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `nhacungcap` (15 bản ghi)
--
INSERT INTO `nhacungcap` (`maNCC`, `tenNCC`, `maSoThue`, `diaChi`, `soDienThoai`, `email`) VALUES
('NCC001', 'Tập Đoàn Bao Bì Tetra Pak Việt Nam', '0301458999', 'KCN Việt Nam - Singapore, Bình Dương', '02743756888', 'contact.vn@tetrapak.com'),
('NCC002', 'Công Ty Cổ Phần Đường Biên Hòa (TTC Sugar)', 3600258147, 'KCN Biên Hòa 1, Đồng Nai', '02513836121', 'sales@ttcsugar.com.vn'),
('NCC003', 'Hợp Tác Xã Nông Trại Bò Sữa Mộc Châu Farm', 2600147258, 'Thị trấn Mộc Châu, Sơn La', '02123866112', 'supply@mocchaudairy.com.vn'),
('NCC004', 'Tập Đoàn Dinh Dưỡng Fonterra New Zealand Ltd', 9900112233, 'Auckland, New Zealand / CN TP.HCM', '02838279999', 'nzmp.vietnam@fonterra.com'),
('NCC005', 'Công Ty Men Sống Chr. Hansen Denmark A/S', 9900445566, 'Hoersholm, Đan Mạch', '02839101122', 'chrhansen@danishmicrobiology.dk'),
('NCC006', 'Trang Trại Sinh Thái Vinamilk Green Farm Tây Ninh', 3901234567, 'Huyện Bến Cầu, Tây Ninh', '02763888999', 'greenfarm.tayninh@vinamilk.com.vn'),
('NCC007', 'Trang Trại Bò Sữa Hữu Cơ Vinamilk Organic Đà Lạt', 5801239988, 'Xã Tu Tra, Đơn Dương, Lâm Đồng', '02633844555', 'organic.dalat@vinamilk.com.vn'),
('NCC008', 'Công Ty TNHH Hương Liệu Thực Phẩm Kerry Ingredients VN', 3700987654, 'KCN VSIP 1, Thuận An, Bình Dương', '02743789123', 'contact.vn@kerry.com'),
('NCC009', 'Tập Đoàn Hóa Chất & Vi Chất Dinh Dưỡng DSM Thụy Sĩ', 9900554433, 'Kaiseraugst, Thụy Sĩ / CN Q.1, TP.HCM', '02838234567', 'nutrition.vn@dsm.com'),
('NCC010', 'Hợp Tác Xã Chăn Nuôi Bò Sữa Đơn Dương (Lâm Đồng)', 5800456123, 'Thị trấn Thạnh Mỹ, Đơn Dương, Lâm Đồng', '02633888777', 'donduongmilk@lamdongcoop.vn'),
('NCC011', 'Công Ty Cổ Phần Nhựa Bao Bì Duy Tân', '0302234567', 'KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM', '02838163333', 'sales@duytan.com'),
('NCC012', 'Công Ty TNHH Vận Tải Lạnh Chuỗi Cung Ứng ABA Cooltrans', '0310246810', 'KCN Cát Lái 2, TP. Thủ Đức, TP.HCM', '02837425555', 'dispatch@abacooltrans.vn'),
('NCC013', 'Trang Trại Bò Sữa Công Nghệ Cao Vinamilk Thanh Hóa', 2801998877, 'Thị trấn Thống Nhất, Yên Định, Thanh Hóa', '02373899222', 'farm.thanhhoa@vinamilk.com.vn'),
('NCC014', 'Công Ty Cổ Phần Cơ Điện Lạnh & Thiết Bị Sữa REE Corp', '0301122334', '364 Cộng Hòa, Phường 13, Tân Bình, TP.HCM', '02838100011', 'ree@reepower.com.vn'),
('NCC015', 'Công Ty Cổ Phần Bao Bì Thùng Giấy Tân Á', 3601556677, 'KCN Amata, Biên Hòa, Đồng Nai', '02513998877', 'packaging@tana-box.com.vn');

--
-- Cấu trúc bảng `nhanvien`
--
DROP TABLE IF EXISTS `nhanvien`;
CREATE TABLE `nhanvien` (
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã nhân viên',
  `hoTen` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Họ và tên nhân viên',
  `soDienThoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaySinh` date DEFAULT NULL,
  `gioiTinh` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'Nam',
  `trinhDo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Đại học',
  `maPhongBan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã phòng ban trực thuộc',
  `maChucVu` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã chức vụ hiện tại',
  `ngayVaoLam` date DEFAULT NULL COMMENT 'Ngày bắt đầu làm việc',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Đang làm việc' COMMENT 'Trạng thái làm việc',
  PRIMARY KEY (`maNV`),
  UNIQUE KEY `uk_nv_sdt` (`soDienThoai`),
  KEY `fk_nv_pb` (`maPhongBan`),
  KEY `fk_nv_cv` (`maChucVu`),
  CONSTRAINT `fk_nv_cv` FOREIGN KEY (`maChucVu`) REFERENCES `chucvu` (`maChucVu`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nv_pb` FOREIGN KEY (`maPhongBan`) REFERENCES `phongban` (`maPhongBan`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hồ sơ Nhân Viên';

--
-- Dữ liệu bảng `nhanvien` (10 bản ghi)
--
INSERT INTO `nhanvien` (`maNV`, `hoTen`, `soDienThoai`, `email`, `ngaySinh`, `gioiTinh`, `trinhDo`, `maPhongBan`, `maChucVu`, `ngayVaoLam`, `trangThai`) VALUES
('NV001', 'Nguyễn Văn Hùng', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB02', 'CV03', '2020-03-15', 'Đang làm việc'),
('NV002', 'Trần Thị Thu Thảo', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB03', 'CV04', '2021-06-10', 'Đang làm việc'),
('NV003', 'Lê Minh Tuấn', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB04', 'CV05', '2019-11-01', 'Đang làm việc'),
('NV004', 'Phạm Hoàng Nam', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB05', 'CV07', '2022-02-20', 'Đang làm việc'),
('NV005', 'Trịnh Đình Đức', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB01', 'CV01', '2018-01-01', 'Đang làm việc'),
('NV006', 'Đặng Mai Phương', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB02', 'CV06', '2022-08-15', 'Đang làm việc'),
('NV007', 'Vũ Quốc Bảo', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB04', 'CV08', '2021-09-05', 'Đang làm việc'),
('NV008', 'Hoàng Kim Ngân', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB03', 'CV07', '2023-04-12', 'Đang làm việc'),
('NV009', 'Bùi Tuấn Kiệt', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB05', 'CV07', '2023-01-10', 'Đang làm việc'),
('NV010', 'Ngô Thị Thanh Trúc', NULL, NULL, NULL, 'Nam', 'Đại học', 'PB06', 'CV07', '2022-10-01', 'Đang làm việc');

--
-- Cấu trúc bảng `phieuchi`
--
DROP TABLE IF EXISTS `phieuchi`;
CREATE TABLE `phieuchi` (
  `maPhieuChi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayChi` datetime DEFAULT CURRENT_TIMESTAMP,
  `maDoiTuong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lyDoChi` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT '0.00',
  `phuongThucChi` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'TM' COMMENT 'Phương thức chi: TM, CK',
  `maTaiKhoanQuy` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Moi' COMMENT 'Trạng thái: Moi, DaDuyet, Huy',
  `nguoiLap` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayLap` datetime DEFAULT CURRENT_TIMESTAMP,
  `nguoiDuyet` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayDuyet` datetime DEFAULT NULL,
  `maPhieuNhapNVL` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK -> PhieuNhapNVL (Kho) - nullable',
  `maBangLuong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK -> BangLuong (Nhân sự) - nullable',
  PRIMARY KEY (`maPhieuChi`),
  KEY `fk_pc_dt` (`maDoiTuong`),
  KEY `fk_pc_tkq` (`maTaiKhoanQuy`),
  KEY `fk_pc_nvlap` (`nguoiLap`),
  KEY `fk_pc_nvduyet` (`nguoiDuyet`),
  KEY `fk_pc_pnnvl` (`maPhieuNhapNVL`),
  KEY `fk_pc_bl` (`maBangLuong`),
  CONSTRAINT `fk_pc_bl` FOREIGN KEY (`maBangLuong`) REFERENCES `bangluong` (`maBangLuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_dt` FOREIGN KEY (`maDoiTuong`) REFERENCES `doituonggiaodich` (`maDoiTuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_nvduyet` FOREIGN KEY (`nguoiDuyet`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_nvlap` FOREIGN KEY (`nguoiLap`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_pnnvl` FOREIGN KEY (`maPhieuNhapNVL`) REFERENCES `phieunhapnvl` (`maPhieuNhapNVL`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_tkq` FOREIGN KEY (`maTaiKhoanQuy`) REFERENCES `taikhoanquy` (`maTaiKhoanQuy`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Phiếu Chi Tiền';

--
-- Dữ liệu bảng `phieuchi` (37 bản ghi)
--
INSERT INTO `phieuchi` (`maPhieuChi`, `ngayChi`, `maDoiTuong`, `lyDoChi`, `soTien`, `phuongThucChi`, `maTaiKhoanQuy`, `trangThai`, `nguoiLap`, `ngayLap`, `nguoiDuyet`, `ngayDuyet`, `maPhieuNhapNVL`, `maBangLuong`) VALUES
('PC_FIN_1790146179', '2026-09-23 00:00:00', 'DT_FIN_1790146179', 'Chi thanh toán tiền nhà cung cấp', 3000000.00, 'TM', 'TKQ_FIN_1790146179', 'Moi', 'NV002', '2026-09-23 06:49:39', NULL, NULL, NULL, NULL),
('PC_OVER_FIN_1790146179', '2026-09-23 00:00:00', 'DT_FIN_1790146179', 'Chi vượt số dư', 999999999.00, 'TM', 'TKQ_FIN_1790146179', 'Moi', 'NV002', '2026-09-23 06:49:39', NULL, NULL, NULL, NULL),
('PC-202609-001', '2026-08-10 05:48:41', 'DT-NCC001', 'Thanh toán tiền mua bao bì tiệt trùng phức hợp Aseptic từ Tetra Pak VN', 450000000.00, 'CK', 'TKQ-BIDV03', 'DaDuyet', 'NV002', '2026-08-10 05:03:41', 'NV001', '2026-08-10 06:18:41', NULL, NULL),
('PC-202609-002', '2026-08-11 04:48:41', 'DT-NCC002', 'Thanh toán tiền nhập 50 tấn đường tinh luyện cao cấp từ TTC Sugar Biên Hòa', 180000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-08-11 04:03:41', 'NV001', '2026-08-11 05:18:41', NULL, NULL),
('PC-202609-003', '2026-08-13 03:48:41', 'DT-NCC003', 'Thanh toán tiền thu mua sữa bò tươi nguyên chất đợt 1 Hợp Tác Xã Mộc Châu', 320000000.00, 'CK', 'TKQ-AGR01', 'DaDuyet', 'NV002', '2026-08-13 03:03:41', 'NV001', '2026-08-13 04:18:41', NULL, NULL),
('PC-202609-004', '2026-08-14 02:48:41', 'DT-NCC004', 'Thanh toán L/C nhập khẩu 40 tấn bột sữa gầy nguyên chất từ Fonterra New Zealand', 850000000.00, 'CK', 'TKQ-VCB03', 'DaDuyet', 'NV002', '2026-08-14 02:03:41', 'NV001', '2026-08-14 03:18:41', NULL, NULL),
('PC-202609-005', '2026-08-16 01:48:41', 'DT-NCC005', 'Thanh toán tiền mua men vi sinh sống đông khô từ Chr. Hansen Đan Mạch', 240000000.00, 'CK', 'TKQ-HSBC01', 'DaDuyet', 'NV002', '2026-08-16 01:03:41', 'NV001', '2026-08-16 02:18:41', NULL, NULL),
('PC-202609-006', '2026-08-18 00:48:41', 'DT-NCC006', 'Thanh toán tiền sữa tươi chuẩn organic trang trại Vinamilk Green Farm Tây Ninh', 420000000.00, 'CK', 'TKQ-BIDV02', 'DaDuyet', 'NV002', '2026-08-18 00:03:41', 'NV001', '2026-08-18 01:18:41', NULL, NULL),
('PC-202609-007', '2026-08-19 06:48:41', 'DT-NCC007', 'Thanh toán tiền sữa bò hữu cơ trang trại Organic Đà Lạt kỳ tháng 8', 290000000.00, 'CK', 'TKQ-AGR02', 'DaDuyet', 'NV002', '2026-08-19 06:03:41', 'NV001', '2026-08-19 07:18:41', NULL, NULL),
('PC-202609-008', '2026-08-21 05:48:41', 'DT-NCC008', 'Thanh toán hương liệu tự nhiên dâu & socola cho Kerry Ingredients VN', 165000000.00, 'CK', 'TKQ-BIDV03', 'DaDuyet', 'NV002', '2026-08-21 05:03:41', 'NV001', '2026-08-21 06:18:41', NULL, NULL),
('PC-202609-009', '2026-08-23 04:48:41', 'DT-NCC009', 'Thanh toán tiền vi chất Canxi nano & Vitamin D3 từ DSM Thụy Sĩ', 210000000.00, 'CK', 'TKQ-ACB01', 'DaDuyet', 'NV002', '2026-08-23 04:03:41', 'NV001', '2026-08-23 05:18:41', NULL, NULL),
('PC-202609-010', '2026-08-25 03:48:41', 'DT-NCC010', 'Thanh toán tiền sữa tươi thu gom từ Hợp tác xã chăn nuôi Đơn Dương', 195000000.00, 'CK', 'TKQ-AGR02', 'DaDuyet', 'NV002', '2026-08-25 03:03:41', 'NV001', '2026-08-25 04:18:41', NULL, NULL),
('PC-202609-011', '2026-08-27 02:48:41', 'DT-NCC011', 'Thanh toán tiền mua pallet nhựa và khay chứa sữa từ Nhựa Duy Tân', 88000000.00, 'CK', 'TKQ-BIDV03', 'DaDuyet', 'NV002', '2026-08-27 02:03:41', 'NV001', '2026-08-27 03:18:41', NULL, NULL),
('PC-202609-012', '2026-08-28 01:48:41', 'DT-NCC012', 'Thanh toán cước vận chuyển xe bồn lạnh luân chuyển sữa tươi ABA Cooltrans', 145000000.00, 'CK', 'TKQ-CTG02', 'DaDuyet', 'NV002', '2026-08-28 01:03:41', 'NV001', '2026-08-28 02:18:41', NULL, NULL),
('PC-202609-013', '2026-08-30 00:48:41', 'DT-NCC013', 'Thanh toán tiền sữa tươi thô trang trại công nghệ cao Yên Định, Thanh Hóa', 260000000.00, 'CK', 'TKQ-BIDV02', 'DaDuyet', 'NV002', '2026-08-30 00:03:41', 'NV001', '2026-08-30 01:18:41', NULL, NULL),
('PC-202609-014', '2026-08-31 06:48:41', 'DT-NCC014', 'Thanh toán bảo dưỡng hệ thống điều hòa không khí kho lạnh REE Corp', 75000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-08-31 06:03:41', 'NV001', '2026-08-31 07:18:41', NULL, NULL),
('PC-202609-015', '2026-09-02 05:48:41', 'DT-NCC015', 'Thanh toán tiền mua 50.000 vỏ thùng carton in offset Tân Á', 68000000.00, 'CK', 'TKQ-BIDV03', 'DaDuyet', 'NV002', '2026-09-02 05:03:41', 'NV001', '2026-09-02 06:18:41', NULL, NULL),
('PC-202609-016', '2026-09-03 04:48:41', 'DT-NV001', 'Chi trả lương tháng 8/2026 cho Trưởng phòng Kho vận Nguyễn Văn Hùng', 28000000.00, 'CK', 'TKQ-BIDV01', 'DaDuyet', 'NV002', '2026-09-03 04:03:41', 'NV001', '2026-09-03 05:18:41', NULL, NULL),
('PC-202609-017', '2026-09-03 03:48:41', 'DT-NV002', 'Chi trả lương tháng 8/2026 cho Kế toán trưởng Trần Thị Thu Thảo', 32000000.00, 'CK', 'TKQ-BIDV01', 'DaDuyet', 'NV002', '2026-09-03 03:03:41', 'NV001', '2026-09-03 04:18:41', NULL, NULL),
('PC-202609-018', '2026-09-03 02:48:41', 'DT-NV003', 'Chi trả lương tháng 8/2026 cho Trưởng ca sản xuất Lê Minh Tuấn', 26000000.00, 'CK', 'TKQ-BIDV01', 'DaDuyet', 'NV002', '2026-09-03 02:03:41', 'NV001', '2026-09-03 03:18:41', NULL, NULL),
('PC-202609-019', '2026-09-03 01:48:41', 'DT-NV004', 'Chi trả lương tháng 8/2026 cho Chuyên viên kinh doanh Phạm Hoàng Nam', 16000000.00, 'CK', 'TKQ-BIDV01', 'DaDuyet', 'NV002', '2026-09-03 01:03:41', 'NV001', '2026-09-03 02:18:41', NULL, NULL),
('PC-202609-020', '2026-09-03 00:48:41', 'DT-NV005', 'Chi trả lương tháng 8/2026 cho Ban Giám đốc điều hành Trịnh Đình Đức', 45000000.00, 'CK', 'TKQ-BIDV01', 'DaDuyet', 'NV002', '2026-09-03 00:03:41', 'NV001', '2026-09-03 01:18:41', NULL, NULL),
('PC-202609-021', '2026-09-05 06:48:41', 'DT-NV002', 'Thanh toán tiền điện sản xuất cho Điện lực Bến Cát (Nhà máy Mega Plant)', 185000000.00, 'CK', 'TKQ-MB02', 'DaDuyet', 'NV002', '2026-09-05 06:03:41', 'NV001', '2026-09-05 07:18:41', NULL, NULL),
('PC-202609-022', '2026-09-06 05:48:41', 'DT-NV002', 'Chi tiền nước sinh hoạt và sản xuất văn phòng Tân Trào kỳ tháng 8', 14500000.00, 'TM', 'TKQ-TM01', 'DaDuyet', 'NV002', '2026-09-06 05:03:41', 'NV001', '2026-09-06 06:18:41', NULL, NULL),
('PC-202609-023', '2026-09-08 04:48:41', 'DT-NV001', 'Chi tiền mua dầu DO vận hành lò hơi tiệt trùng áp suất cao nhà máy', 95000000.00, 'CK', 'TKQ-BIDV03', 'DaDuyet', 'NV002', '2026-09-08 04:03:41', 'NV001', '2026-09-08 05:18:41', NULL, NULL),
('PC-202609-024', '2026-09-09 03:48:41', 'DT-NV002', 'Trích nộp BHXH, BHYT, BHTN tháng 8/2026 cho cơ quan Bảo hiểm TP.HCM', 168000000.00, 'CK', 'TKQ-BIDV01', 'DaDuyet', 'NV002', '2026-09-09 03:03:41', 'NV001', '2026-09-09 04:18:41', NULL, NULL),
('PC-202609-025', '2026-09-11 02:48:41', 'DT-NV004', 'Thanh toán chi phí chiến dịch quảng cáo ra mắt dòng Sữa Hạt Super Nut', 250000000.00, 'CK', 'TKQ-TCB03', 'DaDuyet', 'NV002', '2026-09-11 02:03:41', 'NV001', '2026-09-11 03:18:41', NULL, NULL),
('PC-202609-026', '2026-09-17 01:48:41', 'DT-NCC001', 'Thanh toán tiền mua bao bì đợt 2 tháng 9 cho Tetra Pak (Chờ duyệt CFO)', 380000000.00, 'CK', 'TKQ-BIDV03', 'ChoDuyet', 'NV002', '2026-09-17 01:03:41', NULL, NULL, NULL, NULL),
('PC-202609-027', '2026-09-18 00:48:41', 'DT-NCC002', 'Thanh toán đơn hàng 35 tấn đường luyện TTC Sugar (Chờ duyệt)', 140000000.00, 'CK', 'TKQ-VCB01', 'ChoDuyet', 'NV002', '2026-09-18 00:03:41', NULL, NULL, NULL, NULL),
('PC-202609-028', '2026-09-19 06:48:41', 'DT-NCC003', 'Thanh toán tiền sữa bò tươi đợt 1 tháng 9 Nông trại Mộc Châu (Chờ duyệt)', 285000000.00, 'CK', 'TKQ-AGR01', 'ChoDuyet', 'NV002', '2026-09-19 06:03:41', NULL, NULL, NULL, NULL),
('PC-202609-029', '2026-09-20 05:48:41', 'DT-NCC012', 'Thanh toán cước xe tải lạnh giao hàng chuỗi siêu thị miền Trung ABA', 128000000.00, 'CK', 'TKQ-CTG02', 'ChoDuyet', 'NV002', '2026-09-20 05:03:41', NULL, NULL, NULL, NULL),
('PC-202609-030', '2026-09-20 04:48:41', 'DT-NV001', 'Chi mua sắm trang phục bảo hộ phòng sạch công nhân kho bảo quản UHT', 18500000.00, 'TM', 'TKQ-TM01', 'ChoDuyet', 'NV002', '2026-09-20 04:03:41', NULL, NULL, NULL, NULL),
('PC-202609-031', '2026-09-21 03:48:41', 'DT-NV003', 'Chi mua phụ tùng van áp lực thay thế máy tiệt trùng UHT số 2', 45000000.00, 'CK', 'TKQ-VCB01', 'ChoDuyet', 'NV002', '2026-09-21 03:03:41', NULL, NULL, NULL, NULL),
('PC-202609-032', '2026-09-21 02:48:41', 'DT-NCC006', 'Lập phiếu chi mua sữa tươi đợt 2 tháng 9 Green Farm Tây Ninh', 310000000.00, 'CK', 'TKQ-BIDV02', 'Moi', 'NV002', '2026-09-21 02:03:41', NULL, NULL, NULL, NULL),
('PC-202609-033', '2026-09-22 01:48:41', 'DT-NCC008', 'Lập phiếu thanh toán hương vani và hạt dẻ Kerry Ingredients', 92000000.00, 'CK', 'TKQ-BIDV03', 'Moi', 'NV002', '2026-09-22 01:03:41', NULL, NULL, NULL, NULL),
('PC-202609-034', '2026-09-22 00:48:41', 'DT-NV002', 'Tạm ứng phí dịch vụ kiểm toán bán niên năm 2026 cho PwC Việt Nam', 150000000.00, 'CK', 'TKQ-VCB01', 'Moi', 'NV002', '2026-09-22 00:03:41', NULL, NULL, NULL, NULL),
('PC-202609-035', '2026-09-23 06:48:41', 'DT-NV004', 'Chi phí tổ chức chương trình đổi nắp hộp sữa trúng thưởng tại Cần Thơ', 12000000.00, 'TM', 'TKQ-TM01', 'Moi', 'NV002', '2026-09-23 06:03:41', NULL, NULL, NULL, NULL);

--
-- Cấu trúc bảng `phieunghiemthu`
--
DROP TABLE IF EXISTS `phieunghiemthu`;
CREATE TABLE `phieunghiemthu` (
  `maPhieuNghiemThu` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã phiếu nghiệm thu chất lượng',
  `maCongDoan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên QC nghiệm thu',
  `tongSoLuongSanPham` int DEFAULT '0',
  `tongSoLuongDat` int DEFAULT '0',
  `tongSoLuongKhongDat` int DEFAULT '0',
  `ngayNghiemThu` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNghiemThu`),
  KEY `fk_pnt_cd` (`maCongDoan`),
  KEY `fk_pnt_lsx` (`maLenh`),
  KEY `fk_pnt_nv` (`maNhanVien`),
  CONSTRAINT `fk_pnt_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `congdoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnt_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnt_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nghiệm thu chất lượng sản phẩm hoàn thành';

--
-- Dữ liệu bảng `phieunghiemthu` (2 bản ghi)
--
INSERT INTO `phieunghiemthu` (`maPhieuNghiemThu`, `maCongDoan`, `maLenh`, `maNhanVien`, `tongSoLuongSanPham`, `tongSoLuongDat`, `tongSoLuongKhongDat`, `ngayNghiemThu`, `ghiChu`) VALUES
('PNT20260901', 'CD01-03', 'LSX20260901', 'NV007', 20000, 19980, 20, '2026-09-13', 'Nghiệm thu đạt chuẩn ISO 22000, hao hụt bao bì 20 hộp'),
('PNT20260905', 'CD01-02', 'LSX20260905', 'NV007', 5000, 5000, '0', '2026-09-17', 'Đạt chuẩn vi sinh Probiotics 100%');

--
-- Cấu trúc bảng `phieunhapnvl`
--
DROP TABLE IF EXISTS `phieunhapnvl`;
CREATE TABLE `phieunhapnvl` (
  `maPhieuNhapNVL` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maNCC` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNVTao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên lập phiếu',
  `maNVNhan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên tiếp nhận kho',
  `ngayNhap` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapNVL`),
  KEY `fk_pnnvl_ncc` (`maNCC`),
  KEY `fk_pnnvl_nvtao` (`maNVTao`),
  KEY `fk_pnnvl_nvnhan` (`maNVNhan`),
  CONSTRAINT `fk_pnnvl_ncc` FOREIGN KEY (`maNCC`) REFERENCES `nhacungcap` (`maNCC`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnnvl_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnnvl_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `phieunhapnvl` (3 bản ghi)
--
INSERT INTO `phieunhapnvl` (`maPhieuNhapNVL`, `maNCC`, `maNVTao`, `maNVNhan`, `ngayNhap`, `trangThai`, `ghiChu`) VALUES
('PNNVL2026090101', 'NCC003', 'NV001', 'NV001', '2026-09-13', 'Đã hoàn thành', 'Nhập 20,000 lít sữa tươi thô Mộc Châu kiểm nghiệm đạt ISO'),
('PNNVL2026090502', 'NCC002', 'NV001', 'NV001', '2026-09-18', 'Đã hoàn thành', 'Nhập 10,000 kg đường tinh luyện Biên Hòa Grade A'),
('PNNVL2026090803', 'NCC001', 'NV001', 'NV001', '2026-09-21', 'Đã duyệt', 'Nhập 500,000 vỏ hộp Tetra Pak Brik Aseptic 180ml');

--
-- Cấu trúc bảng `phieunhapsp`
--
DROP TABLE IF EXISTS `phieunhapsp`;
CREATE TABLE `phieunhapsp` (
  `maPhieuNhapSP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maXuong` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNVTao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNVNhan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayNhap` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `maPhieuYCXSP` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nối với Phiếu bàn giao bên Sản xuất',
  PRIMARY KEY (`maPhieuNhapSP`),
  KEY `fk_pnsp_nvtao` (`maNVTao`),
  KEY `fk_pnsp_nvnhan` (`maNVNhan`),
  KEY `fk_pnsp_pycxsp` (`maPhieuYCXSP`),
  CONSTRAINT `fk_pnsp_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnsp_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnsp_pycxsp` FOREIGN KEY (`maPhieuYCXSP`) REFERENCES `phieuyeucauxuatsp` (`maPhieuYCXSP`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `phieunhapsp` (3 bản ghi)
--
INSERT INTO `phieunhapsp` (`maPhieuNhapSP`, `maXuong`, `maNVTao`, `maNVNhan`, `ngayNhap`, `trangThai`, `ghiChu`, `maPhieuYCXSP`) VALUES
('PNSP2026090201', 'XUONG-UHT-01', 'NV003', 'NV001', '2026-08-09', 'Đã hoàn thành', 'Nhập 5,000 thùng Sữa tươi tiệt trùng 100% 180ml', NULL),
('PNSP2026090402', 'XUONG-SUACHUA-02', 'NV003', 'NV001', '2026-09-01', 'Đã hoàn thành', 'Nhập 3,000 lốc Sữa chua ăn có đường 100g', NULL),
('PNSP2026090803', 'XUONG-UHT-01', 'NV003', 'NV001', '2026-09-18', 'Đã hoàn thành', 'Nhập 15,000 thùng Sữa tươi tiệt trùng 100% 180ml (Batch FEFO-2)', NULL);

--
-- Cấu trúc bảng `phieusanxuatbu`
--
DROP TABLE IF EXISTS `phieusanxuatbu`;
CREATE TABLE `phieusanxuatbu` (
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maPhieuNghiemThu` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `soLuongKhongDat` int DEFAULT '0',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maLenh`,`maSanPham`,`maPhieuNghiemThu`),
  KEY `fk_psxb_sp` (`maSanPham`),
  KEY `fk_psxb_pnt` (`maPhieuNghiemThu`),
  CONSTRAINT `fk_psxb_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_psxb_pnt` FOREIGN KEY (`maPhieuNghiemThu`) REFERENCES `phieunghiemthu` (`maPhieuNghiemThu`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_psxb_sp` FOREIGN KEY (`maSanPham`) REFERENCES `sanpham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lệnh sản xuất bù cho lượng sản phẩm lỗi';

--
-- Dữ liệu bảng `phieusanxuatbu` (1 bản ghi)
--
INSERT INTO `phieusanxuatbu` (`maLenh`, `maSanPham`, `maPhieuNghiemThu`, `soLuongKhongDat`, `ghiChu`) VALUES
('LSX20260901', 'SP001', 'PNT20260901', 20, 'Bù 20 hộp hỏng trong khâu chiết rót bao bì');

--
-- Cấu trúc bảng `phieuthu`
--
DROP TABLE IF EXISTS `phieuthu`;
CREATE TABLE `phieuthu` (
  `maPhieuThu` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngayThu` datetime DEFAULT CURRENT_TIMESTAMP,
  `maDoiTuong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lyDoThu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT '0.00',
  `phuongThucThu` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'TM' COMMENT 'Phương thức thu: TM, CK',
  `maTaiKhoanQuy` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Moi' COMMENT 'Trạng thái: Moi, DaDuyet, Huy, ChoDoiSoat',
  `nguoiLap` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayLap` datetime DEFAULT CURRENT_TIMESTAMP,
  `nguoiDuyet` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayDuyet` datetime DEFAULT NULL,
  `maThanhToan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK -> ThanhToan (Bán hàng) - nullable',
  `maCongNo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK -> CongNo (Bán hàng) - nullable',
  `maHoaDon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK -> HoaDon (Bán hàng) - nullable',
  PRIMARY KEY (`maPhieuThu`),
  KEY `fk_pt_dt` (`maDoiTuong`),
  KEY `fk_pt_tkq` (`maTaiKhoanQuy`),
  KEY `fk_pt_nvlap` (`nguoiLap`),
  KEY `fk_pt_nvduyet` (`nguoiDuyet`),
  KEY `fk_pt_tt` (`maThanhToan`),
  KEY `fk_pt_cn` (`maCongNo`),
  KEY `fk_pt_hd` (`maHoaDon`),
  CONSTRAINT `fk_pt_cn` FOREIGN KEY (`maCongNo`) REFERENCES `congno` (`maCongNo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_dt` FOREIGN KEY (`maDoiTuong`) REFERENCES `doituonggiaodich` (`maDoiTuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_hd` FOREIGN KEY (`maHoaDon`) REFERENCES `hoadon` (`maHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_nvduyet` FOREIGN KEY (`nguoiDuyet`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_nvlap` FOREIGN KEY (`nguoiLap`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_tkq` FOREIGN KEY (`maTaiKhoanQuy`) REFERENCES `taikhoanquy` (`maTaiKhoanQuy`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_tt` FOREIGN KEY (`maThanhToan`) REFERENCES `thanhtoan` (`maThanhToan`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Phiếu Thu Tiền';

--
-- Dữ liệu bảng `phieuthu` (36 bản ghi)
--
INSERT INTO `phieuthu` (`maPhieuThu`, `ngayThu`, `maDoiTuong`, `lyDoThu`, `soTien`, `phuongThucThu`, `maTaiKhoanQuy`, `trangThai`, `nguoiLap`, `ngayLap`, `nguoiDuyet`, `ngayDuyet`, `maThanhToan`, `maCongNo`, `maHoaDon`) VALUES
('PT_FIN_1790146179', '2026-09-23 00:00:00', 'DT_FIN_1790146179', 'Thu tiền bán hàng đợt 1', 5000000.00, 'TM', 'TKQ_FIN_1790146179', 'ChoDoiSoat', 'NV002', '2026-09-23 06:49:39', 'NV001', '2026-09-23 06:49:39', NULL, NULL, NULL),
('PT-202609-001', '2026-08-09 05:48:41', 'DT-KH001', 'Thu tiền bán sữa tươi 180ml đợt giao siêu thị Co.opmart miền Nam', 185000000.00, 'CK', 'TKQ-CTG01', 'DaDuyet', 'NV002', '2026-08-09 05:18:41', 'NV001', '2026-08-09 06:03:41', NULL, NULL, NULL),
('PT-202609-002', '2026-08-11 04:48:41', 'DT-KH002', 'Nộp doanh thu tiền mặt cuối ngày chuỗi Giấc Mơ Sữa Việt Q.1, Q.3', 42000000.00, 'TM', 'TKQ-TCB02', 'DaDuyet', 'NV002', '2026-08-11 04:18:41', 'NV001', '2026-08-11 05:03:41', NULL, NULL, NULL),
('PT-202609-003', '2026-08-12 03:48:41', 'DT-KH003', 'Thu tiền phân phối sữa chua Probi cho hệ thống WinMart toàn quốc', 245000000.00, 'CK', 'TKQ-VPB01', 'DaDuyet', 'NV002', '2026-08-12 03:18:41', 'NV001', '2026-08-12 04:03:41', NULL, NULL, NULL),
('PT-202609-004', '2026-08-14 02:48:41', 'DT-KH004', 'Thu công nợ xuất khẩu nội địa nhà phân phối độc quyền Hậu Giang', 310000000.00, 'CK', 'TKQ-VCB02', 'DaDuyet', 'NV002', '2026-08-14 02:18:41', 'NV001', '2026-08-14 03:03:41', NULL, NULL, NULL),
('PT-202609-005', '2026-08-15 01:48:41', 'DT-KH005', 'Thanh toán tiền sữa đặc có đường Phương Nam cho chuỗi Bách Hóa Xanh', 195000000.00, 'CK', 'TKQ-VPB01', 'DaDuyet', 'NV002', '2026-08-15 01:18:41', 'NV001', '2026-08-15 02:03:41', NULL, NULL, NULL),
('PT-202609-006', '2026-08-17 00:48:41', 'DT-KH006', 'Thu thanh toán L/C xuất khẩu lô sữa bột Dielac sang Dubai (UAE)', 950000000.00, 'CK', 'TKQ-SCB01', 'DaDuyet', 'NV002', '2026-08-17 00:18:41', 'NV001', '2026-08-17 01:03:41', NULL, NULL, NULL),
('PT-202609-007', '2026-08-18 23:48:41', 'DT-KH007', 'Thu tiền giao sữa Green Farm cao cấp cho đại siêu thị GO! An Lạc', 178000000.00, 'CK', 'TKQ-CTG01', 'DaDuyet', 'NV002', '2026-08-18 23:18:41', 'NV001', '2026-08-19 00:03:41', NULL, NULL, NULL),
('PT-202609-008', '2026-08-20 06:48:41', 'DT-KH008', 'Thu thanh toán đơn hàng sữa bột trẻ em trung tâm MM Mega Market', 285000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-08-20 06:18:41', 'NV001', '2026-08-20 07:03:41', NULL, NULL, NULL),
('PT-202609-009', '2026-08-22 05:48:41', 'DT-KH009', 'Thanh toán lô kem ăn Vinamilk giao hệ thống AEON Mall Tân Phú', 125000000.00, 'CK', 'TKQ-VCB02', 'DaDuyet', 'NV002', '2026-08-22 05:18:41', 'NV001', '2026-08-22 06:03:41', NULL, NULL, NULL),
('PT-202609-010', '2026-08-24 04:48:41', 'DT-KH010', 'Thu tiền phân phối sữa hạt 9 loại Super Nut cho Lotte Mart Nam Sài Gòn', 165000000.00, 'CK', 'TKQ-TCB01', 'DaDuyet', 'NV002', '2026-08-24 04:18:41', 'NV001', '2026-08-24 05:03:41', NULL, NULL, NULL),
('PT-202609-011', '2026-08-26 03:48:41', 'DT-KH011', 'Thu tiền giao sữa chua uống men sống Probi cho Circle K toàn miền Nam', 88000000.00, 'CK', 'TKQ-TCB01', 'DaDuyet', 'NV002', '2026-08-26 03:18:41', 'NV001', '2026-08-26 04:03:41', NULL, NULL, NULL),
('PT-202609-012', '2026-08-28 02:48:41', 'DT-KH012', 'Thanh toán đợt 2 sữa tươi tiệt trùng 110ml chuỗi tiện ích GS25', 96000000.00, 'CK', 'TKQ-TCB01', 'DaDuyet', 'NV002', '2026-08-28 02:18:41', 'NV001', '2026-08-28 03:03:41', NULL, NULL, NULL),
('PT-202609-013', '2026-08-29 01:48:41', 'DT-KH013', 'Thu thanh toán ngân sách Đề án Sữa Học Đường TP.HCM đợt tháng 8/2026', 750000000.00, 'CK', 'TKQ-VCB04', 'DaDuyet', 'NV002', '2026-08-29 01:18:41', 'NV001', '2026-08-29 02:03:41', NULL, NULL, NULL),
('PT-202609-014', '2026-08-31 00:48:41', 'DT-KH014', 'Thu tiền cung cấp sản phẩm dinh dưỡng y học cho Bệnh viện Chợ Rẫy', 115000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-08-31 00:18:41', 'NV001', '2026-08-31 01:03:41', NULL, NULL, NULL),
('PT-202609-015', '2026-08-31 23:48:41', 'DT-KH015', 'Thu công nợ xuất hàng đợt 1 Tổng đại lý phân phối tiêu dùng miền Bắc', 450000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-08-31 23:18:41', 'NV001', '2026-09-01 00:03:41', NULL, NULL, NULL),
('PT-202609-016', '2026-09-03 06:48:41', 'DT-NV001', 'Hoàn ứng công tác phí giám sát kho lạnh trung chuyển Đà Nẵng', 6500000.00, 'TM', 'TKQ-TM01', 'DaDuyet', 'NV002', '2026-09-03 06:18:41', 'NV001', '2026-09-03 07:03:41', NULL, NULL, NULL),
('PT-202609-017', '2026-09-04 05:48:41', 'DT-NV004', 'Hoàn ứng chi phí tiếp khách và khảo sát thị trường đại lý Tây Nam Bộ', 8200000.00, 'TM', 'TKQ-TM01', 'DaDuyet', 'NV002', '2026-09-04 05:18:41', 'NV001', '2026-09-04 06:03:41', NULL, NULL, NULL),
('PT-202609-018', '2026-09-05 04:48:41', 'DT-NCC001', 'Thu tiền chiết khấu thương mại sản lượng bao bì Aseptic từ Tetra Pak', 85000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-09-05 04:18:41', 'NV001', '2026-09-05 05:03:41', NULL, NULL, NULL),
('PT-202609-019', '2026-09-07 03:48:41', 'DT-NCC002', 'Thu tiền thưởng đạt chỉ tiêu thu mua đường tinh luyện từ TTC Sugar', 35000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-09-07 03:18:41', 'NV001', '2026-09-07 04:03:41', NULL, NULL, NULL),
('PT-202609-020', '2026-09-08 02:48:41', 'DT-KH001', 'Thu tiền thanh lý thùng carton phế liệu kho Mega Plant đợt tháng 8', 15500000.00, 'TM', 'TKQ-TM02', 'DaDuyet', 'NV002', '2026-09-08 02:18:41', 'NV001', '2026-09-08 03:03:41', NULL, NULL, NULL),
('PT-202609-021', '2026-09-09 01:48:41', 'DT-KH002', 'Thu ký quỹ mở thêm 2 điểm bán mới Cửa hàng Giấc Mơ Sữa Việt Bình Thạnh', 50000000.00, 'CK', 'TKQ-TCB02', 'DaDuyet', 'NV002', '2026-09-09 01:18:41', 'NV001', '2026-09-09 02:03:41', NULL, NULL, NULL),
('PT-202609-022', '2026-09-11 00:48:41', 'DT-KH003', 'Thu tiền thanh toán đơn hàng sữa tươi tiệt trùng tuần 1 tháng 9/2026', 320000000.00, 'CK', 'TKQ-VPB01', 'DaDuyet', 'NV002', '2026-09-11 00:18:41', 'NV001', '2026-09-11 01:03:41', NULL, NULL, NULL),
('PT-202609-023', '2026-09-11 23:48:41', 'DT-KH004', 'Thu tiền hàng sữa tươi sinh thái Green Farm đại lý Hậu Giang', 145000000.00, 'CK', 'TKQ-VCB02', 'DaDuyet', 'NV002', '2026-09-11 23:18:41', 'NV001', '2026-09-12 00:03:41', NULL, NULL, NULL),
('PT-202609-024', '2026-09-13 06:48:41', 'DT-KH005', 'Thu tiền phân phối sữa chua ăn nha đam và có đường Bách Hóa Xanh', 210000000.00, 'CK', 'TKQ-VPB01', 'DaDuyet', 'NV002', '2026-09-13 06:18:41', 'NV001', '2026-09-13 07:03:41', NULL, NULL, NULL),
('PT-202609-025', '2026-09-14 05:48:41', 'DT-KH006', 'Thu chênh lệch tỷ giá thanh lý hợp đồng xuất khẩu sữa bột Dubai', 28000000.00, 'CK', 'TKQ-SCB01', 'DaDuyet', 'NV002', '2026-09-14 05:18:41', 'NV001', '2026-09-14 06:03:41', NULL, NULL, NULL),
('PT-202609-026', '2026-09-15 04:48:41', 'DT-NV002', 'Thu lãi tiền gửi ngân hàng phát sinh kỳ tháng 8/2026 tài khoản VCB', 45000000.00, 'CK', 'TKQ-VCB01', 'DaDuyet', 'NV002', '2026-09-15 04:18:41', 'NV001', '2026-09-15 05:03:41', NULL, NULL, NULL),
('PT-202609-027', '2026-09-17 03:48:41', 'DT-KH007', 'Thu tiền hàng đại siêu thị GO! Nguyễn Thị Thập (Chờ đối soát UNC ngân hàng)', 165000000.00, 'CK', 'TKQ-CTG01', 'ChoDoiSoat', 'NV002', '2026-09-17 03:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-028', '2026-09-18 02:48:41', 'DT-KH008', 'Thu thanh toán sữa đặc Phương Nam siêu thị MM Mega (Chờ đối soát)', 135000000.00, 'CK', 'TKQ-VCB01', 'ChoDoiSoat', 'NV002', '2026-09-18 02:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-029', '2026-09-19 01:48:41', 'DT-KH009', 'Thu tiền đợt giao sữa hạt Super Nut cho AEON Mall Bình Tân', 98000000.00, 'CK', 'TKQ-VCB02', 'ChoDoiSoat', 'NV002', '2026-09-19 01:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-030', '2026-09-20 00:48:41', 'DT-KH010', 'Thu thanh toán sữa chua ăn lốc 4 Lotte Mart (Chờ sổ phụ đối chiếu)', 112000000.00, 'CK', 'TKQ-TCB01', 'ChoDoiSoat', 'NV002', '2026-09-20 00:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-031', '2026-09-20 23:48:41', 'DT-KH013', 'Thu đợt đầu năm học mới đề án Sữa Học Đường TP.HCM (Chờ xác nhận kho bạc)', 820000000.00, 'CK', 'TKQ-VCB04', 'ChoDoiSoat', 'NV002', '2026-09-20 23:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-032', '2026-09-21 06:48:41', 'DT-KH011', 'Lập phiếu thu đơn đặt hàng mới tuần 3 tháng 9 chuỗi Circle K', 75000000.00, 'CK', 'TKQ-TCB01', 'Moi', 'NV002', '2026-09-21 06:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-033', '2026-09-22 05:48:41', 'DT-KH012', 'Lập phiếu thu giao kem ốc quế và phô mai miếng chuỗi GS25', 54000000.00, 'CK', 'TKQ-TCB01', 'Moi', 'NV002', '2026-09-22 05:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-034', '2026-09-22 04:48:41', 'DT-KH015', 'Thu tiền đợt 2 đơn hàng sữa bột Dielac Gold cho nhà phân phối Hà Nội', 380000000.00, 'CK', 'TKQ-VCB01', 'Moi', 'NV002', '2026-09-22 04:18:41', NULL, NULL, NULL, NULL, NULL),
('PT-202609-035', '2026-09-23 03:48:41', 'DT-KH002', 'Thu nộp tiền mặt doanh thu bán lẻ cuối ngày Cửa hàng Vinamilk Q.7', 32000000.00, 'TM', 'TKQ-TM01', 'Moi', 'NV002', '2026-09-23 03:18:41', NULL, NULL, NULL, NULL, NULL);

--
-- Cấu trúc bảng `phieuxuatnvl`
--
DROP TABLE IF EXISTS `phieuxuatnvl`;
CREATE TABLE `phieuxuatnvl` (
  `maPhieuXuatNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maXuong` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã xưởng/dây chuyền nhận',
  `maNVTao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNVNhan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayXuat` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `maPhieuYeuCauNVL` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nối với Yêu cầu bên Sản xuất',
  PRIMARY KEY (`maPhieuXuatNVL`),
  KEY `fk_pxnvl_nvtao` (`maNVTao`),
  KEY `fk_pxnvl_nvnhan` (`maNVNhan`),
  KEY `fk_pxnvl_pycnvl` (`maPhieuYeuCauNVL`),
  CONSTRAINT `fk_pxnvl_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxnvl_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxnvl_pycnvl` FOREIGN KEY (`maPhieuYeuCauNVL`) REFERENCES `phieuyeucaunvl` (`maPhieuYCNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `phieuxuatnvl` (2 bản ghi)
--
INSERT INTO `phieuxuatnvl` (`maPhieuXuatNVL`, `maXuong`, `maNVTao`, `maNVNhan`, `ngayXuat`, `trangThai`, `ghiChu`, `maPhieuYeuCauNVL`) VALUES
('PXNVL2026090301', 'XUONG-UHT-01', 'NV001', 'NV003', '2026-09-19', 'Đã hoàn thành', 'Xuất 4,500 lít sữa tươi thô cấp phát cho dây chuyền tiệt trùng UHT', 'YCNVL20260901'),
('PXNVL2026090602', 'XUONG-SUACHUA-02', 'NV001', 'NV003', '2026-09-21', 'Đã hoàn thành', 'Xuất 1,500 kg đường Biên Hòa phục vụ nấu mẻ sữa chua ăn', 'YCNVL20260908');

--
-- Cấu trúc bảng `phieuxuatsp`
--
DROP TABLE IF EXISTS `phieuxuatsp`;
CREATE TABLE `phieuxuatsp` (
  `maPhieuXuatSP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maKhachHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNVTao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayXuat` date DEFAULT NULL,
  `trangThai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maDonHang` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nối với Đơn hàng bên Bán hàng (Bắt buộc theo DT05)',
  PRIMARY KEY (`maPhieuXuatSP`),
  KEY `fk_pxsp_nvtao` (`maNVTao`),
  KEY `fk_pxsp_donhang` (`maDonHang`),
  CONSTRAINT `fk_pxsp_donhang` FOREIGN KEY (`maDonHang`) REFERENCES `donhang` (`maDonHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxsp_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `phieuxuatsp` (4 bản ghi)
--
INSERT INTO `phieuxuatsp` (`maPhieuXuatSP`, `maKhachHang`, `maNVTao`, `ngayXuat`, `trangThai`, `ghiChu`, `maDonHang`) VALUES
('PX26090872', 'KH_SA_1790146178', 'NV003', '2026-09-23', 'Chờ xuất', 'Xuất kho tự động từ đơn hàng DH_SA_1790146178', NULL),
('PXSP2026090501', 'KH001', 'NV001', '2026-09-20', 'Đã hoàn thành', 'Xuất 3,800 thùng Sữa tươi 180ml ưu tiên thuật toán FEFO lô HSD gần nhất', 'DH20260901'),
('PXSP2026090702', 'KH003', 'NV001', '2026-09-22', 'Đã hoàn thành', 'Xuất 2,150 lốc Sữa chua ăn Vinamilk cho siêu thị WinMart', 'DH20260905'),
('PXSP2026091003', 'KH002', 'NV001', '2026-09-23', 'Chờ duyệt', 'Xuất 800 thùng Sữa tươi tiệt trùng FEFO đợt mới', 'DH20260908');

--
-- Cấu trúc bảng `phieuyeucaubtp`
--
DROP TABLE IF EXISTS `phieuyeucaubtp`;
CREATE TABLE `phieuyeucaubtp` (
  `maPhieuYCBTP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maCongDoan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayYeuCau` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCBTP`),
  KEY `fk_pycbtp_cd` (`maCongDoan`),
  KEY `fk_pycbtp_lsx` (`maLenh`),
  KEY `fk_pycbtp_nv` (`maNhanVien`),
  CONSTRAINT `fk_pycbtp_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `congdoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycbtp_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycbtp_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu yêu cầu bán thành phẩm giữa các công đoạn';

--
-- Dữ liệu bảng `phieuyeucaubtp` (1 bản ghi)
--
INSERT INTO `phieuyeucaubtp` (`maPhieuYCBTP`, `maCongDoan`, `maLenh`, `maNhanVien`, `ngayYeuCau`, `ghiChu`) VALUES
('YCBTP20260901', 'CD01-03', 'LSX20260901', 'NV003', '2026-09-12', 'Chuyển BTP tiệt trùng sang phân xưởng chiết rót Aseptic');

--
-- Cấu trúc bảng `phieuyeucaunvl`
--
DROP TABLE IF EXISTS `phieuyeucaunvl`;
CREATE TABLE `phieuyeucaunvl` (
  `maPhieuYCNVL` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã phiếu yêu cầu NVL',
  `maCongDoan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Công đoạn yêu cầu',
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lệnh sản xuất liên quan',
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhân viên lập yêu cầu',
  `ngayYeuCau` date DEFAULT NULL COMMENT 'Ngày lập yêu cầu',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chưa xử lý' COMMENT 'Trạng thái (Chưa xử lý, Đã xuất kho, Từ chối)',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maPhieuYCNVL`),
  KEY `fk_pycnvl_cd` (`maCongDoan`),
  KEY `fk_pycnvl_lsx` (`maLenh`),
  KEY `fk_pycnvl_nv` (`maNhanVien`),
  CONSTRAINT `fk_pycnvl_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `congdoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycnvl_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycnvl_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu yêu cầu nguyên vật liệu từ xưởng';

--
-- Dữ liệu bảng `phieuyeucaunvl` (2 bản ghi)
--
INSERT INTO `phieuyeucaunvl` (`maPhieuYCNVL`, `maCongDoan`, `maLenh`, `maNhanVien`, `ngayYeuCau`, `trangThai`, `ghiChu`) VALUES
('YCNVL20260901', 'CD01-01', 'LSX20260901', 'NV003', '2026-09-11', 'Đã xuất kho', 'Cấp phát nguyên liệu cho Lệnh LSX20260901'),
('YCNVL20260908', 'CD03-01', 'LSX20260908', 'NV007', '2026-09-19', 'Đã xuất kho', 'Cấp phát vỏ hộp Tetra Pak và hương liệu tự nhiên');

--
-- Cấu trúc bảng `phieuyeucauxuatsp`
--
DROP TABLE IF EXISTS `phieuyeucauxuatsp`;
CREATE TABLE `phieuyeucauxuatsp` (
  `maPhieuYCXSP` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã phiếu yêu cầu nhập kho thành phẩm',
  `maPhieuNghiemThu` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Căn cứ biên bản nghiệm thu QC',
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayYeuCau` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chưa xử lý' COMMENT 'Trạng thái (Chưa xử lý, Đã nhập kho)',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCXSP`),
  KEY `fk_pycxsp_pnt` (`maPhieuNghiemThu`),
  KEY `fk_pycxsp_nv` (`maNhanVien`),
  CONSTRAINT `fk_pycxsp_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycxsp_pnt` FOREIGN KEY (`maPhieuNghiemThu`) REFERENCES `phieunghiemthu` (`maPhieuNghiemThu`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu bàn giao thành phẩm từ Xưởng sang Kho';

--
-- Dữ liệu bảng `phieuyeucauxuatsp` (1 bản ghi)
--
INSERT INTO `phieuyeucauxuatsp` (`maPhieuYCXSP`, `maPhieuNghiemThu`, `maNhanVien`, `ngayYeuCau`, `trangThai`, `ghiChu`) VALUES
('YCXSP20260901', 'PNT20260901', 'NV003', '2026-09-13', 'Đã nhập kho', 'Bàn giao 19,980 hộp sữa tiệt trùng sang Kho Tổng Bình Dương');

--
-- Cấu trúc bảng `phongban`
--
DROP TABLE IF EXISTS `phongban`;
CREATE TABLE `phongban` (
  `maPhongBan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã phòng ban',
  `tenPhongBan` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Tên phòng ban',
  PRIMARY KEY (`maPhongBan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Phòng Ban';

--
-- Dữ liệu bảng `phongban` (6 bản ghi)
--
INSERT INTO `phongban` (`maPhongBan`, `tenPhongBan`) VALUES
('PB01', 'Ban Giám Đốc & Điều Hành Tập Đoàn'),
('PB02', 'Phòng Quản Lý Kho Vận & Chuỗi Cung Ứng'),
('PB03', 'Phòng Tài Chính - Kế Toán Doanh Nghiệp'),
('PB04', 'Phòng Kỹ Thuật Sản Xuất & Siêu Nhà Máy Mega'),
('PB05', 'Phòng Kinh Doanh & Mạng Lưới Phân Phối'),
('PB06', 'Phòng Nhân Sự & Đào Tạo Nguồn Nhân Lực');

--
-- Cấu trúc bảng `sanpham`
--
DROP TABLE IF EXISTS `sanpham`;
CREATE TABLE `sanpham` (
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sản phẩm',
  `tenSanPham` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên sản phẩm',
  `donViTinh` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Hộp' COMMENT 'Đơn vị tính',
  `hanSuDung` date DEFAULT NULL COMMENT 'Hạn sử dụng theo ngày/tháng sản phẩm',
  `donGia` decimal(18,2) DEFAULT '0.00' COMMENT 'Đơn giá bán niêm yết',
  `trangThai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Đang kinh doanh' COMMENT 'Trạng thái sản phẩm',
  `ghiChu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maSanPham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Sản Phẩm hoàn chỉnh';

--
-- Dữ liệu bảng `sanpham` (10 bản ghi)
--
INSERT INTO `sanpham` (`maSanPham`, `tenSanPham`, `donViTinh`, `hanSuDung`, `donGia`, `trangThai`, `ghiChu`) VALUES
('SP001', 'Sữa Tươi Tiệt Trùng 100% Vinamilk Ít Đường 180ml', 'Thùng', '2027-01-14', 385000.00, 'Đang kinh doanh', NULL),
('SP002', 'Sữa Tươi Tiệt Trùng 100% Vinamilk Có Đường 110ml', 'Thùng', '2027-01-14', 260000.00, 'Đang kinh doanh', NULL),
('SP003', 'Sữa Chua Ăn Vinamilk Có Đường 100g', 'Lốc', '2026-10-24', 28000.00, 'Đang kinh doanh', NULL),
('SP004', 'Sữa Hạt Tách Béo Vinamilk Hạnh Nhân 180ml', 'Thùng', '2027-03-20', 450000.00, 'Đang kinh doanh', NULL),
('SP005', 'Sữa Tươi Nguyên Chất Vinamilk Green Farm 180ml', 'Thùng', '2027-02-13', 420000.00, 'Đang kinh doanh', NULL),
('SP006', 'Sữa Chua Uống Men Sống Probi 65ml', 'Lốc', '2026-10-21', 24500.00, 'Đang kinh doanh', NULL),
('SP007', 'Sữa Bột Dielac Alpha Gold Step 3 900g', 'Hộp', '2028-09-15', 310000.00, 'Đang kinh doanh', NULL),
('SP008', 'Sữa Đặc Có Đường Phương Nam 1284g', 'Lon', '2027-12-31', 62000.00, 'Đang kinh doanh', NULL),
('SP009', 'Sữa Tươi Tiệt Trùng Hương Dâu Vinamilk 180ml', 'Thùng', '2027-01-20', 385000.00, 'Đang kinh doanh', NULL),
('SP010', 'Phô Mai Con Bò Cười Vinamilk 112g (8 Miếng)', 'Hộp', '2027-04-10', 35000.00, 'Đang kinh doanh', NULL);

--
-- Cấu trúc bảng `taikhoan`
--
DROP TABLE IF EXISTS `taikhoan`;
CREATE TABLE `taikhoan` (
  `maTaiKhoan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maNV` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã nhân viên',
  `matKhau` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu mặc định là hash(123456)',
  `vaiTro` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NhanVien' COMMENT 'QuanLyNhanSu, ChuyenVienNhanSu, NhanVien',
  `trangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hoạt động' COMMENT 'Hoạt động, Khóa',
  `phaiDoiMatKhau` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: bắt buộc đổi mật khẩu',
  PRIMARY KEY (`maTaiKhoan`),
  UNIQUE KEY `uk_tk_nv` (`maNV`),
  CONSTRAINT `fk_tk_nv` FOREIGN KEY (`maNV`) REFERENCES `nhanvien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản đăng nhập nhân viên';

--
-- Dữ liệu bảng `taikhoan` (12 bản ghi)
--
INSERT INTO `taikhoan` (`maTaiKhoan`, `maNV`, `matKhau`, `vaiTro`, `trangThai`, `phaiDoiMatKhau`) VALUES
('TK-NV_TEST_1790089492', 'NV_TEST_1790089492', '$2y$12$Xq7GfErBjX0BtxOvJ3L6mOk3R6JZcbxh2nCWfoUuGqCTIb3DxmAf2', 'NhanVien', 'Hoạt động', 1),
('TK-NV_TEST_1790089532', 'NV_TEST_1790089532', '$2y$12$QHV8BU7OJ.zVmxOVdgYFsOaArweqdn/riqymO8wtnv.ZQpoYJ2wH2', 'NhanVien', 'Hoạt động', 1),
('TK001', 'NV001', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'QuanLyNhanSu', 'Hoạt động', '0'),
('TK002', 'NV002', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'ChuyenVienNhanSu', 'Hoạt động', '0'),
('TK003', 'NV003', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'NhanVien', 'Hoạt động', 1),
('TK004', 'NV004', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'NhanVien', 'Hoạt động', 1),
('TK005', 'NV005', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'QuanLyNhanSu', 'Hoạt động', '0'),
('TK006', 'NV006', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'NhanVien', 'Hoạt động', 1),
('TK007', 'NV007', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'NhanVien', 'Hoạt động', 1),
('TK008', 'NV008', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'ChuyenVienNhanSu', 'Hoạt động', 1),
('TK009', 'NV009', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'NhanVien', 'Hoạt động', 1),
('TK010', 'NV010', '$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2', 'ChuyenVienNhanSu', 'Hoạt động', '0');

--
-- Cấu trúc bảng `taikhoanquy`
--
DROP TABLE IF EXISTS `taikhoanquy`;
CREATE TABLE `taikhoanquy` (
  `maTaiKhoanQuy` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenTaiKhoanQuy` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `loaiTaiKhoan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'TM' COMMENT 'TM (Tiền mặt), NH (Ngân hàng)',
  `soTaiKhoan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nganHang` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soDuHienTai` decimal(18,2) DEFAULT '0.00',
  `trangThai` bit(1) DEFAULT b'1',
  PRIMARY KEY (`maTaiKhoanQuy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `taikhoanquy` (31 bản ghi)
--
INSERT INTO `taikhoanquy` (`maTaiKhoanQuy`, `tenTaiKhoanQuy`, `loaiTaiKhoan`, `soTaiKhoan`, `nganHang`, `soDuHienTai`, `trangThai`) VALUES
('TKQ_FIN_1790146179', 'Quỹ tiền mặt kiểm thử FIN_1790146179', 'TM', NULL, NULL, 15000000.00, 1),
('TKQ-ACB01', 'ACB - TK Chi Trả Phí Kiểm Nghiệm KCS Quốc Tế & Lab', 'NH', 240688899, 'Ngân hàng Á Châu (ACB) - Hội Sở Mạc Đĩnh Chi', 1450000000.00, 1),
('TKQ-ACB02', 'ACB - TK Ký Quỹ Mở L/C Nhập Khẩu Bột Sữa New Zealand', 'NH', 240699911, 'Ngân hàng Á Châu (ACB) - CN Sài Gòn', 7800000000.00, 1),
('TKQ-AGR01', 'Agribank - TK Thu Mua Sữa Hợp Tác Xã Mộc Châu Sơn La', 'NH', 3100201122334, 'Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Mộc Châu', 4560000000.00, 1),
('TKQ-AGR02', 'Agribank - TK Thu Mua Bò Sữa Đơn Dương (Lâm Đồng)', 'NH', 3100205566778, 'Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Lâm Đồng', 3800000000.00, 1),
('TKQ-AGR03', 'Agribank - TK Chi Trợ Giá Nông Nghiệp & Giống Cỏ', 'NH', 3100209988112, 'Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Bến Cát', 1980000000.00, 1),
('TKQ-BIDV01', 'BIDV - TK Chi Lương Tập Đoàn & Phúc Lợi Nhân Sự', 'NH', 1201000998877, 'Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Sở Giao Dịch 2', 6200000000.00, 1),
('TKQ-BIDV02', 'BIDV - TK Thu Mua Sữa Tươi Nông Trại Green Farm', 'NH', 1201000334455, 'Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Tây Ninh', 2900000000.00, 1),
('TKQ-BIDV03', 'BIDV - TK Thanh Toán Bao Bì & Hóa Chất Men Sống', 'NH', 1201000778899, 'Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Bắc Bình Dương', 3450000000.00, 1),
('TKQ-CTG01', 'VietinBank - TK Thu Hồi Công Nợ Đại Siêu Thị Co.opmart & GO!', 'NH', 113000556677, 'Ngân hàng Công Thương Việt Nam (VietinBank) - CN TP.HCM', 4780000000.00, 1),
('TKQ-CTG02', 'VietinBank - TK Chi Phí Vận Tải Lạnh & Cung Ứng Logistics', 'NH', 113000889900, 'Ngân hàng Công Thương Việt Nam (VietinBank) - CN Thủ Thiêm', 1890000000.00, 1),
('TKQ-CTG03', 'VietinBank - TK Giao Dịch Nhà Máy Sữa Tiên Sơn (Bắc Ninh)', 'NH', 113000223344, 'Ngân hàng Công Thương Việt Nam (VietinBank) - CN Bắc Ninh', 2150000000.00, 1),
('TKQ-HSBC01', 'HSBC - TK Ngoại Tệ Thanh Toán Men Sống Chr. Hansen Đan Mạch', 'NH', '001988776001', 'Ngân hàng TNHH MTV HSBC Việt Nam - Hội Sở', 14200000000.00, 1),
('TKQ-MB01', 'MBBank - TK Nộp Thuế & Nghĩa Vụ Ngân Sách Nhà Nước', 'NH', '0801100223344', 'Ngân hàng Quân Đội (MBBank) - CN Sở Giao Dịch 2', 8900000000.00, 1),
('TKQ-MB02', 'MBBank - TK Chi Trả Điện Lực EVN & Năng Lượng Xanh', 'NH', '0801100556677', 'Ngân hàng Quân Đội (MBBank) - CN Nam Sài Gòn', 2100000000.00, 1),
('TKQ-SCB01', 'Standard Chartered - TK Ngoại Tệ Xuất Khẩu Thị Trường Trung Đông', 'NH', '002887766002', 'Ngân hàng Standard Chartered Việt Nam - CN TP.HCM', 18600000000.00, 1),
('TKQ-SHB01', 'SHB - TK Quản Lý Hoạt Động Điều Hành Ban Giám Đốc', 'NH', 1002554433, 'Ngân hàng Sài Gòn - Hà Nội (SHB) - CN Vạn Hạnh', 1890000000.00, 1),
('TKQ-TCB01', 'Techcombank - TK Thu Bán Lẻ Kênh Thương Mại Điện Tử & App', 'NH', 190300112233, 'Ngân hàng Kỹ Thương (Techcombank) - Hội Sở Miền Nam', 3120000000.00, 1),
('TKQ-TCB02', 'Techcombank - TK Thanh Toán Chuỗi Cửa Hàng Giấc Mơ Sữa Việt', 'NH', 190300445566, 'Ngân hàng Kỹ Thương (Techcombank) - CN Phú Mỹ Hưng', 2450000000.00, 1),
('TKQ-TCB03', 'Techcombank - TK Thanh Toán Chiến Dịch Marketing & Quảng Cáo', 'NH', 190300778899, 'Ngân hàng Kỹ Thương (Techcombank) - CN Gia Định', 1650000000.00, 1),
('TKQ-TM01', 'Quỹ Tiền Mặt Trụ Sở Chính (10 Tân Trào, Q.7)', 'TM', NULL, NULL, 450000000.00, 1),
('TKQ-TM02', 'Quỹ Tiền Mặt Siêu Nhà Máy Mega Plant Bình Dương', 'TM', NULL, NULL, 280000000.00, 1),
('TKQ-TM03', 'Quỹ Tiền Mặt Chi Nhánh Hà Nội & Phân Phối Miền Bắc', 'TM', NULL, NULL, 310000000.00, 1),
('TKQ-TM04', 'Quỹ Tiền Mặt Nhà Máy Sữa Đà Lạt & Nông Trại Organic', 'TM', NULL, NULL, 195000000.00, 1),
('TKQ-TM05', 'Quỹ Tiền Mặt Chi Nhánh Cần Thơ & Tây Nam Bộ', 'TM', NULL, NULL, 220000000.00, 1),
('TKQ-TM06', 'Quỹ Tiền Mặt Nhà Máy Sữa Lam Sơn (Yên Định, Thanh Hóa)', 'TM', NULL, NULL, 175000000.00, 1),
('TKQ-VCB01', 'Vietcombank - TK Thanh Toán Thu Tiền Bán Hàng Trụ Sở', 'NH', '0071001234567', 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN TP.HCM', 5450000000.00, 1),
('TKQ-VCB02', 'Vietcombank - TK Thu Bán Sỉ Kênh Siêu Thị & Đại Lý', 'NH', '0071009876543', 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN Tân Bình', 3820000000.00, 1),
('TKQ-VCB03', 'Vietcombank - TK Chuyên Nhập Khẩu Nguyên Liệu USD', 'NH', '0071370011223', 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - Sở Giao Dịch', 12500000000.00, 1),
('TKQ-VCB04', 'Vietcombank - TK Quản Lý Ngân Sách Sữa Học Đường', 'NH', '0071005544332', 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN Nam Sài Gòn', 4100000000.00, 1),
('TKQ-VPB01', 'VPBank - TK Thu Thanh Toán Hệ Thống WinMart & Bách Hóa Xanh', 'NH', 150988877, 'Ngân hàng Việt Nam Thịnh Vượng (VPBank) - CN Bến Thành', 5230000000.00, 1);

--
-- Cấu trúc bảng `thanhtoan`
--
DROP TABLE IF EXISTS `thanhtoan`;
CREATE TABLE `thanhtoan` (
  `maThanhToan` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maCongNo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngayThanhToan` datetime DEFAULT CURRENT_TIMESTAMP,
  `phuongThuc` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Tiền mặt',
  PRIMARY KEY (`maThanhToan`),
  KEY `fk_tt_cn` (`maCongNo`),
  CONSTRAINT `fk_tt_cn` FOREIGN KEY (`maCongNo`) REFERENCES `congno` (`maCongNo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu bảng `thanhtoan` (2 bản ghi)
--
INSERT INTO `thanhtoan` (`maThanhToan`, `maCongNo`, `ngayThanhToan`, `phuongThuc`) VALUES
('TT2026090301', 'CN-KH001-202609', '2026-09-13 06:48:41', 'Chuyển khoản VCB'),
('TT2026090702', 'CN-KH003-202609', '2026-09-17 06:48:41', 'Chuyển khoản BIDV');

--
-- Cấu trúc bảng `tiendosanxuat`
--
DROP TABLE IF EXISTS `tiendosanxuat`;
CREATE TABLE `tiendosanxuat` (
  `maTienDoSX` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maCongDoan` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maLenh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maNhanVien` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaySX` date DEFAULT NULL,
  PRIMARY KEY (`maTienDoSX`),
  KEY `fk_tdsx_cd` (`maCongDoan`),
  KEY `fk_tdsx_lsx` (`maLenh`),
  KEY `fk_tdsx_nv` (`maNhanVien`),
  CONSTRAINT `fk_tdsx_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `congdoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tdsx_lsx` FOREIGN KEY (`maLenh`) REFERENCES `lenhsanxuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tdsx_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `nhanvien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Theo dõi tiến độ sản xuất';

--
-- Dữ liệu bảng `tiendosanxuat` (2 bản ghi)
--
INSERT INTO `tiendosanxuat` (`maTienDoSX`, `maCongDoan`, `maLenh`, `maNhanVien`, `ngaySX`) VALUES
('TDSX20260901', 'CD01-03', 'LSX20260901', 'NV007', '2026-09-13'),
('TDSX20260908', 'CD03-01', 'LSX20260908', 'NV007', '2026-09-20');

--
-- Cấu trúc bảng `tonkho`
--
DROP TABLE IF EXISTS `tonkho`;
CREATE TABLE `tonkho` (
  `maTonKho` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lô tồn kho',
  `tenTonKho` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nhãn mô tả lô',
  `maKho` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Khu vực đang lưu trữ lô (Kho)',
  `maSanPham` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã SP (nếu là lô thành phẩm)',
  `maNVL` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã NVL (nếu là lô nguyên vật liệu)',
  `ngaySanXuat` date DEFAULT NULL COMMENT 'Ngày sản xuất lô',
  `hanSuDung` date DEFAULT NULL COMMENT 'Hạn sử dụng lô',
  `soLuongNhap` int DEFAULT '0' COMMENT 'Số lượng ban đầu nhập',
  `soLuongTonHienTai` int DEFAULT '0' COMMENT 'Số lượng tồn khả dụng hiện tại',
  `trangThaiHSD` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Còn hạn' COMMENT 'Còn hạn, Sắp hết hạn, Hết hạn',
  `trangThaiChatLuong` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Đạt' COMMENT 'Chờ kiểm tra, Đạt, Không đạt',
  `trangThai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Còn hạn' COMMENT 'Tương thích ngược',
  `ghiChu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`maTonKho`),
  KEY `fk_tk_kho` (`maKho`),
  KEY `fk_tk_sp` (`maSanPham`),
  KEY `fk_tk_nvl` (`maNVL`),
  CONSTRAINT `fk_tk_kho` FOREIGN KEY (`maKho`) REFERENCES `kho` (`maKho`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tk_nvl` FOREIGN KEY (`maNVL`) REFERENCES `nguyenvatlieu` (`maNVL`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tk_sp` FOREIGN KEY (`maSanPham`) REFERENCES `sanpham` (`maSanPham`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý chi tiết tồn kho theo Lô và HSD';

--
-- Dữ liệu bảng `tonkho` (12 bản ghi)
--
INSERT INTO `tonkho` (`maTonKho`, `tenTonKho`, `maKho`, `maSanPham`, `maNVL`, `ngaySanXuat`, `hanSuDung`, `soLuongNhap`, `soLuongTonHienTai`, `trangThaiHSD`, `trangThaiChatLuong`, `trangThai`, `ghiChu`) VALUES
('LOT-NVL-20260901-01', 'Lô Sữa Tươi Nguyên Chất Thô Mộc Châu - Đợt 1', 'KHO-LTM', NULL, 'NVL001', '2026-09-13', '2026-10-08', 20000, 15500, 'Sắp hết hạn', 'Đạt', 'Ưu tiên xuất FEFO', 'Bảo quản kho lạnh UHT 2-4 độ C'),
('LOT-NVL-20260902-06', 'Lô Men Probiotics LGG Chr. Hansen Đan Mạch', 'KHO-TONG', NULL, 'NVL006', '2026-09-08', '2026-12-22', 200, 45, 'Còn hạn', 'Đạt', 'Tồn kho thấp', 'Men vi sinh sống đông khô'),
('LOT-NVL-20260905-02', 'Lô Đường Tinh Luyện Biên Hòa Grade A', 'KHO-TONG', NULL, 'NVL002', '2026-08-24', '2027-09-23', 10000, 8500, 'Còn hạn', 'Đạt', 'Còn hạn', 'Kho khô ráo'),
('LOT-NVL-20260907-03', 'Lô Hương Liệu Dâu Tự Nhiên Firmenich', 'KHO-TONG', NULL, 'NVL003', '2026-07-25', '2027-03-22', 500, 80, 'Còn hạn', 'Đạt', 'Tồn kho thấp', 'Cần nhập bổ sung khẩn cấp'),
('LOT-NVL-20260908-04', 'Lô Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml', 'KHO-TONG', NULL, 'NVL004', '2026-09-08', '2028-09-12', 500000, 420000, 'Còn hạn', 'Đạt', 'Còn hạn', 'Kho bao bì tiệt trùng'),
('LOT-NVL-20260910-05', 'Lô Bột Sữa Gầy Skim Milk Powder NZMP Fonterra', 'KHO-TONG', NULL, 'NVL005', '2026-08-14', '2027-09-23', 5000, 4500, 'Còn hạn', 'Đạt', 'Còn hạn', 'Nhập khẩu chính ngạch New Zealand'),
('LOT-SP-20260902-FEFO1', 'Lô Thành Phẩm Sữa Tươi 100% Ít Đường 180ml (Batch FEFO-1)', 'KHO-TONG', 'SP001', NULL, '2026-08-09', '2026-10-03', 10, 10, 'Sắp hết hạn', 'Đạt', 'Ưu tiên xuất FEFO', 'Xuất ngay cho siêu thị Co.opmart'),
('LOT-SP-20260903-PB01', 'Lô Sữa Chua Uống Men Sống Probi 65ml', 'KHO-DNG', 'SP006', NULL, '2026-09-15', '2026-10-28', 12000, 11000, 'Còn hạn', 'Đạt', 'Còn hạn', 'Bảo quản mát 6-8 độ C'),
('LOT-SP-20260904-SC01', 'Lô Thành Phẩm Sữa Chua Ăn Vinamilk Có Đường 100g', 'KHO-TONG', 'SP003', NULL, '2026-09-01', '2026-10-01', 3000, 850, 'Sắp hết hạn', 'Đạt', 'Ưu tiên xuất FEFO', 'Kho lạnh 4-8 độ C'),
('LOT-SP-20260906-DA01', 'Lô Sữa Bột Dielac Alpha Gold Step 3 900g', 'KHO-CTH', 'SP007', NULL, '2026-09-03', '2028-09-22', 2000, 1850, 'Còn hạn', 'Đạt', 'Còn hạn', 'Sữa bột công thức lon thiếc'),
('LOT-SP-20260908-FEFO2', 'Lô Thành Phẩm Sữa Tươi 100% Ít Đường 180ml (Batch FEFO-2)', 'KHO-TONG', 'SP001', NULL, '2026-09-18', '2027-01-21', 15000, 14200, 'Còn hạn', 'Đạt', 'Còn hạn', 'Kho tổng thành phẩm UHT'),
('LOT-SP-20260909-GF01', 'Lô Sữa Tươi Nguyên Chất Vinamilk Green Farm 180ml', 'KHO-TONG', 'SP005', NULL, '2026-09-20', '2027-02-20', 8000, 7600, 'Còn hạn', 'Đạt', 'Còn hạn', 'Dòng sữa tươi sinh thái cao cấp');

SET FOREIGN_KEY_CHECKS=1;
