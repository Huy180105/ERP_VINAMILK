import React, { useEffect, useState, useMemo } from 'react';
import { HRApi } from '../../../services/hrApi';
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  Building2,
  History
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function HRContracts() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const initialForm = {
    maHopDong: '',
    maNV: '',
    loaiHopDong: 'Xác định thời hạn',
    ngayHieuLuc: new Date().toISOString().slice(0, 10),
    ngayHetHan: '',
    mucLuongCoBan: 15000000,
    trangThai: 'Hiệu lực',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([
        HRApi.getContracts(),
        HRApi.getEmployees({ trangThai: 'Đang làm việc' }),
      ]);
      setContracts(cRes.data?.data || []);
      setEmployees(eRes.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp danh sách hợp đồng lao động.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4500);
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchKey =
        !keyword ||
        c.maHopDong.toLowerCase().includes(keyword.toLowerCase()) ||
        c.maNV.toLowerCase().includes(keyword.toLowerCase()) ||
        (c.nhan_vien && c.nhan_vien.hoTen.toLowerCase().includes(keyword.toLowerCase()));

      const matchType = !filterType || c.loaiHopDong === filterType;
      const matchStatus = !filterStatus || c.trangThai === filterStatus;

      return matchKey && matchType && matchStatus;
    });
  }, [contracts, keyword, filterType, filterStatus]);

  const handleOpenAdd = () => {
    setEditingContract(null);
    const nextCode = 'HD' + new Date().getFullYear() + '-' + String(contracts.length + 1).padStart(3, '0');
    setFormData({
      ...initialForm,
      maHopDong: nextCode,
      maNV: employees[0]?.maNV || '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingContract(c);
    setFormData({
      maHopDong: c.maHopDong,
      maNV: c.maNV,
      loaiHopDong: c.loaiHopDong,
      ngayHieuLuc: c.ngayHieuLuc || '',
      ngayHetHan: c.ngayHetHan || '',
      mucLuongCoBan: Number(c.mucLuongCoBan || 0),
      trangThai: c.trangThai || 'Hiệu lực',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.mucLuongCoBan) <= 0) {
      notify('error', 'Quy tắc HR-BR08: Mức lương cơ bản trong hợp đồng lao động phải lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingContract) {
        const res = await HRApi.updateContract(editingContract.maHopDong, formData);
        notify('success', res.data?.message || 'Cập nhật hợp đồng thành công!');
      } else {
        const res = await HRApi.createContract(formData);
        notify('success', res.data?.message || 'Lập mới hợp đồng lao động thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi lưu hợp đồng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Bạn có chắc muốn xóa hợp đồng [${c.maHopDong}] của nhân viên ${c.nhan_vien?.hoTen}?`)) return;
    try {
      const res = await HRApi.deleteContract(c.maHopDong);
      notify('success', res.data?.message || 'Đã xóa hợp đồng.');
      fetchData();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Không thể xóa hợp đồng này.');
    }
  };

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
            Quản Lý Hợp Đồng Lao Động (HR-FR09 — HR-FR12)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi thời hạn, mức lương cơ bản và chế độ đãi ngộ · Ràng buộc 1 hợp đồng chính thức có hiệu lực (HR-BR01, HR-BR08)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 bg-[#002795] hover:bg-[#001F7D] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Hợp Đồng Mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo số HĐ, mã NV, tên NV..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002795]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002795]"
          >
            <option value="">Tất cả loại hợp đồng</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Xác định thời hạn">Xác định thời hạn</option>
            <option value="Không xác định thời hạn">Không xác định thời hạn</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002795]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Hiệu lực">Đang hiệu lực</option>
            <option value="Hết hiệu lực">Hết hiệu lực</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>

          {(keyword || filterType || filterStatus) && (
            <button
              onClick={() => {
                setKeyword('');
                setFilterType('');
                setFilterStatus('');
              }}
              className="text-xs text-[#002795] hover:underline font-bold px-2 py-1 cursor-pointer"
            >
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Contract Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Số Hiệu HĐ</th>
                <th className="py-3 px-4">Nhân Viên Ký Hợp Đồng</th>
                <th className="py-3 px-4">Loại Hợp Đồng</th>
                <th className="py-3 px-4">Ngày Hiệu Lực</th>
                <th className="py-3 px-4">Ngày Hết Hạn</th>
                <th className="py-3 px-4 text-right">Mức Lương Cơ Bản</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Đang nạp dữ liệu hợp đồng...
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Không tìm thấy hợp đồng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr key={c.maHopDong} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#002795]">{c.maHopDong}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.nhan_vien?.hoTen || c.maNV}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.nhan_vien?.chuc_vu?.tenChucVu || 'Chức vụ'} · {c.nhan_vien?.phong_ban?.tenPhongBan || 'Phòng ban'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {c.loaiHopDong}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.ngayHieuLuc}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.ngayHetHan || 'Vô thời hạn'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(c.mucLuongCoBan)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.trangThai === 'Hiệu lực'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.trangThai === 'Hết hiệu lực'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.trangThai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Sửa hợp đồng / Điều chỉnh lương (HR-BR07)"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Xóa hợp đồng lập nhầm (HR-FR11)"
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
      </div>

      {/* Modal: Thêm / Sửa Hợp Đồng */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#002795] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {editingContract ? 'Điều Chỉnh Hợp Đồng Lao Động (HR-FR10)' : 'Lập Hợp Đồng Lao Động Mới (HR-FR09)'}
                </h3>
                <p className="text-[11px] text-blue-100">Kiểm tra quy tắc HR-BR01 (1 HĐ hiệu lực) & HR-BR08 (Lương &gt; 0)</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã / Số Hiệu Hợp Đồng *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingContract}
                    value={formData.maHopDong}
                    onChange={(e) => setFormData({ ...formData, maHopDong: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795] disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhân Viên Ký Kết *</label>
                  <select
                    disabled={!!editingContract}
                    value={formData.maNV}
                    onChange={(e) => setFormData({ ...formData, maNV: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795] disabled:bg-slate-100"
                  >
                    {employees.map((e) => (
                      <option key={e.maNV} value={e.maNV}>
                        {e.maNV} — {e.hoTen} ({e.phong_ban?.tenPhongBan || 'Chưa phân bổ'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại Hợp Đồng Lao Động *</label>
                  <select
                    value={formData.loaiHopDong}
                    onChange={(e) => setFormData({ ...formData, loaiHopDong: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="Thử việc">Thử việc (Thời hạn tối đa 60 ngày)</option>
                    <option value="Xác định thời hạn">Xác định thời hạn (12 - 36 tháng)</option>
                    <option value="Không xác định thời hạn">Không xác định thời hạn (Chính thức lâu dài)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày Bắt Đầu Hiệu Lực *</label>
                    <input
                      type="date"
                      required
                      value={formData.ngayHieuLuc}
                      onChange={(e) => setFormData({ ...formData, ngayHieuLuc: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày Hết Hạn</label>
                    <input
                      type="date"
                      value={formData.ngayHetHan}
                      onChange={(e) => setFormData({ ...formData, ngayHetHan: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức Lương Cơ Bản (VNĐ / Tháng) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="500000"
                    value={formData.mucLuongCoBan}
                    onChange={(e) => setFormData({ ...formData, mucLuongCoBan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Làm căn cứ đóng bảo hiểm & tính lương hàng tháng (HR-BR05, HR-BR08)</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng Thái Hợp Đồng</label>
                  <select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                  >
                    <option value="Hiệu lực">Hiệu lực (Đang áp dụng)</option>
                    <option value="Hết hiệu lực">Hết hiệu lực (Đã thanh lý)</option>
                    <option value="Đã hủy">Đã hủy (Hợp đồng lập nhầm)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Hợp Đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
