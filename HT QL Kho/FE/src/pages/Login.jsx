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
      // In a real app we'd call the API:
      // const res = await fetch('/api/hr/auth/login', { ... })
      // const data = await res.json()
      // if (data.success) login(data.data)

      // Fake login check to see if they typed 123456
      if (matKhau === '123456') {
         login({ maNV: 'NV999', hoTen: 'Nhân viên (Test)', soDienThoai, vaiTro: 'Nhân viên', phaiDoiMatKhau: true });
      } else {
         setError('Số điện thoại hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
    setLoading(false);
  };

  const quickLogin = (role) => {
    login({ maNV: 'NV_' + role, hoTen: `Tài khoản ${role}`, soDienThoai: '0999999999', vaiTro: role });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Real Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-blue-900 mb-2">Vinamilk ERP</h1>
            <p className="text-slate-500">Đăng nhập vào hệ thống quản trị nguồn lực</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input 
                  type="text" 
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input 
                  type="password" 
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md"
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
            </button>
          </form>
        </div>

        {/* Right Side: Quick Demo Logins */}
        <div className="w-full md:w-1/2 bg-slate-100 p-8 md:p-12 border-l border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              Đăng Nhập Nhanh (Dành cho Demo)
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Bạn có thể sử dụng 1 tài khoản Admin để truy cập toàn bộ hệ thống, hoặc chọn tài khoản nhân viên theo từng phân hệ để test phân quyền (ví dụ: Nhân viên kho sẽ không thấy nút Duyệt).
            </p>
          </div>

          <div className="space-y-3">
            <button onClick={() => quickLogin('Admin')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Quản Trị Viên (Toàn Quyền)
            </button>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={() => quickLogin('Quản lý kho')} className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1">
                <Boxes className="w-3 h-3" /> Quản Lý Kho
              </button>
              <button onClick={() => quickLogin('Nhân viên kho')} className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1">
                <Boxes className="w-3 h-3" /> Nhân Viên Kho
              </button>

              <button onClick={() => quickLogin('Quản lý sản xuất')} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1">
                <Factory className="w-3 h-3" /> Quản Lý Sản Xuất
              </button>
              <button onClick={() => quickLogin('Nhân viên sản xuất')} className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1">
                <Factory className="w-3 h-3" /> NV Sản Xuất
              </button>

              <button onClick={() => quickLogin('Kế toán trưởng')} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3" /> Kế Toán Trưởng
              </button>
              <button onClick={() => quickLogin('Kế toán thanh toán')} className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3" /> KT Thanh Toán
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
