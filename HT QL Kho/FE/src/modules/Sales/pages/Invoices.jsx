import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import Pagination from '../../../components/Pagination';
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
  const [orders, setOrders] = useState([]);
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
    maDonHang: '',
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
    loadOrders();
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

  const loadOrders = async () => {
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
    }, 5000);
  };

  const filteredInvoices = useMemo(() => {
    if (!keyword.trim()) return invoices;
    const q = keyword.toLowerCase();
    return invoices.filter(
      (inv) =>
        (inv.maHoaDon || '').toLowerCase().includes(q) ||
        (inv.tenKhachHang || '').toLowerCase().includes(q) ||
        (inv.maDonHang || '').toLowerCase().includes(q)
    );
  }, [invoices, keyword]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const openCreateInvoice = () => {
    setCreateFormData({
      maHoaDon: makeInvoiceCode(),
      maDonHang: '',
      tongTien: 0,
      ngayLap: new Date().toISOString().slice(0, 10),
    });
    setShowCreateModal(true);
  };

  const handleOrderSelect = (code) => {
    const order = orders.find((o) => o.maDonHang === code);
    setCreateFormData({
      ...createFormData,
      maDonHang: code,
      tongTien: Number(order?.thanhTien || order?.tongTien || 0),
    });
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.maDonHang) {
      notify('error', 'Vui lòng chọn đơn hàng.');
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

  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentFormData({
      maHoaDon: inv.maHoaDon,
      phuongThuc: 'Tiền mặt',
      soTienThanhToan: inv.soTienConLai || inv.tongTien,
      hanThanhToan: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (paymentFormData.soTienThanhToan <= 0 && paymentFormData.phuongThuc !== 'Công nợ') {
      notify('error', 'Số tiền thanh toán phải lớn hơn 0.');
      return;
    }

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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR03 & SA-BR03</span>
          </div>
          <h1 className="text-xl font-black text-[#0B2341] mt-2">Quản Lý Hóa Đơn & Thanh Toán (Invoices)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hóa đơn được phát sinh <b>tự động</b> ngay khi tạo đơn hàng mới. Quản lý trạng thái thanh toán & công nợ khách hàng.
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

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã hóa đơn, mã đơn hàng, khách hàng..."
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng số: <span className="font-bold text-[#0B2341]">{filteredInvoices.length}</span> hóa đơn
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã Hóa Đơn</th>
                <th className="px-5 py-4">Mã Đơn Hàng</th>
                <th className="px-5 py-4">Khách Hàng</th>
                <th className="px-5 py-4">Ngày Lập</th>
                <th className="px-5 py-4 text-right">Tổng Tiền</th>
                <th className="px-5 py-4 text-center">Trạng Thái Thanh Toán</th>
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
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Chưa có hóa đơn nào.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.maHoaDon} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{inv.maHoaDon}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">{inv.maDonHang || '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{inv.tenKhachHang || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{(inv.ngayLap || '').slice(0, 10)}</td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 text-sm">
                      {currency(inv.tongTien)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.trangThaiThanhToan === 'Đã tất toán' || inv.trangThaiThanhToan === 'Đã thanh toán'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.trangThaiThanhToan === 'Thanh toán một phần'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.trangThaiThanhToan || 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {inv.trangThaiThanhToan !== 'Đã tất toán' && inv.trangThaiThanhToan !== 'Đã thanh toán' ? (
                        <button
                          onClick={() => openPaymentModal(inv)}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Thanh Toán
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã thu đủ
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredInvoices.length}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Modal Lập Hóa Đơn Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-black text-[#0B2341]">Lập Hóa Đơn Bán Hàng Mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Hóa Đơn</label>
                <input
                  type="text"
                  value={createFormData.maHoaDon}
                  onChange={(e) => setCreateFormData({ ...createFormData, maHoaDon: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Đơn Hàng Mới</label>
                <select
                  value={createFormData.maDonHang}
                  onChange={(e) => handleOrderSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 outline-none"
                  required
                >
                  <option value="">-- Chọn Đơn Hàng --</option>
                  {orders.map((o) => (
                    <option key={o.maDonHang} value={o.maDonHang}>
                      {o.maDonHang} - {o.tenKhachHang} ({currency(o.thanhTien || o.tongTien)}) [{o.trangThai}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tổng Tiền Hóa Đơn (VND)</label>
                <input
                  type="text"
                  value={currency(createFormData.tongTien)}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-black text-[#002795] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#002795] text-white font-bold hover:bg-blue-900 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Tạo Hóa Đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ghi Nhận Thanh Toán */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-[#0B2341]">Ghi Nhận Thanh Toán</h2>
                <p className="text-[11px] text-slate-500">Mã hóa đơn: {selectedInvoice.maHoaDon}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div className="bg-blue-50 p-3.5 rounded-2xl space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Khách hàng:</span>
                  <span className="font-bold text-[#0B2341]">{selectedInvoice.tenKhachHang}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Tổng hóa đơn:</span>
                  <span className="font-bold text-slate-900">{currency(selectedInvoice.tongTien)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Số tiền còn nợ:</span>
                  <span className="font-black text-rose-600">{currency(selectedInvoice.soTienConLai || selectedInvoice.tongTien)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phương Thức Thanh Toán</label>
                <select
                  value={paymentFormData.phuongThuc}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, phuongThuc: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                >
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  <option value="Công nợ">Ghi nhận công nợ gối đầu</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số Tiền Thanh Toán (VND)</label>
                <input
                  type="number"
                  value={paymentFormData.soTienThanhToan}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, soTienThanhToan: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-black text-[#002795] outline-none text-base"
                  required
                />
              </div>

              {paymentFormData.phuongThuc === 'Công nợ' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Thanh Toán Công Nợ</label>
                  <input
                    type="date"
                    value={paymentFormData.hanThanhToan}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, hanThanhToan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xác Nhận Thanh Toán'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
