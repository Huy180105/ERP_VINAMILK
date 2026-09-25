import React, { useEffect, useState } from 'react';
import { HRApi } from '../../../services/hrApi';
import { generateAutoCode } from '../../../utils/codeGenerator';
import {
  Building2,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Coins,
  ChevronRight
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function HRDepartments() {
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'positions'
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ maPhongBan: '', tenPhongBan: '' });

  const [showPosModal, setShowPosModal] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [posForm, setPosForm] = useState({ maChucVu: '', tenChucVu: '', phuCap: 0 });

  const [detailModal, setDetailModal] = useState({ show: false, title: '', staff: [] });

  // Notifications
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, posRes] = await Promise.all([
        HRApi.getDepartments(),
        HRApi.getPositions(),
      ]);
      setDepartments(deptRes.data?.data || []);
      setPositions(posRes.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp dữ liệu phòng ban/chức vụ.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4500);
  };

  // ===================== PHÒNG BAN HANDLERS =====================
  const handleOpenAddDept = () => {
    setEditingDept(null);
    const nextCode = generateAutoCode(departments, 'maPhongBan', 'PB', 2);
    setDeptForm({ maPhongBan: nextCode, tenPhongBan: '' });
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({ maPhongBan: dept.maPhongBan, tenPhongBan: dept.tenPhongBan });
    setShowDeptModal(true);
  };

  const handleSubmitDept = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDept) {
        const res = await HRApi.updateDepartment(editingDept.maPhongBan, { tenPhongBan: deptForm.tenPhongBan });
        notify('success', res.data?.message || 'Cập nhật phòng ban thành công!');
      } else {
        const res = await HRApi.createDepartment(deptForm);
        notify('success', res.data?.message || 'Thêm phòng ban mới thành công!');
      }
      setShowDeptModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi lưu phòng ban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDept = async (dept) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ban [${dept.tenPhongBan}] (${dept.maPhongBan})?`)) return;
    try {
      const res = await HRApi.deleteDepartment(dept.maPhongBan);
      notify('success', res.data?.message || 'Đã xóa phòng ban.');
      fetchData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Không thể xóa phòng ban này.');
    }
  };

  // ===================== CHỨC VỤ HANDLERS =====================
  const handleOpenAddPos = () => {
    setEditingPos(null);
    const nextCode = generateAutoCode(positions, 'maChucVu', 'CV', 2);
    setPosForm({ maChucVu: nextCode, tenChucVu: '', phuCap: 0 });
    setShowPosModal(true);
  };

  const handleOpenEditPos = (pos) => {
    setEditingPos(pos);
    setPosForm({ maChucVu: pos.maChucVu, tenChucVu: pos.tenChucVu, phuCap: pos.phuCap || 0 });
    setShowPosModal(true);
  };

  const handleSubmitPos = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingPos) {
        const res = await HRApi.updatePosition(editingPos.maChucVu, {
          tenChucVu: posForm.tenChucVu,
          phuCap: Number(posForm.phuCap || 0),
        });
        notify('success', res.data?.message || 'Cập nhật chức vụ thành công!');
      } else {
        const res = await HRApi.createPosition({
          ...posForm,
          phuCap: Number(posForm.phuCap || 0),
        });
        notify('success', res.data?.message || 'Thêm chức vụ mới thành công!');
      }
      setShowPosModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi lưu chức vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePos = async (pos) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chức vụ [${pos.tenChucVu}] (${pos.maChucVu})?`)) return;
    try {
      const res = await HRApi.deletePosition(pos.maChucVu);
      notify('success', res.data?.message || 'Đã xóa chức vụ.');
      fetchData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Không thể xóa chức vụ này.');
    }
  };

  // View staff list in dept/position (HR-FR08)
  const handleViewStaff = async (type, item) => {
    try {
      if (type === 'dept') {
        const res = await HRApi.getDepartmentDetail(item.maPhongBan);
        setDetailModal({
          show: true,
          title: `Nhân Sự Thuộc: ${item.tenPhongBan} (${item.maPhongBan})`,
          staff: res.data?.data?.nhan_viens || [],
        });
      } else {
        const res = await HRApi.getPositionDetail(item.maChucVu);
        setDetailModal({
          show: true,
          title: `Nhân Sự Đảm Nhậm Vị Trí: ${item.tenChucVu} (${item.maChucVu})`,
          staff: res.data?.data?.nhan_viens || [],
        });
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp danh sách nhân sự.');
    }
  };

  // Filters
  const filteredDepts = departments.filter(
    (d) =>
      !keyword ||
      d.maPhongBan.toLowerCase().includes(keyword.toLowerCase()) ||
      d.tenPhongBan.toLowerCase().includes(keyword.toLowerCase())
  );

  const filteredPoss = positions.filter(
    (p) =>
      !keyword ||
      p.maChucVu.toLowerCase().includes(keyword.toLowerCase()) ||
      p.tenChucVu.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
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
            Cơ Cấu Tổ Chức Phòng Ban & Chức Vụ (HR-FR05 — HR-FR08)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân định đơn vị phòng ban, thiết lập hệ thống vị trí chức danh và định mức phụ cấp công việc
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {activeTab === 'departments' ? (
            <button
              onClick={handleOpenAddDept}
              className="inline-flex items-center space-x-1.5 bg-[#002795] hover:bg-[#001F7D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Phòng Ban</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddPos}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chức Vụ</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'departments' ? 'bg-[#002795] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Phòng Ban ({departments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'positions' ? 'bg-[#002795] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Chức Vụ & Phụ Cấp ({positions.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002795]"
          />
        </div>
      </div>

      {/* Table 1: Phòng Ban */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-28">Mã Phòng</th>
                <th className="py-3 px-4">Tên Phòng Ban Cơ Cấu</th>
                <th className="py-3 px-4 text-center">Số Nhân Lực Trực Thuộc</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    Đang nạp dữ liệu...
                  </td>
                </tr>
              ) : filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    Không có phòng ban nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredDepts.map((d) => (
                  <tr key={d.maPhongBan} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#002795]">{d.maPhongBan}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{d.tenPhongBan}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewStaff('dept', d)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#002795] hover:bg-blue-100 font-semibold cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{d.nhan_viens_count ?? 0} nhân sự</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditDept(d)}
                          title="Sửa tên phòng ban"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(d)}
                          title="Xóa phòng ban (HR-FR07)"
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
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
      )}

      {/* Table 2: Chức Vụ */}
      {activeTab === 'positions' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-28">Mã Chức Vụ</th>
                <th className="py-3 px-4">Tên Vị Trí Chức Danh</th>
                <th className="py-3 px-4 text-right">Phụ Cấp Chức Vụ</th>
                <th className="py-3 px-4 text-center">Số Nhân Sự Đảm Nhậm</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    Đang nạp dữ liệu...
                  </td>
                </tr>
              ) : filteredPoss.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    Không có chức vụ nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPoss.map((p) => (
                  <tr key={p.maChucVu} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#002795]">{p.maChucVu}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.tenChucVu}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      +{formatCurrency(p.phuCap)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewStaff('pos', p)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{p.nhan_viens_count ?? 0} người</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditPos(p)}
                          title="Sửa thông tin chức vụ"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePos(p)}
                          title="Xóa chức vụ (HR-FR07)"
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
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
      )}

      {/* Modal: Phòng Ban */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#002795] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingDept ? 'Sửa Phòng Ban' : 'Thêm Mới Phòng Ban (HR-FR05)'}
              </h3>
              <button onClick={() => setShowDeptModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitDept} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Phòng Ban *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingDept}
                  value={deptForm.maPhongBan}
                  onChange={(e) => setDeptForm({ ...deptForm, maPhongBan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795] disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Phòng Ban *</label>
                <input
                  type="text"
                  required
                  value={deptForm.tenPhongBan}
                  onChange={(e) => setDeptForm({ ...deptForm, tenPhongBan: e.target.value })}
                  placeholder="Ví dụ: Phòng Marketing & Truyền Thông"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Phòng Ban'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chức Vụ */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingPos ? 'Sửa Chức Vụ' : 'Thêm Mới Chức Vụ (HR-FR05)'}
              </h3>
              <button onClick={() => setShowPosModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitPos} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Chức Vụ *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingPos}
                  value={posForm.maChucVu}
                  onChange={(e) => setPosForm({ ...posForm, maChucVu: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Vị Trí Chức Danh *</label>
                <input
                  type="text"
                  required
                  value={posForm.tenChucVu}
                  onChange={(e) => setPosForm({ ...posForm, tenChucVu: e.target.value })}
                  placeholder="Ví dụ: Chuyên Viên Kỹ Thuật Vi Sinh"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Định Mức Phụ Cấp (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={posForm.phuCap}
                  onChange={(e) => setPosForm({ ...posForm, phuCap: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPosModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Chức Vụ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem Danh Sách Nhân Sự Trực Thuộc (HR-FR08) */}
      {detailModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#002795] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-xs truncate max-w-md">{detailModal.title}</h3>
              <button onClick={() => setDetailModal({ show: false, title: '', staff: [] })} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto text-xs">
              {detailModal.staff.length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">Hiện chưa có nhân sự nào trong danh sách này.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {detailModal.staff.map((s) => (
                    <div key={s.maNV} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{s.hoTen}</div>
                        <div className="text-[11px] text-slate-400">{s.chuc_vu?.tenChucVu || s.phong_ban?.tenPhongBan}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#002795] bg-blue-50 px-2 py-0.5 rounded-md">
                        {s.maNV}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailModal({ show: false, title: '', staff: [] })}
                className="px-4 py-1.5 bg-[#002795] text-white font-bold rounded-xl text-xs cursor-pointer"
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

