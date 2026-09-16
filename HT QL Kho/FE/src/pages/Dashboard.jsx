import React, { useEffect, useState } from 'react';
import { InventoryAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import FefoBadge from '../components/FefoBadge';
import { 
  Boxes, 
  Package, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [expiryRes, lowStockRes, inventoryRes] = await Promise.all([
        InventoryAPI.getNearExpiryAlerts(60).catch(() => ({ data: { data: [] } })),
        InventoryAPI.getLowStockAlerts(1000).catch(() => ({ data: { data: [] } })),
        InventoryAPI.getInventory().catch(() => ({ data: { data: [] } })),
      ]);

      setExpiryAlerts(expiryRes.data.data || []);
      setLowStockAlerts(lowStockRes.data.data || []);
      setLots(inventoryRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalLots = lots.length;
  const materialLots = lots.filter(l => l.maNVL).length;
  const productLots = lots.filter(l => l.maSP).length;

  return (
    <div className="space-y-6">
      {/* Hero Banner with Soft Royal Gradient */}
      <div className="bg-gradient-to-br from-[#00249C] via-[#001D80] to-[#001250] rounded-3xl p-7 text-white soft-shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden border border-blue-800/40">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 border border-amber-300/30 px-3.5 py-1 rounded-full text-xs font-bold backdrop-blur">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Kích hoạt Thuật toán FEFO (Ưu tiên Lô gần hết hạn trước)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center space-x-2">
            <span>Hệ Thống Quản Lý Kho Vinamilk ERP</span>
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </h1>
          <p className="text-blue-100/90 text-xs leading-relaxed font-medium">
            Quản lý tập trung số lượng Tồn kho Nguyên vật liệu & Thành phẩm theo Lô (Batch ID) & Hạn sử dụng (HSD). Đảm bảo chất lượng quốc tế ISO/HACCP cho toàn bộ hệ thống nhà máy Vinamilk.
          </p>
        </div>

        <div className="mt-5 md:mt-0 z-10">
          <button 
            onClick={() => window.location.href = '/outbound/products'}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Xuất Hàng FEFO Ngay</span>
          </button>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Boxes className="w-72 h-72 -mr-12 -mb-12 text-white" />
        </div>
      </div>

      {/* Stat Cards - Soft Rounded Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 soft-shadow transform transition hover:-translate-y-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Số Lô Tồn Kho</p>
            <p className="text-3xl font-black text-[#00249C] mt-1">{totalLots}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đang hoạt động</span>
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-[#00249C] rounded-2xl">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 soft-shadow transform transition hover:-translate-y-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lô Nguyên Vật Liệu</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{materialLots}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Sữa tươi thô, đường, bao bì...</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 soft-shadow transform transition hover:-translate-y-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lô Thành Phẩm Vinamilk</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{productLots}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Sữa tươi 100%, sữa chua...</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 soft-shadow transform transition hover:-translate-y-1 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cảnh Báo FEFO (Sắp HSD)</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{expiryAlerts.length}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">Ưu tiên xuất hàng</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. FEFO Near Expiry Alert List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 soft-shadow p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Cảnh Báo Lô Hàng Sắp Hết Hạn (FEFO Priority)</h2>
                <p className="text-[11px] text-slate-500">Các lô cần ưu tiên xuất hàng trong 60 ngày tới</p>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              {expiryAlerts.length} Lô
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Mã Lô</th>
                  <th className="p-3">Tên Mặt Hàng</th>
                  <th className="p-3">Hạn Sử Dụng</th>
                  <th className="p-3 text-right">Tồn Hiện Tại</th>
                  <th className="p-3 text-center">Ưu Tiên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiryAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-5 text-center text-slate-400 font-medium">
                      Không có lô hàng nào sắp hết hạn trong 60 ngày tới.
                    </td>
                  </tr>
                ) : (
                  expiryAlerts.map((item, idx) => {
                    const itemName = item.sanPham?.tenSanPham || item.nguyenVatLieu?.tenNVL || item.tenTonKho;
                    const daysLeft = Math.ceil((new Date(item.hanSuDung) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#00249C]">{item.maTonKho}</td>
                        <td className="p-3 font-bold text-slate-800">{itemName}</td>
                        <td className="p-3 text-slate-600 font-mono font-semibold">{item.hanSuDung}</td>
                        <td className="p-3 text-right font-black text-slate-900">
                          {item.soLuongTonHienTai.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <FefoBadge daysLeft={daysLeft} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 soft-shadow p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-100 text-rose-800 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Cảnh Báo Tồn Kho Dưới Mức Tối Thiểu</h2>
                <p className="text-[11px] text-slate-500">Các mặt hàng cần nhập bổ sung khẩn cấp</p>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-rose-100 text-rose-900 px-3 py-1 rounded-full border border-rose-200">
              {lowStockAlerts.length} Mặt Hàng
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Mã Lô</th>
                  <th className="p-3">Mặt Hàng</th>
                  <th className="p-3 text-right">Số Tồn Thực Tế</th>
                  <th className="p-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-5 text-center text-slate-400 font-medium">
                      Tồn kho an toàn, không có mặt hàng nào dưới định mức.
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map((item, idx) => {
                    const itemName = item.sanPham?.tenSanPham || item.nguyenVatLieu?.tenNVL || item.tenTonKho;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#00249C]">{item.maTonKho}</td>
                        <td className="p-3 font-bold text-slate-800">{itemName}</td>
                        <td className="p-3 text-right font-black text-rose-600">
                          {item.soLuongTonHienTai.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <StatusBadge status="Tồn kho thấp" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
