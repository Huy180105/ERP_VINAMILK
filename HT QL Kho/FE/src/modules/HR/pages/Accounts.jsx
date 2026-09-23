import React, { useEffect, useState } from 'react';
import { HRApi } from '../../../services/hrApi';
import {
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  KeyRound,
  LogIn,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Phone,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function HRAccounts() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'testLogin'
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Notification
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Role Assignment Modal
  const [roleModal, setRoleModal] = useState({ show: false, account: null, selectedRole: 'NhanVien' });

  // Test Login & Change Password Form (HR-BR10, HR-BR11)
  const [loginPhone, setLoginPhone] = useState('0901000003');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginResult, setLoginResult] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await HRApi.getAccounts();
      setAccounts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể nạp danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4500);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchKey =
      !keyword ||
      acc.maTaiKhoan.toLowerCase().includes(keyword.toLowerCase()) ||
      acc.maNV.toLowerCase().includes(keyword.toLowerCase()) ||
      (acc.nhan_vien && acc.nhan_vien.hoTen.toLowerCase().includes(keyword.toLowerCase())) ||
      (acc.nhan_vien?.soDienThoai && acc.nhan_vien.soDienThoai.includes(keyword));

    const matchRole = !filterRole || acc.vaiTro === filterRole;

    return matchKey && matchRole;
  });

  // HR-FR23: Khóa / Mở khóa tài khoản
  const handleToggleLock = async (acc) => {
    const action = acc.trangThai === 'Hoạt động' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Xác nhận ${action} tài khoản đăng nhập của nhân viên ${acc.nhan_vien?.hoTen}?`)) return;

    try {
      const res = await HRApi.toggleAccountLock(acc.maTaiKhoan);
      notify('success', res.data?.message || 'Cập nhật trạng thái tài khoản thành công!');
      fetchAccounts();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi cập nhật trạng thái tài khoản.');
    }
  };

  // HR-FR24: Gán vai trò
  const handleOpenRoleModal = (acc) => {
    setRoleModal({ show: true, account: acc, selectedRole: acc.vaiTro });
  };

  const handleAssignRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await HRApi.assignRole(roleModal.account.maTaiKhoan, { vaiTro: roleModal.selectedRole });
      notify('success', res.data?.message || 'Phân quyền vai trò thành công!');
      setRoleModal({ show: false, account: null, selectedRole: 'NhanVien' });
      fetchAccounts();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi phân quyền.');
    }
  };

  // HR-FR21: Đăng nhập thử nghiệm
  const handleTestLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginResult(null);
    try {
      const res = await HRApi.login({
        soDienThoai: loginPhone,
        matKhau: loginPassword,
      });
      setLoginResult(res.data?.data);
      notify('success', res.data?.message || 'Đăng nhập thành công!');
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // HR-FR22: Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      notify('error', 'Xác nhận mật khẩu mới không khớp.');
      return;
    }
    if (newPass === '123456') {
      notify('error', 'Quy tắc HR-BR11: Mật khẩu mới không được trùng với mật khẩu mặc định "123456".');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await HRApi.changePassword({
        soDienThoai: loginPhone,
        matKhauHienTai: currentPass,
        matKhauMoi: newPass,
      });
      notify('success', res.data?.message || 'Đổi mật khẩu thành công!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      if (loginResult) {
        setLoginResult({ ...loginResult, phaiDoiMatKhau: false });
      }
      fetchAccounts();
    } catch (err) {
      console.error(err);
      notify('error', err.response?.data?.message || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setIsChangingPass(false);
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
            Quản Lý Tài Khoản Đăng Nhập & Phân Quyền (HR-FR21 — HR-FR24)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đăng nhập qua SĐT · Tự động cấp mật khẩu mặc định 123456 (HR-BR09) · Bắt buộc đổi mật khẩu lần đầu (HR-BR10/11)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'list' ? 'bg-[#002795] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Danh Sách Tài Khoản
          </button>
          <button
            onClick={() => setActiveTab('testLogin')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'testLogin' ? 'bg-[#002795] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mô Phỏng Đăng Nhập & Đổi MK (HR-BR10)
          </button>
        </div>
      </div>

      {/* Tab 1: Account List */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo mã TK, họ tên, SĐT..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002795]"
              />
            </div>

            <div className="flex items-center space-x-2.5 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#002795]"
              >
                <option value="">Tất cả vai trò</option>
                <option value="QuanLyNhanSu">Quản lý nhân sự</option>
                <option value="ChuyenVienNhanSu">Chuyên viên nhân sự</option>
                <option value="NhanVien">Nhân viên</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mã Tài Khoản</th>
                  <th className="py-3 px-4">Nhân Viên Sở Hữu</th>
                  <th className="py-3 px-4">Số Điện Thoại (Tên Đăng Nhập)</th>
                  <th className="py-3 px-4">Vai Trò Phân Quyền</th>
                  <th className="py-3 px-4 text-center">Trạng Thái Đổi MK</th>
                  <th className="py-3 px-4 text-center">Tình Trạng</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      Đang nạp dữ liệu tài khoản...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      Không tìm thấy tài khoản nào.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.maTaiKhoan} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#002795]">{acc.maTaiKhoan}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{acc.nhan_vien?.hoTen}</div>
                        <div className="text-[11px] text-slate-400">{acc.nhan_vien?.phong_ban?.tenPhongBan}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {acc.nhan_vien?.soDienThoai}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.vaiTro === 'QuanLyNhanSu'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : acc.vaiTro === 'ChuyenVienNhanSu'
                              ? 'bg-blue-50 text-[#002795] border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {acc.vaiTro === 'QuanLyNhanSu'
                            ? 'Quản lý nhân sự'
                            : acc.vaiTro === 'ChuyenVienNhanSu'
                            ? 'Chuyên viên nhân sự'
                            : 'Nhân viên'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {acc.phaiDoiMatKhau ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Chưa đổi MK mặc định
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Đã đổi an toàn
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.trangThai === 'Hoạt động'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {acc.trangThai}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenRoleModal(acc)}
                            title="Phân quyền vai trò (HR-FR24)"
                            className="p-1.5 text-slate-600 hover:text-[#002795] hover:bg-blue-50 rounded-md cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(acc)}
                            title={acc.trangThai === 'Hoạt động' ? 'Khóa tài khoản (HR-FR23)' : 'Mở khóa tài khoản'}
                            className={`p-1.5 rounded-md cursor-pointer ${
                              acc.trangThai === 'Hoạt động'
                                ? 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {acc.trangThai === 'Hoạt động' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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
      )}

      {/* Tab 2: Test Login & Change Password */}
      {activeTab === 'testLogin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Đăng nhập */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <LogIn className="w-4 h-4 text-[#002795]" />
                <span>Mô Phỏng Đăng Nhập (HR-FR21)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nhập số điện thoại duy nhất và mật khẩu để kiểm tra xác thực
              </p>
            </div>

            <form onSubmit={handleTestLogin} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="Ví dụ: 0901000003"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật Khẩu</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Mặc định: 123456"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>
            </form>

            {loginResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-[#002795] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Xác Thực Thành Công!</span>
                </div>
                <div className="text-slate-700 space-y-0.5">
                  <div>Họ tên: <b>{loginResult.hoTen}</b> ({loginResult.maNV})</div>
                  <div>Phòng ban: <b>{loginResult.phongBan}</b></div>
                  <div>Chức vụ: <b>{loginResult.chucVu}</b></div>
                  <div>Vai trò: <b className="text-[#002795]">{loginResult.vaiTro}</b></div>
                </div>

                {loginResult.phaiDoiMatKhau ? (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 space-y-1">
                    <div className="font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Quy tắc HR-BR10:</span>
                    </div>
                    <p className="text-[11px]">
                      Tài khoản đang dùng mật khẩu mặc định "123456". Hệ thống bắt buộc phải đổi mật khẩu sang khung bên phải trước khi làm việc!
                    </p>
                  </div>
                ) : (
                  <div className="text-emerald-700 font-bold text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mật khẩu đã được bảo mật an toàn.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Đổi mật khẩu (HR-BR10, HR-BR11) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Đổi Mật Khẩu Bắt Buộc (HR-FR22)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Quy tắc HR-BR11: Từ chối nếu mật khẩu mới trùng "123456"
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật Khẩu Hiện Tại *</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại (ví dụ: 123456)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật Khẩu Mới (Khác 123456) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự, không được là 123456"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Xác Nhận Mật Khẩu Mới *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isChangingPass ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu Mới'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal (HR-FR24) */}
      {roleModal.show && roleModal.account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#002795] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Phân Quyền Vai Trò (HR-FR24)</h3>
              <button onClick={() => setRoleModal({ show: false, account: null, selectedRole: 'NhanVien' })} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRoleSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div>Nhân viên: <b>{roleModal.account.nhan_vien?.hoTen}</b></div>
                <div>Mã NV: <b>{roleModal.account.maNV}</b></div>
                <div>SĐT: <b className="font-mono">{roleModal.account.nhan_vien?.soDienThoai}</b></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Vai Trò Mới *</label>
                <select
                  value={roleModal.selectedRole}
                  onChange={(e) => setRoleModal({ ...roleModal, selectedRole: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#002795]"
                >
                  <option value="QuanLyNhanSu">Quản lý nhân sự (HR Manager) — Toàn quyền</option>
                  <option value="ChuyenVienNhanSu">Chuyên viên nhân sự (HR Specialist) — Hồ sơ, công, lương</option>
                  <option value="NhanVien">Nhân viên công ty (Employee) — Xem công & lương cá nhân</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoleModal({ show: false, account: null, selectedRole: 'NhanVien' })}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002795] hover:bg-[#001F7D] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Xác Nhận Phân Quyền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

