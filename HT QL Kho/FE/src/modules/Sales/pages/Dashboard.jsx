import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesAPI } from '../../../services/api';
import {
  ShoppingCart,
  Users,
  Truck,
  ReceiptText,
  CircleDollarSign,
  TrendingUp,
  PackageCheck,
  Clock3,
  ArrowRight,
  Search,
  Filter,
  MapPin,
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
    deliveries: [],
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
      sub: 'Từ các đơn đã xác nhận/giao',
      icon: TrendingUp,
      color: 'from-[#002795] to-blue-800',
      path: '/sales/orders',
    },
    {
      title: 'Đơn hàng',
      value: data.summary?.orders ?? 0,
      sub: `${data.summary?.pendingOrders ?? 0} đơn đang chờ duyệt`,
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
      path: '/sales/orders',
    },
    {
      title: 'Giao hàng',
      value: data.summary?.deliveries ?? 0,
      sub: `${data.summary?.activeDeliveries ?? 0} chuyến đang trên đường giao`,
      icon: Truck,
      color: 'from-emerald-500 to-teal-600',
      path: '/sales/deliveries',
    },
    {
      title: 'Hóa đơn đã lập',
      value: data.summary?.invoices ?? 0,
      sub: 'Hóa đơn bán hàng xuất kho',
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
    { name: 'Tạo Đơn Hàng', path: '/sales/orders', icon: ShoppingCart, color: 'bg-blue-50 text-[#002795]' },
    { name: 'Điều Phối Giao Hàng', path: '/sales/deliveries', icon: Truck, color: 'bg-emerald-50 text-emerald-700' },
    { name: 'Hóa Đơn Tự Động & Thu Tiền', path: '/sales/invoices', icon: ReceiptText, color: 'bg-purple-50 text-purple-700' },
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
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/70 text-xs">Mạng lưới 250.000 điểm bán</span>
            </div>
            <h1 className="mt-2 text-2xl font-black">Trung Tâm Điều Hành Bán Hàng Vinamilk</h1>
            <p className="mt-1 max-w-2xl text-xs text-blue-100/80">
              Quản trị vòng đời đơn hàng khép kín: kiểm tra tồn kho, Kho xác nhận, tự tạo hóa đơn, điều phối giao vận và quản lý công nợ.
            </p>
          </div>
          <button
            onClick={() => navigate('/sales/orders')}
            className="inline-flex items-center gap-2 rounded-2xl bg-white text-[#002795] px-4 py-2.5 text-xs font-black shadow-md hover:bg-blue-50 transition cursor-pointer shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
            Vào Quản Lý Đơn Hàng
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 px-2">
          Truy Cập Nhanh Nghiệp Vụ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-center gap-2 cursor-pointer group"
              >
                <div className={`p-2.5 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">{action.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ title, value, sub, icon: Icon, color, path }) => (
          <div
            key={title}
            onClick={() => navigate(path)}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
                <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${color} p-2.5 text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Orders & Deliveries */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Đơn hàng mới tiếp nhận</h2>
              <p className="text-[11px] text-slate-500">Danh sách đơn bán hàng gần nhất</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm mã đơn hoặc khách..."
                className="w-48 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-3 py-3">Mã đơn</th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Ngày mua</th>
                  <th className="px-3 py-3 text-right">Tổng tiền</th>
                  <th className="px-3 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400 font-medium">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400 font-medium">
                      Không có đơn hàng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(0, 6).map((order) => (
                    <tr
                      key={order.maDonHang}
                      onClick={() => navigate('/sales/orders')}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3 font-bold text-[#002795]">{order.maDonHang}</td>
                      <td className="px-3 py-3 text-slate-800 font-medium">{order.tenKhachHang || '—'}</td>
                      <td className="px-3 py-3 text-slate-500">{formatDate(order.ngayMua)}</td>
                      <td className="px-3 py-3 text-right font-black text-slate-900">{currency(order.tongTien)}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            order.trangThai === 'Hoàn tất' || order.trangThai === 'Đã giao'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.trangThai === 'Đã xác nhận'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.trangThai || 'Chờ xác nhận'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deliveries & Receivables Side Panel */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">Tiến độ giao vận gần nhất</h2>
                <p className="text-[11px] text-slate-500">Các chuyến vận chuyển hàng</p>
              </div>
              <button
                onClick={() => navigate('/sales/deliveries')}
                className="text-xs font-bold text-[#002795] hover:underline"
              >
                Tất cả
              </button>
            </div>
            <div className="space-y-2.5">
              {(data.deliveries || []).slice(0, 4).map((delivery) => (
                <div
                  key={delivery.maGiaoHang}
                  onClick={() => navigate('/sales/deliveries')}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-blue-50/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#002795]">{delivery.maGiaoHang}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {delivery.trangThai || 'Đang giao'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{delivery.tenKhachHang}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {delivery.diaChiGiao || 'Trụ sở khách hàng'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">Công nợ đến hạn</h2>
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
              {(data.receivables || []).slice(0, 4).map((item) => (
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
    </div>
  );
}
