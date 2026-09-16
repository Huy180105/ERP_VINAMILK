import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HRModule() {
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

      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-3xl p-8 shadow-lg space-y-3">
        <div className="p-3 bg-white/10 rounded-2xl w-fit backdrop-blur">
          <Users className="w-8 h-8 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-black">Phân Hệ Quản Lý Nhân Sự (HRM & Payroll)</h1>
        <p className="text-xs text-teal-100 max-w-2xl leading-relaxed">
          Quản lý hồ sơ nhân viên toàn công ty, cơ cấu phòng ban, chức vụ, hợp đồng lao động, chấm công thực tế và hạch toán lương hàng tháng.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-[#00249C] text-sm">Các Bảng CSDL Tham Chiếu Đã Chuẩn Hóa trong `database_erp.sql`:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border font-mono"><b>PhongBan</b>: Phòng ban trực thuộc</div>
          <div className="p-3 bg-slate-50 rounded-2xl border font-mono"><b>ChucVu</b>: Chức vụ & phụ cấp</div>
          <div className="p-3 bg-slate-50 rounded-2xl border font-mono"><b>NhanVien</b>: Hồ sơ nhân viên gốc</div>
          <div className="p-3 bg-slate-50 rounded-2xl border font-mono"><b>HopDong</b>: Hợp đồng lao động</div>
          <div className="p-3 bg-slate-50 rounded-2xl border font-mono"><b>BangCong</b>: Chấm công hàng tháng</div>
          <div className="p-3 bg-slate-50 rounded-2xl border font-mono"><b>BangLuong</b>: Tổng hợp lương tháng</div>
        </div>
      </div>
    </div>
  );
}
