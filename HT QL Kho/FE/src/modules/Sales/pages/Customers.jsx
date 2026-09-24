import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import {
  Users,
  Plus,
  Search,
  PencilLine,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  MapPin,
  CircleDollarSign,
  FileText
} from 'lucide-react';

const isValidPhone = (value) => /^(0[2-9])\d{8,9}$/.test(value);

const currency = (val) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

export default function SalesCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [detailModal, setDetailModal] = useState({ show: false, customer: null, loading: false });

  const [formData, setFormData] = useState({
    maKhachHang: '',
    tenKhachHang: '',
    soDienThoai: '',
    diaChi: '',
    hanMucCongNo: 50000000,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getCustomers();
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const filteredCustomers = useMemo(() => {
    if (!keyword.trim()) return customers;
    const q = keyword.toLowerCase();
    return customers.filter(
      (c) =>
        (c.maKhachHang || '').toLowerCase().includes(q) ||
        (c.tenKhachHang || '').toLowerCase().includes(q) ||
        (c.soDienThoai || '').toLowerCase().includes(q) ||
        (c.diaChi || '').toLowerCase().includes(q)
    );
  }, [customers, keyword]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      maKhachHang: '',
      tenKhachHang: '',
      soDienThoai: '',
      diaChi: '',
      hanMucCongNo: 100000000,
    });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      maKhachHang: customer.maKhachHang,
      tenKhachHang: customer.tenKhachHang,
      soDienThoai: customer.soDienThoai || '',
      diaChi: customer.diaChi || '',
      hanMucCongNo: Number(customer.hanMucCongNo || 0),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.tenKhachHang.trim()) {
      notify('error', 'Vui lòng nhập tên khách hàng / đại lý.');
      return;
    }
    if (formData.soDienThoai && !isValidPhone(formData.soDienThoai)) {
      notify('error', 'Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 02x).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await SalesAPI.updateCustomer(editingCustomer.maKhachHang, {
          tenKhachHang: formData.tenKhachHang,
          soDienThoai: formData.soDienThoai,
          diaChi: formData.diaChi,
          hanMucCongNo: formData.hanMucCongNo,
        });
        notify('success', 'Cập nhật khách hàng thành công!');
      } else {
        await SalesAPI.createCustomer(formData);
        notify('success', 'Thêm mới khách hàng thành công!');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu khách hàng.';
      notify('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.tenKhachHang}" (${customer.maKhachHang}) không?`)) {
      return;
    }
    try {
      await SalesAPI.deleteCustomer(customer.maKhachHang);
      notify('success', 'Đã xóa khách hàng thành công.');
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xóa khách hàng này.';
      notify('error', msg);
    }
  };

  const viewCustomerDetail = async (customer) => {
    setDetailModal({ show: true, customer: null, loading: true });
    try {
      const res = await SalesAPI.getCustomerDetail(customer.maKhachHang);
      setDetailModal({ show: true, customer: res.data?.data, loading: false });
    } catch (err) {
      notify('error', 'Không thể lấy chi tiết khách hàng.');
      setDetailModal({ show: false, customer: null, loading: false });
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
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR01</span>
          </div>
          <h1 className="text-xl font-black text-[#0B2341] mt-2">Quản Lý Khách Hàng & Đại Lý</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ nhà phân phối, chuỗi siêu thị, đại lý bán buôn và thiết lập hạn mức công nợ tối đa.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#002795] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-900/20 hover:bg-blue-900 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Khách Hàng
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã, tên, SĐT, địa chỉ..."
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng cộng: <span className="font-bold text-[#0B2341]">{filteredCustomers.length}</span> đối tác
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã KH</th>
                <th className="px-5 py-4">Tên Khách Hàng / NPP</th>
                <th className="px-5 py-4">Số Điện Thoại</th>
                <th className="px-5 py-4">Địa Chỉ</th>
                <th className="px-5 py-4 text-right">Hạn Mức Công Nợ</th>
                <th className="px-5 py-4 text-right">Công Nợ Hiện Tại</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.maKhachHang} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{c.maKhachHang}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => viewCustomerDetail(c)}
                        className="font-bold text-slate-800 hover:text-[#002795] text-left cursor-pointer"
                      >
                        {c.tenKhachHang}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">
                      {c.soDienThoai ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.soDienThoai}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={c.diaChi}>
                      {c.diaChi || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {currency(c.hanMucCongNo)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`font-black ${
                          c.tongNoHienTai > c.hanMucCongNo
                            ? 'text-rose-600'
                            : c.tongNoHienTai > 0
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {currency(c.tongNoHienTai)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewCustomerDetail(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700 cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-amber-700 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Thêm / Sửa Khách hàng */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0B2341]">
                {editingCustomer ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Tên Khách Hàng / NPP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tenKhachHang}
                  onChange={(e) => setFormData({ ...formData, tenKhachHang: e.target.value })}
                  placeholder="Ví dụ: Đại lý Vinamilk Cầu Giấy..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    placeholder="0912..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Hạn Mức Công Nợ (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={formData.hanMucCongNo}
                    onChange={(e) => setFormData({ ...formData, hanMucCongNo: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Địa Chỉ
                </label>
                <textarea
                  rows={2}
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  placeholder="Địa chỉ trụ sở hoặc điểm giao hàng..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
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
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Khách hàng */}
      {detailModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {detailModal.customer?.maKhachHang}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">
                  {detailModal.customer?.tenKhachHang}
                </h2>
              </div>
              <button
                onClick={() => setDetailModal({ show: false, customer: null, loading: false })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailModal.loading ? (
              <div className="py-10 text-center text-slate-400 font-medium text-xs">
                Đang nạp hồ sơ chi tiết...
              </div>
            ) : (
              detailModal.customer && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Số Điện Thoại</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {detailModal.customer.soDienThoai || 'Chưa có'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Hạn Mức Nợ</p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        {currency(detailModal.customer.hanMucCongNo)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Nợ Hiện Tại</p>
                      <p className="text-xs font-black text-rose-600 mt-0.5">
                        {currency(detailModal.customer.tongNoHienTai)}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200/60">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Địa Chỉ Giao Hàng</p>
                      <p className="text-xs text-slate-700 mt-0.5">{detailModal.customer.diaChi || '—'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                      Đơn hàng gần đây ({detailModal.customer.recentOrders?.length || 0})
                    </h3>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                          <tr>
                            <th className="px-3 py-2">Mã Đơn</th>
                            <th className="px-3 py-2">Ngày Mua</th>
                            <th className="px-3 py-2 text-right">Tổng Tiền</th>
                            <th className="px-3 py-2 text-center">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(detailModal.customer.recentOrders || []).map((o) => (
                            <tr key={o.maDonHang}>
                              <td className="px-3 py-2 font-bold text-[#002795]">{o.maDonHang}</td>
                              <td className="px-3 py-2 text-slate-600">{o.ngayMua}</td>
                              <td className="px-3 py-2 text-right font-bold">{currency(o.thanhTien)}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {o.trangThai}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
