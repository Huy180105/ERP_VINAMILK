import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../services/api';
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

  const fallbackData = {
    summary: {
      orders: 128,
      customers: 54,
      deliveries: 23,
      invoices: 97,
      receivables: 245000000,
    },
    orders: [
      { maDonHang: 'DH-2026-001', tenKhachHang: 'Công ty Sữa Việt', trangThai: 'Đã xác nhận', ngayMua: '2026-09-15T08:30:00', tongTien: 18500000 },
      { maDonHang: 'DH-2026-002', tenKhachHang: 'Siêu thị VinMart', trangThai: 'Đang giao', ngayMua: '2026-09-15T09:20:00', tongTien: 32500000 },
      { maDonHang: 'DH-2026-003', tenKhachHang: 'Nhà phân phối Bắc Giang', trangThai: 'Chờ xác nhận', ngayMua: '2026-09-14T15:10:00', tongTien: 42000000 },
    ],
    customers: [
      { maKhachHang: 'KH001', tenKhachHang: 'Công ty Sữa Việt', soDienThoai: '0912.111.222' },
      { maKhachHang: 'KH002', tenKhachHang: 'Siêu thị VinMart', soDienThoai: '0908.333.444' },
      { maKhachHang: 'KH003', tenKhachHang: 'Nhà phân phối Bắc Giang', soDienThoai: '0988.555.666' },
    ],
    deliveries: [
      { maGiaoHang: 'GH001', trangThai: 'Đang giao', diaChiGiao: 'Hà Nội - Ba Đình' },
      { maGiaoHang: 'GH002', trangThai: 'Đã giao', diaChiGiao: 'Đà Nẵng - Hải Châu' },
    ],
    invoices: [
      { maHoaDon: 'HD001', tongTien: 18500000, ngayLap: '2026-09-15T08:40:00', maGiaoHang: 'GH001' },
      { maHoaDon: 'HD002', tongTien: 32500000, ngayLap: '2026-09-15T09:40:00', maGiaoHang: 'GH002' },
    ],
    receivables: [
      { maCongNo: 'CN001', tenKhachHang: 'Công ty Sữa Việt', soTienConLai: 6800000, hanThanhToan: '2026-09-22', trangThai: 'Còn nợ' },
      { maCongNo: 'CN002', tenKhachHang: 'Siêu thị VinMart', soTienConLai: 12400000, hanThanhToan: '2026-09-30', trangThai: 'Còn nợ' },
    ],
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getDashboard().catch(() => ({ data: { success: true, data: fallbackData } }));
      setData(res.data.data || fallbackData);
    } catch (err) {
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!keyword.trim()) return data.orders || [];
    const q = keyword.toLowerCase();
    return (data.orders || []).filter((item) =>
      (item.maDonHang || '').toLowerCase().includes(q) ||
      (item.tenKhachHang || '').toLowerCase().includes(q)
    );
  }, [data.orders, keyword]);

  const statCards = [
    {
      title: 'Đơn hàng',
      value: data.summary.orders ?? 0,
      sub: 'Theo tổng số đơn bán',
      icon: ShoppingCart,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Khách hàng',
      value: data.summary.customers ?? 0,
      sub: 'Nhà phân phối / đại lý',
      icon: Users,
      color: 'from-sky-500 to-cyan-600',
    },
    {
      title: 'Giao hàng',
      value: data.summary.deliveries ?? 0,
      sub: 'Đang vận chuyển',
      icon: Truck,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Hóa đơn',
      value: data.summary.invoices ?? 0,
      sub: 'Đã lập hóa đơn',
      icon: ReceiptText,
      color: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Công nợ',
      value: currency(data.summary.receivables ?? 0),
      sub: 'Tổng số tiền còn nợ',
      icon: CircleDollarSign,
      color: 'from-rose-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-7 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-100">Sales & Distribution</p>
            <h1 className="mt-2 text-2xl font-black">Phân hệ quản lý bán hàng</h1>
            <p className="mt-2 max-w-2xl text-sm text-orange-50">
              Theo dõi đơn hàng, khách hàng, giao hàng, hóa đơn và công nợ phải thu trên cùng một dashboard vận hành.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold backdrop-blur-sm ring-1 ring-white/30 transition hover:bg-white/20">
            <TrendingUp className="h-4 w-4" />
            Xem báo cáo bán hàng
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ title, value, sub, icon: Icon, color }) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
                <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${color} p-3 text-white`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Đơn hàng gần đây</h2>
              <p className="text-[11px] text-slate-500">Danh sách đơn bán mới nhất</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm mã đơn / khách hàng"
                className="w-52 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-3 py-3">Mã đơn</th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Ngày mua</th>
                  <th className="px-3 py-3">Tổng tiền</th>
                  <th className="px-3 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400">Không có đơn hàng phù hợp.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.maDonHang} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 font-bold text-slate-900">{order.maDonHang}</td>
                      <td className="px-3 py-3 text-slate-700">{order.tenKhachHang || '—'}</td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(order.ngayMua)}</td>
                      <td className="px-3 py-3 font-bold text-slate-900">{currency(order.tongTien)}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
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

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Khách hàng mới</h2>
                <p className="text-[11px] text-slate-500">Danh mục đối tác</p>
              </div>
              <button className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                <Filter className="h-3.5 w-3.5" />
                Lọc
              </button>
            </div>
            <div className="space-y-3">
              {(data.customers || []).slice(0, 4).map((customer) => (
                <div key={customer.maKhachHang} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{customer.tenKhachHang}</p>
                    <p className="text-[11px] text-slate-500">{customer.soDienThoai || 'Không có SĐT'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700">{customer.maKhachHang}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">Tình trạng giao hàng</h2>
                <p className="text-[11px] text-slate-500">Theo dõi trạng thái vận chuyển</p>
              </div>
              <PackageCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-3">
              {(data.deliveries || []).slice(0, 4).map((delivery) => (
                <div key={delivery.maGiaoHang} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">{delivery.maGiaoHang}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      {delivery.trangThai || 'Đang giao'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{delivery.diaChiGiao || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Hóa đơn mới</h2>
              <p className="text-[11px] text-slate-500">Danh sách hóa đơn gần đây</p>
            </div>
            <ReceiptText className="h-5 w-5 text-violet-600" />
          </div>
          <div className="space-y-3">
            {(data.invoices || []).slice(0, 5).map((invoice) => (
              <div key={invoice.maHoaDon} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{invoice.maHoaDon}</p>
                  <p className="text-[11px] text-slate-500">{formatDate(invoice.ngayLap)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{currency(invoice.tongTien)}</p>
                  <p className="text-[10px] text-slate-500">{invoice.maGiaoHang || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Công nợ phải thu</h2>
              <p className="text-[11px] text-slate-500">Theo dõi khoản nợ và hạn thanh toán</p>
            </div>
            <Clock3 className="h-5 w-5 text-rose-500" />
          </div>
          <div className="space-y-3">
            {(data.receivables || []).slice(0, 5).map((item) => (
              <div key={item.maCongNo} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-800">{item.maCongNo}</p>
                  <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">
                    {item.trangThai || 'Còn nợ'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.tenKhachHang || '—'}</span>
                  <span>{formatDate(item.hanThanhToan)}</span>
                </div>
                <p className="mt-2 text-sm font-black text-slate-900">{currency(item.soTienConLai)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
