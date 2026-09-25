import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesAPI } from '../../../services/api';
import {
  ShoppingCart,
  Users,
  ReceiptText,
  CircleDollarSign,
  TrendingUp,
  PackageCheck,
  Search,
  Tag,
  PlusCircle,
  ExternalLink
} from 'lucide-react';

const currency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    summary: {},
    orders: [],
    customers: [],
    invoices: [],
    receivables: [],
  });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getDashboard();
      setData(res.data?.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!keyword.trim()) return data.orders || [];
    const q = keyword.toLowerCase();
    return (data.orders || []).filter(
      (item) =>
        (item.maDonHang || '').toLowerCase().includes(q) ||
        (item.tenKhachHang || '').toLowerCase().includes(q)
    );
  }, [data.orders, keyword]);

  const statCards = [
    {
      title: 'Doanh thu bán hàng',
      value: currency(data.summary?.totalRevenue ?? 0),
      sub: 'Từ các đơn hàng đã duyệt & thanh toán',
      icon: TrendingUp,
      color: 'from-[#002795] to-blue-800',
      path: '/sales/orders',
    },
    {
      title: 'Đơn hàng',
      value: data.summary?.orders ?? 0,
      sub: `${data.summary?.pendingOrders ?? 0} đơn đang chờ kho duyệt`,
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
      path: '/sales/orders',
    },
    {
      title: 'Hóa đơn phát sinh',
      value: data.summary?.invoices ?? 0,
      sub: 'Tự động khởi tạo từ Đơn hàng',
      icon: ReceiptText,
      color: 'from-violet-500 to-purple-600',
      path: '/sales/invoices',
    },
    {
      title: 'Công nợ phải thu',
      value: currency(data.summary?.receivables ?? 0),
      sub: 'Dư nợ khách hàng cần thu',
      icon: CircleDollarSign,
      color: 'from-rose-500 to-red-600',
      path: '/sales/receivables',
    },
  ];

  const quickActions = [
    { name: 'Tạo Đơn Hàng Mới', path: '/sales/orders', icon: ShoppingCart, color: 'bg-blue-50 text-[#002795]' },
    { name: 'Lập Hóa Đơn & Thu Tiền', path: '/sales/invoices', icon: ReceiptText, color: 'bg-purple-50 text-purple-700' },
    { name: 'Đối Soát Công Nợ', path: '/sales/receivables', icon: CircleDollarSign, color: 'bg-rose-50 text-rose-700' },
    { name: 'Quản Lý Khách Hàng', path: '/sales/customers', icon: Users, color: 'bg-sky-50 text-sky-700' },
    { name: 'Bảng Giá Sản Phẩm', path: '/sales/pricing', icon: Tag, color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#001F7D] via-[#002795] to-blue-900 p-7 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                PHÂN HỆ BÁN HÀNG & PHÂN PHỐI (SD)
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black">Tổng Quan Kinh Doanh Vinamilk ERP</h1>
            <p className="mt-1 text-xs text-blue-100 max-w-2xl leading-relaxed">
              Kênh quản lý bán hàng chuẩn hóa: Tự động phát sinh Hóa đơn khi tạo đơn hàng, chuyển phê duyệt sang bộ phận Kho và hỗ trợ Hủy đơn khi chưa phê duyệt.
            </p>
          </div>

          <button
            onClick={() => navigate('/sales/orders')}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-[#002795] shadow-md hover:bg-blue-50 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Đơn Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.path)}
              className="group cursor-pointer rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-2xl bg-gradient-to-br ${card.color} p-3 text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">THỐNG KÊ</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500">{card.title}</p>
              <h3 className="mt-1 text-xl font-black text-slate-900">{card.value}</h3>
              <p className="mt-2 text-[11px] font-medium text-slate-400">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thao Tác Nhanh Nghiệp Vụ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(act.path)}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white text-left transition-all cursor-pointer group shadow-xs"
              >
                <span className={`p-2.5 rounded-xl ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#002795]">{act.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content: Recent Orders & Debt Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Panel */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">Đơn Đặt Hàng Gần Đây</h2>
              <p className="text-xs text-slate-500">Danh sách đơn chờ kho duyệt & theo dõi tiến độ</p>
            </div>
            <button
              onClick={() => navigate('/sales/orders')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002795] hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã Đơn</th>
                  <th className="px-4 py-3">Khách Hàng</th>
                  <th className="px-4 py-3">Ngày Lập</th>
                  <th className="px-4 py-3 text-right">Thành Tiền</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 6).map((order) => (
                  <tr
                    key={order.maDonHang}
                    onClick={() => navigate('/sales/orders')}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-[#002795]">{order.maDonHang}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{order.tenKhachHang}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(order.ngayMua)}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">{currency(order.thanhTien || order.tongTien)}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.trangThai === 'Hoàn tất' || order.trangThai === 'Đã duyệt'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.trangThai === 'Đã hủy'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.trangThai === 'Chờ xác nhận' ? 'Chờ kho duyệt' : order.trangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receivables Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">Công Nợ Đến Hạn</h2>
              <p className="text-[11px] text-slate-500">Đối tác cần thu hồi tiền</p>
            </div>
            <button
              onClick={() => navigate('/sales/receivables')}
              className="text-xs font-bold text-[#002795] hover:underline"
            >
              Tất cả
            </button>
          </div>
          <div className="space-y-2.5">
            {(data.receivables || []).slice(0, 5).map((item) => (
              <div
                key={item.maCongNo}
                onClick={() => navigate('/sales/receivables')}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-rose-50/40 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">{item.tenKhachHang}</p>
                  <span className="text-xs font-black text-rose-600">{currency(item.soTienConLai)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Hạn TT: {formatDate(item.hanThanhToan)}</span>
                  <span className="text-amber-700 font-bold">{item.trangThai}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
