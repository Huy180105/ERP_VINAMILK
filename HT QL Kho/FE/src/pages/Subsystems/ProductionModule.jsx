import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, ArrowLeft } from 'lucide-react';

export default function ProductionModule() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8 space-y-6">
      <button 
        onClick={() => navigate('/')}
        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-md shadow-sm inline-flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về Trang Chủ Cổng Thông Tin ERP</span>
      </button>

      <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-lg p-8  space-y-3">
        <div className="p-3 bg-white/10 rounded-lg w-fit ">
          <Factory className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-2xl font-bold">Phân Hệ Quản Lý Sản Xuất (Production Management)</h1>
        <p className="text-xs text-indigo-100 max-w-2xl leading-relaxed">
          Quản lý Lệnh sản xuất, quy trình công đoạn (Phối trộn, Tiệt trùng, Đồng hóa, Chiết rót, Đóng gói), Bán thành phẩm, Biên bản nghiệm thu QC & Lệnh làm bù.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-semibold text-[#0B2341] text-sm">Các Bảng CSDL Tham Chiếu Đã Chuẩn Hóa trong `database_erp.sql`:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border"><b>LenhSanXuat</b>: Lệnh sản xuất kế hoạch</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>CongDoan</b>: Quản lý công đoạn xưởng</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>PhieuYeuCauNVL</b>: Yêu cầu NVL gửi Kho</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>PhieuNghiemThu</b>: Biên bản nghiệm thu QC</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>PhieuYeuCauXuatSP</b>: Bàn giao SP cho Kho</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>PhieuSanXuatBu</b>: Lệnh sản xuất bù phế phẩm</div>
        </div>
      </div>
    </div>
  );
}
