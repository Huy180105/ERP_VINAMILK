import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HRApi } from '../../../services/hrApi';
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  UserPlus,
  CalendarCheck,
  Calculator,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function HRDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await HRApi.getDashboardSummary();
      setData(res.data?.data || null);
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ API Nhân sự.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#002795] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Đang đồng bộ dữ liệu quản trị nhân sự Vinamilk...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span>{error || 'Lỗi tải dữ liệu.'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#001F7D] via-[#002795] to-[#0B5ED7] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-mono font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>VINAMILK HUMAN CAPITAL MANAGEMENT · HRM 4.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-wide">
            Tổng Quan Quản Trị Nhân Lực & Tiền Lương
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Hệ thống quản lý thông tin nhân sự tập trung, theo dõi cơ cấu tổ chức, hợp đồng lao động, chấm công tự động và hoạch toán chi phí tiền lương theo chuẩn VAS.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <Users className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Nhân Sự</span>
            <div className="p-2.5 bg-blue-50 text-[#002795] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.tongNhanVien}</span>
            <span className="text-xs text-emerald-600 font-semibold">Đang làm việc</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Đã nghỉ việc: {data.tongNghiViec} nhân sự</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phòng Ban & Vị Trí</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.tongPhongBan}</span>
            <span className="text-xs text-slate-500 font-medium">phòng ban</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{data.tongChucVu} vị trí chức danh công việc</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hợp Đồng Hiệu Lực</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{data.tongHopDongHieuLuc}</span>
            <span className="text-xs text-indigo-600 font-semibold">hợp đồng</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tuân thủ quy tắc HR-BR01</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quỹ Lương Kỳ {data.kyLuongGanNhat}</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">
              {formatCurrency(data.quyLuongThangGanNhat)}
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-1.5 text-[11px]">
            {data.trangThaiKhoaKyLuong ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold inline-flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Đã chốt sổ</span>
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold inline-flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Tạm tính</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-[#002795] uppercase tracking-wider">Tác Vụ Nghiệp Vụ Trọng Tâm</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/hr/employees')}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#002795] border border-slate-200 rounded-xl transition-all duration-150 cursor-pointer group"
          >
            <UserPlus className="w-6 h-6 mb-2 text-[#002795] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Hồ Sơ Nhân Viên</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Tiếp nhận & điều chuyển</span>
          </button>

          <button
            onClick={() => navigate('/hr/timesheets')}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-xl transition-all duration-150 cursor-pointer group"
          >
            <CalendarCheck className="w-6 h-6 mb-2 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Chấm Công Định Kỳ</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Ngày công & tăng ca</span>
          </button>

          <button
            onClick={() => navigate('/hr/payroll')}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xl transition-all duration-150 cursor-pointer group"
          >
            <Calculator className="w-6 h-6 mb-2 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Tính Lương Hàng Loạt</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Tự động hóa chuẩn VAS</span>
          </button>

          <button
            onClick={() => navigate('/hr/reports')}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 rounded-xl transition-all duration-150 cursor-pointer group"
          >
            <BarChart3 className="w-6 h-6 mb-2 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Báo Cáo Quỹ Lương</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Cơ cấu & biến động</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Department Distribution & Recent Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department distribution */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cơ Cấu Nhân Sự Theo Phòng Ban</h3>
              <p className="text-xs text-slate-400">Phân bổ nhân lực tại các khối ban điều hành và nhà máy</p>
            </div>
            <button
              onClick={() => navigate('/hr/departments')}
              className="text-xs font-bold text-[#002795] hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {data.coCauPhongBan.map((dept) => {
              const percent = data.tongNhanVien > 0 ? Math.round((dept.soLuong / data.tongNhanVien) * 100) : 0;
              return (
                <div key={dept.maPhongBan} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.tenPhongBan}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {dept.soLuong} người ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#002795] to-[#0B5ED7] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nhân Sự Mới Tiếp Nhận</h3>
              <p className="text-xs text-slate-400">Hồ sơ và tài khoản đã khởi tạo</p>
            </div>
            <button
              onClick={() => navigate('/hr/employees')}
              className="text-xs font-bold text-[#002795] hover:underline inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.nhanVienMoi.map((emp) => (
              <div key={emp.maNV} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-[#002795] font-bold text-xs flex items-center justify-center shrink-0">
                    {emp.hoTen.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{emp.hoTen}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {emp.chuc_vu?.tenChucVu || 'Nhân viên'} · {emp.phong_ban?.tenPhongBan || 'Chưa xếp'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                    {emp.maNV}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

