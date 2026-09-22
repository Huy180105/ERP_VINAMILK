import React, { useEffect, useState, useMemo } from 'react';
import { HRApi } from '../../../services/hrApi';
import {
  Calculator,
  Search,
  Lock,
  Unlock,
  Download,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  DollarSign,
  Calendar,
  Building2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function HRPayroll() {
  const currentMonth = '09/2026';
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Modals & Forms
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [editForm, setEditForm] = useState({ phuCap: 0, luongTangCa: 0, khauTru: 0, lyDoSua: '' });

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        HRApi.getPayrolls({ thang: selectedMonth }),
        HRApi.getDepartments(),
      ]);
      setPayrolls(pRes.data?.data || []);
      setDepartments(dRes.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp dữ liệu bảng lương.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4500);
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((p) => {
      const matchKey =
        !keyword ||
        p.maBangLuong.toLowerCase().includes(keyword.toLowerCase()) ||
        p.maNV.toLowerCase().includes(keyword.toLowerCase()) ||
        (p.nhan_vien && p.nhan_vien.hoTen.toLowerCase().includes(keyword.toLowerCase()));

      const matchDept = !filterDept || p.nhan_vien?.maPhongBan === filterDept;

      return matchKey && matchDept;
    });
  }, [payrolls, keyword, filterDept]);

  // Is whole month locked?
  const isMonthLocked = useMemo(() => {
    return payrolls.length > 0 && payrolls.every((p) => p.trangThai === 'DaKhoa');
  }, [payrolls]);

  // Summary Totals
  const summary = useMemo(() => {
    return {
      count: filteredPayrolls.length,
      totalBasic: filteredPayrolls.reduce((sum, p) => sum + Number(p.luongCoBan || 0), 0),
      totalAllowance: filteredPayrolls.reduce((sum, p) => sum + Number(p.phuCap || 0), 0),
      totalOT: filteredPayrolls.reduce((sum, p) => sum + Number(p.luongTangCa || 0), 0),
      totalDeduction: filteredPayrolls.reduce((sum, p) => sum + Number(p.khauTru || 0), 0),
      totalNet: filteredPayrolls.reduce((sum, p) => sum + Number(p.tongThucNhan || 0), 0),
    };
  }, [filteredPayrolls]);

  // Batch calculate payroll (HR-FR17)
  const handleCalculatePayroll = async () => {
    setIsSubmitting(true);
    try {
      const res = await HRApi.calculateMonthlyPayroll({ thang: selectedMonth });
      notify('success', res.data?.message || 'Tính lương hàng loạt thành công!');
      fetchPayrolls();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi tính toán bảng lương.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lock payroll month (HR-BR04)
  const handleLockPayroll = async () => {
    if (!window.confirm(`Xác nhận chốt số liệu và khóa sổ bảng lương kỳ ${selectedMonth}? Sau khi khóa, số liệu sẽ được chuyển sang Phân hệ Quản lý Thu Chi (Phiếu Chi).`)) {
      return;
    }
    try {
      const res = await HRApi.lockPayroll({ thang: selectedMonth });
      notify('success', res.data?.message || 'Đã khóa sổ bảng lương thành công!');
      fetchPayrolls();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khóa sổ bảng lương.');
    }
  };

  // Unlock payroll month
  const handleUnlockPayroll = async () => {
    if (!window.confirm(`Mở khóa sổ kỳ lương ${selectedMonth} để điều chỉnh lại số liệu?`)) return;
    try {
      const res = await HRApi.unlockPayroll({ thang: selectedMonth });
      notify('success', res.data?.message || 'Đã mở khóa sổ bảng lương!');
      fetchPayrolls();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi mở khóa sổ.');
    }
  };

  // Open Edit Modal (HR-FR18)
  const handleOpenEdit = (p) => {
    setSelectedPayroll(p);
    setEditForm({
      phuCap: p.phuCap || 0,
      luongTangCa: p.luongTangCa || 0,
      khauTru: p.khauTru || 0,
      lyDoSua: '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.lyDoSua.trim()) {
      notify('error', 'Quy tắc HR-NFR04: Mọi điều chỉnh phụ cấp/khấu trừ trên bảng lương bắt buộc phải nhập lý do giải trình.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await HRApi.updatePayroll(selectedPayroll.maBangLuong, {
        phuCap: Number(editForm.phuCap),
        luongTangCa: Number(editForm.luongTangCa),
        khauTru: Number(editForm.khauTru),
        lyDoSua: editForm.lyDoSua,
      });
      notify('success', res.data?.message || 'Cập nhật bảng lương thành công!');
      setShowEditModal(false);
      fetchPayrolls();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi chỉnh sửa bảng lương.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export report (HR-FR20, HR-BR04)
  const handleExport = async () => {
    try {
      const res = await HRApi.exportPayroll({ thang: selectedMonth });
      setExportData(res.data?.data || null);
      setShowExportModal(true);
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi chuẩn bị xuất báo cáo.');
    }
  };

  const monthOptions = ['09/2026', '08/2026', '07/2026', '06/2026'];

  return (
    <div className="space-y-6 pb-12">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Quản Lý Tính Lương & Báo Cáo Chi Trả (HR-FR17, HR-FR18, HR-FR20)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tính lương tự động chuẩn VAS (BHXH 10.5%, làm thêm 1.5x) · Khóa số liệu trước khi xuất báo cáo (HR-BR04, HR-BR05)
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCalculatePayroll}
            disabled={isSubmitting || isMonthLocked}
            className="inline-flex items-center space-x-1.5 bg-[#002795] hover:bg-[#001F7D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang tính toán...' : 'Tính Lương Tháng Này'}</span>
          </button>

          {isMonthLocked ? (
            <button
              onClick={handleUnlockPayroll}
              className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Mở Khóa Sổ</span>
            </button>
          ) : (
            <button
              onClick={handleLockPayroll}
              disabled={payrolls.length === 0}
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>Khóa Bảng Lương (HR-BR04)</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo (HR-FR20)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Current Month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Quỹ Lương Thực Nhận</span>
          <p className="text-xl font-black text-[#002795] mt-1">{formatCurrency(summary.totalNet)}</p>
          <span className="text-[11px] text-slate-500 font-medium">Chi trả cho {summary.count} nhân sự</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Lương Cơ Bản</span>
          <p className="text-xl font-black text-slate-900 mt-1">{formatCurrency(summary.totalBasic)}</p>
          <span className="text-[11px] text-slate-500 font-medium">Căn cứ theo hợp đồng lao động</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Phụ Cấp & Tăng Ca</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            +{formatCurrency(summary.totalAllowance + summary.totalOT)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Phụ cấp chức vụ + Giờ làm thêm</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Khấu Trừ Bảo Hiểm (HR-BR05)</span>
          <p className="text-xl font-black text-red-600 mt-1">-{formatCurrency(summary.totalDeduction)}</p>
          <span className="text-[11px] text-slate-500 font-medium">10.5% (BHXH + BHYT + BHTN)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Calendar className="w-4 h-4 text-[#002795]" />
            <span className="text-xs font-bold text-[#002795]">Kỳ Lương:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-xs text-[#002795] focus:outline-none cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo số bảng lương, họ tên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002795]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002795]"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.maPhongBan} value={d.maPhongBan}>
                {d.tenPhongBan}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mã Bảng Lương</th>
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4 text-right">Lương HĐ</th>
                <th className="py-3 px-4 text-center">Công Thực Tế</th>
                <th className="py-3 px-4 text-right">Phụ Cấp</th>
                <th className="py-3 px-4 text-right">Tăng Ca</th>
                <th className="py-3 px-4 text-right">Khấu Trừ BH</th>
                <th className="py-3 px-4 text-right">Tổng Thực Nhận</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-slate-400">
                    Đang nạp dữ liệu bảng lương...
                  </td>
                </tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-slate-400">
                    Chưa có số liệu lương cho kỳ {selectedMonth}. Hãy bấm "Tính Lương Tháng Này" để tự động hóa.
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => (
                  <tr key={p.maBangLuong} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#002795]">{p.maBangLuong}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.nhan_vien?.hoTen || p.maNV}</div>
                      <div className="text-[11px] text-slate-400">{p.nhan_vien?.chuc_vu?.tenChucVu}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(p.luongCoBan)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {p.bang_cong?.soNgayCong ?? 22}/22
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700">+{formatCurrency(p.phuCap)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700">+{formatCurrency(p.luongTangCa)}</td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">-{formatCurrency(p.khauTru)}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-[#002795] text-sm">
                      {formatCurrency(p.tongThucNhan)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.trangThai === 'DaKhoa'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.trangThai === 'DaKhoa' ? 'Đã khóa sổ' : 'Tạm tính'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        title="Điều chỉnh phụ cấp/khấu trừ (HR-FR18)"
                        disabled={p.trangThai === 'DaKhoa'}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Sửa Bảng Lương (HR-FR18) */}
      {showEditModal && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#002795] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Điều Chỉnh Bảng Lương (HR-FR18)</h3>
                <p className="text-[11px] text-blue-100">
                  {selectedPayroll.nhan_vien?.hoTen} ({selectedPayroll.maNV}) — Kỳ {selectedPayroll.thang}
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lương Hợp Đồng:</span>
                  <span className="font-bold font-mono text-slate-800">{formatCurrency(selectedPayroll.luongCoBan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số Ngày Công:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {selectedPayroll.bang_cong?.soNgayCong ?? 22} ngày
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phụ Cấp Chức Vụ / Dự Án (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={editForm.phuCap}
                  onChange={(e) => setEditForm({ ...editForm, phuCap: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lương Làm Thêm Giờ (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={editForm.luongTangCa}
                  onChange={(e) => setEditForm({ ...editForm, luongTangCa: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khoản Khấu Trừ Bảo Hiểm / Thuế (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={editForm.khauTru}
                  onChange={(e) => setEditForm({ ...editForm, khauTru: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý Do Giải Trình Bắt Buộc (HR-NFR04) *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Ví dụ: Thưởng hiệu quả quý 3 hoặc điều chỉnh số giờ công làm thêm phát sinh..."
                  value={editForm.lyDoSua}
                  onChange={(e) => setEditForm({ ...editForm, lyDoSua: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">Lưu log kiểm toán người sửa và lịch sử thay đổi.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xác Nhận Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Báo Cáo Xuất Lương (HR-FR20) */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Bảng Kê Chi Trả Lương & Chi Phí Nhân Sự (HR-FR20)</h3>
                <p className="text-[11px] text-slate-300">
                  Kỳ lương: {exportData.thang} · Đã khóa sổ và xác nhận theo chuẩn HR-BR04
                </p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng nhân sự</span>
                  <p className="text-base font-bold text-slate-800">{exportData.tongNhanSu} người</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng quỹ lương</span>
                  <p className="text-base font-bold text-[#002795]">{formatCurrency(exportData.tongQuyLuong)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Khấu trừ BH</span>
                  <p className="text-base font-bold text-red-600">{formatCurrency(exportData.tongKhauTruBaoHiem)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Phụ cấp</span>
                  <p className="text-base font-bold text-emerald-700">{formatCurrency(exportData.tongPhuCap)}</p>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Mã NV</th>
                      <th className="py-2.5 px-3">Họ Tên</th>
                      <th className="py-2.5 px-3">Phòng Ban</th>
                      <th className="py-2.5 px-3 text-right">Lương HĐ</th>
                      <th className="py-2.5 px-3 text-right">Thực Lĩnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {exportData.chiTiet?.map((r) => (
                      <tr key={r.maBangLuong}>
                        <td className="py-2 px-3 font-mono font-bold text-[#002795]">{r.maNV}</td>
                        <td className="py-2 px-3">{r.nhan_vien?.hoTen}</td>
                        <td className="py-2 px-3 text-slate-500">{r.nhan_vien?.phong_ban?.tenPhongBan}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatCurrency(r.luongCoBan)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(r.tongThucNhan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">File sẵn sàng liên thông sang Phân hệ Quản lý Thu Chi</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300 cursor-pointer"
                >
                  In Báo Cáo
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-[#002795] text-white font-bold rounded-xl text-xs hover:bg-[#001F7D] cursor-pointer"
                >
                  Hoàn Tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

