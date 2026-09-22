import React, { useEffect, useState, useMemo } from 'react';
import { HRApi } from '../../../services/hrApi';
import {
  CalendarCheck,
  Search,
  Plus,
  Edit3,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Calendar,
  FileCheck,
  ShieldAlert,
  Users
} from 'lucide-react';

export default function HRTimesheets() {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month selector (MM/YYYY)
  const currentMonth = '09/2026';
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTS, setSelectedTS] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Form State
  const initialForm = {
    maNV: '',
    thang: currentMonth,
    soNgayCong: 22,
    soGioTangCa: 0,
    soNgayNghiPhep: 0,
    lyDoGiaiTrinh: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchInitialData();
  }, [selectedMonth]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tsRes, empRes, deptRes] = await Promise.all([
        HRApi.getTimesheets({ thang: selectedMonth }),
        HRApi.getEmployees({ trangThai: 'Đang làm việc' }),
        HRApi.getDepartments(),
      ]);
      setTimesheets(tsRes.data?.data || []);
      setEmployees(empRes.data?.data || []);
      setDepartments(deptRes.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp dữ liệu chấm công.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4500);
  };

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((ts) => {
      const matchKey =
        !keyword ||
        ts.maBangCong.toLowerCase().includes(keyword.toLowerCase()) ||
        ts.maNV.toLowerCase().includes(keyword.toLowerCase()) ||
        (ts.nhan_vien && ts.nhan_vien.hoTen.toLowerCase().includes(keyword.toLowerCase()));

      const matchDept = !filterDept || ts.nhan_vien?.maPhongBan === filterDept;

      return matchKey && matchDept;
    });
  }, [timesheets, keyword, filterDept]);

  const handleOpenRecord = () => {
    setFormData({
      ...initialForm,
      thang: selectedMonth,
      maNV: employees[0]?.maNV || '',
    });
    setShowRecordModal(true);
  };

  const handleOpenEdit = (ts) => {
    setSelectedTS(ts);
    setFormData({
      maNV: ts.maNV,
      thang: ts.thang,
      soNgayCong: ts.soNgayCong,
      soGioTangCa: Number(ts.soGioTangCa || 0),
      soNgayNghiPhep: ts.soNgayNghiPhep || 0,
      lyDoGiaiTrinh: ts.lyDoGiaiTrinh || '',
    });
    setShowEditModal(true);
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await HRApi.recordTimesheet(formData);
      notify('success', res.data?.message || 'Ghi nhận chấm công thành công!');
      setShowRecordModal(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi ghi nhận chấm công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lyDoGiaiTrinh.trim()) {
      notify('error', 'Quy tắc HR-FR14: Mọi thao tác sửa thủ công bảng công bắt buộc phải có lý do giải trình.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await HRApi.updateTimesheet(selectedTS.maBangCong, {
        soNgayCong: Number(formData.soNgayCong),
        soGioTangCa: Number(formData.soGioTangCa),
        soNgayNghiPhep: Number(formData.soNgayNghiPhep),
        lyDoGiaiTrinh: formData.lyDoGiaiTrinh,
      });
      notify('success', res.data?.message || 'Cập nhật bảng chấm công thành công!');
      setShowEditModal(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi chỉnh sửa bảng công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLockAll = async () => {
    if (!window.confirm(`Bạn có chắc muốn chốt và khóa sổ toàn bộ bảng chấm công kỳ ${selectedMonth}? Khi đã khóa, không thể chỉnh sửa trừ khi mở khóa.`)) {
      return;
    }
    try {
      const res = await HRApi.lockTimesheets({ thang: selectedMonth });
      notify('success', res.data?.message || 'Đã khóa sổ bảng công kỳ này!');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khóa sổ bảng công.');
    }
  };

  // Month options
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
            Quản Lý Chấm Công & Phép / Tăng Ca (HR-FR13 — HR-FR16)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận số ngày công thực tế, giờ làm thêm và quản lý phép theo hạn mức luật lao động (HR-BR03, HR-BR04)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLockAll}
            className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Khóa Sổ Công Tháng</span>
          </button>
          <button
            onClick={handleOpenRecord}
            className="inline-flex items-center space-x-1.5 bg-[#002795] hover:bg-[#001F7D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Nhận Chấm Công</span>
          </button>
        </div>
      </div>

      {/* Month Bar & Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Calendar className="w-4 h-4 text-[#002795]" />
            <span className="text-xs font-bold text-[#002795]">Kỳ Chấm Công:</span>
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
              placeholder="Tìm theo mã NV, họ tên..."
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

      {/* Timesheets Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mã Bảng Công</th>
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4">Phòng Ban / Vị Trí</th>
                <th className="py-3 px-4 text-center">Tháng</th>
                <th className="py-3 px-4 text-center">Ngày Công Thực Tế</th>
                <th className="py-3 px-4 text-center">Giờ Tăng Ca</th>
                <th className="py-3 px-4 text-center">Nghỉ Phép (Lương)</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400">
                    Đang nạp dữ liệu chấm công...
                  </td>
                </tr>
              ) : filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-slate-400">
                    Chưa có bảng chấm công nào cho kỳ {selectedMonth}.
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map((ts) => (
                  <tr key={ts.maBangCong} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#002795]">{ts.maBangCong}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ts.nhan_vien?.hoTen || ts.maNV}</div>
                      <span className="font-mono text-[11px] text-slate-400">{ts.maNV}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{ts.nhan_vien?.phong_ban?.tenPhongBan || 'Chưa xếp'}</div>
                      <div className="text-[11px] text-slate-400">{ts.nhan_vien?.chuc_vu?.tenChucVu}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">{ts.thang}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      <span className="bg-blue-50 text-[#002795] px-2.5 py-1 rounded-md">
                        {ts.soNgayCong} / 22 ngày
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                      {ts.soGioTangCa > 0 ? `+${ts.soGioTangCa}h` : '0h'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {ts.soNgayNghiPhep ?? 0} ngày
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ts.trangThai === 'DaKhoa'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ts.trangThai === 'DaKhoa' ? 'Đã khóa sổ' : 'Đang theo dõi'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(ts)}
                        title="Chỉnh sửa công kèm giải trình (HR-FR14)"
                        disabled={ts.trangThai === 'DaKhoa'}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* Modal: Ghi nhận chấm công (HR-FR13) */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#002795] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Ghi Nhận Chấm Công (HR-FR13)</h3>
                <p className="text-[11px] text-blue-100">Kỳ chấm công: {selectedMonth}</p>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhân Viên *</label>
                <select
                  value={formData.maNV}
                  onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                >
                  {employees.map((e) => (
                    <option key={e.maNV} value={e.maNV}>
                      {e.maNV} — {e.hoTen}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Ngày Công Thực Tế *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="31"
                    value={formData.soNgayCong}
                    onChange={(e) => setFormData({ ...formData, soNgayCong: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Tiêu chuẩn: 22 ngày</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Giờ Tăng Ca (h)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.soGioTangCa}
                    onChange={(e) => setFormData({ ...formData, soGioTangCa: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Hệ số 1.5x lương giờ</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số Ngày Nghỉ Phép Có Lương (HR-BR03)</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={formData.soNgayNghiPhep}
                  onChange={(e) => setFormData({ ...formData, soNgayNghiPhep: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Tối đa 12 ngày/năm theo luật lao động</p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Ghi Nhận Chấm Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sửa Bảng Công Kèm Giải Trình (HR-FR14) */}
      {showEditModal && selectedTS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Chỉnh Sửa Bảng Công (HR-FR14)</h3>
                <p className="text-[11px] text-emerald-100">
                  {selectedTS.nhan_vien?.hoTen} ({selectedTS.maNV}) — Kỳ {selectedTS.thang}
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Công Thực Tế *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="31"
                    value={formData.soNgayCong}
                    onChange={(e) => setFormData({ ...formData, soNgayCong: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ Tăng Ca (h)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.soGioTangCa}
                    onChange={(e) => setFormData({ ...formData, soGioTangCa: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nghỉ Phép Có Lương (Ngày)</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={formData.soNgayNghiPhep}
                  onChange={(e) => setFormData({ ...formData, soNgayNghiPhep: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý Do Giải Trình Bắt Buộc (HR-FR14) *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Ví dụ: Bổ sung công tác tại Trang trại Green Farm Tây Ninh ngày 15/09 theo giấy điều động..."
                  value={formData.lyDoGiaiTrinh}
                  onChange={(e) => setFormData({ ...formData, lyDoGiaiTrinh: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">Mọi thao tác sửa thủ công sẽ được lưu vết kiểm toán.</p>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xác Nhận Chỉnh Sửa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
