import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  CalendarCheck, 
  Calculator, 
  BarChart3, 
  ShieldCheck,
  Award
} from 'lucide-react';

export default function HRSidebar() {
  const navItems = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard Nhân Sự', path: '/hr', icon: LayoutDashboard, exact: true },
      ]
    },
    {
      title: 'HỒ SƠ & TỔ CHỨC',
      items: [
        { name: 'Hồ Sơ Nhân Viên', path: '/hr/employees', icon: Users },
        { name: 'Phòng Ban & Chức Vụ', path: '/hr/departments', icon: Building2 },
        { name: 'Hợp Đồng Lao Động', path: '/hr/contracts', icon: FileText },
      ]
    },
    {
      title: 'CHẤM CÔNG & TIỀN LƯƠNG',
      items: [
        { name: 'Quản Lý Chấm Công', path: '/hr/timesheets', icon: CalendarCheck },
        { name: 'Bảng Tính Lương Tháng', path: '/hr/payroll', icon: Calculator },
      ]
    },
    {
      title: 'BÁO CÁO THỐNG KÊ',
      items: [
        { name: 'Báo Cáo Cơ Cấu & Quỹ Lương', path: '/hr/reports', icon: BarChart3 },
      ]
    },
    {
      title: 'HỆ THỐNG ĐĂNG NHẬP',
      items: [
        { name: 'Tài Khoản & Phân Quyền', path: '/hr/accounts', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#FAF8F5] border-r border-slate-200/70 min-h-[calc(100vh-61px)] flex flex-col justify-between p-3 shrink-0">
      <div className="space-y-5">
        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {group.title}
            </h3>
            <div className="space-y-1 mt-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#002795] text-white shadow-sm translate-x-1'
                          : 'text-slate-600 hover:bg-blue-50/70 hover:text-[#002795]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* HR Policy Card */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/70 rounded-lg text-[#002795] text-xs shadow-sm space-y-1.5 mt-4">
        <div className="font-bold flex items-center space-x-1.5 text-[#002795]">
          <Award className="w-4 h-4 text-[#0052FF]" />
          <span>Nhân Lực Vinamilk</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Môi trường làm việc chuẩn quốc tế, chế độ đãi ngộ hàng đầu ngành sữa Việt Nam.
        </p>
      </div>
    </aside>
  );
}
