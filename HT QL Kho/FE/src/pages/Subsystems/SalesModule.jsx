import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function SalesModule() {
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

      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg p-8  space-y-3">
        <div className="p-3 bg-white/10 rounded-lg w-fit ">
          <ShoppingCart className="w-8 h-8 text-amber-200" />
        </div>
        <h1 className="text-2xl font-bold">Phân Hệ Quản Lý Bán Hàng (Sales & Distribution)</h1>
        <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
          Quản lý danh mục Đại lý / Nhà phân phối, Đơn đặt hàng bán, Theo dõi trạng thái vận chuyển giao hàng, Xuất hóa đơn & Quản lý công nợ phải thu.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-semibold text-[#0B2341] text-sm">Các Bảng CSDL Tham Chiếu Đã Chuẩn Hóa trong `database_erp.sql`:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border"><b>KhachHang</b>: Khách hàng & Nhà phân phối</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>DonHang</b>: Quản lý đơn bán hàng</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>GiaoHang</b>: Trạng thái vận chuyển</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>HoaDon</b>: Hóa đơn bán hàng</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>CongNo</b>: Công nợ phải thu</div>
          <div className="p-3 bg-slate-50 rounded-lg border"><b>ThanhToan</b>: Lịch sử thanh toán</div>
        </div>
      </div>
    </div>
  );
}
