import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Calendar,
  User,
  Package,
  FileCheck2,
  Printer
} from 'lucide-react';

const currency = (val) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

export default function SalesDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const makeDeliveryCode = () => 'GH' + dateCode() + String(Date.now()).slice(-4);
  const dateCode = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    maGiaoHang: makeDeliveryCode(),
    maDonHang: '',
    maPhieuXuatSP: 'PXSP2026090501',
    maNV: 'NV004',
    diaChiGiao: '',
    ngayGiao: new Date().toISOString().slice(0, 10),
    trangThai: 'Đang giao',
  });

  useEffect(() => {
    fetchDeliveries();
    loadEligibleOrders();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getDeliveries();
      setDeliveries(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp danh sách giao hàng.');
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleOrders = async () => {
    try {
      const res = await SalesAPI.getOrders();
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchStatus = statusFilter === 'all' || d.trangThai === statusFilter;
      const q = keyword.toLowerCase();
      const matchKeyword =
        !keyword.trim() ||
        (d.maGiaoHang || '').toLowerCase().includes(q) ||
        (d.maDonHang || '').toLowerCase().includes(q) ||
        (d.tenKhachHang || '').toLowerCase().includes(q) ||
        (d.diaChiGiao || '').toLowerCase().includes(q);
      return matchStatus && matchKeyword;
    });
  }, [deliveries, statusFilter, keyword]);

  const openCreateModal = () => {
    setFormData({
      maGiaoHang: makeDeliveryCode(),
      maDonHang: '',
      maPhieuXuatSP: 'PXSP2026090501',
      maNV: 'NV004',
      diaChiGiao: '',
      ngayGiao: new Date().toISOString().slice(0, 10),
      trangThai: 'Đang giao',
    });
    setShowModal(true);
  };

  const handleOrderChange = (orderCode) => {
    const order = orders.find((o) => o.maDonHang === orderCode);
    const pxCode = order?.phieu_xuat_s_p?.maPhieuXuatSP || order?.phieuXuatSP?.maPhieuXuatSP || order?.maPhieuXuatSP || formData.maPhieuXuatSP;
    setFormData({
      ...formData,
      maDonHang: orderCode,
      maPhieuXuatSP: pxCode,
      diaChiGiao: order?.diaChiKH || order?.khach_hang?.diaChi || order?.diaChi || '131 Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.maDonHang) {
      notify('error', 'Vui lòng chọn đơn hàng cần giao.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SalesAPI.createDelivery(formData);
      notify('success', 'Tạo phiếu giao hàng thành công!');
      setShowModal(false);
      fetchDeliveries();
      loadEligibleOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi tạo phiếu giao hàng.';
      notify('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (delivery, newStatus) => {
    try {
      await SalesAPI.updateDeliveryStatus(delivery.maGiaoHang, newStatus);
      notify('success', `Đã cập nhật trạng thái giao hàng: ${newStatus}`);
      fetchDeliveries();
    } catch (err) {
      notify('error', 'Không thể cập nhật trạng thái giao hàng.');
    }
  };

  const viewDetail = async (delivery) => {
    try {
      const res = await SalesAPI.getDeliveryDetail(delivery.maGiaoHang);
      setSelectedDelivery(res.data?.data);
    } catch (err) {
      notify('error', 'Không thể xem chi tiết phiếu giao.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#002795]">
              <Truck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR04</span>
          </div>
          <h1 className="text-xl font-black text-[#0B2341] mt-2">Quản Lý Giao Hàng & Vận Chuyển</h1>
          <p className="text-xs text-slate-500 mt-1">
            Phiếu giao được tạo khi Kho xác nhận đơn. Hệ thống tự chọn nhân viên rảnh; nếu tất cả đang bận, phiếu sẽ vào hàng chờ.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã giao, đơn hàng, khách..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-2xl outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ phân công">Chờ phân công</option>
            <option value="Chờ giao">Chờ giao</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng cộng: <span className="font-bold text-[#0B2341]">{filteredDeliveries.length}</span> chuyến giao
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã Giao Hàng</th>
                <th className="px-5 py-4">Đơn Hàng</th>
                <th className="px-5 py-4">Khách Hàng / Điểm Giao</th>
                <th className="px-5 py-4">Nhân Viên Giao</th>
                <th className="px-5 py-4">Phiếu Xuất Kho</th>
                <th className="px-5 py-4">Ngày Giao Dự Kiến</th>
                <th className="px-5 py-4 text-center">Trạng Thái</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    Đang nạp danh sách giao hàng...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    Chưa có phiếu giao hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((d) => (
                  <tr key={d.maGiaoHang} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{d.maGiaoHang}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-800 font-bold">{d.maDonHang || '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{d.tenKhachHang || 'Khách vãng lai'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 max-w-xs truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {d.diaChiGiao || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {d.tenNhanVienGiao || d.maNV || d.maNhanVien || 'Đang chờ nhân viên rảnh'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      {d.maPhieuXuatSP || d.maPhieuXuat || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{d.ngayGiao?.slice(0, 10) || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          d.trangThai === 'Đã giao'
                            ? 'bg-emerald-100 text-emerald-700'
                            : d.trangThai === 'Chờ phân công'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {d.trangThai}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {d.trangThai === 'Chờ giao' && (
                          <button
                            onClick={() => handleUpdateStatus(d, 'Đang giao')}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Bắt Đầu Giao
                          </button>
                        )}
                        {d.trangThai === 'Đang giao' && (
                          <>
                            <button onClick={() => handleUpdateStatus(d, 'Đã giao')} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer">Xác Nhận Đã Giao</button>
                            <button onClick={() => handleUpdateStatus(d, 'Giao thất bại')} className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer">Không Giao Được</button>
                          </>
                        )}
                        <button
                          onClick={() => viewDetail(d)}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Chi Tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Phiếu Giao Hàng */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0B2341]">Tạo Phiếu Giao Hàng Mới</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mã Giao Hàng
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.maGiaoHang}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Ngày Giao Dự Kiến
                  </label>
                  <input
                    type="date"
                    value={formData.ngayGiao}
                    onChange={(e) => setFormData({ ...formData, ngayGiao: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Đơn Hàng Cần Giao <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.maDonHang}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map((o) => (
                    <option key={o.maDonHang} value={o.maDonHang}>
                      {o.maDonHang} - {o.tenKhachHang} ({currency(o.thanhTien)}) [{o.trangThai}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Phiếu Xuất Kho (PhieuXuatSP)
                  </label>
                  <input
                    type="text"
                    value={formData.maPhieuXuatSP}
                    onChange={(e) => setFormData({ ...formData, maPhieuXuatSP: e.target.value })}
                    placeholder="PXSP..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Nhân Viên Giao Vận
                  </label>
                  <select
                    value={formData.maNV}
                    onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="NV004">Phạm Hoàng Nam (NV004)</option>
                    <option value="NV007">Vũ Quốc Bảo (NV007)</option>
                    <option value="NV009">Bùi Tuấn Kiệt (NV009)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Địa Chỉ Điểm Giao <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.diaChiGiao}
                  onChange={(e) => setFormData({ ...formData, diaChiGiao: e.target.value })}
                  placeholder="Địa chỉ giao nhận hàng..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#002795] hover:bg-blue-900 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Phiếu Giao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Biên Bản Giao Hàng */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedDelivery.maGiaoHang}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">Biên Bản Giao Hàng</h2>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Khách hàng</span>
                  <p className="font-bold text-slate-900">{selectedDelivery.tenKhachHang}</p>
                  <p className="text-slate-500 text-[11px]">{selectedDelivery.soDienThoaiKH}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Đơn Hàng / Trị giá</span>
                  <p className="font-bold text-[#002795]">{selectedDelivery.maDonHang}</p>
                  <p className="font-bold text-slate-900">{currency(selectedDelivery.thanhTien)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Địa chỉ giao</span>
                <p className="text-slate-700">{selectedDelivery.diaChiGiao}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase text-slate-600 mb-2">Chi tiết sản phẩm bàn giao</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="px-3 py-2">Sản phẩm</th>
                      <th className="px-3 py-2 text-center">Số lượng</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3 py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedDelivery.items || []).map((item) => (
                      <tr key={item.maSanPham}>
                        <td className="px-3 py-2 font-bold text-slate-800">{item.tenSanPham || item.maSanPham}</td>
                        <td className="px-3 py-2 text-center">{item.soLuong}</td>
                        <td className="px-3 py-2 text-right">{currency(item.donGia)}</td>
                        <td className="px-3 py-2 text-right font-bold">{currency(item.thanhTien)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                In Biên Bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
