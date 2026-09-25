import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Users, Lock, Factory, ShoppingCart, Wallet, Boxes } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [soDienThoai, setSoDienThoai] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const lower = soDienThoai.trim().toLowerCase();
      if (lower === 'quanly' || lower === 'ql' || lower === 'admin') {
        login({ maNV: 'NV001', hoTen: 'Nguyễn Văn Hùng (Quản Lý)', soDienThoai: '0901234567', vaiTro: 'Quản lý kho' });
      } else if (lower === 'nhanvien' || lower === 'nv') {
        login({ maNV: 'NV006', hoTen: 'Đặng Mai Phương (Nhân Viên)', soDienThoai: '0907654321', vaiTro: 'Nhân viên kho' });
      } else if (matKhau === '123456' || matKhau.length > 0) {
        // Default to Staff or detect based on input
        if (lower.includes('ql') || lower.includes('quan ly')) {
          login({ maNV: 'NV001', hoTen: 'Nguyễn Văn Hùng (Quản Lý)', soDienThoai, vaiTro: 'Quản lý kho' });
        } else {
          login({ maNV: 'NV006', hoTen: 'Đặng Mai Phương (Nhân Viên)', soDienThoai, vaiTro: 'Nhân viên kho' });
        }
      } else {
        setError('Vui lòng nhập mật khẩu (Mặc định: 123456).');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
    setLoading(false);
  };

  const loginAsActor = (actorType) => {
    if (actorType === 'quanly') {
      login({
        maNV: 'NV001',
        hoTen: 'Nguyễn Văn Hùng',
        chucVu: 'Trưởng Phòng Kho Vận',
        vaiTro: 'Quản lý kho',
        soDienThoai: '0901234567'
      });
    } else if (actorType === 'nhanvien') {
      login({
        maNV: 'NV006',
        hoTen: 'Đặng Mai Phương',
        chucVu: 'Thủ Kho Trưởng / Kiểm Soát FEFO',
        vaiTro: 'Nhân viên kho',
        soDienThoai: '0907654321'
      });
    }
  };

  const quickLogin = (role) => {
    login({ maNV: 'NV_' + role, hoTen: `Tài khoản ${role}`, soDienThoai: '0999999999', vaiTro: role });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Real Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-blue-900 mb-2">Vinamilk ERP</h1>
            <p className="text-slate-500 text-xs">Hệ thống điều hành Quản lý Kho & Liên kết Phân hệ</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tài khoản / Số điện thoại</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input 
                  type="text" 
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập: quanly hoặc nhanvien"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input 
                  type="password" 
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mặc định: 123456"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs cursor-pointer"
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-relaxed">
            <span className="font-bold">💡 Gợi ý đăng nhập nhanh:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
              <li>Nhập <span className="font-mono font-bold text-blue-700">quanly</span> để vào vai Quản lý</li>
              <li>Nhập <span className="font-mono font-bold text-blue-700">nhanvien</span> để vào vai Nhân viên</li>
              <li>Hoặc bấm trực tiếp nút chọn vai trò bên phải &rarr;</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Quick Demo Logins for 2 Actors */}
        <div className="w-full md:w-1/2 bg-slate-100 p-8 md:p-10 border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <span>2 Actor Chính Của Phân Hệ Kho</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Đăng nhập 1-chạm để trải nghiệm phân quyền giữa Nhân viên lập phiếu và Quản lý phê duyệt (theo Chương 3):
              </p>
            </div>

            {/* 2 Main Actors Prominent Buttons */}
            <div className="space-y-3">
              {/* Actor 1: Quản Lý */}
              <div 
                onClick={() => loginAsActor('quanly')}
                className="bg-white hover:bg-blue-50 border-2 border-blue-600/60 hover:border-blue-700 p-3.5 rounded-2xl cursor-pointer shadow-sm transition hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-600 text-white rounded-xl group-hover:scale-105 transition">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-900">Actor 1: QUẢN LÝ KHO</div>
                      <div className="text-[11px] text-slate-700 font-semibold">Nguyễn Văn Hùng (NV001)</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Duyệt phiếu
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 pl-9">
                  &bull; Quyền duyệt/từ chối phiếu nhập - xuất, quản lý danh mục, phê duyệt đề nghị bổ sung.
                </p>
              </div>

              {/* Actor 2: Nhân Viên */}
              <div 
                onClick={() => loginAsActor('nhanvien')}
                className="bg-white hover:bg-emerald-50 border-2 border-emerald-500/60 hover:border-emerald-600 p-3.5 rounded-2xl cursor-pointer shadow-sm transition hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">Actor 2: NHÂN VIÊN KHO</div>
                      <div className="text-[11px] text-slate-700 font-semibold">Đặng Mai Phương (NV006)</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Lập phiếu
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 pl-9">
                  &bull; Quyền lập phiếu nhập NVL & SP, lập phiếu xuất kho, gửi đề nghị (Không thấy nút Duyệt).
                </p>
              </div>
            </div>
          </div>

          {/* Other Roles Demo Section */}
          <div className="mt-5 pt-3 border-t border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Các phân hệ liên kết khác:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => quickLogin('Admin')} className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                Admin (Toàn quyền)
              </button>
              <button onClick={() => quickLogin('Quản lý sản xuất')} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                Sản Xuất (QL)
              </button>
              <button onClick={() => quickLogin('Kế toán trưởng')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                Thu Chi (Kế toán)
              </button>
              <button onClick={() => quickLogin('Quản lý bán hàng')} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-1.5 rounded-lg text-[10px] transition cursor-pointer">
                Bán Hàng (Kinh doanh)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
