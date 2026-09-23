<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 1. Kho (4 Major Distribution & Cold Warehouses)
        DB::table('Kho')->truncate();
        DB::table('Kho')->insert([
            ['maKho' => 'KHO-TONG', 'tenKho' => 'Kho Tổng Mega Plant Vinamilk Bình Dương', 'loaiKho' => 'Kho thành phẩm', 'diaChi' => 'Lô CN-01, KCN Mỹ Phước 2, Bến Cát, Bình Dương'],
            ['maKho' => 'KHO-LTM', 'tenKho' => 'Kho Lạnh Sữa Tươi Cao Nguyên Mộc Châu', 'loaiKho' => 'Kho NVL', 'diaChi' => 'Thị trấn Mộc Châu, Sơn La'],
            ['maKho' => 'KHO-DNG', 'tenKho' => 'Kho Trung Chuyển Miền Trung - Đà Nẵng', 'loaiKho' => 'Kho thành phẩm', 'diaChi' => 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng'],
            ['maKho' => 'KHO-CTH', 'tenKho' => 'Kho Phân Phối Trọng Điểm Tây Nam Bộ (Cần Thơ)', 'loaiKho' => 'Kho thành phẩm', 'diaChi' => 'KCN Trà Nóc 1, Bình Thủy, Cần Thơ'],
        ]);

        // 2. DonHang (6 Realistic Distributor Orders)
        DB::table('ChiTietDonHang')->truncate();
        DB::table('DonHang')->truncate();

        $orders = [
            [
                'maDonHang' => 'DH20260901',
                'ngayMua' => Carbon::now()->subDays(14)->toDateTimeString(),
                'tongTien' => 770000000,
                'thanhTien' => 770000000,
                'trangThai' => 'Đã giao hàng',
                'maKhachHang' => 'KH001', // Saigon Co.op
                'maNhanVien' => 'NV004',
                'items' => [
                    ['maSanPham' => 'SP001', 'soLuong' => 1500, 'donGia' => 385000, 'thanhTien' => 577500000],
                    ['maSanPham' => 'SP003', 'soLuong' => 5000, 'donGia' => 28000, 'thanhTien' => 140000000],
                    ['maSanPham' => 'SP002', 'soLuong' => 200, 'donGia' => 260000, 'thanhTien' => 52500000],
                ]
            ],
            [
                'maDonHang' => 'DH20260905',
                'ngayMua' => Carbon::now()->subDays(10)->toDateTimeString(),
                'tongTien' => 520000000,
                'thanhTien' => 520000000,
                'trangThai' => 'Đã giao hàng',
                'maKhachHang' => 'KH003', // WinMart
                'maNhanVien' => 'NV004',
                'items' => [
                    ['maSanPham' => 'SP005', 'soLuong' => 800, 'donGia' => 420000, 'thanhTien' => 336000000],
                    ['maSanPham' => 'SP006', 'soLuong' => 6000, 'donGia' => 24500, 'thanhTien' => 147000000],
                    ['maSanPham' => 'SP010', 'soLuong' => 1057, 'donGia' => 35000, 'thanhTien' => 37000000],
                ]
            ],
            [
                'maDonHang' => 'DH20260908',
                'ngayMua' => Carbon::now()->subDays(7)->toDateTimeString(),
                'tongTien' => 450000000,
                'thanhTien' => 450000000,
                'trangThai' => 'Đang giao',
                'maKhachHang' => 'KH005', // Bach Hoa Xanh
                'maNhanVien' => 'NV009',
                'items' => [
                    ['maSanPham' => 'SP001', 'soLuong' => 800, 'donGia' => 385000, 'thanhTien' => 308000000],
                    ['maSanPham' => 'SP004', 'soLuong' => 250, 'donGia' => 450000, 'thanhTien' => 112500000],
                    ['maSanPham' => 'SP008', 'soLuong' => 475, 'donGia' => 62000, 'thanhTien' => 29500000],
                ]
            ],
            [
                'maDonHang' => 'DH20260910',
                'ngayMua' => Carbon::now()->subDays(5)->toDateTimeString(),
                'tongTien' => 310000000,
                'thanhTien' => 310000000,
                'trangThai' => 'Đã xác nhận',
                'maKhachHang' => 'KH002', // Giac Mo Sua Viet
                'maNhanVien' => 'NV004',
                'items' => [
                    ['maSanPham' => 'SP007', 'soLuong' => 1000, 'donGia' => 310000, 'thanhTien' => 310000000],
                ]
            ],
            [
                'maDonHang' => 'DH20260912',
                'ngayMua' => Carbon::now()->subDays(3)->toDateTimeString(),
                'tongTien' => 285000000,
                'thanhTien' => 285000000,
                'trangThai' => 'Chờ xác nhận',
                'maKhachHang' => 'KH004', // Dai Ly Mien Tay
                'maNhanVien' => 'NV009',
                'items' => [
                    ['maSanPham' => 'SP001', 'soLuong' => 500, 'donGia' => 385000, 'thanhTien' => 192500000],
                    ['maSanPham' => 'SP002', 'soLuong' => 355, 'donGia' => 260000, 'thanhTien' => 92500000],
                ]
            ],
            [
                'maDonHang' => 'DH20260914',
                'ngayMua' => Carbon::now()->subDays(1)->toDateTimeString(),
                'tongTien' => 1250000000,
                'thanhTien' => 1250000000,
                'trangThai' => 'Chờ xác nhận',
                'maKhachHang' => 'KH006', // Xuat khau Dubai
                'maNhanVien' => 'NV009',
                'items' => [
                    ['maSanPham' => 'SP007', 'soLuong' => 2500, 'donGia' => 310000, 'thanhTien' => 775000000],
                    ['maSanPham' => 'SP008', 'soLuong' => 7661, 'donGia' => 62000, 'thanhTien' => 475000000],
                ]
            ]
        ];

        $donHangInsert = [];
        $chiTietDonHangInsert = [];
        foreach ($orders as $ord) {
            $donHangInsert[] = [
                'maDonHang' => $ord['maDonHang'],
                'ngayMua' => $ord['ngayMua'],
                'tongTien' => $ord['tongTien'],
                'thanhTien' => $ord['thanhTien'],
                'trangThai' => $ord['trangThai'],
                'maKhachHang' => $ord['maKhachHang'],
                'maNhanVien' => $ord['maNhanVien'],
            ];
            foreach ($ord['items'] as $it) {
                $chiTietDonHangInsert[] = [
                    'maDonHang' => $ord['maDonHang'],
                    'maSanPham' => $it['maSanPham'],
                    'soLuong' => $it['soLuong'],
                    'donGia' => $it['donGia'],
                    'thanhTien' => $it['thanhTien'],
                ];
            }
        }
        DB::table('DonHang')->insert($donHangInsert);
        DB::table('ChiTietDonHang')->insert($chiTietDonHangInsert);

        // 3. GiaoHang (Deliveries)
        DB::table('GiaoHang')->truncate();
        DB::table('GiaoHang')->insert([
            [
                'maGiaoHang' => 'GH20260901',
                'ngayGiao' => Carbon::now()->subDays(12)->toDateTimeString(),
                'diaChiGiao' => 'Kho Tổng Saigon Co.op, KCN Lê Minh Xuân, Bình Chánh, TP.HCM',
                'trangThai' => 'Đã giao thành công',
                'maDonHang' => 'DH20260901',
                'maPhieuXuatSP' => 'PXSP2026090501',
                'maKhachHang' => 'KH001',
                'maNV' => 'NV004',
            ],
            [
                'maGiaoHang' => 'GH20260905',
                'ngayGiao' => Carbon::now()->subDays(8)->toDateTimeString(),
                'diaChiGiao' => 'Kho Trung Chuyển WinMart, KCN Sóng Thần 2, Dĩ An, Bình Dương',
                'trangThai' => 'Đã giao thành công',
                'maDonHang' => 'DH20260905',
                'maPhieuXuatSP' => 'PXSP2026090702',
                'maKhachHang' => 'KH003',
                'maNV' => 'NV004',
            ],
            [
                'maGiaoHang' => 'GH20260908',
                'ngayGiao' => Carbon::now()->subDays(2)->toDateTimeString(),
                'diaChiGiao' => 'Kho Bách Hóa Xanh, KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM',
                'trangThai' => 'Đang giao hàng',
                'maDonHang' => 'DH20260908',
                'maPhieuXuatSP' => 'PXSP2026091003',
                'maKhachHang' => 'KH005',
                'maNV' => 'NV009',
            ],
        ]);

        // 4. HoaDon (Invoices)
        DB::table('HoaDon')->truncate();
        DB::table('HoaDon')->insert([
            [
                'maHoaDon' => 'HDGTGT-20260901',
                'ngayLap' => Carbon::now()->subDays(12)->toDateTimeString(),
                'tongTien' => 770000000,
                'maGiaoHang' => 'GH20260901',
            ],
            [
                'maHoaDon' => 'HDGTGT-20260905',
                'ngayLap' => Carbon::now()->subDays(8)->toDateTimeString(),
                'tongTien' => 520000000,
                'maGiaoHang' => 'GH20260905',
            ],
            [
                'maHoaDon' => 'HDGTGT-20260908',
                'ngayLap' => Carbon::now()->subDays(2)->toDateTimeString(),
                'tongTien' => 450000000,
                'maGiaoHang' => 'GH20260908',
            ],
        ]);

        // 5. CongNo (Accounts Receivable)
        DB::table('CongNo')->truncate();
        DB::table('CongNo')->insert([
            [
                'maCongNo' => 'CN-KH001-202609',
                'soTienNo' => 770000000,
                'soTienDaTra' => 500000000,
                'soTienConLai' => 270000000,
                'hanThanhToan' => Carbon::now()->addDays(30)->toDateString(),
                'trangThai' => 'Còn nợ trong hạn',
                'maHoaDon' => 'HDGTGT-20260901',
                'maKhachHang' => 'KH001',
            ],
            [
                'maCongNo' => 'CN-KH003-202609',
                'soTienNo' => 520000000,
                'soTienDaTra' => 520000000,
                'soTienConLai' => 0,
                'hanThanhToan' => Carbon::now()->addDays(15)->toDateString(),
                'trangThai' => 'Đã thanh toán đủ',
                'maHoaDon' => 'HDGTGT-20260905',
                'maKhachHang' => 'KH003',
            ],
            [
                'maCongNo' => 'CN-KH005-202609',
                'soTienNo' => 450000000,
                'soTienDaTra' => 0,
                'soTienConLai' => 450000000,
                'hanThanhToan' => Carbon::now()->addDays(45)->toDateString(),
                'trangThai' => 'Chưa thanh toán',
                'maHoaDon' => 'HDGTGT-20260908',
                'maKhachHang' => 'KH005',
            ],
        ]);

        // 6. ThanhToan (Payment Records)
        DB::table('ThanhToan')->truncate();
        DB::table('ThanhToan')->insert([
            [
                'maThanhToan' => 'TT2026090301',
                'maCongNo' => 'CN-KH001-202609',
                'ngayThanhToan' => Carbon::now()->subDays(10)->toDateTimeString(),
                'phuongThuc' => 'Chuyển khoản VCB',
            ],
            [
                'maThanhToan' => 'TT2026090702',
                'maCongNo' => 'CN-KH003-202609',
                'ngayThanhToan' => Carbon::now()->subDays(6)->toDateTimeString(),
                'phuongThuc' => 'Chuyển khoản BIDV',
            ],
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}

