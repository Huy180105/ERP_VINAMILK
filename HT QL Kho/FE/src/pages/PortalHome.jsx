import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Boxes, 
  Package, 
  Users, 
  ShoppingCart, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Heart, 
  Factory, 
  Globe, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function PortalHome() {
  const navigate = useNavigate();

  const erpModules = [
    {
      id: 'warehouse',
      title: 'Phân Hệ Quản Lý Kho',
      desc: 'Quản lý Tồn kho theo Lô (Batch ID), FEFO, Cảnh báo HSD, Nhập/Xuất Nguyên vật liệu & Thành phẩm.',
      icon: Boxes,
      badge: 'SẴN SÀNG 100%',
      badgeColor: 'bg-emerald-500 text-white',
      path: '/warehouse',
      active: true,
      color: 'from-blue-600 to-indigo-700',
      stats: '14 Bảng CSDL | 29 Endpoints API'
    },
    {
      id: 'production',
      title: 'Phân Hệ Quản Lý Sản Xuất',
      desc: 'Lập Lệnh sản xuất, Quản lý 6 công đoạn tiệt trùng, Yêu cầu NVL, Bán thành phẩm & Nghiệm thu QC.',
      icon: Factory,
      badge: 'SẴN SÀNG 100%',
      badgeColor: 'bg-emerald-500 text-white',
      path: '/production',
      active: true,
      color: 'from-indigo-600 to-purple-700',
      stats: '14 Bảng CSDL | 37 Chức Năng'
    },
    {
      id: 'hr',
      title: 'Phân Hệ Quản Lý Nhân Sự',
      desc: 'Hồ sơ nhân viên toàn công ty, Cơ cấu phòng ban, Hợp đồng lao động, Chấm công & Tính lương.',
      icon: Users,
      badge: 'SẴN SÀNG THAM CHIẾU',
      badgeColor: 'bg-blue-600 text-white',
      path: '/hr',
      active: false,
      color: 'from-teal-600 to-emerald-700',
      stats: '6 Bảng CSDL | Quản Lý Hồ Sơ Gốc'
    },
    {
      id: 'sales',
      title: 'Phân Hệ Quản Lý Bán Hàng',
      desc: 'Tiếp nhận Đơn hàng đại lý, Xuất bán thành phẩm, Quản lý vận chuyển, Hóa đơn & Công nợ phải thu.',
      icon: ShoppingCart,
      badge: 'SẴN SÀNG THAM CHIẾU',
      badgeColor: 'bg-blue-600 text-white',
      path: '/sales',
      active: false,
      color: 'from-amber-600 to-orange-700',
      stats: '8 Bảng CSDL | Kênh Nhà Phân Phối'
    },
    {
      id: 'finance',
      title: 'Phân Hệ Quản Lý Thu Chi',
      desc: 'Lập Phiếu thu, Phiếu chi, Quản lý Quỹ tiền mặt/Ngân hàng, Báo cáo dòng tiền & Thu chi tổng hợp.',
      icon: Wallet,
      badge: 'SẴN SÀNG THAM CHIẾU',
      badgeColor: 'bg-blue-600 text-white',
      path: '/finance',
      active: false,
      color: 'from-purple-600 to-pink-700',
      stats: '9 Bảng CSDL | Kế Toán Dòng Tiền'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans">
      {/* Top Banner Announcement */}
      <div className="bg-[#001768] text-white text-xs py-2 px-4 text-center font-semibold flex items-center justify-center space-x-2 border-b border-blue-900">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>CỔNG THÔNG TIN TỔNG THỂ HỆ THỐNG ERP VINAMILK - CHÀO MỪNG KỶ NIỆM 50 NĂM (1976 - 2026)</span>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#00249C] text-white px-8 py-4 sticky top-0 z-40 shadow-md flex items-center justify-between border-b border-blue-800/40">
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-1.5 rounded-2xl flex items-center shadow-md cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-black text-2xl tracking-tighter text-[#00249C] italic">VINAMILK</span>
            <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold px-1.5 py-0.5 rounded-full ml-1.5 uppercase">EST 1976</span>
          </div>
          <div className="hidden md:flex flex-col border-l border-blue-400/30 pl-4">
            <span className="font-extrabold text-sm text-white tracking-wide">CỔNG THÔNG TIN ERP DOANH NGHIỆP</span>
            <span className="text-[11px] text-blue-200">Vinamilk Enterprise Portal System</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-semibold">
          <span className="hidden lg:inline-flex items-center space-x-1.5 text-blue-200">
            <Globe className="w-4 h-4" />
            <span>Hệ Thống Nhà Máy Toàn Quốc</span>
          </span>
          <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Đạt Chuẩn Quốc Tế ISO/HACCP</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#00249C] via-[#001C70] to-[#001040] text-white py-16 px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>50 NĂM PHỤNG SỰ KHÁT VỌNG VIỆT</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              NHÀ CÓ TIỆC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-amber-200 to-white">
                MỜI BẠN CHUNG VUI
              </span>
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed font-medium">
              Cầu tiến là bí quyết. Vinamilk không ngừng ứng dụng công nghệ quản trị ERP tiên tiến nhất để tích hợp 5 phân hệ lõi: Nhân sự, Sản xuất, Kho, Bán hàng & Thu chi trên cùng một nền tảng dữ liệu tập trung.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
              <button 
                onClick={() => navigate('/warehouse')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transform transition hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
              >
                <span>📦 VÀO PHÂN HỆ QUẢN LÝ KHO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/production')}
                className="bg-white hover:bg-blue-50 text-[#00249C] px-6 py-3.5 rounded-2xl shadow-lg transform transition hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
              >
                <span>🏭 VÀO PHÂN HỆ SẢN XUẤT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-3xl text-center space-y-4 max-w-sm w-full soft-shadow-lg">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-[#00249C] shadow-md">
                <Boxes className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-white">Phân Hệ Kho Đã Kích Hoạt</h3>
              <p className="text-xs text-blue-200 leading-relaxed font-medium">
                Tích hợp thuật toán FEFO, Quản lý Tồn kho theo Lô & 29 Endpoints API Backend Laravel.
              </p>
              <button 
                onClick={() => navigate('/warehouse')}
                className="w-full bg-white text-[#00249C] font-extrabold py-2.5 rounded-xl hover:bg-blue-50 transition text-xs shadow-md"
              >
                Truy Cập Ngay
              </button>
            </div>
          </div>
        </div>
        
        {/* Subtle Background Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 5 ERP Modules Portal Section */}
      <section className="max-w-6xl mx-auto px-8 py-16 space-y-10 w-full">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black tracking-widest text-blue-700 uppercase">HỆ THỐNG TRUNG TÂM</span>
          <h2 className="text-2xl md:text-3xl font-black text-[#00249C]">5 Phân Hệ Quản Trị ERP Vinamilk</h2>
          <p className="text-xs text-slate-500 font-medium">
            Lựa chọn phân hệ làm việc tương ứng với 5 mảng nghiệp vụ chuyên biệt trong toàn bộ quy trình ERP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {erpModules.map((module) => {
            const Icon = module.icon;
            return (
              <div 
                key={module.id}
                onClick={() => navigate(module.path)}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between soft-shadow hover:soft-shadow-lg transform hover:-translate-y-1.5 ${
                  module.active ? 'border-blue-400 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl text-white bg-gradient-to-br ${module.color} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${module.badgeColor}`}>
                      {module.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#00249C] transition">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                      {module.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">{module.stats}</span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#00249C] hover:underline">
                    <span>Truy Cập</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Net Zero & Sustainability Banner */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white py-14 px-8 border-t border-emerald-800/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
              <Heart className="w-4 h-4 fill-emerald-400" />
              <span>ĐỂ TÂM HÀNH ĐỘNG</span>
            </div>
            <h3 className="text-xl font-black">Vinamilk Green Farm & Net Zero 2050</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
              Chỉ 1 năm sau kế hoạch Net Zero 2050, Vinamilk đã có 3 đơn vị đạt Chứng nhận Quốc tế về Trung hòa Carbon.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 text-xs space-y-1">
            <h4 className="font-bold text-emerald-300">01. Nhà Máy Xanh</h4>
            <p className="text-emerald-100/70 text-[11px]">Ứng dụng năng lượng mặt trời và tự động hóa quy trình quản trị ERP.</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 text-xs space-y-1">
            <h4 className="font-bold text-emerald-300">02. Nông Trại Sinh Thái</h4>
            <p className="text-emerald-100/70 text-[11px]">Trang trại bò sữa Vinamilk 100% thiên nhiên, đạt chuẩn quốc tế.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001768] text-blue-200 py-10 px-8 text-xs border-t border-blue-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="bg-white px-3 py-1 rounded-xl inline-block">
              <span className="font-black text-xl text-[#00249C] italic">VINAMILK</span>
            </div>
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK)<br />
              Số 10 Tân Trào, Phường Tân Mỹ, TP. Hồ Chí Minh
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">HỆ THỐNG ERP</h4>
            <ul className="space-y-1 text-[11px]">
              <li><a href="/warehouse" className="hover:underline">Quản Lý Kho</a></li>
              <li><a href="/production" className="hover:underline">Quản Lý Sản Xuất</a></li>
              <li><a href="/hr" className="hover:underline">Quản Lý Nhân Sự</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">THƯƠNG HIỆU</h4>
            <ul className="space-y-1 text-[11px]">
              <li>Sữa Tươi 100% Thiên Nhiên</li>
              <li>Sữa Chua Vinamilk</li>
              <li>Sữa Bột Dielac Gold</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">HỖ TRỢ</h4>
            <p className="text-[11px]">Tổng đài: 1900 636 979</p>
            <p className="text-[11px]">Email: vinamilk@vinamilk.com.vn</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-blue-900/80 mt-8 pt-4 text-center text-[10px] text-blue-300/60">
          © Bản quyền thuộc về Vinamilk 2026. Hệ thống ERP Quản trị Doanh nghiệp Sữa Việt Nam.
        </div>
      </footer>
    </div>
  );
}
