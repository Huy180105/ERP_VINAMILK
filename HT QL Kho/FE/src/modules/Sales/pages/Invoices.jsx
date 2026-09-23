import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import {
  ReceiptText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  Clock,
  Printer,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

const currency = (val) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

export default function SalesInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const makeInvoiceCode = () => 'HD' + dateCode() + String(Date.now()).slice(-4);
  const dateCode = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  };

  const [createFormData, setCreateFormData] = useState({
    maHoaDon: makeInvoiceCode(),
    maGiaoHang: '',
    tongTien: 0,
    ngayLap: new Date().toISOString().slice(0, 10),
  });

  const [paymentFormData, setPaymentFormData] = useState({
    maHoaDon: '',
    phuongThuc: 'Tiền mặt',
    soTienThanhToan: 0,
    hanThanhToan: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchInvoices();
    loadDeliveries();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getInvoices();
      setInvoices(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể tải danh sách hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async () => {
    try {
      const res = await SalesAPI.getDeliveries();
      setDeliveries(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const filteredInvoices = useMemo(() => {
    if (!keyword.trim()) return invoices;
    const q = keyword.toLowerCase();
    return invoices.filter(
      (inv) =>
        (inv.maHoaDon || '').toLowerCase().includes(q) ||
        (inv.maGiaoHang || '').toLowerCase().includes(q) ||
        (inv.tenKhachHang || '').toLowerCase().includes(q) ||
        (inv.dhMaDonHang || inv.maDonHang || '').toLowerCase().includes(q)
    );
  }, [invoices, keyword]);

  const openCreateInvoice = () => {
    setCreateFormData({
      maHoaDon: makeInvoiceCode(),
      maGiaoHang: '',
      tongTien: 0,
      ngayLap: new Date().toISOString().slice(0, 10),
    });
    setShowCreateModal(true);
  };

  const handleDeliverySelect = (code) => {
    const delivery = deliveries.find((d) => d.maGiaoHang === code);
    setCreateFormData({
      ...createFormData,
      maGiaoHang: code,
      tongTien: Number(delivery?.thanhTien || delivery?.tongTien || 0),
    });
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.maGiaoHang) {
      notify('error', 'Vui lòng chọn phiếu giao hàng.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SalesAPI.createInvoice(createFormData);
      notify('success', 'Lập hóa đơn bán hàng thành công!');
      setShowCreateModal(false);
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi lập hóa đơn.';
      notify('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    const unpaid = invoice.soTienConLai !== undefined ? invoice.soTienConLai : Number(invoice.tongTien);
    setPaymentFormData({
      maHoaDon: invoice.maHoaDon,
      phuongThuc: 'Tiền mặt',
      soTienThanhToan: unpaid,
      hanThanhToan: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await SalesAPI.recordPayment(paymentFormData);
      if (res.data?.warning) {
        notify('error', res.data.warning);
      } else {
        notify('success', 'Ghi nhận thanh toán thành công!');
      }
      setShowPaymentModal(false);
      fetchInvoices();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi ghi nhận thanh toán.';
      notify('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewInvoiceDetail = async (invoice) => {
    try {
      const res = await SalesAPI.getInvoiceDetail(invoice.maHoaDon);
      setSelectedInvoice(res.data?.data);
    } catch (err) {
      notify('error', 'Không thể lấy chi tiết hóa đơn.');
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
              <ReceiptText className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR03</span>
          </div>
          <h1 className="text-xl font-black text-[#0B2341] mt-2">Quản Lý Hóa Đơn & Thanh Toán</h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập hóa đơn bán hàng theo phiếu giao hàng, ghi nhận thanh toán tiền mặt/chuyển khoản hoặc ghi nợ gối đầu có kiểm soát hạn mức tín dụng.
          </p>
        </div>

        <button
          onClick={openCreateInvoice}
          className="inline-flex items-center gap-2 bg-[#002795] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-900/20 hover:bg-blue-900 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Lập Hóa Đơn Mới
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã HĐ, mã giao, khách hàng..."
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng cộng: <span className="font-bold text-[#0B2341]">{filteredInvoices.length}</span> hóa đơn
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã Hóa Đơn</th>
                <th className="px-5 py-4">Ngày Lập</th>
                <th className="px-5 py-4">Khách Hàng</th>
                <th className="px-5 py-4">Phiếu Giao / Đơn</th>
                <th className="px-5 py-4 text-right">Tổng Tiền (VNĐ)</th>
                <th className="px-5 py-4 text-center">Trạng Thái</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Đang nạp danh sách hóa đơn...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Chưa có hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.maHoaDon} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{inv.maHoaDon}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inv.ngayLap?.slice(0, 10)}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{inv.tenKhachHang || 'Khách vãng lai'}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      <div>{inv.maGiaoHang}</div>
                      <div className="text-slate-400">{inv.maDonHang}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900">
                      {currency(inv.tongTien)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.trangThaiThanhToan === 'Đã thanh toán' || inv.trangThaiThanhToan === 'Đã tất toán'
                            ? 'bg-emerald-100 text-emerald-700'
                            : inv.trangThaiThanhToan === 'Thanh toán một phần'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {inv.trangThaiThanhToan || 'Đã thanh toán'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {inv.trangThaiThanhToan !== 'Đã tất toán' && inv.trangThaiThanhToan !== 'Đã thanh toán' && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Thanh Toán
                          </button>
                        )}
                        <button
                          onClick={() => viewInvoiceDetail(inv)}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Xem & In
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

      {/* Modal Lập Hóa Đơn */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#0B2341]">Lập Hóa Đơn Bán Hàng</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mã Hóa Đơn
                  </label>
                  <input
                    type="text"
                    disabled
                    value={createFormData.maHoaDon}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Ngày Lập
                  </label>
                  <input
                    type="date"
                    value={createFormData.ngayLap}
                    onChange={(e) => setCreateFormData({ ...createFormData, ngayLap: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Chọn Phiếu Giao Hàng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={createFormData.maGiaoHang}
                  onChange={(e) => handleDeliverySelect(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                >
                  <option value="">-- Chọn phiếu giao hàng --</option>
                  {deliveries.map((d) => (
                    <option key={d.maGiaoHang} value={d.maGiaoHang}>
                      {d.maGiaoHang} - {d.tenKhachHang} ({currency(d.thanhTien || d.tongTien)}) [{d.trangThai}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Tổng Tiền Hóa Đơn (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={createFormData.tongTien}
                  onChange={(e) => setCreateFormData({ ...createFormData, tongTien: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#002795] hover:bg-blue-900 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Tạo Hóa Đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thanh Toán Hóa Đơn */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedInvoice?.maHoaDon}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">Xác Nhận Thanh Toán</h2>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khách hàng:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice?.tenKhachHang}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng hóa đơn:</span>
                  <span className="font-bold text-[#002795]">{currency(selectedInvoice?.tongTien)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2">
                  Hình Thức Thanh Toán <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Tiền mặt', 'Chuyển khoản', 'Công nợ'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentFormData({ ...paymentFormData, phuongThuc: mode })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentFormData.phuongThuc === mode
                          ? 'border-[#002795] bg-blue-50 text-[#002795]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Số Tiền Thanh Toán (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={paymentFormData.soTienThanhToan}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, soTienThanhToan: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                />
              </div>

              {paymentFormData.phuongThuc === 'Công nợ' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Hạn Thanh Toán Công Nợ
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.hanThanhToan}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, hanThanhToan: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#002795]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#002795] hover:bg-blue-900 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xác Nhận Thu Tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem & In Hóa Đơn */}
      {selectedInvoice && !showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedInvoice.maHoaDon}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">Hóa Đơn Bán Hàng Vinamilk</h2>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Khách hàng</span>
                  <p className="font-bold text-slate-900">{selectedInvoice.tenKhachHang}</p>
                  <p className="text-slate-500 text-[11px]">{selectedInvoice.soDienThoaiKH}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Ngày lập / Trị giá</span>
                  <p className="text-slate-600">{selectedInvoice.ngayLap?.slice(0, 10)}</p>
                  <p className="font-black text-[#002795] text-sm">{currency(selectedInvoice.tongTien)}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase text-slate-600 mb-2">Chi tiết sản phẩm</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
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
                    {(selectedInvoice.items || []).map((item) => (
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
                In Hóa Đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

