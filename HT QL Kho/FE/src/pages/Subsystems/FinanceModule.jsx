import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowLeft } from 'lucide-react';

export default function FinanceModule() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8 space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl shadow-xs inline-flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về Trang Chủ Cổng Thông Tin ERP</span>
      </button>

      <div className="bg-gradient-to-r from-purple-700 to-pink-800 text-white rounded-3xl p-8 shadow-lg space-y-3">
        <div className="p-3 bg-white/10 rounded-2xl w-fit backdrop-blur">
          <Wallet className="w-8 h-8 text-pink-200" />
        </div>
        <h1 className="text-2xl font-black">Phân Hệ Quản Lý Thu Chi (Finance & Cash/Bank)</h1>
        <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
          Quản lý các khoản Thu - Chi, Lập Phiếu thu, Phiếu chi, Quản lý Quỹ tiền mặt & Tài khoản Ngân hàng, Báo cáo tổng hợp dòng tiền.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-[#00249C] text-sm">Các Bảng CSDL Tham Chiếu Đã Chuẩn Hóa trong `database_erp.sql`:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-2xl border"><b>DanhMucThu</b>: Khoản mục thu</div>
          <div className="p-3 bg-slate-50 rounded-2xl border"><b>DanhMucChi</b>: Khoản mục chi</div>
          <div className="p-3 bg-slate-50 rounded-2xl border"><b>DoiTuongGiaoDich</b>: Ánh xạ đối tượng giao dịch</div>
          <div className="p-3 bg-slate-50 rounded-2xl border"><b>TaiKhoanQuy</b>: Quỹ tiền mặt/Ngân hàng</div>
          <div className="p-3 bg-slate-50 rounded-2xl border"><b>PhieuThu</b> & <b>PhieuChi</b>: Phiếu thu/chi tiền</div>
          <div className="p-3 bg-slate-50 rounded-2xl border"><b>BaoCaoThuChi</b>: Báo cáo dòng tiền</div>
        </div>
      </div>
    </div>
  );
}
