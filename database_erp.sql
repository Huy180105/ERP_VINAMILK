/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: quanly_erp
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `quanly_erp`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `quanly_erp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `quanly_erp`;

--
-- Table structure for table `BangCong`
--

DROP TABLE IF EXISTS `BangCong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BangCong` (
  `maBangCong` varchar(50) NOT NULL,
  `maNV` varchar(20) NOT NULL COMMENT 'Mã nhân viên',
  `thang` varchar(7) NOT NULL COMMENT 'Tháng chấm công (MM/YYYY)',
  `soNgayCong` int(11) DEFAULT 0 COMMENT 'Số ngày công thực tế',
  `soGioTangCa` decimal(6,2) DEFAULT 0.00 COMMENT 'Số giờ tăng ca trong tháng',
  `soNgayNghiPhep` int(11) DEFAULT 0,
  `trangThai` varchar(20) DEFAULT 'DangChot',
  `lyDoGiaiTrinh` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`maBangCong`),
  KEY `fk_bc_nv` (`maNV`),
  CONSTRAINT `fk_bc_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chấm công hàng tháng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BangCong`
--

LOCK TABLES `BangCong` WRITE;
/*!40000 ALTER TABLE `BangCong` DISABLE KEYS */;
INSERT INTO `BangCong` VALUES
('BC-202608-1','NV001','08/2026',22,12.00,0,'DangChot',NULL),
('BC-202608-10','NV010','08/2026',22,12.00,0,'DangChot',NULL),
('BC-202608-2','NV002','08/2026',22,6.00,0,'DangChot',NULL),
('BC-202608-3','NV003','08/2026',22,6.00,0,'DangChot',NULL),
('BC-202608-4','NV004','08/2026',22,12.00,0,'DangChot',NULL),
('BC-202608-5','NV005','08/2026',22,6.00,0,'DangChot',NULL),
('BC-202608-6','NV006','08/2026',22,6.00,0,'DangChot',NULL),
('BC-202608-7','NV007','08/2026',22,12.00,0,'DangChot',NULL),
('BC-202608-8','NV008','08/2026',22,6.00,0,'DangChot',NULL),
('BC-202608-9','NV009','08/2026',22,6.00,0,'DangChot',NULL),
('BC-202609-1','NV001','09/2026',21,8.00,0,'DangChot',NULL),
('BC-202609-10','NV010','09/2026',21,4.00,0,'DangChot',NULL),
('BC-202609-2','NV002','09/2026',21,4.00,0,'DangChot',NULL),
('BC-202609-3','NV003','09/2026',21,8.00,0,'DangChot',NULL),
('BC-202609-4','NV004','09/2026',21,4.00,0,'DangChot',NULL),
('BC-202609-5','NV005','09/2026',21,8.00,0,'DangChot',NULL),
('BC-202609-6','NV006','09/2026',21,4.00,0,'DangChot',NULL),
('BC-202609-7','NV007','09/2026',21,8.00,0,'DangChot',NULL),
('BC-202609-8','NV008','09/2026',21,4.00,0,'DangChot',NULL),
('BC-202609-9','NV009','09/2026',21,8.00,0,'DangChot',NULL);
/*!40000 ALTER TABLE `BangCong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BangLuong`
--

DROP TABLE IF EXISTS `BangLuong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BangLuong` (
  `maBangLuong` varchar(50) NOT NULL,
  `maNV` varchar(20) NOT NULL COMMENT 'Mã nhân viên nhận lương',
  `maBangCong` varchar(50) DEFAULT NULL,
  `maHopDong` varchar(20) DEFAULT NULL COMMENT 'Hợp đồng căn cứ mức lương',
  `thang` varchar(7) NOT NULL COMMENT 'Tháng tính lương (MM/YYYY)',
  `luongCoBan` decimal(15,2) DEFAULT 0.00,
  `phuCap` decimal(15,2) DEFAULT 0.00,
  `luongTangCa` decimal(15,2) DEFAULT 0.00,
  `khauTru` decimal(15,2) DEFAULT 0.00,
  `tongThucNhan` decimal(15,2) DEFAULT 0.00 COMMENT 'Tổng lương thực nhận',
  `trangThai` varchar(20) DEFAULT 'TamTinh',
  `nguoiSua` varchar(50) DEFAULT NULL,
  `lyDoSua` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`maBangLuong`),
  KEY `fk_bl_nv` (`maNV`),
  KEY `fk_bl_hd` (`maHopDong`),
  KEY `fk_bl_bc` (`maBangCong`),
  CONSTRAINT `fk_bl_bc` FOREIGN KEY (`maBangCong`) REFERENCES `BangCong` (`maBangCong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bl_hd` FOREIGN KEY (`maHopDong`) REFERENCES `HopDong` (`maHopDong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bl_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng tổng hợp lương hàng tháng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BangLuong`
--

LOCK TABLES `BangLuong` WRITE;
/*!40000 ALTER TABLE `BangLuong` DISABLE KEYS */;
INSERT INTO `BangLuong` VALUES
('BL-202608-1','NV001','BC-202608-1','HD2020-001','08/2026',28000000.00,5000000.00,0.00,0.00,33000000.00,'DaKhoa',NULL,NULL),
('BL-202608-10','NV010','BC-202608-10','HD2023-010','08/2026',0.00,0.00,0.00,0.00,18500000.00,'TamTinh',NULL,NULL),
('BL-202608-2','NV002','BC-202608-2','HD2020-002','08/2026',0.00,0.00,0.00,0.00,38000000.00,'TamTinh',NULL,NULL),
('BL-202608-3','NV003','BC-202608-3','HD2019-003','08/2026',26000000.00,4500000.00,0.00,0.00,30500000.00,'DaKhoa',NULL,NULL),
('BL-202608-4','NV004','BC-202608-4','HD2022-004','08/2026',16000000.00,2500000.00,0.00,0.00,18500000.00,'DaKhoa',NULL,NULL),
('BL-202608-5','NV005','BC-202608-5','HD2022-005','08/2026',0.00,0.00,0.00,0.00,75000000.00,'TamTinh',NULL,NULL),
('BL-202608-6','NV006','BC-202608-6','HD2022-006','08/2026',15000000.00,3000000.00,0.00,0.00,18000000.00,'DaKhoa',NULL,NULL),
('BL-202608-7','NV007','BC-202608-7','HD2022-007','08/2026',0.00,0.00,0.00,0.00,20500000.00,'TamTinh',NULL,NULL),
('BL-202608-8','NV008','BC-202608-8','HD2023-008','08/2026',14000000.00,2500000.00,0.00,0.00,16500000.00,'DaKhoa',NULL,NULL),
('BL-202608-9','NV009','BC-202608-9','HD2023-009','08/2026',15000000.00,2500000.00,0.00,0.00,17500000.00,'DaKhoa',NULL,NULL),
('BL-202609-NV_TEST_1790089532','NV_TEST_1790089532',NULL,'HD_TEST_1790089533','09/2026',18000000.00,3000000.00,0.00,1890000.00,19110000.00,'DaKhoa',NULL,NULL),
('BL-202609-NV001','NV001','BC-202609-1','HD2020-001','09/2026',28000000.00,5000000.00,1909091.00,2940000.00,30696364.00,'DaKhoa',NULL,NULL),
('BL-202609-NV002','NV002','BC-202609-2','HD2021-002','09/2026',32000000.00,6000000.00,1090909.00,3360000.00,34276364.00,'DaKhoa',NULL,NULL),
('BL-202609-NV003','NV003','BC-202609-3','HD2019-003','09/2026',26000000.00,4500000.00,1772727.00,2730000.00,28360909.00,'DaKhoa',NULL,NULL),
('BL-202609-NV004','NV004','BC-202609-4','HD2022-004','09/2026',16000000.00,2500000.00,545455.00,1680000.00,16638182.00,'DaKhoa',NULL,NULL),
('BL-202609-NV005','NV005','BC-202609-5','HD2018-005','09/2026',60000000.00,15000000.00,4090909.00,6300000.00,70063636.00,'DaKhoa',NULL,NULL),
('BL-202609-NV006','NV006','BC-202609-6','HD2022-006','09/2026',15000000.00,3000000.00,511364.00,1575000.00,16254546.00,'DaKhoa',NULL,NULL),
('BL-202609-NV007','NV007','BC-202609-7','HD2021-007','09/2026',18000000.00,2500000.00,1227273.00,1890000.00,19019091.00,'DaKhoa',NULL,NULL),
('BL-202609-NV008','NV008','BC-202609-8','HD2023-008','09/2026',14000000.00,2500000.00,477273.00,1470000.00,14870909.00,'DaKhoa',NULL,NULL),
('BL-202609-NV009','NV009','BC-202609-9','HD2023-009','09/2026',15000000.00,2500000.00,1022727.00,1575000.00,16265909.00,'DaKhoa',NULL,NULL),
('BL-202609-NV010','NV010','BC-202609-10','HD2022-010','09/2026',16000000.00,2500000.00,545455.00,1680000.00,16638182.00,'DaKhoa',NULL,NULL);
/*!40000 ALTER TABLE `BangLuong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BaoCaoThuChi`
--

DROP TABLE IF EXISTS `BaoCaoThuChi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BaoCaoThuChi` (
  `maBaoCao` varchar(50) NOT NULL,
  `loaiBaoCao` varchar(20) DEFAULT 'TongHop',
  `tuNgay` date DEFAULT NULL,
  `denNgay` date DEFAULT NULL,
  `ngayLap` datetime DEFAULT current_timestamp(),
  `nguoiLap` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`maBaoCao`),
  KEY `fk_bctc_nv` (`nguoiLap`),
  CONSTRAINT `fk_bctc_nv` FOREIGN KEY (`nguoiLap`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BaoCaoThuChi`
--

