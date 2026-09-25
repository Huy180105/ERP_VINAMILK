import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import {
  ShoppingCart,
  Plus,
  Search,
  PencilLine,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  FileText,
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';

const currency = (val) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

const formatDate = (val) => {
  if (!val) return '—';
  return val.slice(0, 10);
};

export default function SalesOrders() {
  const makeEmptyItem = (productId = '') => ({
    maSanPham: productId,
    soLuong: 1,
    donGia: 0,
  });

  const makeOrderCode = () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `DH${dateStr}${String(Date.now()).slice(-4)}`;
  };

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    maDonHang: makeOrderCode(),
    maKhachHang: '',
    maNhanVien: 'NV001',
    trangThai: 'Chờ xác nhận',
    items: [makeEmptyItem()],
  });

  useEffect(() => {
    fetchOrders();
    loadCustomers();
    loadProductsWithStock();
  }, []);

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getOrders();
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await SalesAPI.getCustomers();
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProductsWithStock = async () => {
    try {
      const res = await SalesAPI.checkStock();
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCustomerObj = useMemo(() => {
    return customers.find((c) => c.maKhachHang === formData.maKhachHang) || null;
  }, [customers, formData.maKhachHang]);

  const updateItem = (index, field, val) => {
    const nextItems = [...formData.items];
    const current = { ...nextItems[index] };

    if (field === 'maSanPham') {
      const prod = products.find((p) => p.maSanPham === val);
      current.maSanPham = val;
      current.donGia = Number(prod?.giaBan || 0);
      nextItems[index] = current;
      setFormData({ ...formData, items: nextItems });
      return;
    }

    if (field === 'soLuong') {
      current.soLuong = Math.max(1, Number(val) || 1);
      nextItems[index] = current;
      setFormData({ ...formData, items: nextItems });
      return;
    }

    nextItems[index][field] = val;
    setFormData({ ...formData, items: nextItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, makeEmptyItem()],
    });
  };

  const removeItemRow = (idx) => {
    if (formData.items.length === 1) return;
    const nextItems = formData.items.filter((_, i) => i !== idx);
    setFormData({ ...formData, items: nextItems });
  };

  const subtotal = formData.items.reduce((sum, item) => {
    return sum + (Number(item.donGia || 0) * Number(item.soLuong || 0));
  }, 0);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.trangThai === statusFilter;
      const q = keyword.toLowerCase();
      const matchKey =
        !keyword.trim() ||
        (o.maDonHang || '').toLowerCase().includes(q) ||
        (o.tenKhachHang || '').toLowerCase().includes(q);
      return matchStatus && matchKey;
    });
  }, [orders, statusFilter, keyword]);

  const openCreateModal = () => {
    setEditingOrderId(null);
    setFormData({
      maDonHang: makeOrderCode(),
      maKhachHang: '',
      maNhanVien: 'NV001',
      trangThai: 'Chờ xác nhận',
      items: [makeEmptyItem()],
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (order) => {
    if (order.trangThai !== 'Chờ xác nhận') {
      notify('error', 'Chỉ đơn hàng "Chờ xác nhận" mới được phép chỉnh sửa.');
      return;
    }

    setEditingOrderId(order.maDonHang);
    setFormData({
      maDonHang: order.maDonHang,
      maKhachHang: order.maKhachHang,
      maNhanVien: order.maNhanVien || 'NV001',
      trangThai: order.trangThai,
      items: (order.items || []).map((i) => ({
        maSanPham: i.maSanPham,
        soLuong: Number(i.soLuong || 1),
        donGia: Number(i.donGia || 0),
      })),
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.maKhachHang) {
      setFormError('Vui lòng chọn khách hàng / nhà phân phối.');
      return;
    }

    if (!formData.items.length || formData.items.some((i) => !i.maSanPham)) {
      setFormError('Vui lòng chọn ít nhất một sản phẩm hợp lệ.');
      return;
    }

    // Kiểm tra tồn kho trước khi gửi (SA-BR01)
    const stockErrors = [];
    formData.items.forEach((item) => {
      const p = products.find((prod) => prod.maSanPham === item.maSanPham);
      if (p && item.soLuong > p.tonKho) {
        stockErrors.push(`Sản phẩm ${p.tenSanPham} chỉ còn tồn kho ${p.tonKho}, yêu cầu đặt: ${item.soLuong}`);
      }
    });

    if (stockErrors.length > 0) {
      setFormError(stockErrors.join(' | '));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingOrderId) {
        await SalesAPI.updateOrder(editingOrderId, {
          maKhachHang: formData.maKhachHang,
          items: formData.items,
        });
        notify('success', 'Cập nhật đơn hàng thành công!');
      } else {
        await SalesAPI.createOrder(formData);
        notify('success', 'Tạo đơn hàng thành công!');
      }
      setShowModal(false);
      fetchOrders();
      loadProductsWithStock();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi khi lưu đơn hàng.';
      const errors = err.response?.data?.errors;
      setFormError(Array.isArray(errors) ? errors.join(' | ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      await SalesAPI.updateOrderStatus(order.maDonHang, 'Đã xác nhận');
      notify('success', `Đã xác nhận đơn hàng ${order.maDonHang}. Sẵn sàng chuyển giao kho.`);
      fetchOrders();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Không thể xác nhận đơn hàng.');
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy/xóa đơn hàng ${order.maDonHang}?`)) return;

    try {
      await SalesAPI.deleteOrder(order.maDonHang);
      notify('success', 'Đã hủy đơn hàng thành công.');
      fetchOrders();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Không thể xóa đơn hàng.');
    }
  };

  const viewOrderDetail = async (order) => {
    try {
      const res = await SalesAPI.getOrderDetail(order.maDonHang);
      setSelectedOrder(res.data?.data);
    } catch (err) {
      notify('error', 'Không thể lấy thông tin chi tiết đơn hàng.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all max-w-md ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#002795]">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR02</span>
          </div>
          <h1 className="text-xl font-black text-[#0B2341] mt-2">Quản Lý Đơn Đặt Hàng (Sales Orders)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận đơn hàng đại lý, kiểm tra tồn kho thành phẩm thời gian thực (FEFO), phê duyệt và chuyển lệnh sang Kho hàng.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#002795] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-900/20 hover:bg-blue-900 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo Đơn Hàng Mới
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách hàng..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-2xl outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Hoàn tất">Hoàn tất</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Hiển thị: <span className="font-bold text-[#0B2341]">{filteredOrders.length}</span> đơn hàng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã Đơn</th>
                <th className="px-5 py-4">Khách Hàng / NPP</th>
                <th className="px-5 py-4">Ngày Lập</th>
                <th className="px-5 py-4">Sản Phẩm Đặt</th>
                <th className="px-5 py-4 text-right">Tổng Tiền</th>
                <th className="px-5 py-4 text-center">Trạng Thái</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Đang nạp danh sách đơn hàng...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Chưa có đơn hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.maDonHang} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{o.maDonHang}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{o.tenKhachHang}</p>
                      <p className="text-[11px] text-slate-500">{o.soDienThoaiKH || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(o.ngayMua)}</td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {(o.items || []).length > 0 ? (
                        <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                          {o.items.length} mặt hàng
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 text-sm">
                      {currency(o.thanhTien || o.tongTien)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.trangThai === 'Hoàn tất' || o.trangThai === 'Đã giao'
                            ? 'bg-emerald-100 text-emerald-700'
                            : o.trangThai === 'Đã xác nhận'
                            ? 'bg-blue-100 text-blue-700'
                            : o.trangThai === 'Đang giao'
                            ? 'bg-indigo-100 text-indigo-700'
                            : o.trangThai === 'Đã hủy'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {o.trangThai}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {o.trangThai === 'Chờ xác nhận' && (
                          <>
                            <button
                              onClick={() => handleConfirmOrder(o)}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Duyệt đơn hàng"
                            >
                              Duyệt Đơn
                            </button>
                            <button
                              onClick={() => openEditModal(o)}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-700 rounded-lg cursor-pointer"
                              title="Sửa đơn"
                            >
                              <PencilLine className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(o)}
                              className="p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Hủy đơn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => viewOrderDetail(o)}
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

      {/* Modal Tạo / Sửa Đơn Hàng */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0B2341]">
                {editingOrderId ? `Chỉnh Sửa Đơn Hàng (${editingOrderId})` : 'Tạo Đơn Hàng Bán Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mã Đơn Hàng
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.maDonHang}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Khách Hàng / NPP <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.maKhachHang}
                    onChange={(e) => setFormData({ ...formData, maKhachHang: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                    required
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((c) => (
                      <option key={c.maKhachHang} value={c.maKhachHang}>
                        {c.maKhachHang} - {c.tenKhachHang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCustomerObj && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">SĐT / Địa chỉ:</span>
                    <p className="font-semibold text-slate-800">{selectedCustomerObj.soDienThoai || 'Chưa có SĐT'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{selectedCustomerObj.diaChi || 'Chưa có địa chỉ'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Hạn mức công nợ:</span>
                    <p className="font-bold text-[#002795]">{currency(selectedCustomerObj.hanMucCongNo)}</p>
                    <p className="text-slate-500 text-[11px]">Dư nợ hiện tại: {currency(selectedCustomerObj.tongNoHienTai || 0)}</p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Chi tiết sản phẩm đặt
                  </h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-bold text-[#002795] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm sản phẩm
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => {
                    const prod = products.find((p) => p.maSanPham === item.maSanPham);
                    const isOutOfStock = prod && item.soLuong > prod.tonKho;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all ${
                          isOutOfStock ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/70'
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <select
                              value={item.maSanPham}
                              onChange={(e) => updateItem(idx, 'maSanPham', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 bg-white outline-none focus:ring-2 focus:ring-[#002795]"
                              required
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {products.map((p) => (
                                <option key={p.maSanPham} value={p.maSanPham}>
                                  {p.tenSanPham} ({p.maSanPham}) - {currency(p.giaBan)} [Tồn: {p.tonKho}]
                                </option>
                              ))}
                            </select>
                            {prod && (
                              <div className="flex items-center gap-2 mt-1 text-[10px]">
                                <span className="text-slate-500">Tồn kho khả dụng: <strong className="text-slate-700">{prod.tonKho} {prod.donViTinh}</strong></span>
                                {isOutOfStock && (
                                  <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded">
                                    Không đủ tồn kho!
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[10px] text-slate-400 font-bold uppercase">Số lượng</label>
                            <input
                              type="number"
                              min="1"
                              value={item.soLuong}
                              onChange={(e) => updateItem(idx, 'soLuong', e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 bg-white font-bold outline-none focus:ring-2 focus:ring-[#002795]"
                              required
                            />
                          </div>

                          <div className="col-span-3 text-right">
                            <label className="block text-[10px] text-slate-400 font-bold uppercase">Thành tiền</label>
                            <p className="text-xs font-black text-slate-900 mt-1">
                              {currency(item.soLuong * (item.donGia || 0))}
                            </p>
                          </div>

                          <div className="col-span-1 text-center">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-100 p-3.5 rounded-2xl flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600">TỔNG TIỀN ĐƠN HÀNG:</span>
                  <span className="text-base font-black text-[#002795]">{currency(subtotal)}</span>
                </div>
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
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Đơn Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedOrder.maDonHang}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">Chi Tiết Đơn Bán Hàng</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Khách hàng</span>
                  <p className="font-bold text-slate-900">{selectedOrder.tenKhachHang}</p>
                  <p className="text-slate-500 text-[11px]">{selectedOrder.soDienThoaiKH}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Ngày lập / Trạng thái</span>
                  <p className="text-slate-600">{formatDate(selectedOrder.ngayMua)}</p>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {selectedOrder.trangThai}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase text-slate-600 mb-2">Danh mục sản phẩm đặt</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="px-3 py-2">Sản phẩm</th>
                      <th className="px-3 py-2 text-center">SL</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3 py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedOrder.items || []).map((item) => (
                      <tr key={item.maSanPham}>
                        <td className="px-3 py-2 font-bold text-slate-800">{item.tenSanPham || item.maSanPham}</td>
                        <td className="px-3 py-2 text-center font-bold">{item.soLuong}</td>
                        <td className="px-3 py-2 text-right">{currency(item.donGia)}</td>
                        <td className="px-3 py-2 text-right font-black">{currency(item.thanhTien)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-bold text-slate-500">TỔNG CỘNG:</span>
              <span className="text-lg font-black text-[#002795]">{currency(selectedOrder.thanhTien)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                In Đơn Hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
