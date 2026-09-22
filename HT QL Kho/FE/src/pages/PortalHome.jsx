import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Boxes, 
  Wallet, 
  Factory, 
  Users, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  ChevronRight,
  Droplet,
  Compass,
  Building2,
  PhoneCall,
  Mail,
  MapPin,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import VinamilkLogo from '../components/VinamilkLogo';

export default function PortalHome() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const erpModules = [
    {
      id: 'warehouse',
      title: 'Phân Hệ Quản Lý Kho (WMS)',
      subtitle: 'Kho thông minh & FEFO',
      desc: 'Quản lý toàn diện Tồn kho theo Lô (Batch ID), thuật toán gợi ý xuất kho theo FEFO (First-Expired, First-Out), Cảnh báo hạn sử dụng, Kiểm soát Nhập/Xuất Nguyên vật liệu và Thành phẩm.',
      icon: Boxes,
      badge: 'ĐANG HOẠT ĐỘNG',
      badgeColor: 'bg-emerald-500 text-white',
      path: '/warehouse',
      active: true,
      stats: '14 Bảng CSDL · 29 Endpoints API',
      highlights: ['Xuất kho tự động FEFO', 'Cảnh báo cận date & tồn tối thiểu', 'Nhập/xuất NVL & Thành phẩm']
    },
    {
      id: 'finance',
      title: 'Phân Hệ Quản Lý Thu Chi (Finance)',
      subtitle: 'Dòng tiền & Ngân quỹ',
      desc: 'Quản trị dòng tiền thu chi minh bạch: Lập và duyệt Phiếu thu bán hàng, Phiếu chi mua NVL và Chi trả lương nhân sự; Đối chiếu Quỹ tiền mặt, Tài khoản ngân hàng và Sổ quỹ tự động.',
      icon: Wallet,
      badge: 'ĐANG HOẠT ĐỘNG',
      badgeColor: 'bg-emerald-500 text-white',
      path: '/finance',
      active: true,
      stats: '9 Bảng CSDL · 25 Endpoints API',
      highlights: ['Phiếu thu đơn hàng phân phối', 'Phiếu chi NVL & Bảng lương', 'Đối soát công nợ & Sổ quỹ']
    },
    {
      id: 'production',
      title: 'Phân Hệ Quản Lý Sản Xuất (MES)',
      subtitle: 'Mega Plant & Tự động hóa',
      desc: 'Lập Kế hoạch & Lệnh sản xuất, Điều phối các công đoạn Tiệt trùng UHT, Đồng hóa, Chiết rót vô trùng. Theo dõi Bán thành phẩm, Định mức NVL và Nghiệm thu chất lượng KCS.',
      icon: Factory,
      badge: 'ĐANG HOẠT ĐỘNG',
      badgeColor: 'bg-emerald-500 text-white',
      path: '/production',
      active: true,
      stats: '14 Bảng CSDL · 42 Quy trình',
      highlights: ['Lệnh sản xuất & KCS', 'Công đoạn tiệt trùng & chiết rót', 'Quản lý bán thành phẩm']
    },
    {
      id: 'hr',
      title: 'Phân Hệ Quản Lý Nhân Sự (HRM)',
      subtitle: 'Hồ sơ 10.000+ Nhân sự',
      desc: 'Hồ sơ nhân viên toàn hệ thống dùng chung cho 5 phân hệ, Cơ cấu tổ chức Phòng ban & Chức vụ, Hợp đồng lao động, Bảng chấm công định kỳ và Bảng tính lương chuyển sang Thu Chi.',
      icon: Users,
      badge: 'TÍCH HỢP THAM CHIẾU',
      badgeColor: 'bg-blue-100 text-[#002795]',
      path: '/hr',
      active: false,
      stats: '6 Bảng CSDL · Nhân sự gốc',
      highlights: ['Hồ sơ nhân viên toàn quốc', 'Phòng ban & Chức vụ', 'Bảng lương tự động sang Thu Chi']
    },
    {
      id: 'sales',
      title: 'Phân Hệ Quản Lý Bán Hàng (SD)',
      subtitle: 'Mạng lưới 250.000 điểm bán',
      desc: 'Quản lý Đơn hàng từ mạng lưới đại lý và siêu thị, Điều phối Xuất bán thành phẩm liên thông Kho hàng, Lập Hóa đơn bán lẻ & Hóa đơn GTGT, Quản lý công nợ khách hàng.',
      icon: ShoppingCart,
      badge: 'ĐANG HOẠT ĐỘNG',
      badgeColor: 'bg-emerald-500 text-white',
      path: '/sales',
      active: true,
      stats: '8 Bảng CSDL · 21 Endpoints API',
      highlights: ['Đơn đặt hàng đại lý', 'Giao hàng liên thông Kho', 'Hóa đơn & Đối soát công nợ']
    }
  ];

  const showcaseProducts = [
    {
      id: 'sp1',
      name: 'Sữa Tươi Tiệt Trùng Vinamilk 100% 180ml',
      category: 'milk',
      categoryName: 'Sữa tươi',
      tag: 'Bán chạy số 1',
      tagColor: 'bg-[#002795] text-white',
      desc: 'Làm hoàn toàn từ 100% sữa bò tươi nguyên chất tại các trang trại chuẩn quốc tế Vinamilk Green Farm.',
      price: '9.500 đ / Hộp',
      code: 'SP001'
    },
    {
      id: 'sp2',
      name: 'Sữa Chua Ăn Vinamilk Có Đường 100g',
      category: 'yogurt',
      categoryName: 'Sữa chua',
      tag: 'Chuẩn Probiotics',
      tagColor: 'bg-emerald-600 text-white',
      desc: 'Lên men tự nhiên từ chủng men Bulgaricus thuần khiết châu Âu, giàu canxi và dưỡng chất tự nhiên.',
      price: '7.500 đ / Hũ',
      code: 'SP002'
    },
    {
      id: 'sp3',
      name: 'Sữa Đặc Có Đường Ông Thọ Nhãn Xanh 380g',
      category: 'condensed',
      categoryName: 'Sữa đặc',
      tag: 'Huyền thoại 1976',
      tagColor: 'bg-amber-600 text-white',
      desc: 'Thương hiệu biểu tượng gắn bó cùng nhiều thế hệ gia đình Việt Nam với độ sánh đậm đà khó quên.',
      price: '28.000 đ / Lon',
      code: 'SP003'
    },
    {
      id: 'sp4',
      name: 'Sữa Hạt Dinh Dưỡng 9 Loại Hạt Super Nut 180ml',
      category: 'nut',
      categoryName: 'Sữa hạt',
      tag: 'Xu hướng sống xanh',
      tagColor: 'bg-teal-600 text-white',
      desc: 'Kết hợp 9 loại hạt thượng hạng: Óc chó, hạnh nhân, yến mạch,... giàu Omega 3 và chất xơ tự nhiên.',
      price: '14.500 đ / Hộp',
      code: 'SP004'
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? showcaseProducts 
    : showcaseProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-[#002795] selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Chuẩn theo vinamilk.com.vn) */}
      <div className="bg-[#001F7D] text-white border-b border-[#002795]/50 px-4 sm:px-8 py-2 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tracking-wider uppercase font-medium">
              MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN TỪ 300K · EST 1976
            </span>
          </div>
          <div className="flex items-center gap-6 uppercase tracking-wider text-[11px]">
            <a href="#story" className="hover:text-sky-200 transition-colors hidden md:inline">Luôn là Vinamilk</a>
            <a href="#technology" className="hover:text-sky-200 transition-colors hidden md:inline">Luôn cầu tiến</a>
            <a href="#products" className="hover:text-sky-200 transition-colors hidden sm:inline">Cửa hàng & Sản phẩm</a>
            <div className="flex items-center gap-3 pl-2 border-l border-white/20">
              <button title="Tìm kiếm" className="hover:text-sky-200 transition-colors cursor-pointer p-1">
                <Search className="w-3.5 h-3.5" />
              </button>
              <button title="Tài khoản ERP" onClick={() => navigate('/warehouse')} className="hover:text-sky-200 transition-colors cursor-pointer p-1">
                <User className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION HEADER (Header thương hiệu Vinamilk) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Official Vinamilk Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-4 cursor-pointer group py-2"
          >
            <VinamilkLogo className="h-12 w-auto text-[#002795] transition-transform duration-300 group-hover:scale-105" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-wider uppercase text-gray-700">
            <a href="#story" className="hover:text-[#002795] transition-colors">Về Vinamilk</a>
            <a href="#products" className="hover:text-[#002795] transition-colors">Sản Phẩm</a>
            <a href="#erp-hub" className="text-[#002795] font-extrabold flex items-center gap-1.5 transition-colors">
              <span>Hệ Thống ERP</span>
              <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-mono">Live</span>
            </a>
            <a href="#sustainability" className="hover:text-[#002795] transition-colors">Phát Triển Bền Vững</a>
            <a href="#farms" className="hover:text-[#002795] transition-colors">Trang Trại Xanh</a>
          </nav>

          {/* Quick Access CTA Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/warehouse')}
              className="bg-[#002795] hover:bg-[#001F7D] text-white px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <span>Vào Cổng ERP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO BANNER SECTION (Đại cảnh Royal Blue y hệt trang chủ Vinamilk) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002795] via-[#002594] to-[#001F7D] text-white py-20 lg:py-28 px-4 sm:px-8">
        
        {/* Background Graphic Patterns & Glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-300 blur-3xl"></div>
        </div>

        {/* Decorative Wave Motif */}
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6">
            
            {/* EST 1976 Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>EST 1976 · THƯƠNG HIỆU SỮA HÀNG ĐẦU VIỆT NAM</span>
            </div>

            {/* Official Slogan */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] uppercase font-display">
              Tại Vinamilk, chúng tôi để tâm đến từng giọt sữa
            </h1>

            {/* Sub-headline */}
            <p className="text-sky-100 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
              Vun đắp hành trình dinh dưỡng gần 50 năm qua bằng khát vọng nâng cao tầm vóc Việt với những sản phẩm đạt chuẩn quốc tế. Hệ sinh thái quản trị số hóa thông minh tích hợp trọn vẹn từ chuỗi trang trại, nhà máy đến hệ thống kho bãi và tài chính.
            </p>

            {/* Core Value Pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 100% Sữa tươi nguyên chất
              </span>
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> 13 Trang trại chuẩn quốc tế
              </span>
              <span className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Tiêu chuẩn xuất kho FEFO
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('/warehouse')}
                className="bg-white text-[#002795] hover:bg-sky-50 px-7 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Boxes className="w-4 h-4 text-[#002795]" />
                <span>Phân Hệ Quản Lý Kho</span>
              </button>

              <button 
                onClick={() => navigate('/finance')}
                className="bg-transparent hover:bg-white/15 text-white border-2 border-white/40 hover:border-white px-7 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-white" />
                <span>Phân Hệ Quản Lý Thu Chi</span>
              </button>

              <a 
                href="#products"
                className="text-sky-200 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1 pl-2 transition-colors cursor-pointer"
              >
                <span>Xem Sản Phẩm</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

        {/* Bottom Curve Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#F8FAFC] rounded-t-[2.5rem]"></div>
      </section>

      {/* 4. KEY METRICS & IMPACT (Các con số biểu tượng của Vinamilk) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-2 mb-16 w-full">
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="space-y-2 border-r border-gray-100 last:border-none pr-4">
            <div className="text-3xl sm:text-4xl font-black text-[#002795] font-display">50+ Năm</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Hành Trình Dinh Dưỡng</div>
            <p className="text-xs text-gray-500 leading-relaxed">Đồng hành và nâng cao tầm vóc thế hệ người Việt từ năm 1976.</p>
          </div>

          <div className="space-y-2 border-r border-gray-100 last:border-none pr-4">
            <div className="text-3xl sm:text-4xl font-black text-[#002795] font-display">150.000+</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Cô Bò Sữa Hạnh Phúc</div>
            <p className="text-xs text-gray-500 leading-relaxed">Chăm sóc tại hệ sinh thái trang trại sinh thái chuẩn Green Farm.</p>
          </div>

          <div className="space-y-2 border-r border-gray-100 last:border-none pr-4">
            <div className="text-3xl sm:text-4xl font-black text-[#002795] font-display">13 Trang Trại</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Chuẩn Quốc Tế & Mega Plant</div>
            <p className="text-xs text-gray-500 leading-relaxed">Hệ thống kho tự động hóa thông minh bậc nhất Đông Nam Á.</p>
          </div>

          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-display">Số 1</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Thương Hiệu Sữa Việt Nam</div>
            <p className="text-xs text-gray-500 leading-relaxed">Top 6 thương hiệu sữa giá trị nhất thế giới theo Brand Finance.</p>
          </div>

        </div>
      </section>

      {/* 5. ERP SUBSYSTEMS CORE HUB (Cổng truy cập 5 Phân hệ Doanh nghiệp) */}
      <section id="erp-hub" className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[#002795] font-mono text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-4 h-4 text-[#002795]" />
              <span>HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP TỔNG THỂ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-950 font-display tracking-tight uppercase">
              Cổng Điều Hành 5 Phân Hệ ERP Vinamilk
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
              Cơ sở dữ liệu ERP tích hợp đồng bộ 5 phân hệ từ Sản xuất, Kho hàng, Bán hàng, Nhân sự đến Thu chi với 51 bảng CSDL chuẩn mực.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-gray-500">Cơ sở dữ liệu:</span>
            <span className="bg-blue-50 border border-blue-200 text-[#002795] px-3 py-1 rounded-full text-xs font-bold font-mono">
              quanly_erp · 51 Bảng
            </span>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {erpModules.map((module) => {
            const Icon = module.icon;
            return (
              <div 
                key={module.id}
                onClick={() => navigate(module.path)}
                className={`group relative bg-white rounded-3xl border transition-all duration-300 p-7 flex flex-col justify-between cursor-pointer ${
                  module.active 
                    ? 'border-gray-200 hover:border-[#002795] hover:shadow-xl hover:-translate-y-1' 
                    : 'border-gray-200/70 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-5">
                  
                  {/* Card Top: Icon & Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      module.active ? 'bg-[#002795] text-white shadow-md shadow-blue-900/20' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider font-mono ${module.badgeColor}`}>
                      {module.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <div className="text-xs font-mono font-semibold uppercase text-sky-700 tracking-wider mb-1">
                      {module.subtitle}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#002795] transition-colors leading-snug font-display">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2.5 leading-relaxed">
                      {module.desc}
                    </p>
                  </div>

                  {/* Highlight feature list */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    {module.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#002795] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card Bottom: Stats & Navigation Link */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400 font-medium">
                    {module.stats}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#002795] text-xs font-bold uppercase tracking-wider group-hover:underline">
                    <span>{module.active ? 'Truy Cập Ngay' : 'Xem Mô Hình'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FEATURED PRODUCTS SHOWCASE (Danh mục sản phẩm Vinamilk) */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-12 shadow-xs">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-[#002795] tracking-widest mb-2">
                DANH MỤC THÀNH PHẨM VINAMILK
              </div>
              <h2 className="text-3xl font-black text-gray-950 font-display uppercase tracking-tight">
                Sản Phẩm Dinh Dưỡng Quốc Dân
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Các sản phẩm đang được theo dõi trực tiếp tại Phân hệ Quản Lý Kho & Thu Chi
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', name: 'Tất Cả' },
                { id: 'milk', name: 'Sữa Tươi' },
                { id: 'yogurt', name: 'Sữa Chua' },
                { id: 'condensed', name: 'Sữa Đặc' },
                { id: 'nut', name: 'Sữa Hạt' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === tab.id 
                      ? 'bg-[#002795] text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div 
                key={p.id}
                className="bg-[#F8FAFC] border border-gray-200/90 rounded-2xl p-5 flex flex-col justify-between hover:border-[#002795] hover:bg-white transition-all group shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-gray-400">
                      MÃ: {p.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${p.tagColor}`}>
                      {p.tag}
                    </span>
                  </div>

                  <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl flex items-center justify-center p-4 group-hover:scale-102 transition-transform">
                    <Droplet className="w-12 h-12 text-[#002795]/30 group-hover:text-[#002795] transition-colors" />
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-sky-700 font-bold uppercase">{p.categoryName}</span>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#002795] transition-colors leading-snug line-clamp-2">
                      {p.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200/70 flex items-center justify-between">
                  <div className="text-sm font-extrabold text-[#002795]">{p.price}</div>
                  <button 
                    onClick={() => navigate('/warehouse/master-data/products')}
                    className="text-xs font-bold text-gray-600 group-hover:text-[#002795] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem Kho</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/warehouse/master-data/products')}
              className="inline-flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-[#002795] hover:text-[#001F7D] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-6 py-3 rounded-full transition-colors cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Quản Lý Toàn Bộ Danh Mục Sản Phẩm Trong Kho Hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 7. BRAND STORY & PHILOSOPHY (Luôn là Vinamilk - Luôn cầu tiến) */}
      <section id="story" className="bg-[#001F7D] text-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-sky-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>CAM KẾT CHẤT LƯỢNG QUỐC TẾ</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display leading-tight">
              Gần 50 Năm Vun Đắp Tầm Vóc Việt
            </h2>

            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              Từ năm 1976, Vinamilk không ngừng mở rộng vùng nguyên liệu xanh, ứng dụng công nghệ tiệt trùng tối tân và xây dựng các siêu nhà máy Mega Plant tự động hóa 100%. Mỗi sản phẩm sữa trao gửi đến hàng triệu gia đình đều là kết tinh của sự tận tụy, chuẩn mực khắt khe và khát vọng vươn tầm thế giới.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                <div className="text-xl font-bold font-display text-sky-200">Green Farm</div>
                <p className="text-xs text-sky-100 mt-1">Trang trại sinh thái tuần hoàn, phúc lợi động vật chuẩn GlobalG.A.P.</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/15">
                <div className="text-xl font-bold font-display text-emerald-300">Net Zero 2050</div>
                <p className="text-xs text-sky-100 mt-1">Tiên phong trung hòa carbon vì tương lai xanh bền vững cho Việt Nam.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/15 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold font-display uppercase tracking-wide text-white">
              Cơ Sở Hạ Tầng ERP Doanh Nghiệp
            </h3>
            
            <div className="space-y-4 text-sm text-sky-100">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Tích hợp Kho & Tài chính Realtime:</strong>
                  Mọi biến động nhập xuất kho đều tự động sinh chứng từ đề nghị thu chi, loại bỏ sai lệch số liệu kế toán.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Thuật toán FEFO thông minh:</strong>
                  Bảo đảm lô hàng có hạn sử dụng gần nhất luôn được ưu tiên xuất kho trước, giảm thiểu 100% rủi ro hết hạn.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Sẵn sàng mở rộng Module:</strong>
                  Cấu trúc CSDL sẵn sàng mở rộng đầy đủ cho Sản Xuất (MES), Nhân Sự (HRM) và Bán Hàng (CRM/SD).
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => navigate('/warehouse')}
                className="w-full bg-white hover:bg-sky-50 text-[#002795] font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
              >
                Khám Phá Toàn Diện Hệ Thống ERP Ngay
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 8. OFFICIAL FOOTER (Chuẩn website vinamilk.com.vn) */}
      <footer className="bg-[#00153D] text-white pt-16 pb-12 px-4 sm:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Logo & Company Address */}
          <div className="lg:col-span-2 space-y-4">
            <VinamilkLogo className="h-12 w-auto text-white" />
            <p className="text-xs text-sky-200/80 leading-relaxed max-w-md pt-2">
              <strong>CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK)</strong><br />
              Trụ sở chính: Tòa nhà Vinamilk, Số 10 Tân Trào, Phường Tân Mỹ, Thành phố Hồ Chí Minh, Việt Nam.<br />
              Giấy chứng nhận ĐKDN số 0300588569 do Sở Kế hoạch và Đầu tư TP.HCM cấp.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-sky-200">
              <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5" /> 1900 636 979</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> vinamilk@vinamilk.com.vn</span>
            </div>
          </div>

          {/* Col 2: ERP Subsystems */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs font-mono uppercase tracking-widest text-sky-300">Phân Hệ ERP</h4>
            <ul className="space-y-2 text-xs text-sky-100/80">
              <li><a href="/warehouse" className="hover:text-white transition-colors">Quản Lý Kho Hàng (FEFO)</a></li>
              <li><a href="/finance" className="hover:text-white transition-colors">Quản Lý Thu Chi & Quỹ</a></li>
              <li><a href="/production" className="hover:text-white transition-colors">Quản Lý Sản Xuất (MES)</a></li>
              <li><a href="/hr" className="hover:text-white transition-colors">Quản Lý Nhân Sự (HRM)</a></li>
              <li><a href="/sales" className="hover:text-white transition-colors">Quản Lý Bán Hàng (SD)</a></li>
            </ul>
          </div>

          {/* Col 3: Brand & Products */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs font-mono uppercase tracking-widest text-sky-300">Thương Hiệu</h4>
            <ul className="space-y-2 text-xs text-sky-100/80">
              <li><a href="#products" className="hover:text-white transition-colors">Sữa Tươi Tiệt Trùng 100%</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Sữa Chua Vinamilk Probiotics</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Sữa Đặc Ông Thọ & Ngôi Sao</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Sữa Bột Dielac Cho Bé</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Sữa Hạt Cao Cấp Super Nut</a></li>
            </ul>
          </div>

          {/* Col 4: Sustainability & Standards */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs font-mono uppercase tracking-widest text-sky-300">Tiêu Chuẩn</h4>
            <ul className="space-y-2 text-xs text-sky-100/80">
              <li>Trang trại sinh thái Green Farm</li>
              <li>Tiêu chuẩn GlobalG.A.P</li>
              <li>Chứng nhận Organic Châu Âu</li>
              <li>Tiêu chuẩn ISO 9001 & HACCP</li>
              <li>Cam kết trung hòa Net Zero 2050</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-200/60 font-mono">
          <div>
            © {new Date().getFullYear()} CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK) · HỆ THỐNG ERP TOÀN DIỆN.
          </div>
          <div className="flex gap-6 uppercase tracking-wider text-[11px]">
            <a href="#" className="hover:text-white">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