LOCK TABLES `BaoCaoThuChi` WRITE;
/*!40000 ALTER TABLE `BaoCaoThuChi` DISABLE KEYS */;
INSERT INTO `BaoCaoThuChi` VALUES
('BCTC-2025-Q1','TongHop','2025-01-01','2025-03-31','2025-04-05 09:00:00','NV002'),
('BCTC-2025-Q2','TongHop','2025-04-01','2025-06-30','2025-07-06 10:00:00','NV002'),
('BCTC-2025-Q3','TongHop','2025-07-01','2025-09-30','2025-10-07 11:00:00','NV002'),
('BCTC-2025-Q4','TongHop','2025-10-01','2025-12-31','2026-01-10 14:00:00','NV002'),
('BCTC-2025-T01','ThuChiThang','2025-01-01','2025-01-31','2025-02-02 08:30:00','NV002'),
('BCTC-2025-T02','ThuChiThang','2025-02-01','2025-02-28','2025-03-02 09:00:00','NV002'),
('BCTC-2025-T03','ThuChiThang','2025-03-01','2025-03-31','2025-04-03 10:15:00','NV002'),
('BCTC-2025-T04','ThuChiThang','2025-04-01','2025-04-30','2025-05-04 08:45:00','NV002'),
('BCTC-2025-T05','ThuChiThang','2025-05-01','2025-05-31','2025-06-02 11:00:00','NV002'),
('BCTC-2025-T06','ThuChiThang','2025-06-01','2025-06-30','2025-07-03 09:30:00','NV002'),
('BCTC-2025-T07','ThuChiThang','2025-07-01','2025-07-31','2025-08-02 14:00:00','NV002'),
('BCTC-2025-T08','ThuChiThang','2025-08-01','2025-08-31','2025-09-02 15:30:00','NV002'),
('BCTC-2025-T09','ThuChiThang','2025-09-01','2025-09-30','2025-10-03 09:00:00','NV002'),
('BCTC-2025-T10','ThuChiThang','2025-10-01','2025-10-31','2025-11-04 10:30:00','NV002'),
('BCTC-2025-T11','ThuChiThang','2025-11-01','2025-11-30','2025-12-02 08:30:00','NV002'),
('BCTC-2025-T12','ThuChiThang','2025-12-01','2025-12-31','2026-01-05 16:00:00','NV002'),
('BCTC-2026-Q1','TongHop','2026-01-01','2026-03-31','2026-04-06 09:00:00','NV002'),
('BCTC-2026-Q2','TongHop','2026-04-01','2026-06-30','2026-07-05 10:00:00','NV002'),
('BCTC-2026-T01','ThuChiThang','2026-01-01','2026-01-31','2026-02-03 09:00:00','NV002'),
('BCTC-2026-T02','ThuChiThang','2026-02-01','2026-02-28','2026-03-03 10:00:00','NV002'),
('BCTC-2026-T03','ThuChiThang','2026-03-01','2026-03-31','2026-04-03 08:30:00','NV002'),
('BCTC-2026-T04','ThuChiThang','2026-04-01','2026-04-30','2026-05-04 09:30:00','NV002'),
('BCTC-2026-T05','ThuChiThang','2026-05-01','2026-05-31','2026-06-03 10:30:00','NV002'),
('BCTC-2026-T06','ThuChiThang','2026-06-01','2026-06-30','2026-07-03 08:45:00','NV002'),
('BCTC-2026-T07','ThuChiThang','2026-07-01','2026-07-31','2026-08-04 11:15:00','NV002'),
('BCTC-2026-T08','ThuChiThang','2026-08-01','2026-08-31','2026-09-02 09:30:00','NV002'),
('BCTC-DCQ-2026-01','DoiChieuQuy','2026-06-01','2026-06-30','2026-07-01 17:00:00','NV002'),
('BCTC-DCQ-2026-02','DoiChieuQuy','2026-07-01','2026-07-31','2026-08-01 17:30:00','NV002'),
('BCTC-DCQ-2026-03','DoiChieuQuy','2026-08-01','2026-08-31','2026-09-01 18:00:00','NV002'),
('BCTC-DCQ-2026-04','DoiChieuQuy','2026-09-01','2026-09-30','2026-09-16 04:29:10','NV002');
/*!40000 ALTER TABLE `BaoCaoThuChi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietDonHang`
--

DROP TABLE IF EXISTS `ChiTietDonHang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietDonHang` (
  `maDonHang` varchar(20) NOT NULL,
  `maSanPham` varchar(20) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `donGia` decimal(18,2) DEFAULT 0.00,
  `thanhTien` decimal(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maDonHang`,`maSanPham`),
  KEY `fk_ctdh_sp` (`maSanPham`),
  CONSTRAINT `fk_ctdh_dh` FOREIGN KEY (`maDonHang`) REFERENCES `DonHang` (`maDonHang`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctdh_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietDonHang`
--

LOCK TABLES `ChiTietDonHang` WRITE;
/*!40000 ALTER TABLE `ChiTietDonHang` DISABLE KEYS */;
INSERT INTO `ChiTietDonHang` VALUES
('DH20260901','SP001',1500,385000.00,577500000.00),
('DH20260901','SP002',200,260000.00,52500000.00),
('DH20260901','SP003',5000,28000.00,140000000.00),
('DH20260905','SP005',800,420000.00,336000000.00),
('DH20260905','SP006',6000,24500.00,147000000.00),
('DH20260905','SP010',1057,35000.00,37000000.00),
('DH20260908','SP001',800,385000.00,308000000.00),
('DH20260908','SP004',250,450000.00,112500000.00),
('DH20260908','SP008',475,62000.00,29500000.00),
('DH20260910','SP007',1000,310000.00,310000000.00),
('DH20260912','SP001',500,385000.00,192500000.00),
('DH20260912','SP002',355,260000.00,92500000.00),
('DH20260914','SP007',2500,310000.00,775000000.00),
('DH20260914','SP008',7661,62000.00,475000000.00);
/*!40000 ALTER TABLE `ChiTietDonHang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietLenhSanXuat`
--

DROP TABLE IF EXISTS `ChiTietLenhSanXuat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietLenhSanXuat` (
  `maLenh` varchar(20) NOT NULL COMMENT 'Mã lệnh sản xuất',
  `maSanPham` varchar(20) NOT NULL COMMENT 'Mã sản phẩm cần sản xuất',
  `soLuong` int(11) DEFAULT 0 COMMENT 'Số lượng sản xuất kế hoạch',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maLenh`,`maSanPham`),
  KEY `fk_ctl_sp` (`maSanPham`),
  CONSTRAINT `fk_ctl_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctl_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết sản phẩm thuộc Lệnh Sản Xuất';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietLenhSanXuat`
--

LOCK TABLES `ChiTietLenhSanXuat` WRITE;
/*!40000 ALTER TABLE `ChiTietLenhSanXuat` DISABLE KEYS */;
INSERT INTO `ChiTietLenhSanXuat` VALUES
('LSX20260901','SP001',20000,'Tiệt trùng UHT vô trùng'),
('LSX20260905','SP003',5000,'Ủ men sống Bulgaricus 8 tiếng'),
('LSX20260908','SP005',10000,'Tiêu chuẩn Clean Label quốc tế'),
('LSX20260912','SP006',15000,'Men sống L.Casei 431');
/*!40000 ALTER TABLE `ChiTietLenhSanXuat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuChi`
--

DROP TABLE IF EXISTS `ChiTietPhieuChi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuChi` (
  `maChiTietChi` varchar(50) NOT NULL,
  `maPhieuChi` varchar(50) NOT NULL,
  `maDanhMucChi` varchar(50) DEFAULT NULL,
  `dienGiai` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maChiTietChi`),
  KEY `fk_ctpc_pc` (`maPhieuChi`),
  KEY `fk_ctpc_dmc` (`maDanhMucChi`),
  CONSTRAINT `fk_ctpc_dmc` FOREIGN KEY (`maDanhMucChi`) REFERENCES `DanhMucChi` (`maDanhMucChi`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpc_pc` FOREIGN KEY (`maPhieuChi`) REFERENCES `PhieuChi` (`maPhieuChi`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuChi`
--

LOCK TABLES `ChiTietPhieuChi` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuChi` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuChi` VALUES
('CTPC-001-1','PC-202609-001','DMC04','Thanh toán tiền mua bao bì tiệt trùng phức hợp Aseptic từ Tetra Pak VN',450000000.00),
('CTPC-002-1','PC-202609-002','DMC03','Thanh toán tiền nhập 50 tấn đường tinh luyện cao cấp từ TTC Sugar Biên Hòa',180000000.00),
('CTPC-003-1','PC-202609-003','DMC01','Thanh toán tiền thu mua sữa bò tươi nguyên chất đợt 1 Hợp Tác Xã Mộc Châu',320000000.00),
('CTPC-004-1','PC-202609-004','DMC02','Thanh toán L/C nhập khẩu 40 tấn bột sữa gầy nguyên chất từ Fonterra New Zealand',850000000.00),
('CTPC-005-1','PC-202609-005','DMC05','Thanh toán tiền mua men vi sinh sống đông khô từ Chr. Hansen Đan Mạch',240000000.00),
('CTPC-006-1','PC-202609-006','DMC01','Thanh toán tiền sữa tươi chuẩn organic trang trại Vinamilk Green Farm Tây Ninh',420000000.00),
('CTPC-007-1','PC-202609-007','DMC01','Thanh toán tiền sữa bò hữu cơ trang trại Organic Đà Lạt kỳ tháng 8',290000000.00),
('CTPC-008-1','PC-202609-008','DMC06','Thanh toán hương liệu tự nhiên dâu & socola cho Kerry Ingredients VN',165000000.00),
('CTPC-009-1','PC-202609-009','DMC06','Thanh toán tiền vi chất Canxi nano & Vitamin D3 từ DSM Thụy Sĩ',210000000.00),
('CTPC-010-1','PC-202609-010','DMC01','Thanh toán tiền sữa tươi thu gom từ Hợp tác xã chăn nuôi Đơn Dương',195000000.00),
('CTPC-011-1','PC-202609-011','DMC07','Thanh toán tiền mua pallet nhựa và khay chứa sữa từ Nhựa Duy Tân',88000000.00),
('CTPC-012-1','PC-202609-012','DMC12','Thanh toán cước vận chuyển xe bồn lạnh luân chuyển sữa tươi ABA Cooltrans',145000000.00),
('CTPC-013-1','PC-202609-013','DMC01','Thanh toán tiền sữa tươi thô trang trại công nghệ cao Yên Định, Thanh Hóa',260000000.00),
('CTPC-014-1','PC-202609-014','DMC17','Thanh toán bảo dưỡng hệ thống điều hòa không khí kho lạnh REE Corp',75000000.00),
('CTPC-015-1','PC-202609-015','DMC07','Thanh toán tiền mua 50.000 vỏ thùng carton in offset Tân Á',68000000.00),
('CTPC-016-1','PC-202609-016','DMC08','Chi trả lương tháng 8/2026 cho Trưởng phòng Kho vận Nguyễn Văn Hùng',28000000.00),
('CTPC-017-1','PC-202609-017','DMC08','Chi trả lương tháng 8/2026 cho Kế toán trưởng Trần Thị Thu Thảo',32000000.00),
('CTPC-018-1','PC-202609-018','DMC08','Chi trả lương tháng 8/2026 cho Trưởng ca sản xuất Lê Minh Tuấn',26000000.00),
('CTPC-019-1','PC-202609-019','DMC08','Chi trả lương tháng 8/2026 cho Chuyên viên kinh doanh Phạm Hoàng Nam',16000000.00),
('CTPC-020-1','PC-202609-020','DMC08','Chi trả lương tháng 8/2026 cho Ban Giám đốc điều hành Trịnh Đình Đức',45000000.00),
('CTPC-021-1','PC-202609-021','DMC14','Thanh toán tiền điện sản xuất cho Điện lực Bến Cát (Nhà máy Mega Plant)',185000000.00),
('CTPC-022-1','PC-202609-022','DMC15','Chi tiền nước sinh hoạt và sản xuất văn phòng Tân Trào kỳ tháng 8',14500000.00),
('CTPC-023-1','PC-202609-023','DMC16','Chi tiền mua dầu DO vận hành lò hơi tiệt trùng áp suất cao nhà máy',95000000.00),
('CTPC-024-1','PC-202609-024','DMC10','Trích nộp BHXH, BHYT, BHTN tháng 8/2026 cho cơ quan Bảo hiểm TP.HCM',168000000.00),
('CTPC-025-1','PC-202609-025','DMC21','Thanh toán chi phí chiến dịch quảng cáo ra mắt dòng Sữa Hạt Super Nut',250000000.00),
('CTPC-026-1','PC-202609-026','DMC04','Thanh toán tiền mua bao bì đợt 2 tháng 9 cho Tetra Pak (Chờ duyệt CFO)',380000000.00),
('CTPC-027-1','PC-202609-027','DMC03','Thanh toán đơn hàng 35 tấn đường luyện TTC Sugar (Chờ duyệt)',140000000.00),
('CTPC-028-1','PC-202609-028','DMC01','Thanh toán tiền sữa bò tươi đợt 1 tháng 9 Nông trại Mộc Châu (Chờ duyệt)',285000000.00),
('CTPC-029-1','PC-202609-029','DMC12','Thanh toán cước xe tải lạnh giao hàng chuỗi siêu thị miền Trung ABA',128000000.00),
('CTPC-030-1','PC-202609-030','DMC29','Chi mua sắm trang phục bảo hộ phòng sạch công nhân kho bảo quản UHT',18500000.00),
('CTPC-031-1','PC-202609-031','DMC18','Chi mua phụ tùng van áp lực thay thế máy tiệt trùng UHT số 2',45000000.00),
('CTPC-032-1','PC-202609-032','DMC01','Lập phiếu chi mua sữa tươi đợt 2 tháng 9 Green Farm Tây Ninh',310000000.00),
('CTPC-033-1','PC-202609-033','DMC06','Lập phiếu thanh toán hương vani và hạt dẻ Kerry Ingredients',92000000.00),
('CTPC-034-1','PC-202609-034','DMC26','Tạm ứng phí dịch vụ kiểm toán bán niên năm 2026 cho PwC Việt Nam',150000000.00),
('CTPC-035-1','PC-202609-035','DMC20','Chi phí tổ chức chương trình đổi nắp hộp sữa trúng thưởng tại Cần Thơ',12000000.00);
/*!40000 ALTER TABLE `ChiTietPhieuChi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuNhapNVL`
--

DROP TABLE IF EXISTS `ChiTietPhieuNhapNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuNhapNVL` (
  `maPhieuNhapNVL` varchar(20) NOT NULL,
  `maTonKho` varchar(50) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `donGia` float DEFAULT 0,
  `thanhTien` float DEFAULT 0,
  `ngaySanXuat` date DEFAULT NULL,
  `hanSuDung` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapNVL`,`maTonKho`),
  KEY `fk_ctpnnvl_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpnnvl_phieu` FOREIGN KEY (`maPhieuNhapNVL`) REFERENCES `PhieuNhapNVL` (`maPhieuNhapNVL`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpnnvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuNhapNVL`
--

LOCK TABLES `ChiTietPhieuNhapNVL` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuNhapNVL` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuNhapNVL` VALUES
('PNNVL2026090101','LOT-NVL-20260901-01',20000,14500,290000000,'2026-09-06','2026-10-01','Kiểm nghiệm vi sinh đạt 100%'),
('PNNVL2026090502','LOT-NVL-20260905-02',10000,21000,210000000,'2026-08-17','2027-09-16','Bao 50kg đóng kín'),
('PNNVL2026090803','LOT-NVL-20260908-04',500000,450,225000000,'2026-09-01','2028-09-05','Cuộn màng tiệt trùng UHT');
/*!40000 ALTER TABLE `ChiTietPhieuNhapNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuNhapSP`
--

DROP TABLE IF EXISTS `ChiTietPhieuNhapSP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuNhapSP` (
  `maPhieuNhapSP` varchar(20) NOT NULL,
  `maTonKho` varchar(50) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `ngaySanXuat` date DEFAULT NULL,
  `hanSuDung` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapSP`,`maTonKho`),
  KEY `fk_ctpnsp_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpnsp_phieu` FOREIGN KEY (`maPhieuNhapSP`) REFERENCES `PhieuNhapSP` (`maPhieuNhapSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpnsp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuNhapSP`
--

LOCK TABLES `ChiTietPhieuNhapSP` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuNhapSP` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuNhapSP` VALUES
('PNSP2026090201','LOT-SP-20260902-FEFO1',5000,'2026-08-02','2026-09-26','QC đạt chuẩn Monde Selection'),
('PNSP2026090402','LOT-SP-20260904-SC01',3000,'2026-08-25','2026-09-24','Bảo quản kho mát ngay'),
('PNSP2026090803','LOT-SP-20260908-FEFO2',15000,'2026-09-11','2027-01-14','Nhập kho tổng');
/*!40000 ALTER TABLE `ChiTietPhieuNhapSP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuThu`
--

DROP TABLE IF EXISTS `ChiTietPhieuThu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuThu` (
  `maChiTietThu` varchar(50) NOT NULL,
  `maPhieuThu` varchar(50) NOT NULL,
  `maDanhMucThu` varchar(50) DEFAULT NULL,
  `dienGiai` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maChiTietThu`),
  KEY `fk_ctpt_pt` (`maPhieuThu`),
  KEY `fk_ctpt_dmt` (`maDanhMucThu`),
  CONSTRAINT `fk_ctpt_dmt` FOREIGN KEY (`maDanhMucThu`) REFERENCES `DanhMucThu` (`maDanhMucThu`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpt_pt` FOREIGN KEY (`maPhieuThu`) REFERENCES `PhieuThu` (`maPhieuThu`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuThu`
--

LOCK TABLES `ChiTietPhieuThu` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuThu` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuThu` VALUES
('CTPT-001-1','PT-202609-001','DMT01','Thu tiền bán sữa tươi 180ml đợt giao siêu thị Co.opmart miền Nam',185000000.00),
('CTPT-002-1','PT-202609-002','DMT12','Nộp doanh thu tiền mặt cuối ngày chuỗi Giấc Mơ Sữa Việt Q.1, Q.3',42000000.00),
('CTPT-003-1','PT-202609-003','DMT04','Thu tiền phân phối sữa chua Probi cho hệ thống WinMart toàn quốc',245000000.00),
('CTPT-004-1','PT-202609-004','DMT01','Thu công nợ xuất khẩu nội địa nhà phân phối độc quyền Hậu Giang',310000000.00),
('CTPT-005-1','PT-202609-005','DMT03','Thanh toán tiền sữa đặc có đường Phương Nam cho chuỗi Bách Hóa Xanh',195000000.00),
('CTPT-006-1','PT-202609-006','DMT10','Thu thanh toán L/C xuất khẩu lô sữa bột Dielac sang Dubai (UAE)',950000000.00),
('CTPT-007-1','PT-202609-007','DMT07','Thu tiền giao sữa Green Farm cao cấp cho đại siêu thị GO! An Lạc',178000000.00),
('CTPT-008-1','PT-202609-008','DMT02','Thu thanh toán đơn hàng sữa bột trẻ em trung tâm MM Mega Market',285000000.00),
('CTPT-009-1','PT-202609-009','DMT05','Thanh toán lô kem ăn Vinamilk giao hệ thống AEON Mall Tân Phú',125000000.00),
('CTPT-010-1','PT-202609-010','DMT06','Thu tiền phân phối sữa hạt 9 loại Super Nut cho Lotte Mart Nam Sài Gòn',165000000.00),
('CTPT-011-1','PT-202609-011','DMT04','Thu tiền giao sữa chua uống men sống Probi cho Circle K toàn miền Nam',88000000.00),
('CTPT-012-1','PT-202609-012','DMT01','Thanh toán đợt 2 sữa tươi tiệt trùng 110ml chuỗi tiện ích GS25',96000000.00),
('CTPT-013-1','PT-202609-013','DMT09','Thu thanh toán ngân sách Đề án Sữa Học Đường TP.HCM đợt tháng 8/2026',750000000.00),
('CTPT-014-1','PT-202609-014','DMT02','Thu tiền cung cấp sản phẩm dinh dưỡng y học cho Bệnh viện Chợ Rẫy',115000000.00),
('CTPT-015-1','PT-202609-015','DMT01','Thu công nợ xuất hàng đợt 1 Tổng đại lý phân phối tiêu dùng miền Bắc',450000000.00),
('CTPT-016-1','PT-202609-016','DMT21','Hoàn ứng công tác phí giám sát kho lạnh trung chuyển Đà Nẵng',6500000.00),
('CTPT-017-1','PT-202609-017','DMT21','Hoàn ứng chi phí tiếp khách và khảo sát thị trường đại lý Tây Nam Bộ',8200000.00),
('CTPT-018-1','PT-202609-018','DMT20','Thu tiền chiết khấu thương mại sản lượng bao bì Aseptic từ Tetra Pak',85000000.00),
('CTPT-019-1','PT-202609-019','DMT20','Thu tiền thưởng đạt chỉ tiêu thu mua đường tinh luyện từ TTC Sugar',35000000.00),
('CTPT-020-1','PT-202609-020','DMT15','Thu tiền thanh lý thùng carton phế liệu kho Mega Plant đợt tháng 8',15500000.00),
('CTPT-021-1','PT-202609-021','DMT13','Thu ký quỹ mở thêm 2 điểm bán mới Cửa hàng Giấc Mơ Sữa Việt Bình Thạnh',50000000.00),
('CTPT-022-1','PT-202609-022','DMT01','Thu tiền thanh toán đơn hàng sữa tươi tiệt trùng tuần 1 tháng 9/2026',320000000.00),
('CTPT-023-1','PT-202609-023','DMT07','Thu tiền hàng sữa tươi sinh thái Green Farm đại lý Hậu Giang',145000000.00),
('CTPT-024-1','PT-202609-024','DMT04','Thu tiền phân phối sữa chua ăn nha đam và có đường Bách Hóa Xanh',210000000.00),
('CTPT-025-1','PT-202609-025','DMT29','Thu chênh lệch tỷ giá thanh lý hợp đồng xuất khẩu sữa bột Dubai',28000000.00),
('CTPT-026-1','PT-202609-026','DMT18','Thu lãi tiền gửi ngân hàng phát sinh kỳ tháng 8/2026 tài khoản VCB',45000000.00),
('CTPT-027-1','PT-202609-027','DMT01','Thu tiền hàng đại siêu thị GO! Nguyễn Thị Thập (Chờ đối soát UNC ngân hàng)',165000000.00),
('CTPT-028-1','PT-202609-028','DMT03','Thu thanh toán sữa đặc Phương Nam siêu thị MM Mega (Chờ đối soát)',135000000.00),
('CTPT-029-1','PT-202609-029','DMT06','Thu tiền đợt giao sữa hạt Super Nut cho AEON Mall Bình Tân',98000000.00),
('CTPT-030-1','PT-202609-030','DMT04','Thu thanh toán sữa chua ăn lốc 4 Lotte Mart (Chờ sổ phụ đối chiếu)',112000000.00),
('CTPT-031-1','PT-202609-031','DMT09','Thu đợt đầu năm học mới đề án Sữa Học Đường TP.HCM (Chờ xác nhận kho bạc)',820000000.00),
('CTPT-032-1','PT-202609-032','DMT01','Lập phiếu thu đơn đặt hàng mới tuần 3 tháng 9 chuỗi Circle K',75000000.00),
('CTPT-033-1','PT-202609-033','DMT05','Lập phiếu thu giao kem ốc quế và phô mai miếng chuỗi GS25',54000000.00),
('CTPT-034-1','PT-202609-034','DMT02','Thu tiền đợt 2 đơn hàng sữa bột Dielac Gold cho nhà phân phối Hà Nội',380000000.00),
('CTPT-035-1','PT-202609-035','DMT12','Thu nộp tiền mặt doanh thu bán lẻ cuối ngày Cửa hàng Vinamilk Q.7',32000000.00);
/*!40000 ALTER TABLE `ChiTietPhieuThu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuXuatNVL`
--

DROP TABLE IF EXISTS `ChiTietPhieuXuatNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuXuatNVL` (
  `maPhieuXuatNVL` varchar(20) NOT NULL,
  `maTonKho` varchar(50) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuXuatNVL`,`maTonKho`),
  KEY `fk_ctpxnvl_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpxnvl_phieu` FOREIGN KEY (`maPhieuXuatNVL`) REFERENCES `PhieuXuatNVL` (`maPhieuXuatNVL`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpxnvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuXuatNVL`
--

LOCK TABLES `ChiTietPhieuXuatNVL` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuXuatNVL` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuXuatNVL` VALUES
('PXNVL2026090301','LOT-NVL-20260901-01',4500,'Xuất theo lệnh sản xuất LSX-UHT-20260903'),
('PXNVL2026090602','LOT-NVL-20260905-02',1500,'Xuất theo lệnh sản xuất LSX-SC-20260906');
/*!40000 ALTER TABLE `ChiTietPhieuXuatNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuXuatSP`
--

DROP TABLE IF EXISTS `ChiTietPhieuXuatSP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuXuatSP` (
  `maPhieuXuatSP` varchar(20) NOT NULL,
  `maTonKho` varchar(50) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuXuatSP`,`maTonKho`),
  KEY `fk_ctpxsp_tk` (`maTonKho`),
  CONSTRAINT `fk_ctpxsp_phieu` FOREIGN KEY (`maPhieuXuatSP`) REFERENCES `PhieuXuatSP` (`maPhieuXuatSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpxsp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuXuatSP`
--

LOCK TABLES `ChiTietPhieuXuatSP` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuXuatSP` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuXuatSP` VALUES
('PXSP2026090501','LOT-SP-20260902-FEFO1',3800,'Ưu tiên xuất lô gần HSD theo chuẩn ISO/HACCP'),
('PXSP2026090702','LOT-SP-20260904-SC01',2150,'Vận chuyển xe xe đông lạnh Vinamilk Express'),
('PXSP2026091003','LOT-SP-20260908-FEFO2',800,'Bàn giao cửa hàng Giấc Mơ Sữa Việt');
/*!40000 ALTER TABLE `ChiTietPhieuXuatSP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuYeuCauBTP`
--

DROP TABLE IF EXISTS `ChiTietPhieuYeuCauBTP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuYeuCauBTP` (
  `maPhieuYCBTP` varchar(20) NOT NULL,
  `maBTP` varchar(20) NOT NULL,
  `tenBTP` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soLuong` int(11) DEFAULT 0,
  PRIMARY KEY (`maPhieuYCBTP`,`maBTP`),
  CONSTRAINT `fk_ctpycbtp_phieu` FOREIGN KEY (`maPhieuYCBTP`) REFERENCES `PhieuYeuCauBTP` (`maPhieuYCBTP`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuYeuCauBTP`
--

LOCK TABLES `ChiTietPhieuYeuCauBTP` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuYeuCauBTP` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuYeuCauBTP` VALUES
('YCBTP20260901','BTP-SUA-UHT','Sữa tươi tiệt trùng UHT',20000);
/*!40000 ALTER TABLE `ChiTietPhieuYeuCauBTP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuYeuCauNVL`
--

DROP TABLE IF EXISTS `ChiTietPhieuYeuCauNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuYeuCauNVL` (
  `maPhieuYCNVL` varchar(20) NOT NULL,
  `maNVL` varchar(20) NOT NULL,
  `tenNVL` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soLuong` int(11) DEFAULT 0,
  PRIMARY KEY (`maPhieuYCNVL`,`maNVL`),
  CONSTRAINT `fk_ctpycnvl_phieu` FOREIGN KEY (`maPhieuYCNVL`) REFERENCES `PhieuYeuCauNVL` (`maPhieuYCNVL`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết danh mục NVL cần cấp phát';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuYeuCauNVL`
--

LOCK TABLES `ChiTietPhieuYeuCauNVL` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuYeuCauNVL` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuYeuCauNVL` VALUES
('YCNVL20260901','NVL001','Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)',18000),
('YCNVL20260901','NVL002','Đường Tinh Luyện Biên Hòa Grade A',1500),
('YCNVL20260908','NVL004','Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml',10000);
/*!40000 ALTER TABLE `ChiTietPhieuYeuCauNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietPhieuYeuCauXuatSP`
--

DROP TABLE IF EXISTS `ChiTietPhieuYeuCauXuatSP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietPhieuYeuCauXuatSP` (
  `maPhieuYCXSP` varchar(20) NOT NULL,
  `maSanPham` varchar(20) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCXSP`,`maSanPham`),
  KEY `fk_ctpycxsp_sp` (`maSanPham`),
  CONSTRAINT `fk_ctpycxsp_phieu` FOREIGN KEY (`maPhieuYCXSP`) REFERENCES `PhieuYeuCauXuatSP` (`maPhieuYCXSP`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ctpycxsp_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietPhieuYeuCauXuatSP`
--

LOCK TABLES `ChiTietPhieuYeuCauXuatSP` WRITE;
/*!40000 ALTER TABLE `ChiTietPhieuYeuCauXuatSP` DISABLE KEYS */;
INSERT INTO `ChiTietPhieuYeuCauXuatSP` VALUES
('YCXSP20260901','SP001',19980,'Đã nhập vào Lô LOT-SP-20260908-FEFO2');
/*!40000 ALTER TABLE `ChiTietPhieuYeuCauXuatSP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChiTietTienDoSanXuat`
--

DROP TABLE IF EXISTS `ChiTietTienDoSanXuat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChiTietTienDoSanXuat` (
  `maTienDoSX` varchar(20) NOT NULL,
  `maBTP` varchar(20) NOT NULL,
  `soLuong` int(11) DEFAULT 0,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Đạt',
  PRIMARY KEY (`maTienDoSX`,`maBTP`),
  CONSTRAINT `fk_cttdsx_phieu` FOREIGN KEY (`maTienDoSX`) REFERENCES `TienDoSanXuat` (`maTienDoSX`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChiTietTienDoSanXuat`
--

LOCK TABLES `ChiTietTienDoSanXuat` WRITE;
/*!40000 ALTER TABLE `ChiTietTienDoSanXuat` DISABLE KEYS */;
INSERT INTO `ChiTietTienDoSanXuat` VALUES
('TDSX20260901','BTP-SUA-UHT',20000,'Đạt chuẩn 100%'),
('TDSX20260908','BTP-GREEN-FARM',10000,'Đang kiểm nghiệm');
/*!40000 ALTER TABLE `ChiTietTienDoSanXuat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChucVu`
--

DROP TABLE IF EXISTS `ChucVu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChucVu` (
  `maChucVu` varchar(20) NOT NULL COMMENT 'Mã chức vụ',
  `tenChucVu` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Tên chức vụ',
  `phuCap` decimal(15,2) DEFAULT 0.00 COMMENT 'Phụ cấp chức vụ',
  PRIMARY KEY (`maChucVu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Chức Vụ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChucVu`
--

LOCK TABLES `ChucVu` WRITE;
/*!40000 ALTER TABLE `ChucVu` DISABLE KEYS */;
INSERT INTO `ChucVu` VALUES
('CV01','Tổng Giám Đốc Điều Hành (CEO)',15000000.00),
('CV02','Giám Đốc Tài Chính (CFO)',10000000.00),
('CV03','Trưởng Phòng Kho Vận',5000000.00),
('CV04','Kế Toán Trưởng',6000000.00),
('CV05','Trưởng Ca Kỹ Thuật Sản Xuất',4500000.00),
('CV06','Thủ Kho Trưởng / Kiểm Soát FEFO',3000000.00),
('CV07','Kế Toán Thanh Toán & Kho',2500000.00),
('CV08','Chuyên Viên KCS / Kiểm Định Chất Lượng',2500000.00);
/*!40000 ALTER TABLE `ChucVu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CongDoan`
--

DROP TABLE IF EXISTS `CongDoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CongDoan` (
  `maCongDoan` varchar(20) NOT NULL COMMENT 'Mã công đoạn',
  `maLenh` varchar(20) NOT NULL COMMENT 'Mã lệnh sản xuất liên quan',
  `maNhanVien` varchar(20) DEFAULT NULL COMMENT 'Nhân viên quản lý công đoạn',
  `tenLenh` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Tên công đoạn (Phối trộn, Tiệt trùng, Đồng hóa, Chiết rót, Đóng gói)',
  `nhanCong` int(11) DEFAULT 0 COMMENT 'Số lượng nhân công phân công',
  `ngayBatDau` date DEFAULT NULL COMMENT 'Ngày bắt đầu công đoạn',
  `ngayKetThuc` date DEFAULT NULL COMMENT 'Ngày kết thúc công đoạn',
  `chiPhi` decimal(18,2) DEFAULT 0.00 COMMENT 'Chi phí thực hiện công đoạn',
  `thanhPham` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Tên bán thành phẩm / sản phẩm đầu ra',
  `soLuongThanhPham` int(11) DEFAULT 0 COMMENT 'Số lượng thành phẩm công đoạn',
  `khau` int(11) DEFAULT 1 COMMENT 'Số thứ tự khâu/bước',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ thực hiện' COMMENT 'Trạng thái công đoạn',
  PRIMARY KEY (`maCongDoan`),
  KEY `fk_cd_lsx` (`maLenh`),
  KEY `fk_cd_nv` (`maNhanVien`),
  CONSTRAINT `fk_cd_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cd_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Các công đoạn trong quy trình sản xuất';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CongDoan`
--

LOCK TABLES `CongDoan` WRITE;
/*!40000 ALTER TABLE `CongDoan` DISABLE KEYS */;
INSERT INTO `CongDoan` VALUES
('CD01-01','LSX20260901','NV003','Phối trộn & Gia nhiệt ban đầu',6,'2026-09-04','2026-09-04',12000000.00,'BTP Sữa tươi đã phối trộn',20000,1,'Đã hoàn thành'),
('CD01-02','LSX20260901','NV003','Tiệt trùng UHT 140 độ C & Đồng hóa áp suất cao',4,'2026-09-05','2026-09-05',25000000.00,'BTP Sữa tươi tiệt trùng UHT',20000,2,'Đã hoàn thành'),
('CD01-03','LSX20260901','NV007','Chiết rót vô trùng Aseptic & Đóng gói thùng carton',8,'2026-09-05','2026-09-06',32000000.00,'Thùng Sữa Tươi Tiệt Trùng 100% 180ml',20000,3,'Đã hoàn thành'),
('CD03-01','LSX20260908','NV007','Kiểm định & Xử lý sữa thô Green Farm Tây Ninh',5,'2026-09-12','2026-09-13',15000000.00,'BTP Sữa tươi Green Farm đạt chuẩn',10000,1,'Đang thực hiện');
/*!40000 ALTER TABLE `CongDoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CongNo`
--

DROP TABLE IF EXISTS `CongNo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CongNo` (
  `maCongNo` varchar(20) NOT NULL,
  `soTienNo` decimal(18,2) DEFAULT 0.00,
  `soTienDaTra` decimal(18,2) DEFAULT 0.00,
  `soTienConLai` decimal(18,2) DEFAULT 0.00,
  `hanThanhToan` date DEFAULT NULL,
  `trangThai` varchar(30) DEFAULT 'Còn nợ',
  `maHoaDon` varchar(20) DEFAULT NULL,
  `maKhachHang` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`maCongNo`),
  KEY `fk_cn_hd` (`maHoaDon`),
  KEY `fk_cn_kh` (`maKhachHang`),
  CONSTRAINT `fk_cn_hd` FOREIGN KEY (`maHoaDon`) REFERENCES `HoaDon` (`maHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cn_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `KhachHang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CongNo`
--

LOCK TABLES `CongNo` WRITE;
/*!40000 ALTER TABLE `CongNo` DISABLE KEYS */;
INSERT INTO `CongNo` VALUES
('CN-KH001-202609',770000000.00,500000000.00,270000000.00,'2026-10-16','Còn nợ trong hạn','HDGTGT-20260901','KH001'),
('CN-KH003-202609',520000000.00,520000000.00,0.00,'2026-10-01','Đã thanh toán đủ','HDGTGT-20260905','KH003'),
('CN-KH005-202609',450000000.00,0.00,450000000.00,'2026-10-31','Chưa thanh toán','HDGTGT-20260908','KH005');
/*!40000 ALTER TABLE `CongNo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DanhMucChi`
--

DROP TABLE IF EXISTS `DanhMucChi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DanhMucChi` (
  `maDanhMucChi` varchar(50) NOT NULL,
  `tenDanhMucChi` varchar(100) NOT NULL,
  `moTa` varchar(255) DEFAULT NULL,
  `trangThai` bit(1) DEFAULT b'1',
  PRIMARY KEY (`maDanhMucChi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DanhMucChi`
--

LOCK TABLES `DanhMucChi` WRITE;
/*!40000 ALTER TABLE `DanhMucChi` DISABLE KEYS */;
INSERT INTO `DanhMucChi` VALUES
('DMC01','Chi mua sữa tươi thô nguyên liệu từ các nông trại','Thanh toán tiền sữa bò tươi từ các trang trại công nghệ cao Mộc Châu, Tây Ninh',''),
('DMC02','Chi mua bột sữa gầy nhập khẩu từ Fonterra New Zealand','Nhập khẩu bột sữa nguyên kem phục vụ sản xuất sữa bột và sữa đặc',''),
('DMC03','Chi mua đường tinh luyện cao cấp từ TTC Sugar Biên Hòa','Nguyên liệu phối trộn cho dòng sữa có đường và nước ngọt tiệt trùng',''),
('DMC04','Chi mua bao bì phức hợp tiệt trùng từ Tetra Pak','Vỏ hộp giấy Aseptic 6 lớp vô trùng phục vụ đóng gói sữa tiệt trùng UHT',''),
('DMC05','Chi mua men vi sinh phân giải từ Chr. Hansen Đan Mạch','Chủng men sống Probiotics phục vụ dây chuyền sữa chua lên men tự nhiên',''),
('DMC06','Chi mua vi chất dinh dưỡng, Vitamin & Khoáng chất từ DSM','Vi chất bổ sung phát triển trí não DHA, Canxi nano, Vitamin A & D3',''),
('DMC07','Chi mua bao bì thùng carton, pallet nhựa từ Duy Tân & Tân Á','Bao bì cấp 2 và công cụ bảo quản lưu kho vận chuyển pallet',''),
('DMC08','Chi trả lương cán bộ công nhân viên định kỳ hàng tháng','Lương theo hợp đồng phân hệ HRM cho toàn thể cán bộ công nhân viên',''),
('DMC09','Chi thưởng năng suất, lương tháng 13 và lễ Tết','Khen thưởng thi đua sản xuất và động viên người lao động',''),
('DMC10','Chi nộp Bảo hiểm Xã hội, Y tế và Thất nghiệp (BHXH)','Trích nộp nghĩa vụ bảo hiểm bắt buộc theo luật lao động cho nhân viên',''),
('DMC11','Chi kinh phí Công đoàn và quỹ phúc lợi xã hội','Trích nộp 2% kinh phí công đoàn và thăm hỏi ốm đau, hiếu hỷ',''),
('DMC12','Chi cước vận tải lạnh chuyên dụng ABA Cooltrans','Cước xe tải lạnh 2-4 độ C luân chuyển sữa tươi từ nông trại về nhà máy',''),
('DMC13','Chi phí thuê kho bãi trung chuyển logistics vùng miền','Thuê diện tích kho hàng tại các hub trọng điểm Cần Thơ, Đà Nẵng, Hải Phòng',''),
('DMC14','Chi tiền điện năng lượng vận hành hệ thống kho lạnh UHT','Hóa đơn tiền điện sản xuất cho EVN tại Siêu Nhà Máy Mega Plant Bình Dương',''),
('DMC15','Chi tiền nước sản xuất và hệ thống xử lý nước thải','Chi phí nước tinh khiết và vận hành trạm tái sinh nước đạt chuẩn Net Zero',''),
('DMC16','Chi mua dầu DO và khí đốt vận hành lò hơi tiệt trùng UHT','Nhiên liệu sinh hơi tiệt trùng áp suất cao cho hệ thống gia nhiệt sản xuất',''),
('DMC17','Chi bảo dưỡng định kỳ hệ thống robot tự động Mega Plant','Bảo trì dàn máy chiết rót tốc độ cao và cánh tay robot xếp pallet kho thông minh',''),
('DMC18','Chi sửa chữa, thay thế phụ tùng máy cô đặc sữa chân không','Vật tư thay thế định kỳ van áp lực, gioăng cao su chịu nhiệt ngành thực phẩm',''),
('DMC19','Chi hoa hồng và chiết khấu bán hàng cho đại lý cấp 1','Thanh toán chiết khấu doanh thu cho các nhà phân phối độc quyền',''),
('DMC20','Chi khuyến mại người tiêu dùng và chương trình quà tặng','Kinh phí làm ly sứ, đồ chơi trẻ em đính kèm lốc sữa và phiếu cào may mắn',''),
('DMC21','Chi quảng cáo truyền hình (TVC), báo chí và tiếp thị số','Chiến dịch truyền thông thương hiệu Vinamilk - Để tâm đến từng giọt sữa',''),
('DMC22','Chi tài trợ chương trình Quỹ Sữa Vươn Cao Việt Nam','Trao tặng hàng triệu ly sữa cho trẻ em có hoàn cảnh khó khăn vùng sâu xa',''),
('DMC23','Chi hỗ trợ giống cỏ và thú y cho các hộ nuôi bò sữa','Chính sách trợ giá cám dinh dưỡng và vắc xin phòng dịch cho liên kết nông dân',''),
('DMC24','Chi phí kiểm nghiệm KCS, chứng nhận ISO 22000 & Organic','Phí đánh giá định kỳ của tổ chức Bureau Veritas và Eurofins quốc tế',''),
('DMC25','Chi phí mua sắm bản quyền phần mềm ERP SAP & hạ tầng số','Phí bảo trì license hàng năm hệ thống máy chủ cơ sở dữ liệu doanh nghiệp',''),
('DMC26','Chi phí kiểm toán độc lập báo cáo tài chính thường niên','Thù lao dịch vụ kiểm toán cho nhóm công ty Big 4 (PwC / KPMG)',''),
('DMC27','Chi phí thuê văn phòng trụ sở chính Tân Trào và chi nhánh','Hợp đồng thuê mặt bằng văn phòng làm việc và phí dịch vụ quản lý tòa nhà',''),
('DMC28','Chi phí đào tạo nâng cao tay nghề và học bổng Vinamilk','Chương trình tu nghiệp kỹ sư công nghệ sữa tại Hà Lan và Đan Mạch',''),
('DMC29','Chi trang cấp đồng phục và bảo hộ lao động phòng sạch','Bộ quần áo chống bụi vô trùng, giày cách điện, nón trùm tóc công nhân',''),
('DMC30','Chi trả lãi vay vốn lưu động phục vụ chu kỳ sản xuất','Tiền lãi vay các ngân hàng thương mại tài trợ vốn thu mua nông sản',''),
('DMC31','Chi phí dịch vụ ngân hàng, phí chuyển tiền và mở L/C','Phí thanh toán quốc tế và phí quản lý tài khoản định kỳ ngân hàng',''),
('DMC32','Chi nộp thuế Thu nhập doanh nghiệp (TNDN) và thuế môn bài','Nộp ngân sách nhà nước tiền thuế thu nhập doanh nghiệp quý','');
/*!40000 ALTER TABLE `DanhMucChi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DanhMucThu`
--

DROP TABLE IF EXISTS `DanhMucThu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DanhMucThu` (
  `maDanhMucThu` varchar(50) NOT NULL,
  `tenDanhMucThu` varchar(100) NOT NULL,
  `moTa` varchar(255) DEFAULT NULL,
  `trangThai` bit(1) DEFAULT b'1',
  PRIMARY KEY (`maDanhMucThu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DanhMucThu`
--

LOCK TABLES `DanhMucThu` WRITE;
/*!40000 ALTER TABLE `DanhMucThu` DISABLE KEYS */;
INSERT INTO `DanhMucThu` VALUES
('DMT01','Thu tiền bán sữa tươi tiệt trùng 100% & ít đường','Thu hồi tiền bán lẻ và bán buôn dòng sữa tươi tiệt trùng đóng hộp 110ml, 180ml',''),
('DMT02','Thu tiền bán sữa bột dinh dưỡng Dielac & Alpha Gold','Thu tiền phân phối sữa bột trẻ em và người cao tuổi toàn quốc',''),
('DMT03','Thu tiền bán sữa đặc Ông Thọ & Ngôi Sao Phương Nam','Thu từ các chuỗi F&B, quán cafe và đại lý làm bánh truyền thống',''),
('DMT04','Thu tiền bán sữa chua ăn & sữa chua uống Probi','Thu hồi tiền từ các hệ thống siêu thị chuỗi bán lẻ men sống Probi',''),
('DMT05','Thu tiền bán kem ăn và phô mai Vinamilk','Doanh thu sản phẩm đông lạnh, kem cây, kem hộp và phô mai miếng',''),
('DMT06','Thu tiền bán sữa hạt dinh dưỡng Super Nut','Doanh thu dòng sản phẩm sữa 9 loại hạt cao cấp thuần thực vật',''),
('DMT07','Thu tiền bán sữa tươi hữu cơ Green Farm & Organic','Doanh thu phân khúc sữa cao cấp từ hệ thống trang trại sinh thái',''),
('DMT08','Thu tiền bán bơ lạt & chế phẩm sữa công nghiệp','Cung cấp nguyên liệu chế biến bơ sữa cho các nhà máy bánh kẹo',''),
('DMT09','Thu thanh toán hợp đồng đề án Sữa Học Đường','Thanh toán từ ngân sách và ban điều hành đề án dinh dưỡng học đường',''),
('DMT10','Thu ngoại tệ xuất khẩu sữa sang Trung Đông & Dubai','Nguồn thu thanh toán L/C ngoại tệ từ các đối tác Jebel Ali UAE',''),
('DMT11','Thu ngoại tệ xuất khẩu sữa sang Nhật Bản & Hoa Kỳ','Thu kiều hối xuất khẩu sữa chua và nước cốt dừa organic',''),
('DMT12','Thu tiền bán lẻ chuỗi Cửa Hàng Giấc Mơ Sữa Việt','Doanh thu thanh toán tiền mặt & POS từ hệ thống showroom Vinamilk',''),
('DMT13','Thu tiền đặt cọc mở mới đại lý phân phối','Ký quỹ hợp đồng phân phối độc quyền cấp huyện / tỉnh',''),
('DMT14','Thu tiền bảo lãnh thực hiện hợp đồng tiêu thụ sữa','Tiền ký quỹ của các chuỗi siêu thị và đại lý thương mại điện tử',''),
('DMT15','Thu thanh lý bao bì carton và vỏ can nhựa phế liệu','Tái chế thu hồi chi phí từ phế phẩm đóng gói tại các nhà máy',''),
('DMT16','Thu thanh lý máy móc cơ khí & thiết bị kho cũ','Thanh lý xe nâng, giá kệ kho lạnh sau thời gian khấu hao hết',''),
('DMT17','Thu lãi tiền gửi ngân hàng có kỳ hạn (Fixed Deposits)','Lãi suất phát sinh định kỳ từ các khoản tiền gửi quản lý thanh khoản',''),
('DMT18','Thu lãi tiền gửi ngân hàng không kỳ hạn (Demand)','Tiền lãi phát sinh hàng tháng trên tài khoản thanh toán vãng lai',''),
('DMT19','Thu cổ tức & lợi nhuận được chia từ công ty liên kết','Lợi nhuận từ các công ty bò sữa và chế biến thức ăn chăn nuôi liên kết',''),
('DMT20','Thu chiết khấu thương mại nhận từ nhà cung cấp','Thưởng chiết khấu khối lượng từ nhà cung cấp bao bì và nguyên liệu',''),
('DMT21','Thu hoàn ứng công tác phí thị trường miền Bắc','Nhân viên kinh doanh hoàn ứng tiền công tác thị trường',''),
('DMT22','Thu hoàn ứng kinh phí tham gia hội chợ triển lãm','Hoàn ứng ngân sách triển lãm quốc tế Vietfood & Expo',''),
('DMT23','Thu tiền bồi thường bảo hiểm tài sản và kho bãi','Bảo hiểm chi trả bồi thường các tổn thất sự cố vận tải và kho lạnh',''),
('DMT24','Thu tiền phạt vi phạm hợp đồng giao nguyên vật liệu','Khoản phạt các nhà cung cấp không đảm bảo tiến độ hoặc chất lượng cam kết',''),
('DMT25','Thu phí cho thuê mặt bằng và dịch vụ kho lạnh','Cho đối tác logistics gửi bảo quản tạm thời tại hệ thống kho lạnh trung chuyển',''),
('DMT26','Thu phí nhượng quyền thương mại chuỗi Giấc Mơ Sữa Việt','Phí nhượng quyền định kỳ từ các đại lý ủy quyền thương hiệu',''),
('DMT27','Thu tài trợ nghiên cứu khoa học dinh dưỡng học đường','Khoản viện trợ không hoàn lại từ các viện nghiên cứu dinh dưỡng quốc tế',''),
('DMT28','Thu hồi nợ khó đòi đã xử lý xóa sổ kế toán','Thu hồi các khoản công nợ cũ của các đại lý đã giải thể',''),
('DMT29','Thu chênh lệch tỷ giá ngoại tệ dương khi xuất khẩu sữa','Lãi chênh lệch tỷ giá USD/VND khi đáo hạn chứng từ thanh toán xuất khẩu',''),
('DMT30','Thu hoàn thuế Giá trị gia tăng (VAT) hàng nông sản xuất khẩu','Cục thuế hoàn tiền thuế VAT theo hồ sơ hoàn thuế định kỳ',''),
('DMT31','Thu thưởng thi đua doanh số kênh bán lẻ hiện đại (MT)','Tiền thưởng từ đối tác trung tâm thương mại khi vượt mốc cam kết',''),
('DMT32','Các khoản thu nhập vãng lai và hoạt động tài chính khác','Các khoản thu tài chính phát sinh ngoài kế hoạch hoạt động thông thường','');
/*!40000 ALTER TABLE `DanhMucThu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DoiTuongGiaoDich`
--

DROP TABLE IF EXISTS `DoiTuongGiaoDich`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DoiTuongGiaoDich` (
  `maDoiTuong` varchar(50) NOT NULL,
  `maThamChieu` varchar(50) NOT NULL COMMENT 'Mã gốc thật sự của KH / NCC / NV',
  `loaiDoiTuong` varchar(20) NOT NULL COMMENT 'Loại đối tượng: KH, NCC, NV, Khac',
  `trangThai` bit(1) DEFAULT b'1' COMMENT 'Trạng thái hoạt động của đối tượng',
  PRIMARY KEY (`maDoiTuong`),
  UNIQUE KEY `uk_dt_loai_thamchieu` (`loaiDoiTuong`,`maThamChieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng ánh xạ đối tượng giao dịch từ Bán hàng, Kho, Nhân sự';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DoiTuongGiaoDich`
--

LOCK TABLES `DoiTuongGiaoDich` WRITE;
/*!40000 ALTER TABLE `DoiTuongGiaoDich` DISABLE KEYS */;
INSERT INTO `DoiTuongGiaoDich` VALUES
('DT-KH001','KH001','KH',''),
('DT-KH002','KH002','KH',''),
('DT-KH003','KH003','KH',''),
('DT-KH004','KH004','KH',''),
('DT-KH005','KH005','KH',''),
('DT-KH006','KH006','KH',''),
('DT-KH007','KH007','KH',''),
('DT-KH008','KH008','KH',''),
('DT-KH009','KH009','KH',''),
('DT-KH010','KH010','KH',''),
('DT-KH011','KH011','KH',''),
('DT-KH012','KH012','KH',''),
('DT-KH013','KH013','KH',''),
('DT-KH014','KH014','KH',''),
('DT-KH015','KH015','KH',''),
('DT-NCC001','NCC001','NCC',''),
('DT-NCC002','NCC002','NCC',''),
('DT-NCC003','NCC003','NCC',''),
('DT-NCC004','NCC004','NCC',''),
('DT-NCC005','NCC005','NCC',''),
('DT-NCC006','NCC006','NCC',''),
('DT-NCC007','NCC007','NCC',''),
('DT-NCC008','NCC008','NCC',''),
('DT-NCC009','NCC009','NCC',''),
('DT-NCC010','NCC010','NCC',''),
('DT-NCC011','NCC011','NCC',''),
('DT-NCC012','NCC012','NCC',''),
('DT-NCC013','NCC013','NCC',''),
('DT-NCC014','NCC014','NCC',''),
('DT-NCC015','NCC015','NCC',''),
('DT-NV001','NV001','NV',''),
('DT-NV002','NV002','NV',''),
('DT-NV003','NV003','NV',''),
('DT-NV004','NV004','NV',''),
('DT-NV005','NV005','NV','');
/*!40000 ALTER TABLE `DoiTuongGiaoDich` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DonHang`
--

DROP TABLE IF EXISTS `DonHang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `DonHang` (
  `maDonHang` varchar(20) NOT NULL,
  `ngayMua` datetime DEFAULT current_timestamp(),
  `tongTien` decimal(18,2) DEFAULT 0.00,
  `thanhTien` decimal(18,2) DEFAULT 0.00,
  `trangThai` varchar(30) DEFAULT 'Chờ xác nhận',
  `maKhachHang` varchar(20) DEFAULT NULL,
  `maNhanVien` varchar(20) DEFAULT NULL COMMENT 'Nhân viên kinh doanh tạo đơn',
  PRIMARY KEY (`maDonHang`),
  KEY `fk_dh_kh` (`maKhachHang`),
  KEY `fk_dh_nv` (`maNhanVien`),
  CONSTRAINT `fk_dh_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `KhachHang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dh_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Đơn Bán Hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DonHang`
--

LOCK TABLES `DonHang` WRITE;
/*!40000 ALTER TABLE `DonHang` DISABLE KEYS */;
INSERT INTO `DonHang` VALUES
('DH20260901','2026-09-02 04:12:10',770000000.00,770000000.00,'Đã giao hàng','KH001','NV004'),
('DH20260905','2026-09-06 04:12:10',520000000.00,520000000.00,'Đã giao hàng','KH003','NV004'),
('DH20260908','2026-09-09 04:12:10',450000000.00,450000000.00,'Đang giao','KH005','NV009'),
('DH20260910','2026-09-11 04:12:10',310000000.00,310000000.00,'Đã xác nhận','KH002','NV004'),
('DH20260912','2026-09-13 04:12:10',285000000.00,285000000.00,'Chờ xác nhận','KH004','NV009'),
('DH20260914','2026-09-15 04:12:10',1250000000.00,1250000000.00,'Chờ xác nhận','KH006','NV009');
/*!40000 ALTER TABLE `DonHang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `GiaoHang`
--

DROP TABLE IF EXISTS `GiaoHang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `GiaoHang` (
  `maGiaoHang` varchar(20) NOT NULL,
  `ngayGiao` datetime DEFAULT NULL,
  `diaChiGiao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `trangThai` varchar(30) DEFAULT 'Đang giao',
  `maDonHang` varchar(20) DEFAULT NULL,
  `maPhieuXuat` varchar(20) DEFAULT NULL,
  `maKhachHang` varchar(20) DEFAULT NULL,
  `maNhanVien` varchar(20) DEFAULT NULL COMMENT 'Nhân viên giao hàng',
  PRIMARY KEY (`maGiaoHang`),
  KEY `fk_gh_dh` (`maDonHang`),
  KEY `fk_gh_px` (`maPhieuXuat`),
  KEY `fk_gh_kh` (`maKhachHang`),
  KEY `fk_gh_nv` (`maNhanVien`),
  CONSTRAINT `fk_gh_dh` FOREIGN KEY (`maDonHang`) REFERENCES `DonHang` (`maDonHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_kh` FOREIGN KEY (`maKhachHang`) REFERENCES `KhachHang` (`maKhachHang`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_gh_px` FOREIGN KEY (`maPhieuXuat`) REFERENCES `PhieuXuatSP` (`maPhieuXuatSP`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `GiaoHang`
--

LOCK TABLES `GiaoHang` WRITE;
/*!40000 ALTER TABLE `GiaoHang` DISABLE KEYS */;
INSERT INTO `GiaoHang` VALUES
('GH20260901','2026-09-04 04:12:10','Kho Tổng Saigon Co.op, KCN Lê Minh Xuân, Bình Chánh, TP.HCM','Đã giao thành công','DH20260901','PXSP2026090201','KH001','NV004'),
('GH20260905','2026-09-08 04:12:10','Kho Trung Chuyển WinMart, KCN Sóng Thần 2, Dĩ An, Bình Dương','Đã giao thành công','DH20260905','PXSP2026090902','KH003','NV004'),
('GH20260908','2026-09-14 04:12:10','Kho Bách Hóa Xanh, KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM','Đang giao hàng','DH20260908','PXSP2026091003','KH005','NV009');
/*!40000 ALTER TABLE `GiaoHang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HoaDon`
--

DROP TABLE IF EXISTS `HoaDon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `HoaDon` (
  `maHoaDon` varchar(20) NOT NULL,
  `ngayLap` datetime DEFAULT current_timestamp(),
  `tongTien` decimal(18,2) DEFAULT 0.00,
  `maGiaoHang` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`maHoaDon`),
  KEY `fk_hd_gh` (`maGiaoHang`),
  CONSTRAINT `fk_hd_gh` FOREIGN KEY (`maGiaoHang`) REFERENCES `GiaoHang` (`maGiaoHang`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HoaDon`
--

LOCK TABLES `HoaDon` WRITE;
/*!40000 ALTER TABLE `HoaDon` DISABLE KEYS */;
INSERT INTO `HoaDon` VALUES
('HDGTGT-20260901','2026-09-04 04:12:10',770000000.00,'GH20260901'),
('HDGTGT-20260905','2026-09-08 04:12:10',520000000.00,'GH20260905'),
('HDGTGT-20260908','2026-09-14 04:12:10',450000000.00,'GH20260908');
/*!40000 ALTER TABLE `HoaDon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HopDong`
--

DROP TABLE IF EXISTS `HopDong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `HopDong` (
  `maHopDong` varchar(20) NOT NULL COMMENT 'Mã hợp đồng lao động',
  `maNV` varchar(20) NOT NULL COMMENT 'Mã nhân viên ký hợp đồng',
  `loaiHopDong` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Loại hợp đồng (Thử việc/Xác định thời hạn/Không xác định)',
  `ngayHieuLuc` date DEFAULT NULL COMMENT 'Ngày hợp đồng có hiệu lực',
  `ngayHetHan` date DEFAULT NULL,
  `mucLuongCoBan` decimal(15,2) DEFAULT 0.00 COMMENT 'Mức lương cơ bản theo hợp đồng',
  `trangThai` varchar(30) DEFAULT 'Hiệu lực',
  PRIMARY KEY (`maHopDong`),
  KEY `fk_hd_nv` (`maNV`),
  CONSTRAINT `fk_hd_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hợp đồng lao động';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HopDong`
--

LOCK TABLES `HopDong` WRITE;
/*!40000 ALTER TABLE `HopDong` DISABLE KEYS */;
INSERT INTO `HopDong` VALUES
('HD_TEST_1790089533','NV_TEST_1790089532','Xác định thời hạn','2026-09-01',NULL,18000000.00,'Hiệu lực'),
('HD2018-005','NV005','Không xác định thời hạn','2018-01-01',NULL,60000000.00,'Hiệu lực'),
('HD2019-003','NV003','Không xác định thời hạn','2019-11-01',NULL,26000000.00,'Hiệu lực'),
('HD2020-001','NV001','Không xác định thời hạn','2020-03-15',NULL,28000000.00,'Hiệu lực'),
('HD2021-002','NV002','Không xác định thời hạn','2021-06-10',NULL,32000000.00,'Hiệu lực'),
('HD2021-007','NV007','Xác định thời hạn 3 năm','2021-09-05',NULL,18000000.00,'Hiệu lực'),
('HD2022-004','NV004','Xác định thời hạn 3 năm','2022-02-20',NULL,16000000.00,'Hiệu lực'),
('HD2022-006','NV006','Xác định thời hạn 3 năm','2022-08-15',NULL,15000000.00,'Hiệu lực'),
('HD2022-010','NV010','Không xác định thời hạn','2022-10-01',NULL,16000000.00,'Hiệu lực'),
('HD2023-008','NV008','Xác định thời hạn 1 năm','2023-04-12',NULL,14000000.00,'Hiệu lực'),
('HD2023-009','NV009','Xác định thời hạn 1 năm','2023-01-10',NULL,15000000.00,'Hiệu lực');
/*!40000 ALTER TABLE `HopDong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KhachHang`
--

DROP TABLE IF EXISTS `KhachHang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `KhachHang` (
  `maKhachHang` varchar(20) NOT NULL,
  `tenKhachHang` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `soDienThoai` varchar(15) DEFAULT NULL,
  `diaChi` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `hanMucCongNo` decimal(18,2) DEFAULT 0.00,
  PRIMARY KEY (`maKhachHang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Khách Hàng & Nhà Phân Phối';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KhachHang`
--

LOCK TABLES `KhachHang` WRITE;
/*!40000 ALTER TABLE `KhachHang` DISABLE KEYS */;
INSERT INTO `KhachHang` VALUES
('KH001','Hệ Thống Siêu Thị Co.opmart Toàn Quốc (Saigon Co.op)','02838360143','131 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM',500000000.00),
('KH002','Chuỗi Cửa Hàng Vinamilk Giấc Mơ Sữa Việt','1900636979','10 Tân Trào, Tân Phú, Quận 7, TP.HCM',1000000000.00),
('KH003','Hệ Thống Siêu Thị WinMart / WinMart+ (Masan Group)','02471066866','Số 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',800000000.00),
('KH004','Đại Lý Tổng Phân Phối Sữa Miền Tây (Hậu Giang)','02933878999','KCN Sông Hậu, Huyện Châu Thành, Hậu Giang',350000000.00),
('KH005','Tập Đoàn Bách Hóa Xanh (MWG)','19001908','KCN Tân Bình, Tân Phú, TP.HCM',600000000.00),
('KH006','Hệ Thống Đại Lý Xuất Khẩu Sữa Trung Đông (Dubai UAE)','00971432100','Jebel Ali Free Zone, Dubai, UAE',2000000000.00),
('KH007','Đại Siêu Thị GO! & Tops Market (Central Retail Việt Nam)','02839958368','Tòa nhà Central Plaza, 163 Phan Đăng Lưu, Phú Nhuận, TP.HCM',750000000.00),
('KH008','Hệ Thống Bán Sỉ MM Mega Market Việt Nam (An Phú)','02835190390','Khu B, KĐT mới An Phú - An Khánh, TP. Thủ Đức, TP.HCM',900000000.00),
('KH009','Chuỗi Siêu Thị AEON Mall Nhật Bản (Tân Phú & Bình Tân)','02862887733','Số 30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM',1200000000.00),
('KH010','Hệ Thống Siêu Thị Lotte Mart Nam Sài Gòn','02837753232','469 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, TP.HCM',650000000.00),
('KH011','Chuỗi Cửa Hàng Tiện Lợi Circle K Việt Nam','02836207070','160 Bùi Thị Xuân, Phạm Ngũ Lão, Quận 1, TP.HCM',450000000.00),
('KH012','Chuỗi Bán Lẻ Tiện Ích GS25 (Sơn Kim Retail)','02873022525','Toà nhà Empress Tower, 138 Hai Bà Trưng, Quận 1, TP.HCM',400000000.00),
('KH013','Ban Điều Hành Đề Án Sữa Học Đường TP. Hồ Chí Minh','02838299666','66-68 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',1500000000.00),
('KH014','Khoa Dinh Dưỡng & Căn Tin Bệnh Viện Chợ Rẫy','02838554137','201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',300000000.00),
('KH015','Công Ty Cổ Phần Phân Phối Tiêu Dùng Miền Bắc (Hà Nội)','02437896688','Khu Công Nghiệp Đài Tư, Sài Đồng, Long Biên, Hà Nội',850000000.00);
/*!40000 ALTER TABLE `KhachHang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Kho`
--

DROP TABLE IF EXISTS `Kho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Kho` (
  `maKho` varchar(20) NOT NULL,
  `tenKho` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `diaChi` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maKho`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Kho`
--

LOCK TABLES `Kho` WRITE;
/*!40000 ALTER TABLE `Kho` DISABLE KEYS */;
INSERT INTO `Kho` VALUES
('KHO-CTH','Kho Phân Phối Trọng Điểm Tây Nam Bộ (Cần Thơ)','KCN Trà Nóc 1, Bình Thủy, Cần Thơ'),
('KHO-DNG','Kho Trung Chuyển Miền Trung - Đà Nẵng','KCN Hòa Khánh, Liên Chiểu, Đà Nẵng'),
('KHO-LTM','Kho Lạnh Sữa Tươi Cao Nguyên Mộc Châu','Thị trấn Mộc Châu, Sơn La'),
('KHO-TONG','Kho Tổng Mega Plant Vinamilk Bình Dương','Lô CN-01, KCN Mỹ Phước 2, Bến Cát, Bình Dương');
/*!40000 ALTER TABLE `Kho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KhoNguyenVatLieu`
--

DROP TABLE IF EXISTS `KhoNguyenVatLieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `KhoNguyenVatLieu` (
  `maKhoNVL` varchar(20) NOT NULL,
  `maTonKho` varchar(50) NOT NULL,
  `tinhTrangKhoNVL` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Bình thường',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maKhoNVL`),
  KEY `fk_khonvl_tk` (`maTonKho`),
  CONSTRAINT `fk_khonvl_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KhoNguyenVatLieu`
--

LOCK TABLES `KhoNguyenVatLieu` WRITE;
/*!40000 ALTER TABLE `KhoNguyenVatLieu` DISABLE KEYS */;
INSERT INTO `KhoNguyenVatLieu` VALUES
('KNVL01','LOT-NVL-20260901-01','Bình thường','Kho UHT Sữa Thô'),
('KNVL02','LOT-NVL-20260905-02','Bình thường','Kho Khô Đường Tinh Luyện'),
('KNVL03','LOT-NVL-20260907-03','Tồn kho thấp','Kho Phụ Gia Hương Liệu'),
('KNVL04','LOT-NVL-20260908-04','Bình thường','Kho Bao Bì Vỏ Hộp');
/*!40000 ALTER TABLE `KhoNguyenVatLieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `KhoSanPham`
--

DROP TABLE IF EXISTS `KhoSanPham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `KhoSanPham` (
  `maKhoSP` varchar(20) NOT NULL,
  `maTonKho` varchar(50) NOT NULL,
  `tinhTrangKhoSP` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Bình thường',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maKhoSP`),
  KEY `fk_khosp_tk` (`maTonKho`),
  CONSTRAINT `fk_khosp_tk` FOREIGN KEY (`maTonKho`) REFERENCES `TonKho` (`maTonKho`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `KhoSanPham`
--

LOCK TABLES `KhoSanPham` WRITE;
/*!40000 ALTER TABLE `KhoSanPham` DISABLE KEYS */;
INSERT INTO `KhoSanPham` VALUES
('KSP01','LOT-SP-20260902-FEFO1','Bình thường','Khu vực ưu tiên xuất FEFO'),
('KSP02','LOT-SP-20260904-SC01','Bình thường','Kho Lạnh Sữa Chua 4-8 độ C'),
('KSP03','LOT-SP-20260909-GF01','Bình thường','Kho Tổng Thành Phẩm Green Farm'),
('KSP04','LOT-SP-20260906-DA01','Bình thường','Kho Sữa Bột Dielac');
/*!40000 ALTER TABLE `KhoSanPham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LenhSanXuat`
--

DROP TABLE IF EXISTS `LenhSanXuat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LenhSanXuat` (
  `maLenh` varchar(20) NOT NULL COMMENT 'Mã lệnh sản xuất',
  `maNhanVien` varchar(20) DEFAULT NULL COMMENT 'Nhân viên phụ trách/tạo lệnh',
  `tenLenh` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Tên/Mô tả lệnh sản xuất',
  `ngayTaoLenh` date DEFAULT NULL COMMENT 'Ngày tạo lệnh',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt' COMMENT 'Trạng thái (Chờ duyệt, Đã duyệt, Đang thực hiện, Hoàn thành, Hủy)',
  PRIMARY KEY (`maLenh`),
  KEY `fk_lsx_nv` (`maNhanVien`),
  CONSTRAINT `fk_lsx_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Lệnh Sản Xuất';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LenhSanXuat`
--

LOCK TABLES `LenhSanXuat` WRITE;
/*!40000 ALTER TABLE `LenhSanXuat` DISABLE KEYS */;
INSERT INTO `LenhSanXuat` VALUES
('LSX20260901','NV003','Kế hoạch sản xuất Sữa tươi tiệt trùng UHT 100% 180ml (Batch A)','2026-09-04','Hoàn thành'),
('LSX20260905','NV003','Kế hoạch sản xuất Sữa chua ăn có đường 100g (Batch Probiotics)','2026-09-08','Hoàn thành'),
('LSX20260908','NV007','Kế hoạch sản xuất Sữa tươi sinh thái Green Farm 180ml','2026-09-11','Đang thực hiện'),
('LSX20260912','NV003','Kế hoạch sản xuất Sữa chua uống men sống Probi 65ml','2026-09-14','Đã duyệt');
/*!40000 ALTER TABLE `LenhSanXuat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LichSuNhanSu`
--

DROP TABLE IF EXISTS `LichSuNhanSu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LichSuNhanSu` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `maNV` varchar(20) NOT NULL,
  `loaiThayDoi` varchar(50) NOT NULL COMMENT 'DieuChuyenPhongBan, DieuChuyenChucVu, ThayDoiLuong, DoiMatKhau, SuaBangLuong, TaoMoi',
  `noiDung` text NOT NULL,
  `nguoiThucHien` varchar(50) DEFAULT 'Quản lý nhân sự',
  `ngayTao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ls_nv` (`maNV`),
  CONSTRAINT `fk_ls_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử biến động nhân sự và điều chỉnh lương';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LichSuNhanSu`
--

LOCK TABLES `LichSuNhanSu` WRITE;
/*!40000 ALTER TABLE `LichSuNhanSu` DISABLE KEYS */;
INSERT INTO `LichSuNhanSu` VALUES
(1,'NV_TEST_1790089492','TaoMoi','Tiếp nhận nhân sự mới: Nguyễn Kiểm Thử Tự Động (NV_TEST_1790089492). Phòng ban: Phòng Quản Lý Kho Vận & Chuỗi Cung Ứng, Chức vụ: Thủ Kho Trưởng / Kiểm Soát FEFO. Tự động cấp tài khoản đăng nhập (SĐT: 0988089492).','Quản lý nhân sự','2026-09-22 15:04:53'),
(2,'NV_TEST_1790089532','TaoMoi','Tiếp nhận nhân sự mới: Nguyễn Kiểm Thử Tự Động (NV_TEST_1790089532). Phòng ban: Phòng Quản Lý Kho Vận & Chuỗi Cung Ứng, Chức vụ: Thủ Kho Trưởng / Kiểm Soát FEFO. Tự động cấp tài khoản đăng nhập (SĐT: 0988089532).','Quản lý nhân sự','2026-09-22 15:05:32'),
(3,'NV_TEST_1790089532','ThayDoiLuong','Ký mới hợp đồng [HD_TEST_1790089533] (Xác định thời hạn), mức lương cơ bản: 18.000.000 VNĐ.','Quản lý nhân sự','2026-09-22 15:05:33');
/*!40000 ALTER TABLE `LichSuNhanSu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LoaiNVL`
--

DROP TABLE IF EXISTS `LoaiNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LoaiNVL` (
  `maLoaiNVL` varchar(20) NOT NULL,
  `tenLoaiNVL` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maLoaiNVL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LoaiNVL`
--

LOCK TABLES `LoaiNVL` WRITE;
/*!40000 ALTER TABLE `LoaiNVL` DISABLE KEYS */;
INSERT INTO `LoaiNVL` VALUES
('LNVL01','Sữa Tươi Thô & Nguyên Liệu Lỏng','Sữa tươi thô thu mua từ trang trại Green Farm Vinamilk'),
('LNVL02','Nguyên Liệu Khô & Phụ Gia','Đường tinh luyện, vi chất dinh dưỡng, hương liệu nhập khẩu'),
('LNVL03','Bao Bì & Vật Tư Đóng Gói','Vỏ hộp giấy Tetra Pak, nắp nhựa, cuộn màng co'),
('LNVL04','Bột Sữa & Béo Dinh Dưỡng','Bột sữa gầy NZMP New Zealand, béo sữa chua'),
('LNVL05','Men Sữa Chua & Enzyme','Men Probiotics LGG nhập khẩu Đan Mạch'),
('LNVL06','Trái Cây & Hạt Tự Nhiên','Mứt dâu tây Đà Lạt, cốt dừa, bơ hạnh nhân');
/*!40000 ALTER TABLE `LoaiNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NguyenVatLieu`
--

DROP TABLE IF EXISTS `NguyenVatLieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `NguyenVatLieu` (
  `maNVL` varchar(20) NOT NULL,
  `maLoaiNVL` varchar(20) DEFAULT NULL,
  `tenNVL` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `donVi` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Kg',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maNVL`),
  KEY `fk_nvl_loai` (`maLoaiNVL`),
  CONSTRAINT `fk_nvl_loai` FOREIGN KEY (`maLoaiNVL`) REFERENCES `LoaiNVL` (`maLoaiNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NguyenVatLieu`
--

LOCK TABLES `NguyenVatLieu` WRITE;
/*!40000 ALTER TABLE `NguyenVatLieu` DISABLE KEYS */;
INSERT INTO `NguyenVatLieu` VALUES
('NVL001','LNVL01','Sữa Tươi Nguyên Chất 100% Thô (Mộc Châu)','Lít','Bảo quản lạnh 2-4 độ C'),
('NVL002','LNVL02','Đường Tinh Luyện Biên Hòa Grade A','Kg','Bảo quản kho khô ráo'),
('NVL003','LNVL02','Hương Liệu Dâu Tự Nhiên Firmenich','Kg','Nhập khẩu Thụy Sĩ'),
('NVL004','LNVL03','Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml','Cái','Đạt chuẩn tiệt trùng UHT'),
('NVL005','LNVL04','Bột Sữa Gầy Skim Milk Powder NZMP','Kg','Nhập khẩu Fonterra New Zealand'),
('NVL006','LNVL05','Men Probiotics LGG Chr. Hansen','Kg','Men sống lên men sữa chua Đan Mạch'),
('NVL007','LNVL06','Mứt Dâu Tây Tự Nhiên Đà Lạt','Kg','Cốt trái cây tươi chín mộng'),
('NVL008','LNVL03','Thùng Carton 24 Hộp Sữa 180ml','Cái','Bao bì carton sóng 5 lớp'),
('NVL009','LNVL01','Sữa Tươi Thô Trang Trại Green Farm Tây Ninh','Lít','Đạt chuẩn Organic Châu Âu'),
('NVL010','LNVL06','Bơ Hạnh Nhân Tự Nhiên Nhập Khẩu Mỹ','Kg','Phục vụ dòng Sữa Hạt cao cấp');
/*!40000 ALTER TABLE `NguyenVatLieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NhaCungCap`
--

DROP TABLE IF EXISTS `NhaCungCap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `NhaCungCap` (
  `maNCC` varchar(20) NOT NULL,
  `tenNCC` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `maSoThue` varchar(20) DEFAULT NULL,
  `diaChi` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soDienThoai` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`maNCC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NhaCungCap`
--

LOCK TABLES `NhaCungCap` WRITE;
/*!40000 ALTER TABLE `NhaCungCap` DISABLE KEYS */;
INSERT INTO `NhaCungCap` VALUES
('NCC001','Tập Đoàn Bao Bì Tetra Pak Việt Nam','0301458999','KCN Việt Nam - Singapore, Bình Dương','02743756888','contact.vn@tetrapak.com'),
('NCC002','Công Ty Cổ Phần Đường Biên Hòa (TTC Sugar)','3600258147','KCN Biên Hòa 1, Đồng Nai','02513836121','sales@ttcsugar.com.vn'),
('NCC003','Hợp Tác Xã Nông Trại Bò Sữa Mộc Châu Farm','2600147258','Thị trấn Mộc Châu, Sơn La','02123866112','supply@mocchaudairy.com.vn'),
('NCC004','Tập Đoàn Dinh Dưỡng Fonterra New Zealand Ltd','9900112233','Auckland, New Zealand / CN TP.HCM','02838279999','nzmp.vietnam@fonterra.com'),
('NCC005','Công Ty Men Sống Chr. Hansen Denmark A/S','9900445566','Hoersholm, Đan Mạch','02839101122','chrhansen@danishmicrobiology.dk'),
('NCC006','Trang Trại Sinh Thái Vinamilk Green Farm Tây Ninh','3901234567','Huyện Bến Cầu, Tây Ninh','02763888999','greenfarm.tayninh@vinamilk.com.vn'),
('NCC007','Trang Trại Bò Sữa Hữu Cơ Vinamilk Organic Đà Lạt','5801239988','Xã Tu Tra, Đơn Dương, Lâm Đồng','02633844555','organic.dalat@vinamilk.com.vn'),
('NCC008','Công Ty TNHH Hương Liệu Thực Phẩm Kerry Ingredients VN','3700987654','KCN VSIP 1, Thuận An, Bình Dương','02743789123','contact.vn@kerry.com'),
('NCC009','Tập Đoàn Hóa Chất & Vi Chất Dinh Dưỡng DSM Thụy Sĩ','9900554433','Kaiseraugst, Thụy Sĩ / CN Q.1, TP.HCM','02838234567','nutrition.vn@dsm.com'),
('NCC010','Hợp Tác Xã Chăn Nuôi Bò Sữa Đơn Dương (Lâm Đồng)','5800456123','Thị trấn Thạnh Mỹ, Đơn Dương, Lâm Đồng','02633888777','donduongmilk@lamdongcoop.vn'),
('NCC011','Công Ty Cổ Phần Nhựa Bao Bì Duy Tân','0302234567','KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM','02838163333','sales@duytan.com'),
('NCC012','Công Ty TNHH Vận Tải Lạnh Chuỗi Cung Ứng ABA Cooltrans','0310246810','KCN Cát Lái 2, TP. Thủ Đức, TP.HCM','02837425555','dispatch@abacooltrans.vn'),
('NCC013','Trang Trại Bò Sữa Công Nghệ Cao Vinamilk Thanh Hóa','2801998877','Thị trấn Thống Nhất, Yên Định, Thanh Hóa','02373899222','farm.thanhhoa@vinamilk.com.vn'),
('NCC014','Công Ty Cổ Phần Cơ Điện Lạnh & Thiết Bị Sữa REE Corp','0301122334','364 Cộng Hòa, Phường 13, Tân Bình, TP.HCM','02838100011','ree@reepower.com.vn'),
('NCC015','Công Ty Cổ Phần Bao Bì Thùng Giấy Tân Á','3601556677','KCN Amata, Biên Hòa, Đồng Nai','02513998877','packaging@tana-box.com.vn');
/*!40000 ALTER TABLE `NhaCungCap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NhanVien`
--

DROP TABLE IF EXISTS `NhanVien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `NhanVien` (
  `maNV` varchar(20) NOT NULL COMMENT 'Mã nhân viên',
  `hoTen` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Họ và tên nhân viên',
  `soDienThoai` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ngaySinh` date DEFAULT NULL,
  `gioiTinh` varchar(10) DEFAULT 'Nam',
  `trinhDo` varchar(50) DEFAULT 'Đại học',
  `maPhongBan` varchar(20) DEFAULT NULL COMMENT 'Mã phòng ban trực thuộc',
  `maChucVu` varchar(20) DEFAULT NULL COMMENT 'Mã chức vụ hiện tại',
  `ngayVaoLam` date DEFAULT NULL COMMENT 'Ngày bắt đầu làm việc',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Đang làm việc' COMMENT 'Trạng thái làm việc',
  PRIMARY KEY (`maNV`),
  UNIQUE KEY `uk_nv_sdt` (`soDienThoai`),
  KEY `fk_nv_pb` (`maPhongBan`),
  KEY `fk_nv_cv` (`maChucVu`),
  CONSTRAINT `fk_nv_cv` FOREIGN KEY (`maChucVu`) REFERENCES `ChucVu` (`maChucVu`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_nv_pb` FOREIGN KEY (`maPhongBan`) REFERENCES `PhongBan` (`maPhongBan`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hồ sơ Nhân Viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NhanVien`
--

LOCK TABLES `NhanVien` WRITE;
/*!40000 ALTER TABLE `NhanVien` DISABLE KEYS */;
INSERT INTO `NhanVien` VALUES
('NV_TEST_1790089492','Nguyễn Kiểm Thử Tự Động','0988089492','test@vinamilk.com.vn',NULL,'Nam','Đại học','PB02','CV06','2026-09-22','Đang làm việc'),
('NV_TEST_1790089532','Nguyễn Kiểm Thử Tự Động','0988089532','test@vinamilk.com.vn',NULL,'Nam','Đại học','PB02','CV06','2026-09-22','Đang làm việc'),
('NV001','Nguyễn Văn Hùng','0901000001','hung.nv@vinamilk.com.vn','1985-05-15','Nam','Thạc sĩ','PB02','CV03','2020-03-15','Đang làm việc'),
('NV002','Trần Thị Thu Thảo','0901000002','thao.ttt@vinamilk.com.vn','1990-08-20','Nữ','Đại học','PB03','CV04','2021-06-10','Đang làm việc'),
('NV003','Lê Minh Tuấn','0901000003','tuan.lm@vinamilk.com.vn','1988-11-12','Nam','Kỹ sư','PB04','CV05','2019-11-01','Đang làm việc'),
('NV004','Phạm Hoàng Nam','0901000004','nam.ph@vinamilk.com.vn','1992-02-18','Nam','Đại học','PB05','CV07','2022-02-20','Đang làm việc'),
('NV005','Trịnh Đình Đức','0901000005','duc.td@vinamilk.com.vn','1975-01-01','Nam','Tiến sĩ','PB01','CV01','2018-01-01','Đang làm việc'),
('NV006','Đặng Mai Phương','0901000006','phuong.dm@vinamilk.com.vn','1994-09-25','Nữ','Đại học','PB02','CV06','2022-08-15','Đang làm việc'),
('NV007','Vũ Quốc Bảo','0901000007','bao.vq@vinamilk.com.vn','1991-07-08','Nam','Kỹ sư','PB04','CV08','2021-09-05','Đang làm việc'),
('NV008','Hoàng Kim Ngân','0901000008','ngan.hk@vinamilk.com.vn','1995-12-30','Nữ','Đại học','PB03','CV07','2023-04-12','Đang làm việc'),
('NV009','Bùi Tuấn Kiệt','0901000009','kiet.bt@vinamilk.com.vn','1996-03-14','Nam','Cao đẳng','PB05','CV07','2023-01-10','Đang làm việc'),
('NV010','Ngô Thị Thanh Trúc','0901000010','truc.ntt@vinamilk.com.vn','1993-10-10','Nữ','Thạc sĩ','PB06','CV07','2022-10-01','Đang làm việc');
/*!40000 ALTER TABLE `NhanVien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuChi`
--

DROP TABLE IF EXISTS `PhieuChi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuChi` (
  `maPhieuChi` varchar(50) NOT NULL,
  `ngayChi` datetime DEFAULT current_timestamp(),
  `maDoiTuong` varchar(50) DEFAULT NULL,
  `lyDoChi` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT 0.00,
  `phuongThucChi` varchar(20) DEFAULT 'TM' COMMENT 'Phương thức chi: TM, CK',
  `maTaiKhoanQuy` varchar(50) DEFAULT NULL,
  `trangThai` varchar(20) DEFAULT 'Moi' COMMENT 'Trạng thái: Moi, DaDuyet, Huy',
  `nguoiLap` varchar(50) DEFAULT NULL,
  `ngayLap` datetime DEFAULT current_timestamp(),
  `nguoiDuyet` varchar(50) DEFAULT NULL,
  `ngayDuyet` datetime DEFAULT NULL,
  `maPhieuNhapNVL` varchar(50) DEFAULT NULL COMMENT 'FK -> PhieuNhapNVL (Kho) - nullable',
  `maBangLuong` varchar(50) DEFAULT NULL COMMENT 'FK -> BangLuong (Nhân sự) - nullable',
  PRIMARY KEY (`maPhieuChi`),
  KEY `fk_pc_dt` (`maDoiTuong`),
  KEY `fk_pc_tkq` (`maTaiKhoanQuy`),
  KEY `fk_pc_nvlap` (`nguoiLap`),
  KEY `fk_pc_nvduyet` (`nguoiDuyet`),
  KEY `fk_pc_pnnvl` (`maPhieuNhapNVL`),
  KEY `fk_pc_bl` (`maBangLuong`),
  CONSTRAINT `fk_pc_bl` FOREIGN KEY (`maBangLuong`) REFERENCES `BangLuong` (`maBangLuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_dt` FOREIGN KEY (`maDoiTuong`) REFERENCES `DoiTuongGiaoDich` (`maDoiTuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_nvduyet` FOREIGN KEY (`nguoiDuyet`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_nvlap` FOREIGN KEY (`nguoiLap`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_pnnvl` FOREIGN KEY (`maPhieuNhapNVL`) REFERENCES `PhieuNhapNVL` (`maPhieuNhapNVL`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_tkq` FOREIGN KEY (`maTaiKhoanQuy`) REFERENCES `TaiKhoanQuy` (`maTaiKhoanQuy`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Phiếu Chi Tiền';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuChi`
--

LOCK TABLES `PhieuChi` WRITE;
/*!40000 ALTER TABLE `PhieuChi` DISABLE KEYS */;
INSERT INTO `PhieuChi` VALUES
('PC-202609-001','2026-08-03 03:29:10','DT-NCC001','Thanh toán tiền mua bao bì tiệt trùng phức hợp Aseptic từ Tetra Pak VN',450000000.00,'CK','TKQ-BIDV03','DaDuyet','NV002','2026-08-03 02:44:10','NV001','2026-08-03 03:59:10',NULL,NULL),
('PC-202609-002','2026-08-04 02:29:10','DT-NCC002','Thanh toán tiền nhập 50 tấn đường tinh luyện cao cấp từ TTC Sugar Biên Hòa',180000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-04 01:44:10','NV001','2026-08-04 02:59:10',NULL,NULL),
('PC-202609-003','2026-08-06 01:29:10','DT-NCC003','Thanh toán tiền thu mua sữa bò tươi nguyên chất đợt 1 Hợp Tác Xã Mộc Châu',320000000.00,'CK','TKQ-AGR01','DaDuyet','NV002','2026-08-06 00:44:10','NV001','2026-08-06 01:59:10',NULL,NULL),
('PC-202609-004','2026-08-07 00:29:10','DT-NCC004','Thanh toán L/C nhập khẩu 40 tấn bột sữa gầy nguyên chất từ Fonterra New Zealand',850000000.00,'CK','TKQ-VCB03','DaDuyet','NV002','2026-08-06 23:44:10','NV001','2026-08-07 00:59:10',NULL,NULL),
('PC-202609-005','2026-08-08 23:29:10','DT-NCC005','Thanh toán tiền mua men vi sinh sống đông khô từ Chr. Hansen Đan Mạch',240000000.00,'CK','TKQ-HSBC01','DaDuyet','NV002','2026-08-08 22:44:10','NV001','2026-08-08 23:59:10',NULL,NULL),
('PC-202609-006','2026-08-10 22:29:10','DT-NCC006','Thanh toán tiền sữa tươi chuẩn organic trang trại Vinamilk Green Farm Tây Ninh',420000000.00,'CK','TKQ-BIDV02','DaDuyet','NV002','2026-08-10 21:44:10','NV001','2026-08-10 22:59:10',NULL,NULL),
('PC-202609-007','2026-08-12 04:29:10','DT-NCC007','Thanh toán tiền sữa bò hữu cơ trang trại Organic Đà Lạt kỳ tháng 8',290000000.00,'CK','TKQ-AGR02','DaDuyet','NV002','2026-08-12 03:44:10','NV001','2026-08-12 04:59:10',NULL,NULL),
('PC-202609-008','2026-08-14 03:29:10','DT-NCC008','Thanh toán hương liệu tự nhiên dâu & socola cho Kerry Ingredients VN',165000000.00,'CK','TKQ-BIDV03','DaDuyet','NV002','2026-08-14 02:44:10','NV001','2026-08-14 03:59:10',NULL,NULL),
('PC-202609-009','2026-08-16 02:29:10','DT-NCC009','Thanh toán tiền vi chất Canxi nano & Vitamin D3 từ DSM Thụy Sĩ',210000000.00,'CK','TKQ-ACB01','DaDuyet','NV002','2026-08-16 01:44:10','NV001','2026-08-16 02:59:10',NULL,NULL),
('PC-202609-010','2026-08-18 01:29:10','DT-NCC010','Thanh toán tiền sữa tươi thu gom từ Hợp tác xã chăn nuôi Đơn Dương',195000000.00,'CK','TKQ-AGR02','DaDuyet','NV002','2026-08-18 00:44:10','NV001','2026-08-18 01:59:10',NULL,NULL),
('PC-202609-011','2026-08-20 00:29:10','DT-NCC011','Thanh toán tiền mua pallet nhựa và khay chứa sữa từ Nhựa Duy Tân',88000000.00,'CK','TKQ-BIDV03','DaDuyet','NV002','2026-08-19 23:44:10','NV001','2026-08-20 00:59:10',NULL,NULL),
('PC-202609-012','2026-08-20 23:29:10','DT-NCC012','Thanh toán cước vận chuyển xe bồn lạnh luân chuyển sữa tươi ABA Cooltrans',145000000.00,'CK','TKQ-CTG02','DaDuyet','NV002','2026-08-20 22:44:10','NV001','2026-08-20 23:59:10',NULL,NULL),
('PC-202609-013','2026-08-22 22:29:10','DT-NCC013','Thanh toán tiền sữa tươi thô trang trại công nghệ cao Yên Định, Thanh Hóa',260000000.00,'CK','TKQ-BIDV02','DaDuyet','NV002','2026-08-22 21:44:10','NV001','2026-08-22 22:59:10',NULL,NULL),
('PC-202609-014','2026-08-24 04:29:10','DT-NCC014','Thanh toán bảo dưỡng hệ thống điều hòa không khí kho lạnh REE Corp',75000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-24 03:44:10','NV001','2026-08-24 04:59:10',NULL,NULL),
('PC-202609-015','2026-08-26 03:29:10','DT-NCC015','Thanh toán tiền mua 50.000 vỏ thùng carton in offset Tân Á',68000000.00,'CK','TKQ-BIDV03','DaDuyet','NV002','2026-08-26 02:44:10','NV001','2026-08-26 03:59:10',NULL,NULL),
('PC-202609-016','2026-08-27 02:29:10','DT-NV001','Chi trả lương tháng 8/2026 cho Trưởng phòng Kho vận Nguyễn Văn Hùng',28000000.00,'CK','TKQ-BIDV01','DaDuyet','NV002','2026-08-27 01:44:10','NV001','2026-08-27 02:59:10',NULL,NULL),
('PC-202609-017','2026-08-27 01:29:10','DT-NV002','Chi trả lương tháng 8/2026 cho Kế toán trưởng Trần Thị Thu Thảo',32000000.00,'CK','TKQ-BIDV01','DaDuyet','NV002','2026-08-27 00:44:10','NV001','2026-08-27 01:59:10',NULL,NULL),
('PC-202609-018','2026-08-27 00:29:10','DT-NV003','Chi trả lương tháng 8/2026 cho Trưởng ca sản xuất Lê Minh Tuấn',26000000.00,'CK','TKQ-BIDV01','DaDuyet','NV002','2026-08-26 23:44:10','NV001','2026-08-27 00:59:10',NULL,NULL),
('PC-202609-019','2026-08-26 23:29:10','DT-NV004','Chi trả lương tháng 8/2026 cho Chuyên viên kinh doanh Phạm Hoàng Nam',16000000.00,'CK','TKQ-BIDV01','DaDuyet','NV002','2026-08-26 22:44:10','NV001','2026-08-26 23:59:10',NULL,NULL),
('PC-202609-020','2026-08-26 22:29:10','DT-NV005','Chi trả lương tháng 8/2026 cho Ban Giám đốc điều hành Trịnh Đình Đức',45000000.00,'CK','TKQ-BIDV01','DaDuyet','NV002','2026-08-26 21:44:10','NV001','2026-08-26 22:59:10',NULL,NULL),
('PC-202609-021','2026-08-29 04:29:10','DT-NV002','Thanh toán tiền điện sản xuất cho Điện lực Bến Cát (Nhà máy Mega Plant)',185000000.00,'CK','TKQ-MB02','DaDuyet','NV002','2026-08-29 03:44:10','NV001','2026-08-29 04:59:10',NULL,NULL),
('PC-202609-022','2026-08-30 03:29:10','DT-NV002','Chi tiền nước sinh hoạt và sản xuất văn phòng Tân Trào kỳ tháng 8',14500000.00,'TM','TKQ-TM01','DaDuyet','NV002','2026-08-30 02:44:10','NV001','2026-08-30 03:59:10',NULL,NULL),
('PC-202609-023','2026-09-01 02:29:10','DT-NV001','Chi tiền mua dầu DO vận hành lò hơi tiệt trùng áp suất cao nhà máy',95000000.00,'CK','TKQ-BIDV03','DaDuyet','NV002','2026-09-01 01:44:10','NV001','2026-09-01 02:59:10',NULL,NULL),
('PC-202609-024','2026-09-02 01:29:10','DT-NV002','Trích nộp BHXH, BHYT, BHTN tháng 8/2026 cho cơ quan Bảo hiểm TP.HCM',168000000.00,'CK','TKQ-BIDV01','DaDuyet','NV002','2026-09-02 00:44:10','NV001','2026-09-02 01:59:10',NULL,NULL),
('PC-202609-025','2026-09-04 00:29:10','DT-NV004','Thanh toán chi phí chiến dịch quảng cáo ra mắt dòng Sữa Hạt Super Nut',250000000.00,'CK','TKQ-TCB03','DaDuyet','NV002','2026-09-03 23:44:10','NV001','2026-09-04 00:59:10',NULL,NULL),
('PC-202609-026','2026-09-09 23:29:10','DT-NCC001','Thanh toán tiền mua bao bì đợt 2 tháng 9 cho Tetra Pak (Chờ duyệt CFO)',380000000.00,'CK','TKQ-BIDV03','ChoDuyet','NV002','2026-09-09 22:44:10',NULL,NULL,NULL,NULL),
('PC-202609-027','2026-09-10 22:29:10','DT-NCC002','Thanh toán đơn hàng 35 tấn đường luyện TTC Sugar (Chờ duyệt)',140000000.00,'CK','TKQ-VCB01','ChoDuyet','NV002','2026-09-10 21:44:10',NULL,NULL,NULL,NULL),
('PC-202609-028','2026-09-12 04:29:10','DT-NCC003','Thanh toán tiền sữa bò tươi đợt 1 tháng 9 Nông trại Mộc Châu (Chờ duyệt)',285000000.00,'CK','TKQ-AGR01','ChoDuyet','NV002','2026-09-12 03:44:10',NULL,NULL,NULL,NULL),
('PC-202609-029','2026-09-13 03:29:10','DT-NCC012','Thanh toán cước xe tải lạnh giao hàng chuỗi siêu thị miền Trung ABA',128000000.00,'CK','TKQ-CTG02','ChoDuyet','NV002','2026-09-13 02:44:10',NULL,NULL,NULL,NULL),
('PC-202609-030','2026-09-13 02:29:10','DT-NV001','Chi mua sắm trang phục bảo hộ phòng sạch công nhân kho bảo quản UHT',18500000.00,'TM','TKQ-TM01','ChoDuyet','NV002','2026-09-13 01:44:10',NULL,NULL,NULL,NULL),
('PC-202609-031','2026-09-14 01:29:10','DT-NV003','Chi mua phụ tùng van áp lực thay thế máy tiệt trùng UHT số 2',45000000.00,'CK','TKQ-VCB01','ChoDuyet','NV002','2026-09-14 00:44:10',NULL,NULL,NULL,NULL),
('PC-202609-032','2026-09-14 00:29:10','DT-NCC006','Lập phiếu chi mua sữa tươi đợt 2 tháng 9 Green Farm Tây Ninh',310000000.00,'CK','TKQ-BIDV02','Moi','NV002','2026-09-13 23:44:10',NULL,NULL,NULL,NULL),
('PC-202609-033','2026-09-14 23:29:10','DT-NCC008','Lập phiếu thanh toán hương vani và hạt dẻ Kerry Ingredients',92000000.00,'CK','TKQ-BIDV03','Moi','NV002','2026-09-14 22:44:10',NULL,NULL,NULL,NULL),
('PC-202609-034','2026-09-14 22:29:10','DT-NV002','Tạm ứng phí dịch vụ kiểm toán bán niên năm 2026 cho PwC Việt Nam',150000000.00,'CK','TKQ-VCB01','Moi','NV002','2026-09-14 21:44:10',NULL,NULL,NULL,NULL),
('PC-202609-035','2026-09-16 04:29:10','DT-NV004','Chi phí tổ chức chương trình đổi nắp hộp sữa trúng thưởng tại Cần Thơ',12000000.00,'TM','TKQ-TM01','Moi','NV002','2026-09-16 03:44:10',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `PhieuChi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuNghiemThu`
--

DROP TABLE IF EXISTS `PhieuNghiemThu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuNghiemThu` (
  `maPhieuNghiemThu` varchar(20) NOT NULL COMMENT 'Mã phiếu nghiệm thu chất lượng',
  `maCongDoan` varchar(20) DEFAULT NULL,
  `maLenh` varchar(20) DEFAULT NULL,
  `maNhanVien` varchar(20) DEFAULT NULL COMMENT 'Nhân viên QC nghiệm thu',
  `tongSoLuongSanPham` int(11) DEFAULT 0,
  `tongSoLuongDat` int(11) DEFAULT 0,
  `tongSoLuongKhongDat` int(11) DEFAULT 0,
  `ngayNghiemThu` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNghiemThu`),
  KEY `fk_pnt_cd` (`maCongDoan`),
  KEY `fk_pnt_lsx` (`maLenh`),
  KEY `fk_pnt_nv` (`maNhanVien`),
  CONSTRAINT `fk_pnt_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnt_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnt_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nghiệm thu chất lượng sản phẩm hoàn thành';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuNghiemThu`
--

LOCK TABLES `PhieuNghiemThu` WRITE;
/*!40000 ALTER TABLE `PhieuNghiemThu` DISABLE KEYS */;
INSERT INTO `PhieuNghiemThu` VALUES
('PNT20260901','CD01-03','LSX20260901','NV007',20000,19980,20,'2026-09-06','Nghiệm thu đạt chuẩn ISO 22000, hao hụt bao bì 20 hộp'),
('PNT20260905','CD01-02','LSX20260905','NV007',5000,5000,0,'2026-09-10','Đạt chuẩn vi sinh Probiotics 100%');
/*!40000 ALTER TABLE `PhieuNghiemThu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuNhapNVL`
--

DROP TABLE IF EXISTS `PhieuNhapNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuNhapNVL` (
  `maPhieuNhapNVL` varchar(20) NOT NULL,
  `maNCC` varchar(20) DEFAULT NULL,
  `maNVTao` varchar(20) DEFAULT NULL COMMENT 'Nhân viên lập phiếu',
  `maNVNhan` varchar(20) DEFAULT NULL COMMENT 'Nhân viên tiếp nhận kho',
  `ngayNhap` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuNhapNVL`),
  KEY `fk_pnnvl_ncc` (`maNCC`),
  KEY `fk_pnnvl_nvtao` (`maNVTao`),
  KEY `fk_pnnvl_nvnhan` (`maNVNhan`),
  CONSTRAINT `fk_pnnvl_ncc` FOREIGN KEY (`maNCC`) REFERENCES `NhaCungCap` (`maNCC`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnnvl_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnnvl_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuNhapNVL`
--

LOCK TABLES `PhieuNhapNVL` WRITE;
/*!40000 ALTER TABLE `PhieuNhapNVL` DISABLE KEYS */;
INSERT INTO `PhieuNhapNVL` VALUES
('PNNVL2026090101','NCC003','NV001','NV001','2026-09-06','Đã hoàn thành','Nhập 20,000 lít sữa tươi thô Mộc Châu kiểm nghiệm đạt ISO'),
('PNNVL2026090502','NCC002','NV001','NV001','2026-09-11','Đã hoàn thành','Nhập 10,000 kg đường tinh luyện Biên Hòa Grade A'),
('PNNVL2026090803','NCC001','NV001','NV001','2026-09-14','Đã duyệt','Nhập 500,000 vỏ hộp Tetra Pak Brik Aseptic 180ml');
/*!40000 ALTER TABLE `PhieuNhapNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuNhapSP`
--

DROP TABLE IF EXISTS `PhieuNhapSP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuNhapSP` (
  `maPhieuNhapSP` varchar(20) NOT NULL,
  `maXuong` varchar(20) DEFAULT NULL,
  `maNVTao` varchar(20) DEFAULT NULL,
  `maNVNhan` varchar(20) DEFAULT NULL,
  `ngayNhap` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `maPhieuYCXSP` varchar(20) DEFAULT NULL COMMENT 'Nối với Phiếu bàn giao bên Sản xuất',
  PRIMARY KEY (`maPhieuNhapSP`),
  KEY `fk_pnsp_nvtao` (`maNVTao`),
  KEY `fk_pnsp_nvnhan` (`maNVNhan`),
  KEY `fk_pnsp_pycxsp` (`maPhieuYCXSP`),
  CONSTRAINT `fk_pnsp_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnsp_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pnsp_pycxsp` FOREIGN KEY (`maPhieuYCXSP`) REFERENCES `PhieuYeuCauXuatSP` (`maPhieuYCXSP`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuNhapSP`
--

LOCK TABLES `PhieuNhapSP` WRITE;
/*!40000 ALTER TABLE `PhieuNhapSP` DISABLE KEYS */;
INSERT INTO `PhieuNhapSP` VALUES
('PNSP2026090201','XUONG-UHT-01','NV003','NV001','2026-08-02','Đã hoàn thành','Nhập 5,000 thùng Sữa tươi tiệt trùng 100% 180ml',NULL),
('PNSP2026090402','XUONG-SUACHUA-02','NV003','NV001','2026-08-25','Đã hoàn thành','Nhập 3,000 lốc Sữa chua ăn có đường 100g',NULL),
('PNSP2026090803','XUONG-UHT-01','NV003','NV001','2026-09-11','Đã hoàn thành','Nhập 15,000 thùng Sữa tươi tiệt trùng 100% 180ml (Batch FEFO-2)',NULL);
/*!40000 ALTER TABLE `PhieuNhapSP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuSanXuatBu`
--

DROP TABLE IF EXISTS `PhieuSanXuatBu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuSanXuatBu` (
  `maLenh` varchar(20) NOT NULL,
  `maSanPham` varchar(20) NOT NULL,
  `maPhieuNghiemThu` varchar(20) NOT NULL,
  `soLuongKhongDat` int(11) DEFAULT 0,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maLenh`,`maSanPham`,`maPhieuNghiemThu`),
  KEY `fk_psxb_sp` (`maSanPham`),
  KEY `fk_psxb_pnt` (`maPhieuNghiemThu`),
  CONSTRAINT `fk_psxb_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_psxb_pnt` FOREIGN KEY (`maPhieuNghiemThu`) REFERENCES `PhieuNghiemThu` (`maPhieuNghiemThu`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_psxb_sp` FOREIGN KEY (`maSanPham`) REFERENCES `SanPham` (`maSanPham`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lệnh sản xuất bù cho lượng sản phẩm lỗi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuSanXuatBu`
--

LOCK TABLES `PhieuSanXuatBu` WRITE;
/*!40000 ALTER TABLE `PhieuSanXuatBu` DISABLE KEYS */;
INSERT INTO `PhieuSanXuatBu` VALUES
('LSX20260901','SP001','PNT20260901',20,'Bù 20 hộp hỏng trong khâu chiết rót bao bì');
/*!40000 ALTER TABLE `PhieuSanXuatBu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuThu`
--

DROP TABLE IF EXISTS `PhieuThu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuThu` (
  `maPhieuThu` varchar(50) NOT NULL,
  `ngayThu` datetime DEFAULT current_timestamp(),
  `maDoiTuong` varchar(50) DEFAULT NULL,
  `lyDoThu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soTien` decimal(18,2) DEFAULT 0.00,
  `phuongThucThu` varchar(20) DEFAULT 'TM' COMMENT 'Phương thức thu: TM, CK',
  `maTaiKhoanQuy` varchar(50) DEFAULT NULL,
  `trangThai` varchar(20) DEFAULT 'Moi' COMMENT 'Trạng thái: Moi, DaDuyet, Huy, ChoDoiSoat',
  `nguoiLap` varchar(50) DEFAULT NULL,
  `ngayLap` datetime DEFAULT current_timestamp(),
  `nguoiDuyet` varchar(50) DEFAULT NULL,
  `ngayDuyet` datetime DEFAULT NULL,
  `maThanhToan` varchar(50) DEFAULT NULL COMMENT 'FK -> ThanhToan (Bán hàng) - nullable',
  `maCongNo` varchar(50) DEFAULT NULL COMMENT 'FK -> CongNo (Bán hàng) - nullable',
  `maHoaDon` varchar(50) DEFAULT NULL COMMENT 'FK -> HoaDon (Bán hàng) - nullable',
  PRIMARY KEY (`maPhieuThu`),
  KEY `fk_pt_dt` (`maDoiTuong`),
  KEY `fk_pt_tkq` (`maTaiKhoanQuy`),
  KEY `fk_pt_nvlap` (`nguoiLap`),
  KEY `fk_pt_nvduyet` (`nguoiDuyet`),
  KEY `fk_pt_tt` (`maThanhToan`),
  KEY `fk_pt_cn` (`maCongNo`),
  KEY `fk_pt_hd` (`maHoaDon`),
  CONSTRAINT `fk_pt_cn` FOREIGN KEY (`maCongNo`) REFERENCES `CongNo` (`maCongNo`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_dt` FOREIGN KEY (`maDoiTuong`) REFERENCES `DoiTuongGiaoDich` (`maDoiTuong`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_hd` FOREIGN KEY (`maHoaDon`) REFERENCES `HoaDon` (`maHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_nvduyet` FOREIGN KEY (`nguoiDuyet`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_nvlap` FOREIGN KEY (`nguoiLap`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_tkq` FOREIGN KEY (`maTaiKhoanQuy`) REFERENCES `TaiKhoanQuy` (`maTaiKhoanQuy`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pt_tt` FOREIGN KEY (`maThanhToan`) REFERENCES `ThanhToan` (`maThanhToan`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý Phiếu Thu Tiền';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuThu`
--

LOCK TABLES `PhieuThu` WRITE;
/*!40000 ALTER TABLE `PhieuThu` DISABLE KEYS */;
INSERT INTO `PhieuThu` VALUES
('PT-202609-001','2026-08-02 03:29:10','DT-KH001','Thu tiền bán sữa tươi 180ml đợt giao siêu thị Co.opmart miền Nam',185000000.00,'CK','TKQ-CTG01','DaDuyet','NV002','2026-08-02 02:59:10','NV001','2026-08-02 03:44:10',NULL,NULL,NULL),
('PT-202609-002','2026-08-04 02:29:10','DT-KH002','Nộp doanh thu tiền mặt cuối ngày chuỗi Giấc Mơ Sữa Việt Q.1, Q.3',42000000.00,'TM','TKQ-TCB02','DaDuyet','NV002','2026-08-04 01:59:10','NV001','2026-08-04 02:44:10',NULL,NULL,NULL),
('PT-202609-003','2026-08-05 01:29:10','DT-KH003','Thu tiền phân phối sữa chua Probi cho hệ thống WinMart toàn quốc',245000000.00,'CK','TKQ-VPB01','DaDuyet','NV002','2026-08-05 00:59:10','NV001','2026-08-05 01:44:10',NULL,NULL,NULL),
('PT-202609-004','2026-08-07 00:29:10','DT-KH004','Thu công nợ xuất khẩu nội địa nhà phân phối độc quyền Hậu Giang',310000000.00,'CK','TKQ-VCB02','DaDuyet','NV002','2026-08-06 23:59:10','NV001','2026-08-07 00:44:10',NULL,NULL,NULL),
('PT-202609-005','2026-08-07 23:29:10','DT-KH005','Thanh toán tiền sữa đặc có đường Phương Nam cho chuỗi Bách Hóa Xanh',195000000.00,'CK','TKQ-VPB01','DaDuyet','NV002','2026-08-07 22:59:10','NV001','2026-08-07 23:44:10',NULL,NULL,NULL),
('PT-202609-006','2026-08-09 22:29:10','DT-KH006','Thu thanh toán L/C xuất khẩu lô sữa bột Dielac sang Dubai (UAE)',950000000.00,'CK','TKQ-SCB01','DaDuyet','NV002','2026-08-09 21:59:10','NV001','2026-08-09 22:44:10',NULL,NULL,NULL),
('PT-202609-007','2026-08-11 21:29:10','DT-KH007','Thu tiền giao sữa Green Farm cao cấp cho đại siêu thị GO! An Lạc',178000000.00,'CK','TKQ-CTG01','DaDuyet','NV002','2026-08-11 20:59:10','NV001','2026-08-11 21:44:10',NULL,NULL,NULL),
('PT-202609-008','2026-08-13 04:29:10','DT-KH008','Thu thanh toán đơn hàng sữa bột trẻ em trung tâm MM Mega Market',285000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-13 03:59:10','NV001','2026-08-13 04:44:10',NULL,NULL,NULL),
('PT-202609-009','2026-08-15 03:29:10','DT-KH009','Thanh toán lô kem ăn Vinamilk giao hệ thống AEON Mall Tân Phú',125000000.00,'CK','TKQ-VCB02','DaDuyet','NV002','2026-08-15 02:59:10','NV001','2026-08-15 03:44:10',NULL,NULL,NULL),
('PT-202609-010','2026-08-17 02:29:10','DT-KH010','Thu tiền phân phối sữa hạt 9 loại Super Nut cho Lotte Mart Nam Sài Gòn',165000000.00,'CK','TKQ-TCB01','DaDuyet','NV002','2026-08-17 01:59:10','NV001','2026-08-17 02:44:10',NULL,NULL,NULL),
('PT-202609-011','2026-08-19 01:29:10','DT-KH011','Thu tiền giao sữa chua uống men sống Probi cho Circle K toàn miền Nam',88000000.00,'CK','TKQ-TCB01','DaDuyet','NV002','2026-08-19 00:59:10','NV001','2026-08-19 01:44:10',NULL,NULL,NULL),
('PT-202609-012','2026-08-21 00:29:10','DT-KH012','Thanh toán đợt 2 sữa tươi tiệt trùng 110ml chuỗi tiện ích GS25',96000000.00,'CK','TKQ-TCB01','DaDuyet','NV002','2026-08-20 23:59:10','NV001','2026-08-21 00:44:10',NULL,NULL,NULL),
('PT-202609-013','2026-08-21 23:29:10','DT-KH013','Thu thanh toán ngân sách Đề án Sữa Học Đường TP.HCM đợt tháng 8/2026',750000000.00,'CK','TKQ-VCB04','DaDuyet','NV002','2026-08-21 22:59:10','NV001','2026-08-21 23:44:10',NULL,NULL,NULL),
('PT-202609-014','2026-08-23 22:29:10','DT-KH014','Thu tiền cung cấp sản phẩm dinh dưỡng y học cho Bệnh viện Chợ Rẫy',115000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-23 21:59:10','NV001','2026-08-23 22:44:10',NULL,NULL,NULL),
('PT-202609-015','2026-08-24 21:29:10','DT-KH015','Thu công nợ xuất hàng đợt 1 Tổng đại lý phân phối tiêu dùng miền Bắc',450000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-24 20:59:10','NV001','2026-08-24 21:44:10',NULL,NULL,NULL),
('PT-202609-016','2026-08-27 04:29:10','DT-NV001','Hoàn ứng công tác phí giám sát kho lạnh trung chuyển Đà Nẵng',6500000.00,'TM','TKQ-TM01','DaDuyet','NV002','2026-08-27 03:59:10','NV001','2026-08-27 04:44:10',NULL,NULL,NULL),
('PT-202609-017','2026-08-28 03:29:10','DT-NV004','Hoàn ứng chi phí tiếp khách và khảo sát thị trường đại lý Tây Nam Bộ',8200000.00,'TM','TKQ-TM01','DaDuyet','NV002','2026-08-28 02:59:10','NV001','2026-08-28 03:44:10',NULL,NULL,NULL),
('PT-202609-018','2026-08-29 02:29:10','DT-NCC001','Thu tiền chiết khấu thương mại sản lượng bao bì Aseptic từ Tetra Pak',85000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-29 01:59:10','NV001','2026-08-29 02:44:10',NULL,NULL,NULL),
('PT-202609-019','2026-08-31 01:29:10','DT-NCC002','Thu tiền thưởng đạt chỉ tiêu thu mua đường tinh luyện từ TTC Sugar',35000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-08-31 00:59:10','NV001','2026-08-31 01:44:10',NULL,NULL,NULL),
('PT-202609-020','2026-09-01 00:29:10','DT-KH001','Thu tiền thanh lý thùng carton phế liệu kho Mega Plant đợt tháng 8',15500000.00,'TM','TKQ-TM02','DaDuyet','NV002','2026-08-31 23:59:10','NV001','2026-09-01 00:44:10',NULL,NULL,NULL),
('PT-202609-021','2026-09-01 23:29:10','DT-KH002','Thu ký quỹ mở thêm 2 điểm bán mới Cửa hàng Giấc Mơ Sữa Việt Bình Thạnh',50000000.00,'CK','TKQ-TCB02','DaDuyet','NV002','2026-09-01 22:59:10','NV001','2026-09-01 23:44:10',NULL,NULL,NULL),
('PT-202609-022','2026-09-03 22:29:10','DT-KH003','Thu tiền thanh toán đơn hàng sữa tươi tiệt trùng tuần 1 tháng 9/2026',320000000.00,'CK','TKQ-VPB01','DaDuyet','NV002','2026-09-03 21:59:10','NV001','2026-09-03 22:44:10',NULL,NULL,NULL),
('PT-202609-023','2026-09-04 21:29:10','DT-KH004','Thu tiền hàng sữa tươi sinh thái Green Farm đại lý Hậu Giang',145000000.00,'CK','TKQ-VCB02','DaDuyet','NV002','2026-09-04 20:59:10','NV001','2026-09-04 21:44:10',NULL,NULL,NULL),
('PT-202609-024','2026-09-06 04:29:10','DT-KH005','Thu tiền phân phối sữa chua ăn nha đam và có đường Bách Hóa Xanh',210000000.00,'CK','TKQ-VPB01','DaDuyet','NV002','2026-09-06 03:59:10','NV001','2026-09-06 04:44:10',NULL,NULL,NULL),
('PT-202609-025','2026-09-07 03:29:10','DT-KH006','Thu chênh lệch tỷ giá thanh lý hợp đồng xuất khẩu sữa bột Dubai',28000000.00,'CK','TKQ-SCB01','DaDuyet','NV002','2026-09-07 02:59:10','NV001','2026-09-07 03:44:10',NULL,NULL,NULL),
('PT-202609-026','2026-09-08 02:29:10','DT-NV002','Thu lãi tiền gửi ngân hàng phát sinh kỳ tháng 8/2026 tài khoản VCB',45000000.00,'CK','TKQ-VCB01','DaDuyet','NV002','2026-09-08 01:59:10','NV001','2026-09-08 02:44:10',NULL,NULL,NULL),
('PT-202609-027','2026-09-10 01:29:10','DT-KH007','Thu tiền hàng đại siêu thị GO! Nguyễn Thị Thập (Chờ đối soát UNC ngân hàng)',165000000.00,'CK','TKQ-CTG01','ChoDoiSoat','NV002','2026-09-10 00:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-028','2026-09-11 00:29:10','DT-KH008','Thu thanh toán sữa đặc Phương Nam siêu thị MM Mega (Chờ đối soát)',135000000.00,'CK','TKQ-VCB01','ChoDoiSoat','NV002','2026-09-10 23:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-029','2026-09-11 23:29:10','DT-KH009','Thu tiền đợt giao sữa hạt Super Nut cho AEON Mall Bình Tân',98000000.00,'CK','TKQ-VCB02','ChoDoiSoat','NV002','2026-09-11 22:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-030','2026-09-12 22:29:10','DT-KH010','Thu thanh toán sữa chua ăn lốc 4 Lotte Mart (Chờ sổ phụ đối chiếu)',112000000.00,'CK','TKQ-TCB01','ChoDoiSoat','NV002','2026-09-12 21:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-031','2026-09-13 21:29:10','DT-KH013','Thu đợt đầu năm học mới đề án Sữa Học Đường TP.HCM (Chờ xác nhận kho bạc)',820000000.00,'CK','TKQ-VCB04','ChoDoiSoat','NV002','2026-09-13 20:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-032','2026-09-14 04:29:10','DT-KH011','Lập phiếu thu đơn đặt hàng mới tuần 3 tháng 9 chuỗi Circle K',75000000.00,'CK','TKQ-TCB01','Moi','NV002','2026-09-14 03:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-033','2026-09-15 03:29:10','DT-KH012','Lập phiếu thu giao kem ốc quế và phô mai miếng chuỗi GS25',54000000.00,'CK','TKQ-TCB01','Moi','NV002','2026-09-15 02:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-034','2026-09-15 02:29:10','DT-KH015','Thu tiền đợt 2 đơn hàng sữa bột Dielac Gold cho nhà phân phối Hà Nội',380000000.00,'CK','TKQ-VCB01','Moi','NV002','2026-09-15 01:59:10',NULL,NULL,NULL,NULL,NULL),
('PT-202609-035','2026-09-16 01:29:10','DT-KH002','Thu nộp tiền mặt doanh thu bán lẻ cuối ngày Cửa hàng Vinamilk Q.7',32000000.00,'TM','TKQ-TM01','Moi','NV002','2026-09-16 00:59:10',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `PhieuThu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuXuatNVL`
--

DROP TABLE IF EXISTS `PhieuXuatNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuXuatNVL` (
  `maPhieuXuatNVL` varchar(20) NOT NULL,
  `maXuong` varchar(20) DEFAULT NULL COMMENT 'Mã xưởng/dây chuyền nhận',
  `maNVTao` varchar(20) DEFAULT NULL,
  `maNVNhan` varchar(20) DEFAULT NULL,
  `ngayXuat` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `maPhieuYeuCauNVL` varchar(20) DEFAULT NULL COMMENT 'Nối với Yêu cầu bên Sản xuất',
  PRIMARY KEY (`maPhieuXuatNVL`),
  KEY `fk_pxnvl_nvtao` (`maNVTao`),
  KEY `fk_pxnvl_nvnhan` (`maNVNhan`),
  KEY `fk_pxnvl_pycnvl` (`maPhieuYeuCauNVL`),
  CONSTRAINT `fk_pxnvl_nvnhan` FOREIGN KEY (`maNVNhan`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxnvl_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pxnvl_pycnvl` FOREIGN KEY (`maPhieuYeuCauNVL`) REFERENCES `PhieuYeuCauNVL` (`maPhieuYCNVL`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuXuatNVL`
--

LOCK TABLES `PhieuXuatNVL` WRITE;
/*!40000 ALTER TABLE `PhieuXuatNVL` DISABLE KEYS */;
INSERT INTO `PhieuXuatNVL` VALUES
('PXNVL2026090301','XUONG-UHT-01','NV001','NV003','2026-09-12','Đã hoàn thành','Xuất 4,500 lít sữa tươi thô cấp phát cho dây chuyền tiệt trùng UHT',NULL),
('PXNVL2026090602','XUONG-SUACHUA-02','NV001','NV003','2026-09-14','Đã hoàn thành','Xuất 1,500 kg đường Biên Hòa phục vụ nấu mẻ sữa chua ăn',NULL);
/*!40000 ALTER TABLE `PhieuXuatNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuXuatSP`
--

DROP TABLE IF EXISTS `PhieuXuatSP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuXuatSP` (
  `maPhieuXuatSP` varchar(20) NOT NULL,
  `maKhachHang` varchar(20) DEFAULT NULL,
  `maNVTao` varchar(20) DEFAULT NULL,
  `ngayXuat` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chờ duyệt',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `maDonHang` varchar(20) DEFAULT NULL COMMENT 'Nối với Đơn hàng bên Bán hàng',
  PRIMARY KEY (`maPhieuXuatSP`),
  KEY `fk_pxsp_nvtao` (`maNVTao`),
  CONSTRAINT `fk_pxsp_nvtao` FOREIGN KEY (`maNVTao`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuXuatSP`
--

LOCK TABLES `PhieuXuatSP` WRITE;
/*!40000 ALTER TABLE `PhieuXuatSP` DISABLE KEYS */;
INSERT INTO `PhieuXuatSP` VALUES
('PXSP2026090501','KH001','NV001','2026-09-13','Đã hoàn thành','Xuất 3,800 thùng Sữa tươi 180ml ưu tiên thuật toán FEFO lô HSD gần nhất',NULL),
('PXSP2026090702','KH003','NV001','2026-09-15','Đã hoàn thành','Xuất 2,150 lốc Sữa chua ăn Vinamilk cho siêu thị WinMart',NULL),
('PXSP2026091003','KH002','NV001','2026-09-16','Chờ duyệt','Xuất 800 thùng Sữa tươi tiệt trùng FEFO đợt mới',NULL);
/*!40000 ALTER TABLE `PhieuXuatSP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuYeuCauBTP`
--

DROP TABLE IF EXISTS `PhieuYeuCauBTP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuYeuCauBTP` (
  `maPhieuYCBTP` varchar(20) NOT NULL,
  `maCongDoan` varchar(20) DEFAULT NULL,
  `maLenh` varchar(20) DEFAULT NULL,
  `maNhanVien` varchar(20) DEFAULT NULL,
  `ngayYeuCau` date DEFAULT NULL,
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCBTP`),
  KEY `fk_pycbtp_cd` (`maCongDoan`),
  KEY `fk_pycbtp_lsx` (`maLenh`),
  KEY `fk_pycbtp_nv` (`maNhanVien`),
  CONSTRAINT `fk_pycbtp_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycbtp_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycbtp_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu yêu cầu bán thành phẩm giữa các công đoạn';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuYeuCauBTP`
--

LOCK TABLES `PhieuYeuCauBTP` WRITE;
/*!40000 ALTER TABLE `PhieuYeuCauBTP` DISABLE KEYS */;
INSERT INTO `PhieuYeuCauBTP` VALUES
('YCBTP20260901','CD01-03','LSX20260901','NV003','2026-09-05','Chuyển BTP tiệt trùng sang phân xưởng chiết rót Aseptic');
/*!40000 ALTER TABLE `PhieuYeuCauBTP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuYeuCauNVL`
--

DROP TABLE IF EXISTS `PhieuYeuCauNVL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuYeuCauNVL` (
  `maPhieuYCNVL` varchar(20) NOT NULL COMMENT 'Mã phiếu yêu cầu NVL',
  `maCongDoan` varchar(20) DEFAULT NULL COMMENT 'Công đoạn yêu cầu',
  `maLenh` varchar(20) DEFAULT NULL COMMENT 'Lệnh sản xuất liên quan',
  `maNhanVien` varchar(20) DEFAULT NULL COMMENT 'Nhân viên lập yêu cầu',
  `ngayYeuCau` date DEFAULT NULL COMMENT 'Ngày lập yêu cầu',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chưa xử lý' COMMENT 'Trạng thái (Chưa xử lý, Đã xuất kho, Từ chối)',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maPhieuYCNVL`),
  KEY `fk_pycnvl_cd` (`maCongDoan`),
  KEY `fk_pycnvl_lsx` (`maLenh`),
  KEY `fk_pycnvl_nv` (`maNhanVien`),
  CONSTRAINT `fk_pycnvl_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycnvl_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycnvl_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu yêu cầu nguyên vật liệu từ xưởng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuYeuCauNVL`
--

LOCK TABLES `PhieuYeuCauNVL` WRITE;
/*!40000 ALTER TABLE `PhieuYeuCauNVL` DISABLE KEYS */;
INSERT INTO `PhieuYeuCauNVL` VALUES
('YCNVL20260901','CD01-01','LSX20260901','NV003','2026-09-04','Đã xuất kho','Cấp phát nguyên liệu cho Lệnh LSX20260901'),
('YCNVL20260908','CD03-01','LSX20260908','NV007','2026-09-12','Đã xuất kho','Cấp phát vỏ hộp Tetra Pak và hương liệu tự nhiên');
/*!40000 ALTER TABLE `PhieuYeuCauNVL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhieuYeuCauXuatSP`
--

DROP TABLE IF EXISTS `PhieuYeuCauXuatSP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhieuYeuCauXuatSP` (
  `maPhieuYCXSP` varchar(20) NOT NULL COMMENT 'Mã phiếu yêu cầu nhập kho thành phẩm',
  `maPhieuNghiemThu` varchar(20) DEFAULT NULL COMMENT 'Căn cứ biên bản nghiệm thu QC',
  `maNhanVien` varchar(20) DEFAULT NULL,
  `ngayYeuCau` date DEFAULT NULL,
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Chưa xử lý' COMMENT 'Trạng thái (Chưa xử lý, Đã nhập kho)',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maPhieuYCXSP`),
  KEY `fk_pycxsp_pnt` (`maPhieuNghiemThu`),
  KEY `fk_pycxsp_nv` (`maNhanVien`),
  CONSTRAINT `fk_pycxsp_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pycxsp_pnt` FOREIGN KEY (`maPhieuNghiemThu`) REFERENCES `PhieuNghiemThu` (`maPhieuNghiemThu`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phiếu bàn giao thành phẩm từ Xưởng sang Kho';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhieuYeuCauXuatSP`
--

LOCK TABLES `PhieuYeuCauXuatSP` WRITE;
/*!40000 ALTER TABLE `PhieuYeuCauXuatSP` DISABLE KEYS */;
INSERT INTO `PhieuYeuCauXuatSP` VALUES
('YCXSP20260901','PNT20260901','NV003','2026-09-06','Đã nhập kho','Bàn giao 19,980 hộp sữa tiệt trùng sang Kho Tổng Bình Dương');
/*!40000 ALTER TABLE `PhieuYeuCauXuatSP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhongBan`
--

DROP TABLE IF EXISTS `PhongBan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhongBan` (
  `maPhongBan` varchar(20) NOT NULL COMMENT 'Mã phòng ban',
  `tenPhongBan` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Tên phòng ban',
  PRIMARY KEY (`maPhongBan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Phòng Ban';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhongBan`
--

LOCK TABLES `PhongBan` WRITE;
/*!40000 ALTER TABLE `PhongBan` DISABLE KEYS */;
INSERT INTO `PhongBan` VALUES
('PB01','Ban Giám Đốc & Điều Hành Tập Đoàn'),
('PB02','Phòng Quản Lý Kho Vận & Chuỗi Cung Ứng'),
('PB03','Phòng Tài Chính - Kế Toán Doanh Nghiệp'),
('PB04','Phòng Kỹ Thuật Sản Xuất & Siêu Nhà Máy Mega'),
('PB05','Phòng Kinh Doanh & Mạng Lưới Phân Phối'),
('PB06','Phòng Nhân Sự & Đào Tạo Nguồn Nhân Lực');
/*!40000 ALTER TABLE `PhongBan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SanPham`
--

DROP TABLE IF EXISTS `SanPham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `SanPham` (
  `maSanPham` varchar(20) NOT NULL COMMENT 'Mã sản phẩm',
  `tenSanPham` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Tên sản phẩm',
  `donViTinh` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Hộp' COMMENT 'Đơn vị tính',
  `donGia` decimal(15,2) DEFAULT 0.00 COMMENT 'Đơn giá bán niêm yết',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Đang kinh doanh' COMMENT 'Trạng thái sản phẩm',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Ghi chú',
  PRIMARY KEY (`maSanPham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Sản Phẩm hoàn chỉnh';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SanPham`
--

LOCK TABLES `SanPham` WRITE;
/*!40000 ALTER TABLE `SanPham` DISABLE KEYS */;
INSERT INTO `SanPham` VALUES
('SP001','Sữa Tươi Tiệt Trùng 100% Vinamilk Ít Đường 180ml','Thùng',385000.00,'Đang kinh doanh',NULL),
('SP002','Sữa Tươi Tiệt Trùng 100% Vinamilk Có Đường 110ml','Thùng',260000.00,'Đang kinh doanh',NULL),
('SP003','Sữa Chua Ăn Vinamilk Có Đường 100g','Lốc',28000.00,'Đang kinh doanh',NULL),
('SP004','Sữa Hạt Tách Béo Vinamilk Hạnh Nhân 180ml','Thùng',450000.00,'Đang kinh doanh',NULL),
('SP005','Sữa Tươi Nguyên Chất Vinamilk Green Farm 180ml','Thùng',420000.00,'Đang kinh doanh',NULL),
('SP006','Sữa Chua Uống Men Sống Probi 65ml','Lốc',24500.00,'Đang kinh doanh',NULL),
('SP007','Sữa Bột Dielac Alpha Gold Step 3 900g','Hộp',310000.00,'Đang kinh doanh',NULL),
('SP008','Sữa Đặc Có Đường Phương Nam 1284g','Lon',62000.00,'Đang kinh doanh',NULL),
('SP009','Sữa Tươi Tiệt Trùng Hương Dâu Vinamilk 180ml','Thùng',385000.00,'Đang kinh doanh',NULL),
('SP010','Phô Mai Con Bò Cười Vinamilk 112g (8 Miếng)','Hộp',35000.00,'Đang kinh doanh',NULL);
/*!40000 ALTER TABLE `SanPham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaiKhoan`
--

DROP TABLE IF EXISTS `TaiKhoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiKhoan` (
  `maTaiKhoan` varchar(50) NOT NULL,
  `maNV` varchar(20) NOT NULL COMMENT 'Mã nhân viên',
  `matKhau` varchar(255) NOT NULL COMMENT 'Mật khẩu mặc định là hash(123456)',
  `vaiTro` varchar(30) NOT NULL DEFAULT 'NhanVien' COMMENT 'QuanLyNhanSu, ChuyenVienNhanSu, NhanVien',
  `trangThai` varchar(20) NOT NULL DEFAULT 'Hoạt động' COMMENT 'Hoạt động, Khóa',
  `phaiDoiMatKhau` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1: bắt buộc đổi mật khẩu',
  PRIMARY KEY (`maTaiKhoan`),
  UNIQUE KEY `uk_tk_nv` (`maNV`),
  CONSTRAINT `fk_tk_nv` FOREIGN KEY (`maNV`) REFERENCES `NhanVien` (`maNV`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản đăng nhập nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiKhoan`
--

LOCK TABLES `TaiKhoan` WRITE;
/*!40000 ALTER TABLE `TaiKhoan` DISABLE KEYS */;
INSERT INTO `TaiKhoan` VALUES
('TK-NV_TEST_1790089492','NV_TEST_1790089492','$2y$12$Xq7GfErBjX0BtxOvJ3L6mOk3R6JZcbxh2nCWfoUuGqCTIb3DxmAf2','NhanVien','Hoạt động',1),
('TK-NV_TEST_1790089532','NV_TEST_1790089532','$2y$12$QHV8BU7OJ.zVmxOVdgYFsOaArweqdn/riqymO8wtnv.ZQpoYJ2wH2','NhanVien','Hoạt động',1),
('TK001','NV001','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','QuanLyNhanSu','Hoạt động',0),
('TK002','NV002','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','ChuyenVienNhanSu','Hoạt động',0),
('TK003','NV003','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','NhanVien','Hoạt động',1),
('TK004','NV004','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','NhanVien','Hoạt động',1),
('TK005','NV005','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','QuanLyNhanSu','Hoạt động',0),
('TK006','NV006','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','NhanVien','Hoạt động',1),
('TK007','NV007','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','NhanVien','Hoạt động',1),
('TK008','NV008','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','ChuyenVienNhanSu','Hoạt động',1),
('TK009','NV009','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','NhanVien','Hoạt động',1),
('TK010','NV010','$2y$12$NqB8rE8Qnvy2pPq0uG9Q6u2Wq4KqjWbS8Q7j9K3l4G2a9k1O8u6s2','ChuyenVienNhanSu','Hoạt động',0);
/*!40000 ALTER TABLE `TaiKhoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaiKhoanQuy`
--

DROP TABLE IF EXISTS `TaiKhoanQuy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaiKhoanQuy` (
  `maTaiKhoanQuy` varchar(50) NOT NULL,
  `tenTaiKhoanQuy` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `loaiTaiKhoan` varchar(20) DEFAULT 'TM' COMMENT 'TM (Tiền mặt), NH (Ngân hàng)',
  `soTaiKhoan` varchar(50) DEFAULT NULL,
  `nganHang` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `soDuHienTai` decimal(18,2) DEFAULT 0.00,
  `trangThai` bit(1) DEFAULT b'1',
  PRIMARY KEY (`maTaiKhoanQuy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaiKhoanQuy`
--

LOCK TABLES `TaiKhoanQuy` WRITE;
/*!40000 ALTER TABLE `TaiKhoanQuy` DISABLE KEYS */;
INSERT INTO `TaiKhoanQuy` VALUES
('TKQ-ACB01','ACB - TK Chi Trả Phí Kiểm Nghiệm KCS Quốc Tế & Lab','NH','240688899','Ngân hàng Á Châu (ACB) - Hội Sở Mạc Đĩnh Chi',1450000000.00,''),
('TKQ-ACB02','ACB - TK Ký Quỹ Mở L/C Nhập Khẩu Bột Sữa New Zealand','NH','240699911','Ngân hàng Á Châu (ACB) - CN Sài Gòn',7800000000.00,''),
('TKQ-AGR01','Agribank - TK Thu Mua Sữa Hợp Tác Xã Mộc Châu Sơn La','NH','3100201122334','Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Mộc Châu',4560000000.00,''),
('TKQ-AGR02','Agribank - TK Thu Mua Bò Sữa Đơn Dương (Lâm Đồng)','NH','3100205566778','Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Lâm Đồng',3800000000.00,''),
('TKQ-AGR03','Agribank - TK Chi Trợ Giá Nông Nghiệp & Giống Cỏ','NH','3100209988112','Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Bến Cát',1980000000.00,''),
('TKQ-BIDV01','BIDV - TK Chi Lương Tập Đoàn & Phúc Lợi Nhân Sự','NH','1201000998877','Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Sở Giao Dịch 2',6200000000.00,''),
('TKQ-BIDV02','BIDV - TK Thu Mua Sữa Tươi Nông Trại Green Farm','NH','1201000334455','Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Tây Ninh',2900000000.00,''),
('TKQ-BIDV03','BIDV - TK Thanh Toán Bao Bì & Hóa Chất Men Sống','NH','1201000778899','Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Bắc Bình Dương',3450000000.00,''),
('TKQ-CTG01','VietinBank - TK Thu Hồi Công Nợ Đại Siêu Thị Co.opmart & GO!','NH','113000556677','Ngân hàng Công Thương Việt Nam (VietinBank) - CN TP.HCM',4780000000.00,''),
('TKQ-CTG02','VietinBank - TK Chi Phí Vận Tải Lạnh & Cung Ứng Logistics','NH','113000889900','Ngân hàng Công Thương Việt Nam (VietinBank) - CN Thủ Thiêm',1890000000.00,''),
('TKQ-CTG03','VietinBank - TK Giao Dịch Nhà Máy Sữa Tiên Sơn (Bắc Ninh)','NH','113000223344','Ngân hàng Công Thương Việt Nam (VietinBank) - CN Bắc Ninh',2150000000.00,''),
('TKQ-HSBC01','HSBC - TK Ngoại Tệ Thanh Toán Men Sống Chr. Hansen Đan Mạch','NH','001988776001','Ngân hàng TNHH MTV HSBC Việt Nam - Hội Sở',14200000000.00,''),
('TKQ-MB01','MBBank - TK Nộp Thuế & Nghĩa Vụ Ngân Sách Nhà Nước','NH','0801100223344','Ngân hàng Quân Đội (MBBank) - CN Sở Giao Dịch 2',8900000000.00,''),
('TKQ-MB02','MBBank - TK Chi Trả Điện Lực EVN & Năng Lượng Xanh','NH','0801100556677','Ngân hàng Quân Đội (MBBank) - CN Nam Sài Gòn',2100000000.00,''),
('TKQ-SCB01','Standard Chartered - TK Ngoại Tệ Xuất Khẩu Thị Trường Trung Đông','NH','002887766002','Ngân hàng Standard Chartered Việt Nam - CN TP.HCM',18600000000.00,''),
('TKQ-SHB01','SHB - TK Quản Lý Hoạt Động Điều Hành Ban Giám Đốc','NH','1002554433','Ngân hàng Sài Gòn - Hà Nội (SHB) - CN Vạn Hạnh',1890000000.00,''),
('TKQ-TCB01','Techcombank - TK Thu Bán Lẻ Kênh Thương Mại Điện Tử & App','NH','190300112233','Ngân hàng Kỹ Thương (Techcombank) - Hội Sở Miền Nam',3120000000.00,''),
('TKQ-TCB02','Techcombank - TK Thanh Toán Chuỗi Cửa Hàng Giấc Mơ Sữa Việt','NH','190300445566','Ngân hàng Kỹ Thương (Techcombank) - CN Phú Mỹ Hưng',2450000000.00,''),
('TKQ-TCB03','Techcombank - TK Thanh Toán Chiến Dịch Marketing & Quảng Cáo','NH','190300778899','Ngân hàng Kỹ Thương (Techcombank) - CN Gia Định',1650000000.00,''),
('TKQ-TM01','Quỹ Tiền Mặt Trụ Sở Chính (10 Tân Trào, Q.7)','TM',NULL,NULL,450000000.00,''),
('TKQ-TM02','Quỹ Tiền Mặt Siêu Nhà Máy Mega Plant Bình Dương','TM',NULL,NULL,280000000.00,''),
('TKQ-TM03','Quỹ Tiền Mặt Chi Nhánh Hà Nội & Phân Phối Miền Bắc','TM',NULL,NULL,310000000.00,''),
('TKQ-TM04','Quỹ Tiền Mặt Nhà Máy Sữa Đà Lạt & Nông Trại Organic','TM',NULL,NULL,195000000.00,''),
('TKQ-TM05','Quỹ Tiền Mặt Chi Nhánh Cần Thơ & Tây Nam Bộ','TM',NULL,NULL,220000000.00,''),
('TKQ-TM06','Quỹ Tiền Mặt Nhà Máy Sữa Lam Sơn (Yên Định, Thanh Hóa)','TM',NULL,NULL,175000000.00,''),
('TKQ-VCB01','Vietcombank - TK Thanh Toán Thu Tiền Bán Hàng Trụ Sở','NH','0071001234567','Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN TP.HCM',5450000000.00,''),
('TKQ-VCB02','Vietcombank - TK Thu Bán Sỉ Kênh Siêu Thị & Đại Lý','NH','0071009876543','Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN Tân Bình',3820000000.00,''),
('TKQ-VCB03','Vietcombank - TK Chuyên Nhập Khẩu Nguyên Liệu USD','NH','0071370011223','Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - Sở Giao Dịch',12500000000.00,''),
('TKQ-VCB04','Vietcombank - TK Quản Lý Ngân Sách Sữa Học Đường','NH','0071005544332','Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN Nam Sài Gòn',4100000000.00,''),
('TKQ-VPB01','VPBank - TK Thu Thanh Toán Hệ Thống WinMart & Bách Hóa Xanh','NH','150988877','Ngân hàng Việt Nam Thịnh Vượng (VPBank) - CN Bến Thành',5230000000.00,'');
/*!40000 ALTER TABLE `TaiKhoanQuy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ThanhToan`
--

DROP TABLE IF EXISTS `ThanhToan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ThanhToan` (
  `maThanhToan` varchar(20) NOT NULL,
  `maCongNo` varchar(20) DEFAULT NULL,
  `ngayThanhToan` datetime DEFAULT current_timestamp(),
  `phuongThuc` varchar(30) DEFAULT 'Tiền mặt',
  PRIMARY KEY (`maThanhToan`),
  KEY `fk_tt_cn` (`maCongNo`),
  CONSTRAINT `fk_tt_cn` FOREIGN KEY (`maCongNo`) REFERENCES `CongNo` (`maCongNo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ThanhToan`
--

LOCK TABLES `ThanhToan` WRITE;
/*!40000 ALTER TABLE `ThanhToan` DISABLE KEYS */;
INSERT INTO `ThanhToan` VALUES
('TT2026090301','CN-KH001-202609','2026-09-06 04:12:10','Chuyển khoản VCB'),
('TT2026090702','CN-KH003-202609','2026-09-10 04:12:10','Chuyển khoản BIDV');
/*!40000 ALTER TABLE `ThanhToan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TienDoSanXuat`
--

DROP TABLE IF EXISTS `TienDoSanXuat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TienDoSanXuat` (
  `maTienDoSX` varchar(20) NOT NULL,
  `maCongDoan` varchar(20) DEFAULT NULL,
  `maLenh` varchar(20) DEFAULT NULL,
  `maNhanVien` varchar(20) DEFAULT NULL,
  `ngaySX` date DEFAULT NULL,
  PRIMARY KEY (`maTienDoSX`),
  KEY `fk_tdsx_cd` (`maCongDoan`),
  KEY `fk_tdsx_lsx` (`maLenh`),
  KEY `fk_tdsx_nv` (`maNhanVien`),
  CONSTRAINT `fk_tdsx_cd` FOREIGN KEY (`maCongDoan`) REFERENCES `CongDoan` (`maCongDoan`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tdsx_lsx` FOREIGN KEY (`maLenh`) REFERENCES `LenhSanXuat` (`maLenh`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tdsx_nv` FOREIGN KEY (`maNhanVien`) REFERENCES `NhanVien` (`maNV`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Theo dõi tiến độ sản xuất';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TienDoSanXuat`
--

LOCK TABLES `TienDoSanXuat` WRITE;
/*!40000 ALTER TABLE `TienDoSanXuat` DISABLE KEYS */;
INSERT INTO `TienDoSanXuat` VALUES
('TDSX20260901','CD01-03','LSX20260901','NV007','2026-09-06'),
('TDSX20260908','CD03-01','LSX20260908','NV007','2026-09-13');
/*!40000 ALTER TABLE `TienDoSanXuat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TonKho`
--

DROP TABLE IF EXISTS `TonKho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TonKho` (
  `maTonKho` varchar(50) NOT NULL COMMENT 'Mã lô tồn kho',
  `tenTonKho` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'Nhãn mô tả lô',
  `maSP` varchar(20) DEFAULT NULL COMMENT 'Mã SP (nếu là lô thành phẩm)',
  `maNVL` varchar(20) DEFAULT NULL COMMENT 'Mã NVL (nếu là lô nguyên vật liệu)',
  `ngaySanXuat` date DEFAULT NULL COMMENT 'Ngày sản xuất lô',
  `hanSuDung` date DEFAULT NULL COMMENT 'Hạn sử dụng lô',
  `soLuongNhap` int(11) DEFAULT 0 COMMENT 'Số lượng ban đầu nhập',
  `soLuongTonHienTai` int(11) DEFAULT 0 COMMENT 'Số lượng tồn khả dụng hiện tại',
  `trangThai` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'Còn hạn' COMMENT 'Trạng thái (Còn hạn, Sắp hết hạn, Hết hạn)',
  `ghiChu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`maTonKho`),
  KEY `fk_tk_sp` (`maSP`),
  KEY `fk_tk_nvl` (`maNVL`),
  CONSTRAINT `fk_tk_nvl` FOREIGN KEY (`maNVL`) REFERENCES `NguyenVatLieu` (`maNVL`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_tk_sp` FOREIGN KEY (`maSP`) REFERENCES `SanPham` (`maSanPham`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý chi tiết tồn kho theo Lô và HSD';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TonKho`
--

LOCK TABLES `TonKho` WRITE;
/*!40000 ALTER TABLE `TonKho` DISABLE KEYS */;
INSERT INTO `TonKho` VALUES
('LOT-NVL-20260901-01','Lô Sữa Tươi Nguyên Chất Thô Mộc Châu - Đợt 1',NULL,'NVL001','2026-09-06','2026-10-01',20000,15500,'Ưu tiên xuất FEFO','Bảo quản kho lạnh UHT 2-4 độ C'),
('LOT-NVL-20260902-06','Lô Men Probiotics LGG Chr. Hansen Đan Mạch',NULL,'NVL006','2026-09-01','2026-12-15',200,45,'Tồn kho thấp','Men vi sinh sống đông khô'),
('LOT-NVL-20260905-02','Lô Đường Tinh Luyện Biên Hòa Grade A',NULL,'NVL002','2026-08-17','2027-09-16',10000,8500,'Còn hạn','Kho khô ráo'),
('LOT-NVL-20260907-03','Lô Hương Liệu Dâu Tự Nhiên Firmenich',NULL,'NVL003','2026-07-18','2027-03-15',500,80,'Tồn kho thấp','Cần nhập bổ sung khẩn cấp'),
('LOT-NVL-20260908-04','Lô Vỏ Hộp Giấy Tetra Pak Brik Aseptic 180ml',NULL,'NVL004','2026-09-01','2028-09-05',500000,420000,'Còn hạn','Kho bao bì tiệt trùng'),
('LOT-NVL-20260910-05','Lô Bột Sữa Gầy Skim Milk Powder NZMP Fonterra',NULL,'NVL005','2026-08-07','2027-09-16',5000,4500,'Còn hạn','Nhập khẩu chính ngạch New Zealand'),
('LOT-SP-20260902-FEFO1','Lô Thành Phẩm Sữa Tươi 100% Ít Đường 180ml (Batch FEFO-1)','SP001',NULL,'2026-08-02','2026-09-26',5000,1200,'Ưu tiên xuất FEFO','Xuất ngay cho siêu thị Co.opmart'),
('LOT-SP-20260903-PB01','Lô Sữa Chua Uống Men Sống Probi 65ml','SP006',NULL,'2026-09-08','2026-10-21',12000,11000,'Còn hạn','Bảo quản mát 6-8 độ C'),
('LOT-SP-20260904-SC01','Lô Thành Phẩm Sữa Chua Ăn Vinamilk Có Đường 100g','SP003',NULL,'2026-08-25','2026-09-24',3000,850,'Ưu tiên xuất FEFO','Kho lạnh 4-8 độ C'),
('LOT-SP-20260906-DA01','Lô Sữa Bột Dielac Alpha Gold Step 3 900g','SP007',NULL,'2026-08-27','2028-09-15',2000,1850,'Còn hạn','Sữa bột công thức lon thiếc'),
('LOT-SP-20260908-FEFO2','Lô Thành Phẩm Sữa Tươi 100% Ít Đường 180ml (Batch FEFO-2)','SP001',NULL,'2026-09-11','2027-01-14',15000,14200,'Còn hạn','Kho tổng thành phẩm UHT'),
('LOT-SP-20260909-GF01','Lô Sữa Tươi Nguyên Chất Vinamilk Green Farm 180ml','SP005',NULL,'2026-09-13','2027-02-13',8000,7600,'Còn hạn','Dòng sữa tươi sinh thái cao cấp');
/*!40000 ALTER TABLE `TonKho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'quanly_erp'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-22 22:07:10
