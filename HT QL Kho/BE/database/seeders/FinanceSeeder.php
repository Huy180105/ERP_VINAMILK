<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // =========================================================================
        // 1. DANH MỤC KHOẢN THU (FI-FR01) - 32 Mục
        // =========================================================================
        DB::table('ChiTietPhieuThu')->truncate();
        DB::table('PhieuThu')->truncate();
        DB::table('DanhMucThu')->truncate();

        $revCategories = [
            ['maDanhMucThu' => 'DMT01', 'tenDanhMucThu' => 'Thu tiền bán sữa tươi tiệt trùng 100% & ít đường', 'moTa' => 'Thu hồi tiền bán lẻ và bán buôn dòng sữa tươi tiệt trùng đóng hộp 110ml, 180ml', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT02', 'tenDanhMucThu' => 'Thu tiền bán sữa bột dinh dưỡng Dielac & Alpha Gold', 'moTa' => 'Thu tiền phân phối sữa bột trẻ em và người cao tuổi toàn quốc', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT03', 'tenDanhMucThu' => 'Thu tiền bán sữa đặc Ông Thọ & Ngôi Sao Phương Nam', 'moTa' => 'Thu từ các chuỗi F&B, quán cafe và đại lý làm bánh truyền thống', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT04', 'tenDanhMucThu' => 'Thu tiền bán sữa chua ăn & sữa chua uống Probi', 'moTa' => 'Thu hồi tiền từ các hệ thống siêu thị chuỗi bán lẻ men sống Probi', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT05', 'tenDanhMucThu' => 'Thu tiền bán kem ăn và phô mai Vinamilk', 'moTa' => 'Doanh thu sản phẩm đông lạnh, kem cây, kem hộp và phô mai miếng', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT06', 'tenDanhMucThu' => 'Thu tiền bán sữa hạt dinh dưỡng Super Nut', 'moTa' => 'Doanh thu dòng sản phẩm sữa 9 loại hạt cao cấp thuần thực vật', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT07', 'tenDanhMucThu' => 'Thu tiền bán sữa tươi hữu cơ Green Farm & Organic', 'moTa' => 'Doanh thu phân khúc sữa cao cấp từ hệ thống trang trại sinh thái', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT08', 'tenDanhMucThu' => 'Thu tiền bán bơ lạt & chế phẩm sữa công nghiệp', 'moTa' => 'Cung cấp nguyên liệu chế biến bơ sữa cho các nhà máy bánh kẹo', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT09', 'tenDanhMucThu' => 'Thu thanh toán hợp đồng đề án Sữa Học Đường', 'moTa' => 'Thanh toán từ ngân sách và ban điều hành đề án dinh dưỡng học đường', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT10', 'tenDanhMucThu' => 'Thu ngoại tệ xuất khẩu sữa sang Trung Đông & Dubai', 'moTa' => 'Nguồn thu thanh toán L/C ngoại tệ từ các đối tác Jebel Ali UAE', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT11', 'tenDanhMucThu' => 'Thu ngoại tệ xuất khẩu sữa sang Nhật Bản & Hoa Kỳ', 'moTa' => 'Thu kiều hối xuất khẩu sữa chua và nước cốt dừa organic', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT12', 'tenDanhMucThu' => 'Thu tiền bán lẻ chuỗi Cửa Hàng Giấc Mơ Sữa Việt', 'moTa' => 'Doanh thu thanh toán tiền mặt & POS từ hệ thống showroom Vinamilk', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT13', 'tenDanhMucThu' => 'Thu tiền đặt cọc mở mới đại lý phân phối', 'moTa' => 'Ký quỹ hợp đồng phân phối độc quyền cấp huyện / tỉnh', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT14', 'tenDanhMucThu' => 'Thu tiền bảo lãnh thực hiện hợp đồng tiêu thụ sữa', 'moTa' => 'Tiền ký quỹ của các chuỗi siêu thị và đại lý thương mại điện tử', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT15', 'tenDanhMucThu' => 'Thu thanh lý bao bì carton và vỏ can nhựa phế liệu', 'moTa' => 'Tái chế thu hồi chi phí từ phế phẩm đóng gói tại các nhà máy', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT16', 'tenDanhMucThu' => 'Thu thanh lý máy móc cơ khí & thiết bị kho cũ', 'moTa' => 'Thanh lý xe nâng, giá kệ kho lạnh sau thời gian khấu hao hết', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT17', 'tenDanhMucThu' => 'Thu lãi tiền gửi ngân hàng có kỳ hạn (Fixed Deposits)', 'moTa' => 'Lãi suất phát sinh định kỳ từ các khoản tiền gửi quản lý thanh khoản', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT18', 'tenDanhMucThu' => 'Thu lãi tiền gửi ngân hàng không kỳ hạn (Demand)', 'moTa' => 'Tiền lãi phát sinh hàng tháng trên tài khoản thanh toán vãng lai', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT19', 'tenDanhMucThu' => 'Thu cổ tức & lợi nhuận được chia từ công ty liên kết', 'moTa' => 'Lợi nhuận từ các công ty bò sữa và chế biến thức ăn chăn nuôi liên kết', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT20', 'tenDanhMucThu' => 'Thu chiết khấu thương mại nhận từ nhà cung cấp', 'moTa' => 'Thưởng chiết khấu khối lượng từ nhà cung cấp bao bì và nguyên liệu', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT21', 'tenDanhMucThu' => 'Thu hoàn ứng công tác phí thị trường miền Bắc', 'moTa' => 'Nhân viên kinh doanh hoàn ứng tiền công tác thị trường', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT22', 'tenDanhMucThu' => 'Thu hoàn ứng kinh phí tham gia hội chợ triển lãm', 'moTa' => 'Hoàn ứng ngân sách triển lãm quốc tế Vietfood & Expo', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT23', 'tenDanhMucThu' => 'Thu tiền bồi thường bảo hiểm tài sản và kho bãi', 'moTa' => 'Bảo hiểm chi trả bồi thường các tổn thất sự cố vận tải và kho lạnh', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT24', 'tenDanhMucThu' => 'Thu tiền phạt vi phạm hợp đồng giao nguyên vật liệu', 'moTa' => 'Khoản phạt các nhà cung cấp không đảm bảo tiến độ hoặc chất lượng cam kết', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT25', 'tenDanhMucThu' => 'Thu phí cho thuê mặt bằng và dịch vụ kho lạnh', 'moTa' => 'Cho đối tác logistics gửi bảo quản tạm thời tại hệ thống kho lạnh trung chuyển', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT26', 'tenDanhMucThu' => 'Thu phí nhượng quyền thương mại chuỗi Giấc Mơ Sữa Việt', 'moTa' => 'Phí nhượng quyền định kỳ từ các đại lý ủy quyền thương hiệu', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT27', 'tenDanhMucThu' => 'Thu tài trợ nghiên cứu khoa học dinh dưỡng học đường', 'moTa' => 'Khoản viện trợ không hoàn lại từ các viện nghiên cứu dinh dưỡng quốc tế', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT28', 'tenDanhMucThu' => 'Thu hồi nợ khó đòi đã xử lý xóa sổ kế toán', 'moTa' => 'Thu hồi các khoản công nợ cũ của các đại lý đã giải thể', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT29', 'tenDanhMucThu' => 'Thu chênh lệch tỷ giá ngoại tệ dương khi xuất khẩu sữa', 'moTa' => 'Lãi chênh lệch tỷ giá USD/VND khi đáo hạn chứng từ thanh toán xuất khẩu', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT30', 'tenDanhMucThu' => 'Thu hoàn thuế Giá trị gia tăng (VAT) hàng nông sản xuất khẩu', 'moTa' => 'Cục thuế hoàn tiền thuế VAT theo hồ sơ hoàn thuế định kỳ', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT31', 'tenDanhMucThu' => 'Thu thưởng thi đua doanh số kênh bán lẻ hiện đại (MT)', 'moTa' => 'Tiền thưởng từ đối tác trung tâm thương mại khi vượt mốc cam kết', 'trangThai' => 1],
            ['maDanhMucThu' => 'DMT32', 'tenDanhMucThu' => 'Các khoản thu nhập vãng lai và hoạt động tài chính khác', 'moTa' => 'Các khoản thu tài chính phát sinh ngoài kế hoạch hoạt động thông thường', 'trangThai' => 1],
        ];
        DB::table('DanhMucThu')->insert($revCategories);

        // =========================================================================
        // 2. DANH MỤC KHOẢN CHI (FI-FR01) - 32 Mục
        // =========================================================================
        DB::table('ChiTietPhieuChi')->truncate();
        DB::table('PhieuChi')->truncate();
        DB::table('DanhMucChi')->truncate();

        $expCategories = [
            ['maDanhMucChi' => 'DMC01', 'tenDanhMucChi' => 'Chi mua sữa tươi thô nguyên liệu từ các nông trại', 'moTa' => 'Thanh toán tiền sữa bò tươi từ các trang trại công nghệ cao Mộc Châu, Tây Ninh', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC02', 'tenDanhMucChi' => 'Chi mua bột sữa gầy nhập khẩu từ Fonterra New Zealand', 'moTa' => 'Nhập khẩu bột sữa nguyên kem phục vụ sản xuất sữa bột và sữa đặc', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC03', 'tenDanhMucChi' => 'Chi mua đường tinh luyện cao cấp từ TTC Sugar Biên Hòa', 'moTa' => 'Nguyên liệu phối trộn cho dòng sữa có đường và nước ngọt tiệt trùng', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC04', 'tenDanhMucChi' => 'Chi mua bao bì phức hợp tiệt trùng từ Tetra Pak', 'moTa' => 'Vỏ hộp giấy Aseptic 6 lớp vô trùng phục vụ đóng gói sữa tiệt trùng UHT', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC05', 'tenDanhMucChi' => 'Chi mua men vi sinh phân giải từ Chr. Hansen Đan Mạch', 'moTa' => 'Chủng men sống Probiotics phục vụ dây chuyền sữa chua lên men tự nhiên', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC06', 'tenDanhMucChi' => 'Chi mua vi chất dinh dưỡng, Vitamin & Khoáng chất từ DSM', 'moTa' => 'Vi chất bổ sung phát triển trí não DHA, Canxi nano, Vitamin A & D3', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC07', 'tenDanhMucChi' => 'Chi mua bao bì thùng carton, pallet nhựa từ Duy Tân & Tân Á', 'moTa' => 'Bao bì cấp 2 và công cụ bảo quản lưu kho vận chuyển pallet', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC08', 'tenDanhMucChi' => 'Chi trả lương cán bộ công nhân viên định kỳ hàng tháng', 'moTa' => 'Lương theo hợp đồng phân hệ HRM cho toàn thể cán bộ công nhân viên', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC09', 'tenDanhMucChi' => 'Chi thưởng năng suất, lương tháng 13 và lễ Tết', 'moTa' => 'Khen thưởng thi đua sản xuất và động viên người lao động', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC10', 'tenDanhMucChi' => 'Chi nộp Bảo hiểm Xã hội, Y tế và Thất nghiệp (BHXH)', 'moTa' => 'Trích nộp nghĩa vụ bảo hiểm bắt buộc theo luật lao động cho nhân viên', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC11', 'tenDanhMucChi' => 'Chi kinh phí Công đoàn và quỹ phúc lợi xã hội', 'moTa' => 'Trích nộp 2% kinh phí công đoàn và thăm hỏi ốm đau, hiếu hỷ', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC12', 'tenDanhMucChi' => 'Chi cước vận tải lạnh chuyên dụng ABA Cooltrans', 'moTa' => 'Cước xe tải lạnh 2-4 độ C luân chuyển sữa tươi từ nông trại về nhà máy', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC13', 'tenDanhMucChi' => 'Chi phí thuê kho bãi trung chuyển logistics vùng miền', 'moTa' => 'Thuê diện tích kho hàng tại các hub trọng điểm Cần Thơ, Đà Nẵng, Hải Phòng', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC14', 'tenDanhMucChi' => 'Chi tiền điện năng lượng vận hành hệ thống kho lạnh UHT', 'moTa' => 'Hóa đơn tiền điện sản xuất cho EVN tại Siêu Nhà Máy Mega Plant Bình Dương', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC15', 'tenDanhMucChi' => 'Chi tiền nước sản xuất và hệ thống xử lý nước thải', 'moTa' => 'Chi phí nước tinh khiết và vận hành trạm tái sinh nước đạt chuẩn Net Zero', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC16', 'tenDanhMucChi' => 'Chi mua dầu DO và khí đốt vận hành lò hơi tiệt trùng UHT', 'moTa' => 'Nhiên liệu sinh hơi tiệt trùng áp suất cao cho hệ thống gia nhiệt sản xuất', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC17', 'tenDanhMucChi' => 'Chi bảo dưỡng định kỳ hệ thống robot tự động Mega Plant', 'moTa' => 'Bảo trì dàn máy chiết rót tốc độ cao và cánh tay robot xếp pallet kho thông minh', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC18', 'tenDanhMucChi' => 'Chi sửa chữa, thay thế phụ tùng máy cô đặc sữa chân không', 'moTa' => 'Vật tư thay thế định kỳ van áp lực, gioăng cao su chịu nhiệt ngành thực phẩm', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC19', 'tenDanhMucChi' => 'Chi hoa hồng và chiết khấu bán hàng cho đại lý cấp 1', 'moTa' => 'Thanh toán chiết khấu doanh thu cho các nhà phân phối độc quyền', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC20', 'tenDanhMucChi' => 'Chi khuyến mại người tiêu dùng và chương trình quà tặng', 'moTa' => 'Kinh phí làm ly sứ, đồ chơi trẻ em đính kèm lốc sữa và phiếu cào may mắn', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC21', 'tenDanhMucChi' => 'Chi quảng cáo truyền hình (TVC), báo chí và tiếp thị số', 'moTa' => 'Chiến dịch truyền thông thương hiệu Vinamilk - Để tâm đến từng giọt sữa', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC22', 'tenDanhMucChi' => 'Chi tài trợ chương trình Quỹ Sữa Vươn Cao Việt Nam', 'moTa' => 'Trao tặng hàng triệu ly sữa cho trẻ em có hoàn cảnh khó khăn vùng sâu xa', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC23', 'tenDanhMucChi' => 'Chi hỗ trợ giống cỏ và thú y cho các hộ nuôi bò sữa', 'moTa' => 'Chính sách trợ giá cám dinh dưỡng và vắc xin phòng dịch cho liên kết nông dân', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC24', 'tenDanhMucChi' => 'Chi phí kiểm nghiệm KCS, chứng nhận ISO 22000 & Organic', 'moTa' => 'Phí đánh giá định kỳ của tổ chức Bureau Veritas và Eurofins quốc tế', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC25', 'tenDanhMucChi' => 'Chi phí mua sắm bản quyền phần mềm ERP SAP & hạ tầng số', 'moTa' => 'Phí bảo trì license hàng năm hệ thống máy chủ cơ sở dữ liệu doanh nghiệp', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC26', 'tenDanhMucChi' => 'Chi phí kiểm toán độc lập báo cáo tài chính thường niên', 'moTa' => 'Thù lao dịch vụ kiểm toán cho nhóm công ty Big 4 (PwC / KPMG)', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC27', 'tenDanhMucChi' => 'Chi phí thuê văn phòng trụ sở chính Tân Trào và chi nhánh', 'moTa' => 'Hợp đồng thuê mặt bằng văn phòng làm việc và phí dịch vụ quản lý tòa nhà', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC28', 'tenDanhMucChi' => 'Chi phí đào tạo nâng cao tay nghề và học bổng Vinamilk', 'moTa' => 'Chương trình tu nghiệp kỹ sư công nghệ sữa tại Hà Lan và Đan Mạch', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC29', 'tenDanhMucChi' => 'Chi trang cấp đồng phục và bảo hộ lao động phòng sạch', 'moTa' => 'Bộ quần áo chống bụi vô trùng, giày cách điện, nón trùm tóc công nhân', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC30', 'tenDanhMucChi' => 'Chi trả lãi vay vốn lưu động phục vụ chu kỳ sản xuất', 'moTa' => 'Tiền lãi vay các ngân hàng thương mại tài trợ vốn thu mua nông sản', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC31', 'tenDanhMucChi' => 'Chi phí dịch vụ ngân hàng, phí chuyển tiền và mở L/C', 'moTa' => 'Phí thanh toán quốc tế và phí quản lý tài khoản định kỳ ngân hàng', 'trangThai' => 1],
            ['maDanhMucChi' => 'DMC32', 'tenDanhMucChi' => 'Chi nộp thuế Thu nhập doanh nghiệp (TNDN) và thuế môn bài', 'moTa' => 'Nộp ngân sách nhà nước tiền thuế thu nhập doanh nghiệp quý', 'trangThai' => 1],
        ];
        DB::table('DanhMucChi')->insert($expCategories);

        // =========================================================================
        // 3. ĐỐI TƯỢNG GIAO DỊCH (FI-BR05) - 35 Đối Tượng Chuẩn Hóa
        // =========================================================================
        DB::table('DoiTuongGiaoDich')->truncate();

        $counterparties = [
            // 15 Khách hàng
            ['maDoiTuong' => 'DT-KH001', 'maThamChieu' => 'KH001', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH002', 'maThamChieu' => 'KH002', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH003', 'maThamChieu' => 'KH003', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH004', 'maThamChieu' => 'KH004', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH005', 'maThamChieu' => 'KH005', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH006', 'maThamChieu' => 'KH006', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH007', 'maThamChieu' => 'KH007', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH008', 'maThamChieu' => 'KH008', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH009', 'maThamChieu' => 'KH009', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH010', 'maThamChieu' => 'KH010', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH011', 'maThamChieu' => 'KH011', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH012', 'maThamChieu' => 'KH012', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH013', 'maThamChieu' => 'KH013', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH014', 'maThamChieu' => 'KH014', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-KH015', 'maThamChieu' => 'KH015', 'loaiDoiTuong' => 'KH', 'trangThai' => 1],

            // 15 Nhà cung cấp
            ['maDoiTuong' => 'DT-NCC001', 'maThamChieu' => 'NCC001', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC002', 'maThamChieu' => 'NCC002', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC003', 'maThamChieu' => 'NCC003', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC004', 'maThamChieu' => 'NCC004', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC005', 'maThamChieu' => 'NCC005', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC006', 'maThamChieu' => 'NCC006', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC007', 'maThamChieu' => 'NCC007', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC008', 'maThamChieu' => 'NCC008', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC009', 'maThamChieu' => 'NCC009', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC010', 'maThamChieu' => 'NCC010', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC011', 'maThamChieu' => 'NCC011', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC012', 'maThamChieu' => 'NCC012', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC013', 'maThamChieu' => 'NCC013', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC014', 'maThamChieu' => 'NCC014', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NCC015', 'maThamChieu' => 'NCC015', 'loaiDoiTuong' => 'NCC', 'trangThai' => 1],

            // 5 Nhân viên
            ['maDoiTuong' => 'DT-NV001', 'maThamChieu' => 'NV001', 'loaiDoiTuong' => 'NV', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NV002', 'maThamChieu' => 'NV002', 'loaiDoiTuong' => 'NV', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NV003', 'maThamChieu' => 'NV003', 'loaiDoiTuong' => 'NV', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NV004', 'maThamChieu' => 'NV004', 'loaiDoiTuong' => 'NV', 'trangThai' => 1],
            ['maDoiTuong' => 'DT-NV005', 'maThamChieu' => 'NV005', 'loaiDoiTuong' => 'NV', 'trangThai' => 1],
        ];
        DB::table('DoiTuongGiaoDich')->insert($counterparties);

        // =========================================================================
        // 4. TÀI KHOẢN QUỸ / NGÂN HÀNG (FI-FR04) - 30 Tài Khoản
        // =========================================================================
        DB::table('TaiKhoanQuy')->truncate();

        $accounts = [
            // 6 Quỹ tiền mặt
            ['maTaiKhoanQuy' => 'TKQ-TM01', 'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Trụ Sở Chính (10 Tân Trào, Q.7)', 'loaiTaiKhoan' => 'TM', 'soTaiKhoan' => null, 'nganHang' => null, 'soDuHienTai' => 450000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TM02', 'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Siêu Nhà Máy Mega Plant Bình Dương', 'loaiTaiKhoan' => 'TM', 'soTaiKhoan' => null, 'nganHang' => null, 'soDuHienTai' => 280000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TM03', 'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Chi Nhánh Hà Nội & Phân Phối Miền Bắc', 'loaiTaiKhoan' => 'TM', 'soTaiKhoan' => null, 'nganHang' => null, 'soDuHienTai' => 310000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TM04', 'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Nhà Máy Sữa Đà Lạt & Nông Trại Organic', 'loaiTaiKhoan' => 'TM', 'soTaiKhoan' => null, 'nganHang' => null, 'soDuHienTai' => 195000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TM05', 'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Chi Nhánh Cần Thơ & Tây Nam Bộ', 'loaiTaiKhoan' => 'TM', 'soTaiKhoan' => null, 'nganHang' => null, 'soDuHienTai' => 220000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TM06', 'tenTaiKhoanQuy' => 'Quỹ Tiền Mặt Nhà Máy Sữa Lam Sơn (Yên Định, Thanh Hóa)', 'loaiTaiKhoan' => 'TM', 'soTaiKhoan' => null, 'nganHang' => null, 'soDuHienTai' => 175000000.00, 'trangThai' => 1],

            // 24 Tài khoản ngân hàng
            ['maTaiKhoanQuy' => 'TKQ-VCB01', 'tenTaiKhoanQuy' => 'Vietcombank - TK Thanh Toán Thu Tiền Bán Hàng Trụ Sở', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '0071001234567', 'nganHang' => 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN TP.HCM', 'soDuHienTai' => 5450000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-VCB02', 'tenTaiKhoanQuy' => 'Vietcombank - TK Thu Bán Sỉ Kênh Siêu Thị & Đại Lý', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '0071009876543', 'nganHang' => 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN Tân Bình', 'soDuHienTai' => 3820000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-VCB03', 'tenTaiKhoanQuy' => 'Vietcombank - TK Chuyên Nhập Khẩu Nguyên Liệu USD', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '0071370011223', 'nganHang' => 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - Sở Giao Dịch', 'soDuHienTai' => 12500000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-VCB04', 'tenTaiKhoanQuy' => 'Vietcombank - TK Quản Lý Ngân Sách Sữa Học Đường', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '0071005544332', 'nganHang' => 'Ngân hàng Ngoại Thương Việt Nam (Vietcombank) - CN Nam Sài Gòn', 'soDuHienTai' => 4100000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-BIDV01', 'tenTaiKhoanQuy' => 'BIDV - TK Chi Lương Tập Đoàn & Phúc Lợi Nhân Sự', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '1201000998877', 'nganHang' => 'Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Sở Giao Dịch 2', 'soDuHienTai' => 6200000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-BIDV02', 'tenTaiKhoanQuy' => 'BIDV - TK Thu Mua Sữa Tươi Nông Trại Green Farm', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '1201000334455', 'nganHang' => 'Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Tây Ninh', 'soDuHienTai' => 2900000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-BIDV03', 'tenTaiKhoanQuy' => 'BIDV - TK Thanh Toán Bao Bì & Hóa Chất Men Sống', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '1201000778899', 'nganHang' => 'Ngân hàng Đầu tư & Phát triển VN (BIDV) - CN Bắc Bình Dương', 'soDuHienTai' => 3450000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-CTG01', 'tenTaiKhoanQuy' => 'VietinBank - TK Thu Hồi Công Nợ Đại Siêu Thị Co.opmart & GO!', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '113000556677', 'nganHang' => 'Ngân hàng Công Thương Việt Nam (VietinBank) - CN TP.HCM', 'soDuHienTai' => 4780000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-CTG02', 'tenTaiKhoanQuy' => 'VietinBank - TK Chi Phí Vận Tải Lạnh & Cung Ứng Logistics', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '113000889900', 'nganHang' => 'Ngân hàng Công Thương Việt Nam (VietinBank) - CN Thủ Thiêm', 'soDuHienTai' => 1890000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-CTG03', 'tenTaiKhoanQuy' => 'VietinBank - TK Giao Dịch Nhà Máy Sữa Tiên Sơn (Bắc Ninh)', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '113000223344', 'nganHang' => 'Ngân hàng Công Thương Việt Nam (VietinBank) - CN Bắc Ninh', 'soDuHienTai' => 2150000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TCB01', 'tenTaiKhoanQuy' => 'Techcombank - TK Thu Bán Lẻ Kênh Thương Mại Điện Tử & App', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '190300112233', 'nganHang' => 'Ngân hàng Kỹ Thương (Techcombank) - Hội Sở Miền Nam', 'soDuHienTai' => 3120000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TCB02', 'tenTaiKhoanQuy' => 'Techcombank - TK Thanh Toán Chuỗi Cửa Hàng Giấc Mơ Sữa Việt', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '190300445566', 'nganHang' => 'Ngân hàng Kỹ Thương (Techcombank) - CN Phú Mỹ Hưng', 'soDuHienTai' => 2450000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-TCB03', 'tenTaiKhoanQuy' => 'Techcombank - TK Thanh Toán Chiến Dịch Marketing & Quảng Cáo', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '190300778899', 'nganHang' => 'Ngân hàng Kỹ Thương (Techcombank) - CN Gia Định', 'soDuHienTai' => 1650000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-AGR01', 'tenTaiKhoanQuy' => 'Agribank - TK Thu Mua Sữa Hợp Tác Xã Mộc Châu Sơn La', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '3100201122334', 'nganHang' => 'Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Mộc Châu', 'soDuHienTai' => 4560000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-AGR02', 'tenTaiKhoanQuy' => 'Agribank - TK Thu Mua Bò Sữa Đơn Dương (Lâm Đồng)', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '3100205566778', 'nganHang' => 'Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Lâm Đồng', 'soDuHienTai' => 3800000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-AGR03', 'tenTaiKhoanQuy' => 'Agribank - TK Chi Trợ Giá Nông Nghiệp & Giống Cỏ', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '3100209988112', 'nganHang' => 'Ngân hàng Nông nghiệp & PTNT (Agribank) - CN Bến Cát', 'soDuHienTai' => 1980000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-MB01', 'tenTaiKhoanQuy' => 'MBBank - TK Nộp Thuế & Nghĩa Vụ Ngân Sách Nhà Nước', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '0801100223344', 'nganHang' => 'Ngân hàng Quân Đội (MBBank) - CN Sở Giao Dịch 2', 'soDuHienTai' => 8900000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-MB02', 'tenTaiKhoanQuy' => 'MBBank - TK Chi Trả Điện Lực EVN & Năng Lượng Xanh', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '0801100556677', 'nganHang' => 'Ngân hàng Quân Đội (MBBank) - CN Nam Sài Gòn', 'soDuHienTai' => 2100000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-ACB01', 'tenTaiKhoanQuy' => 'ACB - TK Chi Trả Phí Kiểm Nghiệm KCS Quốc Tế & Lab', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '240688899', 'nganHang' => 'Ngân hàng Á Châu (ACB) - Hội Sở Mạc Đĩnh Chi', 'soDuHienTai' => 1450000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-ACB02', 'tenTaiKhoanQuy' => 'ACB - TK Ký Quỹ Mở L/C Nhập Khẩu Bột Sữa New Zealand', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '240699911', 'nganHang' => 'Ngân hàng Á Châu (ACB) - CN Sài Gòn', 'soDuHienTai' => 7800000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-VPB01', 'tenTaiKhoanQuy' => 'VPBank - TK Thu Thanh Toán Hệ Thống WinMart & Bách Hóa Xanh', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '150988877', 'nganHang' => 'Ngân hàng Việt Nam Thịnh Vượng (VPBank) - CN Bến Thành', 'soDuHienTai' => 5230000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-SHB01', 'tenTaiKhoanQuy' => 'SHB - TK Quản Lý Hoạt Động Điều Hành Ban Giám Đốc', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '1002554433', 'nganHang' => 'Ngân hàng Sài Gòn - Hà Nội (SHB) - CN Vạn Hạnh', 'soDuHienTai' => 1890000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-HSBC01', 'tenTaiKhoanQuy' => 'HSBC - TK Ngoại Tệ Thanh Toán Men Sống Chr. Hansen Đan Mạch', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '001988776001', 'nganHang' => 'Ngân hàng TNHH MTV HSBC Việt Nam - Hội Sở', 'soDuHienTai' => 14200000000.00, 'trangThai' => 1],
            ['maTaiKhoanQuy' => 'TKQ-SCB01', 'tenTaiKhoanQuy' => 'Standard Chartered - TK Ngoại Tệ Xuất Khẩu Thị Trường Trung Đông', 'loaiTaiKhoan' => 'NH', 'soTaiKhoan' => '002887766002', 'nganHang' => 'Ngân hàng Standard Chartered Việt Nam - CN TP.HCM', 'soDuHienTai' => 18600000000.00, 'trangThai' => 1],
        ];
        DB::table('TaiKhoanQuy')->insert($accounts);

        // =========================================================================
        // 5. PHIẾU THU & CHI TIẾT PHIẾU THU (FI-FR02, FI-BR01) - 35 Phiếu Thu
        // =========================================================================
        $receiptTemplates = [
            ['dt' => 'DT-KH001', 'cat' => 'DMT01', 'acc' => 'TKQ-CTG01', 'method' => 'CK', 'amount' => 185000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền bán sữa tươi 180ml đợt giao siêu thị Co.opmart miền Nam', 'days' => 45],
            ['dt' => 'DT-KH002', 'cat' => 'DMT12', 'acc' => 'TKQ-TCB02', 'method' => 'TM', 'amount' => 42000000, 'status' => 'DaDuyet', 'reason' => 'Nộp doanh thu tiền mặt cuối ngày chuỗi Giấc Mơ Sữa Việt Q.1, Q.3', 'days' => 43],
            ['dt' => 'DT-KH003', 'cat' => 'DMT04', 'acc' => 'TKQ-VPB01', 'method' => 'CK', 'amount' => 245000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền phân phối sữa chua Probi cho hệ thống WinMart toàn quốc', 'days' => 42],
            ['dt' => 'DT-KH004', 'cat' => 'DMT01', 'acc' => 'TKQ-VCB02', 'method' => 'CK', 'amount' => 310000000, 'status' => 'DaDuyet', 'reason' => 'Thu công nợ xuất khẩu nội địa nhà phân phối độc quyền Hậu Giang', 'days' => 40],
            ['dt' => 'DT-KH005', 'cat' => 'DMT03', 'acc' => 'TKQ-VPB01', 'method' => 'CK', 'amount' => 195000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền sữa đặc có đường Phương Nam cho chuỗi Bách Hóa Xanh', 'days' => 39],
            ['dt' => 'DT-KH006', 'cat' => 'DMT10', 'acc' => 'TKQ-SCB01', 'method' => 'CK', 'amount' => 950000000, 'status' => 'DaDuyet', 'reason' => 'Thu thanh toán L/C xuất khẩu lô sữa bột Dielac sang Dubai (UAE)', 'days' => 37],
            ['dt' => 'DT-KH007', 'cat' => 'DMT07', 'acc' => 'TKQ-CTG01', 'method' => 'CK', 'amount' => 178000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền giao sữa Green Farm cao cấp cho đại siêu thị GO! An Lạc', 'days' => 35],
            ['dt' => 'DT-KH008', 'cat' => 'DMT02', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 285000000, 'status' => 'DaDuyet', 'reason' => 'Thu thanh toán đơn hàng sữa bột trẻ em trung tâm MM Mega Market', 'days' => 34],
            ['dt' => 'DT-KH009', 'cat' => 'DMT05', 'acc' => 'TKQ-VCB02', 'method' => 'CK', 'amount' => 125000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán lô kem ăn Vinamilk giao hệ thống AEON Mall Tân Phú', 'days' => 32],
            ['dt' => 'DT-KH010', 'cat' => 'DMT06', 'acc' => 'TKQ-TCB01', 'method' => 'CK', 'amount' => 165000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền phân phối sữa hạt 9 loại Super Nut cho Lotte Mart Nam Sài Gòn', 'days' => 30],
            ['dt' => 'DT-KH011', 'cat' => 'DMT04', 'acc' => 'TKQ-TCB01', 'method' => 'CK', 'amount' => 88000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền giao sữa chua uống men sống Probi cho Circle K toàn miền Nam', 'days' => 28],
            ['dt' => 'DT-KH012', 'cat' => 'DMT01', 'acc' => 'TKQ-TCB01', 'method' => 'CK', 'amount' => 96000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán đợt 2 sữa tươi tiệt trùng 110ml chuỗi tiện ích GS25', 'days' => 26],
            ['dt' => 'DT-KH013', 'cat' => 'DMT09', 'acc' => 'TKQ-VCB04', 'method' => 'CK', 'amount' => 750000000, 'status' => 'DaDuyet', 'reason' => 'Thu thanh toán ngân sách Đề án Sữa Học Đường TP.HCM đợt tháng 8/2026', 'days' => 25],
            ['dt' => 'DT-KH014', 'cat' => 'DMT02', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 115000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền cung cấp sản phẩm dinh dưỡng y học cho Bệnh viện Chợ Rẫy', 'days' => 23],
            ['dt' => 'DT-KH015', 'cat' => 'DMT01', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 450000000, 'status' => 'DaDuyet', 'reason' => 'Thu công nợ xuất hàng đợt 1 Tổng đại lý phân phối tiêu dùng miền Bắc', 'days' => 22],
            ['dt' => 'DT-NV001', 'cat' => 'DMT21', 'acc' => 'TKQ-TM01', 'method' => 'TM', 'amount' => 6500000, 'status' => 'DaDuyet', 'reason' => 'Hoàn ứng công tác phí giám sát kho lạnh trung chuyển Đà Nẵng', 'days' => 20],
            ['dt' => 'DT-NV004', 'cat' => 'DMT21', 'acc' => 'TKQ-TM01', 'method' => 'TM', 'amount' => 8200000, 'status' => 'DaDuyet', 'reason' => 'Hoàn ứng chi phí tiếp khách và khảo sát thị trường đại lý Tây Nam Bộ', 'days' => 19],
            ['dt' => 'DT-NCC001', 'cat' => 'DMT20', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 85000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền chiết khấu thương mại sản lượng bao bì Aseptic từ Tetra Pak', 'days' => 18],
            ['dt' => 'DT-NCC002', 'cat' => 'DMT20', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 35000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền thưởng đạt chỉ tiêu thu mua đường tinh luyện từ TTC Sugar', 'days' => 16],
            ['dt' => 'DT-KH001', 'cat' => 'DMT15', 'acc' => 'TKQ-TM02', 'method' => 'TM', 'amount' => 15500000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền thanh lý thùng carton phế liệu kho Mega Plant đợt tháng 8', 'days' => 15],
            ['dt' => 'DT-KH002', 'cat' => 'DMT13', 'acc' => 'TKQ-TCB02', 'method' => 'CK', 'amount' => 50000000, 'status' => 'DaDuyet', 'reason' => 'Thu ký quỹ mở thêm 2 điểm bán mới Cửa hàng Giấc Mơ Sữa Việt Bình Thạnh', 'days' => 14],
            ['dt' => 'DT-KH003', 'cat' => 'DMT01', 'acc' => 'TKQ-VPB01', 'method' => 'CK', 'amount' => 320000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền thanh toán đơn hàng sữa tươi tiệt trùng tuần 1 tháng 9/2026', 'days' => 12],
            ['dt' => 'DT-KH004', 'cat' => 'DMT07', 'acc' => 'TKQ-VCB02', 'method' => 'CK', 'amount' => 145000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền hàng sữa tươi sinh thái Green Farm đại lý Hậu Giang', 'days' => 11],
            ['dt' => 'DT-KH005', 'cat' => 'DMT04', 'acc' => 'TKQ-VPB01', 'method' => 'CK', 'amount' => 210000000, 'status' => 'DaDuyet', 'reason' => 'Thu tiền phân phối sữa chua ăn nha đam và có đường Bách Hóa Xanh', 'days' => 10],
            ['dt' => 'DT-KH006', 'cat' => 'DMT29', 'acc' => 'TKQ-SCB01', 'method' => 'CK', 'amount' => 28000000, 'status' => 'DaDuyet', 'reason' => 'Thu chênh lệch tỷ giá thanh lý hợp đồng xuất khẩu sữa bột Dubai', 'days' => 9],
            ['dt' => 'DT-NV002', 'cat' => 'DMT18', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 45000000, 'status' => 'DaDuyet', 'reason' => 'Thu lãi tiền gửi ngân hàng phát sinh kỳ tháng 8/2026 tài khoản VCB', 'days' => 8],
            // 5 Phiếu Chờ đối soát
            ['dt' => 'DT-KH007', 'cat' => 'DMT01', 'acc' => 'TKQ-CTG01', 'method' => 'CK', 'amount' => 165000000, 'status' => 'ChoDoiSoat', 'reason' => 'Thu tiền hàng đại siêu thị GO! Nguyễn Thị Thập (Chờ đối soát UNC ngân hàng)', 'days' => 6],
            ['dt' => 'DT-KH008', 'cat' => 'DMT03', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 135000000, 'status' => 'ChoDoiSoat', 'reason' => 'Thu thanh toán sữa đặc Phương Nam siêu thị MM Mega (Chờ đối soát)', 'days' => 5],
            ['dt' => 'DT-KH009', 'cat' => 'DMT06', 'acc' => 'TKQ-VCB02', 'method' => 'CK', 'amount' => 98000000, 'status' => 'ChoDoiSoat', 'reason' => 'Thu tiền đợt giao sữa hạt Super Nut cho AEON Mall Bình Tân', 'days' => 4],
            ['dt' => 'DT-KH010', 'cat' => 'DMT04', 'acc' => 'TKQ-TCB01', 'method' => 'CK', 'amount' => 112000000, 'status' => 'ChoDoiSoat', 'reason' => 'Thu thanh toán sữa chua ăn lốc 4 Lotte Mart (Chờ sổ phụ đối chiếu)', 'days' => 3],
            ['dt' => 'DT-KH013', 'cat' => 'DMT09', 'acc' => 'TKQ-VCB04', 'method' => 'CK', 'amount' => 820000000, 'status' => 'ChoDoiSoat', 'reason' => 'Thu đợt đầu năm học mới đề án Sữa Học Đường TP.HCM (Chờ xác nhận kho bạc)', 'days' => 2],
            // 4 Phiếu Mới lập
            ['dt' => 'DT-KH011', 'cat' => 'DMT01', 'acc' => 'TKQ-TCB01', 'method' => 'CK', 'amount' => 75000000, 'status' => 'Moi', 'reason' => 'Lập phiếu thu đơn đặt hàng mới tuần 3 tháng 9 chuỗi Circle K', 'days' => 2],
            ['dt' => 'DT-KH012', 'cat' => 'DMT05', 'acc' => 'TKQ-TCB01', 'method' => 'CK', 'amount' => 54000000, 'status' => 'Moi', 'reason' => 'Lập phiếu thu giao kem ốc quế và phô mai miếng chuỗi GS25', 'days' => 1],
            ['dt' => 'DT-KH015', 'cat' => 'DMT02', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 380000000, 'status' => 'Moi', 'reason' => 'Thu tiền đợt 2 đơn hàng sữa bột Dielac Gold cho nhà phân phối Hà Nội', 'days' => 1],
            ['dt' => 'DT-KH002', 'cat' => 'DMT12', 'acc' => 'TKQ-TM01', 'method' => 'TM', 'amount' => 32000000, 'status' => 'Moi', 'reason' => 'Thu nộp tiền mặt doanh thu bán lẻ cuối ngày Cửa hàng Vinamilk Q.7', 'days' => 0],
        ];

        $receipts = [];
        $receiptDetails = [];
        $i = 1;

        foreach ($receiptTemplates as $t) {
            $code = sprintf('PT-202609-%03d', $i);
            $dtCode = sprintf('CTPT-%03d-1', $i);
            $date = Carbon::now()->subDays($t['days'])->subHours($i % 8)->toDateTimeString();

            $receipts[] = [
                'maPhieuThu' => $code,
                'ngayThu' => $date,
                'maDoiTuong' => $t['dt'],
                'lyDoThu' => $t['reason'],
                'soTien' => $t['amount'],
                'phuongThucThu' => $t['method'],
                'maTaiKhoanQuy' => $t['acc'],
                'trangThai' => $t['status'],
                'nguoiLap' => 'NV002',
                'ngayLap' => Carbon::parse($date)->subMinutes(30)->toDateTimeString(),
                'nguoiDuyet' => $t['status'] === 'DaDuyet' ? 'NV001' : null,
                'ngayDuyet' => $t['status'] === 'DaDuyet' ? Carbon::parse($date)->addMinutes(15)->toDateTimeString() : null,
                'maThanhToan' => null,
                'maCongNo' => null,
                'maHoaDon' => null,
            ];

            $receiptDetails[] = [
                'maChiTietThu' => $dtCode,
                'maPhieuThu' => $code,
                'maDanhMucThu' => $t['cat'],
                'dienGiai' => $t['reason'],
                'soTien' => $t['amount'],
            ];
            $i++;
        }

        DB::table('PhieuThu')->insert($receipts);
        DB::table('ChiTietPhieuThu')->insert($receiptDetails);

        // =========================================================================
        // 6. PHIẾU CHI & CHI TIẾT PHIẾU CHI (FI-FR03, FI-BR02) - 35 Phiếu Chi
        // =========================================================================
        $paymentTemplates = [
            ['dt' => 'DT-NCC001', 'cat' => 'DMC04', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 450000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền mua bao bì tiệt trùng phức hợp Aseptic từ Tetra Pak VN', 'days' => 44],
            ['dt' => 'DT-NCC002', 'cat' => 'DMC03', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 180000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền nhập 50 tấn đường tinh luyện cao cấp từ TTC Sugar Biên Hòa', 'days' => 43],
            ['dt' => 'DT-NCC003', 'cat' => 'DMC01', 'acc' => 'TKQ-AGR01', 'method' => 'CK', 'amount' => 320000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền thu mua sữa bò tươi nguyên chất đợt 1 Hợp Tác Xã Mộc Châu', 'days' => 41],
            ['dt' => 'DT-NCC004', 'cat' => 'DMC02', 'acc' => 'TKQ-VCB03', 'method' => 'CK', 'amount' => 850000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán L/C nhập khẩu 40 tấn bột sữa gầy nguyên chất từ Fonterra New Zealand', 'days' => 40],
            ['dt' => 'DT-NCC005', 'cat' => 'DMC05', 'acc' => 'TKQ-HSBC01', 'method' => 'CK', 'amount' => 240000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền mua men vi sinh sống đông khô từ Chr. Hansen Đan Mạch', 'days' => 38],
            ['dt' => 'DT-NCC006', 'cat' => 'DMC01', 'acc' => 'TKQ-BIDV02', 'method' => 'CK', 'amount' => 420000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền sữa tươi chuẩn organic trang trại Vinamilk Green Farm Tây Ninh', 'days' => 36],
            ['dt' => 'DT-NCC007', 'cat' => 'DMC01', 'acc' => 'TKQ-AGR02', 'method' => 'CK', 'amount' => 290000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền sữa bò hữu cơ trang trại Organic Đà Lạt kỳ tháng 8', 'days' => 35],
            ['dt' => 'DT-NCC008', 'cat' => 'DMC06', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 165000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán hương liệu tự nhiên dâu & socola cho Kerry Ingredients VN', 'days' => 33],
            ['dt' => 'DT-NCC009', 'cat' => 'DMC06', 'acc' => 'TKQ-ACB01', 'method' => 'CK', 'amount' => 210000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền vi chất Canxi nano & Vitamin D3 từ DSM Thụy Sĩ', 'days' => 31],
            ['dt' => 'DT-NCC010', 'cat' => 'DMC01', 'acc' => 'TKQ-AGR02', 'method' => 'CK', 'amount' => 195000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền sữa tươi thu gom từ Hợp tác xã chăn nuôi Đơn Dương', 'days' => 29],
            ['dt' => 'DT-NCC011', 'cat' => 'DMC07', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 88000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền mua pallet nhựa và khay chứa sữa từ Nhựa Duy Tân', 'days' => 27],
            ['dt' => 'DT-NCC012', 'cat' => 'DMC12', 'acc' => 'TKQ-CTG02', 'method' => 'CK', 'amount' => 145000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán cước vận chuyển xe bồn lạnh luân chuyển sữa tươi ABA Cooltrans', 'days' => 26],
            ['dt' => 'DT-NCC013', 'cat' => 'DMC01', 'acc' => 'TKQ-BIDV02', 'method' => 'CK', 'amount' => 260000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền sữa tươi thô trang trại công nghệ cao Yên Định, Thanh Hóa', 'days' => 24],
            ['dt' => 'DT-NCC014', 'cat' => 'DMC17', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 75000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán bảo dưỡng hệ thống điều hòa không khí kho lạnh REE Corp', 'days' => 23],
            ['dt' => 'DT-NCC015', 'cat' => 'DMC07', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 68000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền mua 50.000 vỏ thùng carton in offset Tân Á', 'days' => 21],
            ['dt' => 'DT-NV001', 'cat' => 'DMC08', 'acc' => 'TKQ-BIDV01', 'method' => 'CK', 'amount' => 28000000, 'status' => 'DaDuyet', 'reason' => 'Chi trả lương tháng 8/2026 cho Trưởng phòng Kho vận Nguyễn Văn Hùng', 'days' => 20],
            ['dt' => 'DT-NV002', 'cat' => 'DMC08', 'acc' => 'TKQ-BIDV01', 'method' => 'CK', 'amount' => 32000000, 'status' => 'DaDuyet', 'reason' => 'Chi trả lương tháng 8/2026 cho Kế toán trưởng Trần Thị Thu Thảo', 'days' => 20],
            ['dt' => 'DT-NV003', 'cat' => 'DMC08', 'acc' => 'TKQ-BIDV01', 'method' => 'CK', 'amount' => 26000000, 'status' => 'DaDuyet', 'reason' => 'Chi trả lương tháng 8/2026 cho Trưởng ca sản xuất Lê Minh Tuấn', 'days' => 20],
            ['dt' => 'DT-NV004', 'cat' => 'DMC08', 'acc' => 'TKQ-BIDV01', 'method' => 'CK', 'amount' => 16000000, 'status' => 'DaDuyet', 'reason' => 'Chi trả lương tháng 8/2026 cho Chuyên viên kinh doanh Phạm Hoàng Nam', 'days' => 20],
            ['dt' => 'DT-NV005', 'cat' => 'DMC08', 'acc' => 'TKQ-BIDV01', 'method' => 'CK', 'amount' => 45000000, 'status' => 'DaDuyet', 'reason' => 'Chi trả lương tháng 8/2026 cho Ban Giám đốc điều hành Trịnh Đình Đức', 'days' => 20],
            ['dt' => 'DT-NV002', 'cat' => 'DMC14', 'acc' => 'TKQ-MB02', 'method' => 'CK', 'amount' => 185000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán tiền điện sản xuất cho Điện lực Bến Cát (Nhà máy Mega Plant)', 'days' => 18],
            ['dt' => 'DT-NV002', 'cat' => 'DMC15', 'acc' => 'TKQ-TM01', 'method' => 'TM', 'amount' => 14500000, 'status' => 'DaDuyet', 'reason' => 'Chi tiền nước sinh hoạt và sản xuất văn phòng Tân Trào kỳ tháng 8', 'days' => 17],
            ['dt' => 'DT-NV001', 'cat' => 'DMC16', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 95000000, 'status' => 'DaDuyet', 'reason' => 'Chi tiền mua dầu DO vận hành lò hơi tiệt trùng áp suất cao nhà máy', 'days' => 15],
            ['dt' => 'DT-NV002', 'cat' => 'DMC10', 'acc' => 'TKQ-BIDV01', 'method' => 'CK', 'amount' => 168000000, 'status' => 'DaDuyet', 'reason' => 'Trích nộp BHXH, BHYT, BHTN tháng 8/2026 cho cơ quan Bảo hiểm TP.HCM', 'days' => 14],
            ['dt' => 'DT-NV004', 'cat' => 'DMC21', 'acc' => 'TKQ-TCB03', 'method' => 'CK', 'amount' => 250000000, 'status' => 'DaDuyet', 'reason' => 'Thanh toán chi phí chiến dịch quảng cáo ra mắt dòng Sữa Hạt Super Nut', 'days' => 12],
            // 6 Phiếu Chờ duyệt
            ['dt' => 'DT-NCC001', 'cat' => 'DMC04', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 380000000, 'status' => 'ChoDuyet', 'reason' => 'Thanh toán tiền mua bao bì đợt 2 tháng 9 cho Tetra Pak (Chờ duyệt CFO)', 'days' => 6],
            ['dt' => 'DT-NCC002', 'cat' => 'DMC03', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 140000000, 'status' => 'ChoDuyet', 'reason' => 'Thanh toán đơn hàng 35 tấn đường luyện TTC Sugar (Chờ duyệt)', 'days' => 5],
            ['dt' => 'DT-NCC003', 'cat' => 'DMC01', 'acc' => 'TKQ-AGR01', 'method' => 'CK', 'amount' => 285000000, 'status' => 'ChoDuyet', 'reason' => 'Thanh toán tiền sữa bò tươi đợt 1 tháng 9 Nông trại Mộc Châu (Chờ duyệt)', 'days' => 4],
            ['dt' => 'DT-NCC012', 'cat' => 'DMC12', 'acc' => 'TKQ-CTG02', 'method' => 'CK', 'amount' => 128000000, 'status' => 'ChoDuyet', 'reason' => 'Thanh toán cước xe tải lạnh giao hàng chuỗi siêu thị miền Trung ABA', 'days' => 3],
            ['dt' => 'DT-NV001', 'cat' => 'DMC29', 'acc' => 'TKQ-TM01', 'method' => 'TM', 'amount' => 18500000, 'status' => 'ChoDuyet', 'reason' => 'Chi mua sắm trang phục bảo hộ phòng sạch công nhân kho bảo quản UHT', 'days' => 3],
            ['dt' => 'DT-NV003', 'cat' => 'DMC18', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 45000000, 'status' => 'ChoDuyet', 'reason' => 'Chi mua phụ tùng van áp lực thay thế máy tiệt trùng UHT số 2', 'days' => 2],
            // 4 Phiếu Mới lập
            ['dt' => 'DT-NCC006', 'cat' => 'DMC01', 'acc' => 'TKQ-BIDV02', 'method' => 'CK', 'amount' => 310000000, 'status' => 'Moi', 'reason' => 'Lập phiếu chi mua sữa tươi đợt 2 tháng 9 Green Farm Tây Ninh', 'days' => 2],
            ['dt' => 'DT-NCC008', 'cat' => 'DMC06', 'acc' => 'TKQ-BIDV03', 'method' => 'CK', 'amount' => 92000000, 'status' => 'Moi', 'reason' => 'Lập phiếu thanh toán hương vani và hạt dẻ Kerry Ingredients', 'days' => 1],
            ['dt' => 'DT-NV002', 'cat' => 'DMC26', 'acc' => 'TKQ-VCB01', 'method' => 'CK', 'amount' => 150000000, 'status' => 'Moi', 'reason' => 'Tạm ứng phí dịch vụ kiểm toán bán niên năm 2026 cho PwC Việt Nam', 'days' => 1],
            ['dt' => 'DT-NV004', 'cat' => 'DMC20', 'acc' => 'TKQ-TM01', 'method' => 'TM', 'amount' => 12000000, 'status' => 'Moi', 'reason' => 'Chi phí tổ chức chương trình đổi nắp hộp sữa trúng thưởng tại Cần Thơ', 'days' => 0],
        ];

        $payments = [];
        $paymentDetails = [];
        $j = 1;

        foreach ($paymentTemplates as $p) {
            $code = sprintf('PC-202609-%03d', $j);
            $dtCode = sprintf('CTPC-%03d-1', $j);
            $date = Carbon::now()->subDays($p['days'])->subHours($j % 7)->toDateTimeString();

            $payments[] = [
                'maPhieuChi' => $code,
                'ngayChi' => $date,
                'maDoiTuong' => $p['dt'],
                'lyDoChi' => $p['reason'],
                'soTien' => $p['amount'],
                'phuongThucChi' => $p['method'],
                'maTaiKhoanQuy' => $p['acc'],
                'trangThai' => $p['status'],
                'nguoiLap' => 'NV002',
                'ngayLap' => Carbon::parse($date)->subMinutes(45)->toDateTimeString(),
                'nguoiDuyet' => $p['status'] === 'DaDuyet' ? 'NV001' : null,
                'ngayDuyet' => $p['status'] === 'DaDuyet' ? Carbon::parse($date)->addMinutes(30)->toDateTimeString() : null,
                'maPhieuNhapNVL' => null,
                'maBangLuong' => null,
            ];

            $paymentDetails[] = [
                'maChiTietChi' => $dtCode,
                'maPhieuChi' => $code,
                'maDanhMucChi' => $p['cat'],
                'dienGiai' => $p['reason'],
                'soTien' => $p['amount'],
            ];
            $j++;
        }

        DB::table('PhieuChi')->insert($payments);
        DB::table('ChiTietPhieuChi')->insert($paymentDetails);

        // =========================================================================
        // 7. BÁO CÁO THU CHI (FI-FR06) - 30 Báo Cáo
        // =========================================================================
        DB::table('BaoCaoThuChi')->truncate();

        $reports = [
            // 12 Báo cáo tháng năm 2025
            ['maBaoCao' => 'BCTC-2025-T01', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-01-01', 'denNgay' => '2025-01-31', 'ngayLap' => '2025-02-02 08:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T02', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-02-01', 'denNgay' => '2025-02-28', 'ngayLap' => '2025-03-02 09:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T03', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-03-01', 'denNgay' => '2025-03-31', 'ngayLap' => '2025-04-03 10:15:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T04', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-04-01', 'denNgay' => '2025-04-30', 'ngayLap' => '2025-05-04 08:45:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T05', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-05-01', 'denNgay' => '2025-05-31', 'ngayLap' => '2025-06-02 11:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T06', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-06-01', 'denNgay' => '2025-06-30', 'ngayLap' => '2025-07-03 09:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T07', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-07-01', 'denNgay' => '2025-07-31', 'ngayLap' => '2025-08-02 14:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T08', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-08-01', 'denNgay' => '2025-08-31', 'ngayLap' => '2025-09-02 15:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T09', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-09-01', 'denNgay' => '2025-09-30', 'ngayLap' => '2025-10-03 09:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T10', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-10-01', 'denNgay' => '2025-10-31', 'ngayLap' => '2025-11-04 10:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T11', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-11-01', 'denNgay' => '2025-11-30', 'ngayLap' => '2025-12-02 08:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-T12', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2025-12-01', 'denNgay' => '2025-12-31', 'ngayLap' => '2026-01-05 16:00:00', 'nguoiLap' => 'NV002'],

            // 4 Báo cáo quý năm 2025
            ['maBaoCao' => 'BCTC-2025-Q1', 'loaiBaoCao' => 'TongHop', 'tuNgay' => '2025-01-01', 'denNgay' => '2025-03-31', 'ngayLap' => '2025-04-05 09:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-Q2', 'loaiBaoCao' => 'TongHop', 'tuNgay' => '2025-04-01', 'denNgay' => '2025-06-30', 'ngayLap' => '2025-07-06 10:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-Q3', 'loaiBaoCao' => 'TongHop', 'tuNgay' => '2025-07-01', 'denNgay' => '2025-09-30', 'ngayLap' => '2025-10-07 11:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2025-Q4', 'loaiBaoCao' => 'TongHop', 'tuNgay' => '2025-10-01', 'denNgay' => '2025-12-31', 'ngayLap' => '2026-01-10 14:00:00', 'nguoiLap' => 'NV002'],

            // 8 Báo cáo tháng năm 2026
            ['maBaoCao' => 'BCTC-2026-T01', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-01-01', 'denNgay' => '2026-01-31', 'ngayLap' => '2026-02-03 09:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T02', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-02-01', 'denNgay' => '2026-02-28', 'ngayLap' => '2026-03-03 10:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T03', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-03-01', 'denNgay' => '2026-03-31', 'ngayLap' => '2026-04-03 08:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T04', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-04-01', 'denNgay' => '2026-04-30', 'ngayLap' => '2026-05-04 09:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T05', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-05-01', 'denNgay' => '2026-05-31', 'ngayLap' => '2026-06-03 10:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T06', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-06-01', 'denNgay' => '2026-06-30', 'ngayLap' => '2026-07-03 08:45:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T07', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-07-01', 'denNgay' => '2026-07-31', 'ngayLap' => '2026-08-04 11:15:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-T08', 'loaiBaoCao' => 'ThuChiThang', 'tuNgay' => '2026-08-01', 'denNgay' => '2026-08-31', 'ngayLap' => '2026-09-02 09:30:00', 'nguoiLap' => 'NV002'],

            // 2 Báo cáo quý năm 2026
            ['maBaoCao' => 'BCTC-2026-Q1', 'loaiBaoCao' => 'TongHop', 'tuNgay' => '2026-01-01', 'denNgay' => '2026-03-31', 'ngayLap' => '2026-04-06 09:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-2026-Q2', 'loaiBaoCao' => 'TongHop', 'tuNgay' => '2026-04-01', 'denNgay' => '2026-06-30', 'ngayLap' => '2026-07-05 10:00:00', 'nguoiLap' => 'NV002'],

            // 4 Báo cáo đối chiếu sổ quỹ
            ['maBaoCao' => 'BCTC-DCQ-2026-01', 'loaiBaoCao' => 'DoiChieuQuy', 'tuNgay' => '2026-06-01', 'denNgay' => '2026-06-30', 'ngayLap' => '2026-07-01 17:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-DCQ-2026-02', 'loaiBaoCao' => 'DoiChieuQuy', 'tuNgay' => '2026-07-01', 'denNgay' => '2026-07-31', 'ngayLap' => '2026-08-01 17:30:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-DCQ-2026-03', 'loaiBaoCao' => 'DoiChieuQuy', 'tuNgay' => '2026-08-01', 'denNgay' => '2026-08-31', 'ngayLap' => '2026-09-01 18:00:00', 'nguoiLap' => 'NV002'],
            ['maBaoCao' => 'BCTC-DCQ-2026-04', 'loaiBaoCao' => 'DoiChieuQuy', 'tuNgay' => '2026-09-01', 'denNgay' => '2026-09-30', 'ngayLap' => Carbon::now()->toDateTimeString(), 'nguoiLap' => 'NV002'],
        ];
        DB::table('BaoCaoThuChi')->insert($reports);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
