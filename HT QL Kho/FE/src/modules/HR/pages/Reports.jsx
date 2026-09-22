import React, { useEffect, useState } from 'react';
import { HRApi } from '../../../services/hrApi';
import {
  BarChart3,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  PieChart,
  Award,
  AlertCircle
} from 'lucide-react';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(val || 0));

export default function HRReports() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'payroll'
  const [staffData, setStaffData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        HRApi.getStaffReport(),
        HRApi.getPayrollFundReport(),
      ]);
      setStaffData(sRes.data?.data || null);
      setPayrollData(pRes.data?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#002795] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Đang tổng hợp báo cáo thống kê nhân sự Vinamilk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Báo Cáo Thống Kê Nhân Sự & Quỹ Lương (HR-FR19, HR-FR20)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích cơ cấu nguồn nhân lực, biến động nhân sự và xu hướng chi phí tiền lương qua các kỳ
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'staff' ? 'bg-[#002795] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Báo Cáo Nhân Sự (HR-FR19)
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'payroll' ? 'bg-[#002795] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Báo Cáo Quỹ Lương (HR-FR20)
          </button>
        </div>
      </div>

      {/* Tab 1: Staff Reports */}
      {activeTab === 'staff' && staffData && (
        <div className="space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cơ Cấu Giới Tính</h3>
              <div className="mt-4 space-y-3">
                {staffData.gioiTinh?.map((g) => (
                  <div key={g.gioiTinh} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{g.gioiTinh}</span>
                      <span className="font-mono text-[#002795]">{g.soLuong} nhân sự</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.gioiTinh === 'Nam' ? 'bg-[#002795]' : 'bg-pink-500'}`}
                        style={{ width: `${(g.soLuong / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trình Độ Học Vấn</h3>
              <div className="mt-4 space-y-3">
                {staffData.trinhDo?.map((t) => (
                  <div key={t.trinhDo} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{t.trinhDo}</span>
                      <span className="font-mono text-emerald-700">{t.soLuong} người</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${(t.soLuong / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân Loại Hợp Đồng</h3>
              <div className="mt-4 space-y-3">
                {staffData.loaiHopDong?.map((h) => (
                  <div key={h.loaiHopDong} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{h.loaiHopDong}</span>
                      <span className="font-mono text-indigo-700">{h.soLuong} HĐ</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${(h.soLuong / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Chi Tiết Biến Động Nhân Sự Theo Phòng Ban</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Mã Phòng</th>
                    <th className="py-3 px-4">Tên Phòng Ban Cơ Cấu</th>
                    <th className="py-3 px-4 text-center">Đang Làm Việc</th>
                    <th className="py-3 px-4 text-center">Đã Nghỉ Việc</th>
                    <th className="py-3 px-4 text-center">Tổng Nhân Lực</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {staffData.phongBan?.map((d) => (
                    <tr key={d.maPhongBan} className="hover:bg-blue-50/40">
                      <td className="py-3 px-4 font-mono font-bold text-[#002795]">{d.maPhongBan}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.tenPhongBan}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        {d.dang_lam_viec}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {d.da_nghi_viec}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {d.dang_lam_viec + d.da_nghi_viec}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payroll Reports */}
      {activeTab === 'payroll' && payrollData && (
        <div className="space-y-6">
          {/* History over months */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chi Phí Quỹ Lương Qua Các Kỳ</h3>
                <p className="text-xs text-slate-400">Lương cơ bản, phụ cấp, tăng ca, bảo hiểm và tổng thực chi</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#002795] bg-blue-50 px-2.5 py-1 rounded-lg">
                12 Tháng Gần Nhất
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Kỳ Lương</th>
                    <th className="py-3 px-4 text-center">Số Nhân Sự</th>
                    <th className="py-3 px-4 text-right">Tổng Lương Căn Bản</th>
                    <th className="py-3 px-4 text-right">Phụ Cấp</th>
                    <th className="py-3 px-4 text-right">Tăng Ca</th>
                    <th className="py-3 px-4 text-right">Khấu Trừ Bảo Hiểm</th>
                    <th className="py-3 px-4 text-right">Tổng Thực Nhận</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payrollData.theoKy?.map((item) => (
                    <tr key={item.thang} className="hover:bg-blue-50/40">
                      <td className="py-3 px-4 font-mono font-bold text-[#002795]">{item.thang}</td>
                      <td className="py-3 px-4 text-center font-mono">{item.tongNhanVien}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(item.tongLuongCoBan)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">+{formatCurrency(item.tongPhuCap)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">+{formatCurrency(item.tongTangCa)}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-600">-{formatCurrency(item.tongKhauTru)}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                        {formatCurrency(item.tongThucNhan)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.trangThai === 'DaKhoa' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.trangThai === 'DaKhoa' ? 'Đã khóa sổ' : 'Tạm tính'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Cost Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Chi Phí Quỹ Lương Theo Phòng Ban (Kỳ {payrollData.kyBaoCao})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payrollData.theoPhongBan?.map((d) => (
                <div key={d.maPhongBan} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{d.tenPhongBan}</span>
                    <span className="text-slate-400 font-mono font-semibold">{d.soNhanSu} người</span>
                  </div>
                  <div className="text-lg font-black text-[#002795] font-mono">
                    {formatCurrency(d.tongChiPhi)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Bình quân: {formatCurrency(d.soNhanSu > 0 ? d.tongChiPhi / d.soNhanSu : 0)} / người
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
