import React, { useEffect, useMemo, useState } from 'react';
import { MasterDataAPI, SalesAPI } from '../../services/api';
import { ShoppingCart, Plus, Search, PencilLine, CheckCircle2 } from 'lucide-react';

const getCurrentEmployeeCode = () => {
  if (typeof window === 'undefined') return 'NV001';

  const keys = ['currentEmployee', 'employeeProfile', 'salesUser', 'user', 'authUser'];

  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      const code = data?.maNV || data?.maNhanVien || data?.employeeCode || data?.maNVien || null;

      if (code) return code;
    } catch (error) {
      // ignore malformed localStorage payloads
    }
  }

  return 'NV001';
};

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

export default function SalesOrders() {
  const makeEmptyItem = (productId = '') => ({
    maSanPham: productId,
    soLuong: 1,
    donGia: 0,
  });

  const makeOrderCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Date.now()).slice(-6);
    return `DH${year}${month}${day}${random}`;
  };

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    maDonHang: makeOrderCode(),
    maKhachHang: '',
    maNhanVien: getCurrentEmployeeCode(),
    trangThai: 'Chờ xác nhận',
    items: [makeEmptyItem()],
  });

  const fallbackOrders = [
    { maDonHang: 'DH-2026-001', tenKhachHang: 'Công ty Sữa Việt', ngayMua: '2026-09-15T08:30:00', tongTien: 18500000, trangThai: 'Đã xác nhận' },
    { maDonHang: 'DH-2026-002', tenKhachHang: 'Siêu thị VinMart', ngayMua: '2026-09-15T09:20:00', tongTien: 32500000, trangThai: 'Đang giao' },
    { maDonHang: 'DH-2026-003', tenKhachHang: 'Nhà phân phối Bắc Giang', ngayMua: '2026-09-14T15:10:00', tongTien: 42000000, trangThai: 'Chờ xác nhận' },
  ];

  const subtotal = formData.items.reduce((sum, item) => {
    const product = products.find((p) => p.maSanPham === item.maSanPham);
    const donGia = Number(product?.donGia || item.donGia || 0);
    const soLuong = Number(item.soLuong || 0);
    return sum + donGia * soLuong;
  }, 0);

  useEffect(() => {
    fetchOrders();
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await SalesAPI.getCustomers();
      const customerList = res.data.data || [];
      setCustomers(customerList);
        setFormData((prev) => ({ ...prev, maKhachHang: '' }));
    } catch (err) {
      setCustomers([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await MasterDataAPI.getProducts();
      const productList = res.data.data || [];
      setProducts(productList);
        setFormData((prev) => ({
          ...prev,
          items: [makeEmptyItem()],
        }));
    } catch (err) {
      setProducts([]);
    }
  };

  const updateItem = (index, field, value) => {
    const nextItems = [...formData.items];
    const current = { ...nextItems[index] };

    if (field === 'maSanPham') {
      const selectedProduct = products.find((product) => product.maSanPham === value);
      current.maSanPham = value;
      current.donGia = Number(selectedProduct?.donGia || 0);
      nextItems[index] = current;
      setFormData({ ...formData, items: nextItems });
      return;
    }

    if (field === 'soLuong') {
      const nextQty = Number(value) || 0;

      if (nextQty <= 0) {
        const filteredItems = formData.items.filter((_, itemIndex) => itemIndex !== index);
        setFormData({
          ...formData,
          items: filteredItems.length > 0 ? filteredItems : [makeEmptyItem()],
        });
        return;
      }

      current.soLuong = nextQty;
      nextItems[index] = current;
      setFormData({ ...formData, items: nextItems });
      return;
    }

    nextItems[index] = current;
    setFormData({ ...formData, items: nextItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, makeEmptyItem()],
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) {
      setFormData({
        ...formData,
        items: [makeEmptyItem()],
      });
      return;
    }

    const nextItems = formData.items.filter((_, itemIndex) => itemIndex !== index);
    setFormData({ ...formData, items: nextItems });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getOrders({ keyword }).catch(() => ({ data: { data: fallbackOrders } }));
      setOrders(res.data.data || fallbackOrders);
    } catch (err) {
      setOrders(fallbackOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.maDonHang.trim() || !formData.maKhachHang) {
      setFormError('Đơn hàng không hợp lệ. Vui lòng chọn khách hàng trước khi lưu.');
      return;
    }

    if (!formData.items.length || formData.items.some((item) => !item.maSanPham)) {
      setFormError('Đơn hàng chưa có sản phẩm. Vui lòng chọn ít nhất một mặt hàng hợp lệ.');
      return;
    }

    const normalizedItems = formData.items.map((item) => {
      const product = products.find((p) => p.maSanPham === item.maSanPham);
      return {
        maSanPham: item.maSanPham,
        soLuong: Number(item.soLuong || 0),
        donGia: Number(product?.donGia || item.donGia || 0),
      };
    });

    const invalidQty = normalizedItems.some((item) => item.soLuong <= 0);
    if (invalidQty) {
      setFormError('Số lượng đặt hàng của từng sản phẩm phải lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        maDonHang: formData.maDonHang.trim(),
        maKhachHang: formData.maKhachHang,
        maNhanVien: formData.maNhanVien,
        ngayMua: new Date().toISOString(),
        trangThai: 'Chờ xác nhận',
        items: normalizedItems,
      };

      if (editingOrderId) {
        await SalesAPI.updateOrder(editingOrderId, orderPayload);
      } else {
        await SalesAPI.createOrder(orderPayload);
      }

      setShowModal(false);
      setEditingOrderId(null);
      setFormData({
        maDonHang: makeOrderCode(),
              maKhachHang: '',
        maNhanVien: getCurrentEmployeeCode(),
        trangThai: 'Chờ xác nhận',
              items: [makeEmptyItem()],
      });
      setFormError('');
      fetchOrders();
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi tạo đơn hàng';
      const errors = err.response?.data?.errors;
      setFormError(Array.isArray(errors) ? errors.join(' | ') : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrder = (order) => {
    if (order.trangThai !== 'Chờ xác nhận') return;

    setEditingOrderId(order.maDonHang);
    setFormData({
      maDonHang: order.maDonHang,
      maKhachHang: order.maKhachHang || '',
      maNhanVien: order.maNhanVien || getCurrentEmployeeCode(),
      trangThai: 'Chờ xác nhận',
      items: (order.items || []).map((item) => ({
        maSanPham: item.maSanPham,
        soLuong: Number(item.soLuong || 1),
        donGia: Number(item.donGia || 0),
      })),
    });
    setFormError('');
    setShowModal(true);
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await SalesAPI.updateOrderStatus(id, nextStatus);
      fetchOrders();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đơn hàng');
    }
  };

  const handleQuickView = (order) => {
    setSelectedOrder(order);
  };

  const handleCancelOrder = async (order) => {
    if (order.trangThai !== 'Chờ xác nhận') return;
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;

    try {
      await SalesAPI.deleteOrder(order.maDonHang);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi hủy đơn hàng');
    }
  };

  const filteredOrders = useMemo(() => {
    if (!keyword.trim()) return orders;
    const q = keyword.toLowerCase();
    return orders.filter((order) =>
      (order.maDonHang || '').toLowerCase().includes(q) ||
      (order.tenKhachHang || '').toLowerCase().includes(q) ||
      (order.maKhachHang || '').toLowerCase().includes(q)
    );
  }, [orders, keyword]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
            <ShoppingCart className="h-6 w-6 text-orange-600" />
            Quản lý đơn hàng bán hàng
          </h1>
          <p className="mt-1 text-xs text-slate-500">Theo dõi đơn đặt hàng, xác nhận vận chuyển và cập nhật trạng thái giao dịch.</p>
        </div>
        <button
          onClick={() => {
            setEditingOrderId(null);
            setFormData({
              maDonHang: makeOrderCode(),
                maKhachHang: '',
              maNhanVien: getCurrentEmployeeCode(),
              trangThai: 'Chờ xác nhận',
                items: [makeEmptyItem()],
            });
            setFormError('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#00249C] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-900"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn hàng mới
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã đơn hoặc khách hàng"
              className="w-64 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-3 py-3">Mã đơn</th>
                <th className="px-3 py-3">Khách hàng</th>
                <th className="px-3 py-3">Ngày mua</th>
                <th className="px-3 py-3">Tổng tiền</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-slate-400">Không có đơn hàng phù hợp.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.maDonHang} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3 font-bold text-slate-900">{order.maDonHang}</td>
                    <td className="px-3 py-3 text-slate-700">{order.tenKhachHang || order.maKhachHang || '—'}</td>
                    <td className="px-3 py-3 text-slate-600">{formatDate(order.ngayMua)}</td>
                    <td className="px-3 py-3 font-bold text-slate-900">{currency(order.tongTien)}</td>
                    <td className="px-3 py-3 font-bold text-slate-700">{order.trangThai || 'Chờ xác nhận'}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickView(order)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-700"
                        >
                          Xem nhanh
                        </button>
                        {order.trangThai === 'Chờ xác nhận' && (
                          <button
                            type="button"
                            onClick={() => handleEditOrder(order)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] font-bold text-blue-700"
                          >
                            <PencilLine className="h-3 w-3" />
                            Sửa
                          </button>
                        )}
                        {order.trangThai === 'Chờ xác nhận' && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-[10px] font-bold text-red-700"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900">Xem nhanh đơn hàng</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-lg text-slate-500">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Mã đơn:</span>
                <span className="font-black text-slate-900">{selectedOrder.maDonHang}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Khách hàng:</span>
                <span>{selectedOrder.tenKhachHang || selectedOrder.maKhachHang || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Ngày mua:</span>
                <span>{formatDate(selectedOrder.ngayMua)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Tổng tiền:</span>
                <span className="font-black text-slate-900">{currency(selectedOrder.tongTien)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-500">Trạng thái:</span>
                <span>{selectedOrder.trangThai || 'Chờ xác nhận'}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-[#00249C] px-4 py-2 font-bold text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-900">{editingOrderId ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-lg text-slate-500">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block font-bold text-slate-700">Khách hàng</label>
                  <select
                    value={formData.maKhachHang}
                    onChange={(e) => setFormData({ ...formData, maKhachHang: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map((customer) => (
                      <option key={customer.maKhachHang} value={customer.maKhachHang}>
                        {customer.tenKhachHang} ({customer.maKhachHang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-600">Danh sách mặt hàng</h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700"
                  >
                    + Thêm mặt hàng
                  </button>
                </div>

                {formData.items.map((item, index) => {
                  const product = products.find((p) => p.maSanPham === item.maSanPham);
                  const lineTotal = (Number(product?.donGia || item.donGia || 0) * Number(item.soLuong || 0));

                  return (
                    <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1.5fr_0.7fr_0.8fr_auto]">
                      <div>
                        <label className="mb-1 block font-bold text-slate-700">Sản phẩm</label>
                        <select
                          value={item.maSanPham}
                          onChange={(e) => updateItem(index, 'maSanPham', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-500"
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map((productItem) => (
                            <option key={productItem.maSanPham} value={productItem.maSanPham}>
                              {productItem.tenSanPham} ({productItem.maSanPham})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-slate-700">Số lượng</label>
                        <input
                          type="number"
                          min="1"
                          value={item.soLuong}
                          onChange={(e) => updateItem(index, 'soLuong', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block font-bold text-slate-700">Đơn giá</label>
                        <input
                          disabled
                          value={currency(product?.donGia || item.donGia || 0)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700 outline-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-bold text-red-700"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="md:col-span-4 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                        <span>Thành tiền dòng</span>
                        <strong>{currency(lineTotal)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                <div className="flex items-center justify-between gap-3">
                  <span>Tổng tiền đơn hàng</span>
                  <strong>{currency(subtotal)}</strong>
                </div>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOrderId(null);
                    setFormError('');
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00249C] px-4 py-2 font-bold text-white disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu đơn hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
