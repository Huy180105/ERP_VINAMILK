import React, { useEffect, useState, useMemo } from 'react';
import { HRApi } from '../../../services/hrApi';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  ShieldCheck,
  FileText
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Notifications
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    maNV: '',
    hoTen: '',
    soDienThoai: '',
    email: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    trinhDo: 'Đại học',
    maPhongBan: '',
    maChucVu: '',
    ngayVaoLam: new Date().toISOString().slice(0, 10),
    trangThai: 'Đang làm việc',
    vaiTro: 'NhanVien',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        HRApi.getEmployees(),
        HRApi.getDepartments(),
        HRApi.getPositions(),
      ]);
      setEmployees(empRes.data?.data || []);
      setDepartments(deptRes.data?.data || []);
      setPositions(posRes.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp dữ liệu hồ sơ nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4500);
  };

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchKey =
        !keyword ||
        emp.maNV.toLowerCase().includes(keyword.toLowerCase()) ||
        emp.hoTen.toLowerCase().includes(keyword.toLowerCase()) ||
        (emp.soDienThoai && emp.soDienThoai.includes(keyword)) ||
        (emp.email && emp.email.toLowerCase().includes(keyword.toLowerCase()));

      const matchDept = !filterDept || emp.maPhongBan === filterDept;
      const matchStatus = !filterStatus || emp.trangThai === filterStatus;

      return matchKey && matchDept && matchStatus;
    });
  }, [employees, keyword, filterDept, filterStatus]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextId = 'NV' + String(employees.length + 1).padStart(3, '0');
    setFormData({
      ...initialForm,
      maNV: nextId,
      maPhongBan: departments[0]?.maPhongBan || '',
      maChucVu: positions[0]?.maChucVu || '',
    });
    setShowAddModal(true);
  };

  // Submit Add
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await HRApi.createEmployee(formData);
      notify('success', res.data?.message || 'Tiếp nhận nhân sự thành công!');
      setShowAddModal(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi lưu hồ sơ nhân viên.';
      notify('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setFormData({
      maNV: emp.maNV,
      hoTen: emp.hoTen,
      soDienThoai: emp.soDienThoai || '',
      email: emp.email || '',
      ngaySinh: emp.ngaySinh || '',
      gioiTinh: emp.gioiTinh || 'Nam',
      trinhDo: emp.trinhDo || 'Đại học',
      maPhongBan: emp.maPhongBan || '',
      maChucVu: emp.maChucVu || '',
      ngayVaoLam: emp.ngayVaoLam || '',
      trangThai: emp.trangThai || 'Đang làm việc',
      vaiTro: emp.tai_khoan?.vaiTro || 'NhanVien',
    });
    setShowEditModal(true);
  };

  // Submit Edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await HRApi.updateEmployee(selectedEmp.maNV, formData);
      notify('success', res.data?.message || 'Cập nhật nhân viên thành công!');
      setShowEditModal(false);
      fetchInitialData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.';
      notify('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Employee (HR-FR03, HR-BR06)
  const handleDelete = async (emp) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ nhân viên ${emp.hoTen} (${emp.maNV})? Hành động này sẽ kiểm tra quy tắc toàn vẹn dữ liệu HR-BR06.`)) {
      return;
    }
    try {
      const res = await HRApi.deleteEmployee(emp.maNV);
      notify('success', res.data?.message || 'Đã xóa nhân viên.');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể xóa nhân viên này.';
      notify('error', msg);
    }
  };

  // Open Detail Modal (Audit trail HR-BR07)
  const handleOpenDetail = async (emp) => {
    setSelectedEmp(emp);
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const res = await HRApi.getEmployeeDetail(emp.maNV);
      setDetailData(res.data?.data || null);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể tải chi tiết nhân viên.');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold transition-all duration-200 ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Quản Lý Hồ Sơ Nhân Viên (HR-FR01 — HR-FR04)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ nhân sự cốt lõi dùng chung cho 5 phân hệ ERP Vinamilk · Tự động sinh tài khoản mặc định (HR-BR09)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-[#002795] hover:bg-[#001F7D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tiếp Nhận Nhân Viên Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã, họ tên, SĐT, email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002795]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002795]"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((d) => (
              <option key={d.maPhongBan} value={d.maPhongBan}>
                {d.tenPhongBan}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002795]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc</option>
          </select>

          {(keyword || filterDept || filterStatus) && (
            <button
              onClick={() => {
                setKeyword('');
                setFilterDept('');
                setFilterStatus('');
              }}
              className="text-xs text-[#002795] hover:underline font-bold px-2 py-1 cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mã NV</th>
                <th className="py-3 px-4">Họ & Tên Nhân Viên</th>
                <th className="py-3 px-4">Liên Hệ</th>
                <th className="py-3 px-4">Phòng Ban & Chức Vụ</th>
                <th className="py-3 px-4">Ngày Vào Làm</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Đang nạp danh sách hồ sơ nhân sự...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.maNV} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#002795]">{emp.maNV}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.hoTen}</div>
                      <div className="text-[11px] text-slate-400">{emp.gioiTinh} · {emp.trinhDo}</div>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-slate-600 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{emp.soDienThoai || 'Chưa cập nhật'}</span>
                      </div>
                      {emp.email && (
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{emp.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{emp.phong_ban?.tenPhongBan || 'Chưa phân bổ'}</div>
                      <div className="text-[11px] text-[#002795] font-medium">{emp.chuc_vu?.tenChucVu || 'Chưa phân bổ'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{emp.ngayVaoLam || '—'}</td>
                    <td className="py-3 px-4">
                      {emp.trangThai === 'Đang làm việc' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đang làm việc
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Đã nghỉ việc
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenDetail(emp)}
                          title="Xem chi tiết & Lịch sử biến động"
                          className="p-1.5 text-slate-600 hover:text-[#002795] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          title="Chỉnh sửa thông tin"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          title="Xóa hồ sơ (HR-BR06)"
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
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

      {/* Modal 1: Tiếp nhận nhân viên mới (HR-FR01) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="bg-[#002795] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Tiếp Nhận Hồ Sơ Nhân Viên Mới (HR-FR01)</h3>
                <p className="text-[11px] text-blue-100">Hệ thống sẽ tự động cấp tài khoản mật khẩu mặc định "123456" (HR-BR09)</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Nhân Viên *</label>
                  <input
                    type="text"
                    required
                    value={formData.maNV}
                    onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ Và Tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại (Đăng Nhập) *</label>
                  <input
                    type="text"
                    required
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    placeholder="Duy nhất toàn hệ thống (HR-BR12)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Công Ty</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ten.nv@vinamilk.com.vn"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng Ban Trực Thuộc *</label>
                  <select
                    value={formData.maPhongBan}
                    onChange={(e) => setFormData({ ...formData, maPhongBan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    {departments.map((d) => (
                      <option key={d.maPhongBan} value={d.maPhongBan}>
                        {d.tenPhongBan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức Vụ Đảm Nhậm *</label>
                  <select
                    value={formData.maChucVu}
                    onChange={(e) => setFormData({ ...formData, maChucVu: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    {positions.map((p) => (
                      <option key={p.maChucVu} value={p.maChucVu}>
                        {p.tenChucVu} (+{formatCurrency(p.phuCap)} phụ cấp)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới Tính</label>
                  <select
                    value={formData.gioiTinh}
                    onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trình Độ Học Vấn</label>
                  <select
                    value={formData.trinhDo}
                    onChange={(e) => setFormData({ ...formData, trinhDo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Kỹ sư">Kỹ sư</option>
                    <option value="Trung cấp / Khác">Trung cấp / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Bắt Đầu Làm Việc</label>
                  <input
                    type="date"
                    value={formData.ngayVaoLam}
                    onChange={(e) => setFormData({ ...formData, ngayVaoLam: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai Trò Phân Quyền Ban Đầu</label>
                  <select
                    value={formData.vaiTro}
                    onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="NhanVien">Nhân viên công ty</option>
                    <option value="ChuyenVienNhanSu">Chuyên viên nhân sự</option>
                    <option value="QuanLyNhanSu">Quản lý nhân sự (HR Manager)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-[#002795] space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quy tắc bảo mật HR-BR09 & HR-BR10:</span>
                </div>
                <p>
                  Hệ thống tự động cấp tài khoản: Tên đăng nhập = <b>Số điện thoại</b>, Mật khẩu khởi tạo = <b>123456</b> (đã băm bcrypt). Nhân viên sẽ bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Hồ Sơ & Cấp Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chỉnh sửa nhân viên (HR-FR02) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="bg-[#002795] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Cập Nhật Hồ Sơ Nhân Viên (HR-FR02)</h3>
                <p className="text-[11px] text-blue-100">Thay đổi phòng ban/chức vụ sẽ tự động lưu vết lịch sử (HR-BR07)</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Nhân Viên (Cố định)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.maNV}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ Và Tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại (HR-BR12) *</label>
                  <input
                    type="text"
                    required
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Công Ty</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng Ban Trực Thuộc *</label>
                  <select
                    value={formData.maPhongBan}
                    onChange={(e) => setFormData({ ...formData, maPhongBan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    {departments.map((d) => (
                      <option key={d.maPhongBan} value={d.maPhongBan}>
                        {d.tenPhongBan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức Vụ Đảm Nhậm *</label>
                  <select
                    value={formData.maChucVu}
                    onChange={(e) => setFormData({ ...formData, maChucVu: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    {positions.map((p) => (
                      <option key={p.maChucVu} value={p.maChucVu}>
                        {p.tenChucVu}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng Thái Làm Việc</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="Đang làm việc">Đang làm việc</option>
                    <option value="Đã nghỉ việc">Đã nghỉ việc (Không tính công/lương kỳ sau - HR-BR02)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trình Độ Học Vấn</label>
                  <select
                    value={formData.trinhDo}
                    onChange={(e) => setFormData({ ...formData, trinhDo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="Đại học">Đại học</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Kỹ sư">Kỹ sư</option>
                    <option value="Trung cấp / Khác">Trung cấp / Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Chi Tiết & Lịch Sử Biến Động (HR-BR07) */}
      {showDetailModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="bg-[#002795] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Hồ Sơ Toàn Diện: {selectedEmp.hoTen} ({selectedEmp.maNV})</h3>
                <p className="text-[11px] text-blue-100">Hợp đồng, bảng lương gần nhất và nhật ký lưu vết thay đổi (HR-BR07)</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {loadingDetail || !detailData ? (
                <div className="text-center py-10 text-slate-400">Đang tải lịch sử chi tiết...</div>
              ) : (
                <>
                  {/* General Info Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Phòng ban</span>
                      <p className="font-bold text-slate-800 mt-0.5">{detailData.phong_ban?.tenPhongBan || 'Chưa phân bổ'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Chức vụ</span>
                      <p className="font-bold text-slate-800 mt-0.5">{detailData.chuc_vu?.tenChucVu || 'Chưa phân bổ'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Điện thoại</span>
                      <p className="font-mono font-bold text-[#002795] mt-0.5">{detailData.soDienThoai}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Trạng thái</span>
                      <p className="font-bold text-emerald-600 mt-0.5">{detailData.trangThai}</p>
                    </div>
                  </div>

                  {/* Contracts */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                      <FileText className="w-4 h-4 text-[#002795]" />
                      <span>Hợp Đồng Lao Động</span>
                    </h4>
                    {detailData.hop_dongs?.length === 0 ? (
                      <p className="text-slate-400 italic">Chưa có hợp đồng nào được lập.</p>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Mã HĐ</th>
                              <th className="py-2 px-3">Loại Hợp Đồng</th>
                              <th className="py-2 px-3">Hiệu Lực</th>
                              <th className="py-2 px-3 text-right">Lương Cơ Bản</th>
                              <th className="py-2 px-3">Trạng Thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {detailData.hop_dongs?.map((hd) => (
                              <tr key={hd.maHopDong}>
                                <td className="py-2 px-3 font-mono font-bold text-[#002795]">{hd.maHopDong}</td>
                                <td className="py-2 px-3 font-medium">{hd.loaiHopDong}</td>
                                <td className="py-2 px-3 font-mono text-slate-500">{hd.ngayHieuLuc}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  {formatCurrency(hd.mucLuongCoBan)}
                                </td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      hd.trangThai === 'Hiệu lực' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {hd.trangThai}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Audit Trail History (HR-BR07) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                      <History className="w-4 h-4 text-[#002795]" />
                      <span>Nhật Ký Lưu Vết Lịch Sử (Quy tắc HR-BR07)</span>
                    </h4>
                    {detailData.lich_su_thay_doi?.length === 0 ? (
                      <p className="text-slate-400 italic">Chưa có ghi chép biến động nào.</p>
                    ) : (
                      <div className="space-y-2">
                        {detailData.lich_su_thay_doi?.map((log) => (
                          <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#002795]">{log.loaiThayDoi}</span>
                              <span className="font-mono text-slate-400">{log.ngayTao}</span>
                            </div>
                            <p className="text-slate-700 font-medium text-[11px]">{log.noiDung}</p>
                            <p className="text-[10px] text-slate-400">Thực hiện bởi: {log.nguoiThucHien}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-[#002795] text-white font-bold rounded-xl text-xs hover:bg-[#001F7D] cursor-pointer"
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

