import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import {
  CircleDollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Calendar,
  AlertTriangle,
  History,
  Phone,
  FileSpreadsheet
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

export default function SalesReceivables() {
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchReceivables();
  }, []);

  const fetchReceivables = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getReceivables();
      setReceivables(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể tải danh sách công nợ.');
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

  const filteredReceivables = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return receivables.map((item) => {
      let isOverdue = false;
      if (item.hanThanhToan && item.soTienConLai > 0 && item.hanThanhToan < today) {
        isOverdue = true;
      }
      return { ...item, isOverdue };
    }).filter((r) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'overdue' && r.isOverdue) ||
        (statusFilter !== 'overdue' && r.trangThai === statusFilter);

      const q = keyword.toLowerCase();
      const matchKeyword =
        !keyword.trim() ||
        (r.maCongNo || '').toLowerCase().includes(q) ||
        (r.tenKhachHang || '').toLowerCase().includes(q) ||
        (r.maHoaDon || '').toLowerCase().includes(q);

      return matchStatus && matchKeyword;
    });
  }, [receivables, statusFilter, keyword]);

  const stats = useMemo(() => {
    const totalDebt = receivables.reduce((sum, r) => sum + Number(r.soTienConLai || 0), 0);
    const paidDebt = receivables.reduce((sum, r) => sum + Number(r.soTienDaTra || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const overdueDebt = receivables
      .filter((r) => r.hanThanhToan && Number(r.soTienConLai) > 0 && r.hanThanhToan < today)
      .reduce((sum, r) => sum + Number(r.soTienConLai || 0), 0);
    const debtorCount = new Set(receivables.filter(r => Number(r.soTienConLai) > 0).map(r => r.maKhachHang)).size;

    return { totalDebt, paidDebt, overdueDebt, debtorCount };
  }, [receivables]);

  const viewDebtDetail = async (debt) => {
    try {
      const res = await SalesAPI.getReceivableDetail(debt.maCongNo);
      setSelectedDebt(res.data?.data);
    } catch (err) {
      notify('error', 'Không thể xem chi tiết công nợ.');
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
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-[#002795]">
            <CircleDollarSign className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR05</span>
        </div>
        <h1 className="text-xl font-black text-[#0B2341] mt-2">Quản Lý & Theo Dõi Công Nợ Khách Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi chi tiết số tiền nợ gốc, đã thanh toán, số dư nợ còn lại, kỳ hạn thanh toán và hạn mức tín dụng theo từng hóa đơn.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng Nợ Phải Thu</p>
          <p className="text-2xl font-black text-rose-600 mt-2">{currency(stats.totalDebt)}</p>
          <p className="text-[11px] text-slate-500 mt-1">{stats.debtorCount} đối tác đang có dư nợ</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nợ Quá Hạn</p>
          <p className="text-2xl font-black text-amber-600 mt-2">{currency(stats.overdueDebt)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Cần ưu tiên đôn đốc thu hồi</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Đã Thu Hồi</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{currency(stats.paidDebt)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Ghi nhận vào sổ quỹ thu</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng Số Khoản Nợ</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{receivables.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Lịch sử giao dịch gối đầu</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã công nợ, khách hàng, HĐ..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-2xl outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Còn nợ">Còn nợ</option>
            <option value="Thanh toán một phần">Thanh toán một phần</option>
            <option value="Đã tất toán">Đã tất toán</option>
            <option value="overdue">Đã quá hạn</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Hiển thị: <span className="font-bold text-[#0B2341]">{filteredReceivables.length}</span> khoản nợ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã Công Nợ</th>
                <th className="px-5 py-4">Khách Hàng / NPP</th>
                <th className="px-5 py-4">Hóa Đơn / Đơn</th>
                <th className="px-5 py-4 text-right">Tổng Nợ Ban Đầu</th>
                <th className="px-5 py-4 text-right">Đã Trả</th>
                <th className="px-5 py-4 text-right">Còn Phải Thu</th>
                <th className="px-5 py-4">Hạn Thanh Toán</th>
                <th className="px-5 py-4 text-center">Trạng Thái</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                    Đang nạp dữ liệu công nợ...
                  </td>
                </tr>
              ) : filteredReceivables.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-medium">
                    Không có khoản công nợ nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredReceivables.map((r) => (
                  <tr key={r.maCongNo} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{r.maCongNo}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{r.tenKhachHang || '—'}</p>
                      <p className="text-[11px] text-slate-500">{r.soDienThoaiKH || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      <div>{r.maHoaDon || '—'}</div>
                      <div className="text-slate-400">{r.maDonHang || ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                      {currency(r.soTienNo)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
                      {currency(r.soTienDaTra)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-rose-600">
                      {currency(r.soTienConLai)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className={`inline-flex items-center gap-1 ${r.isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(r.hanThanhToan)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.trangThai === 'Đã tất toán'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.isOverdue
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.isOverdue ? 'Quá hạn' : r.trangThai}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => viewDebtDetail(r)}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Lịch Sử Đối Soát
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lịch Sử Đối Soát Công Nợ */}
      {selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedDebt.maCongNo}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">Lịch Sử Đối Soát & Thanh Toán</h2>
              </div>
              <button
                onClick={() => setSelectedDebt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-900">{selectedDebt.tenKhachHang}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hạn mức tín dụng:</span>
                <span className="font-bold text-slate-800">{currency(selectedDebt.hanMucCongNo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hóa đơn phát sinh:</span>
                <span className="font-mono font-bold text-[#002795]">{selectedDebt.maHoaDon}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span>Còn phải thu:</span>
                <span className="text-rose-600 font-black text-sm">{currency(selectedDebt.soTienConLai)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase text-slate-600 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-700" />
                Lịch sử các lần thanh toán ({selectedDebt.payments?.length || 0})
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="px-3 py-2">Mã GD</th>
                      <th className="px-3 py-2">Ngày TT</th>
                      <th className="px-3 py-2">Phương Thức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedDebt.payments || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-slate-400">
                          Chưa có giao dịch thanh toán nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      selectedDebt.payments.map((p) => (
                        <tr key={p.maThanhToan}>
                          <td className="px-3 py-2 font-mono font-bold text-slate-800">{p.maThanhToan}</td>
                          <td className="px-3 py-2 text-slate-600">{p.ngayThanhToan?.slice(0, 19)}</td>
                          <td className="px-3 py-2">
                            <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md">
                              {p.phuongThuc}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDebt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

