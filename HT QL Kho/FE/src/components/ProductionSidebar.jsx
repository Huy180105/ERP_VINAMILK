import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  GitMerge, 
  Boxes, 
  FlaskConical, 
  ShieldCheck, 
  RotateCcw, 
  BarChart3, 
  Factory,
  Sparkles
} from 'lucide-react';

export default function ProductionSidebar() {
  const navItems = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard Sản Xuất', path: '/production', icon: LayoutDashboard },
      ]
    },
    {
      title: 'KẾ HOẠCH & ĐIỀU ĐỘ',
      items: [
        { name: 'Lệnh Sản Xuất (LSX)', path: '/production/orders', icon: ClipboardList, highlight: true },
      ]
    },
    {
      title: 'QUY TRÌNH DÂY CHUYỀN',
      items: [
        { name: '6 Công Đoạn Sản Xuất', path: '/production/stages', icon: GitMerge },
        { name: 'Bán Thành Phẩm & Tiến Độ', path: '/production/semi-finished', icon: FlaskConical },
      ]
    },
    {
      title: 'VẬT TƯ & NGUYÊN LIỆU',
      items: [
        { name: 'Phiếu Yêu Cầu NVL', path: '/production/material-requests', icon: Boxes },
      ]
    },
    {
      title: 'CHẤT LƯỢNG & NGHIỆM THU',
      items: [
        { name: 'Kiểm Tra QC & Bàn Giao Kho', path: '/production/quality-control', icon: ShieldCheck },
        { name: 'Lệnh Sản Xuất Bù (Phế phẩm)', path: '/production/compensations', icon: RotateCcw },
      ]
    },
    {
      title: 'HIỆU SUẤT & BÁO CÁO',
      items: [
        { name: 'Báo Cáo Sản Lượng & OEE', path: '/production/reports', icon: BarChart3 },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#FAF8F5] border-r border-slate-200/70 min-h-[calc(100vh-61px)] flex flex-col justify-between p-3 soft-shadow shrink-0">
      <div className="space-y-4">
        {/* Module Header Badge */}
        <div className="p-3 bg-gradient-to-r from-indigo-900 to-[#00249C] text-white rounded-2xl shadow-sm flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <Factory className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black tracking-wider text-indigo-200">PHÂN HỆ ERP</div>
            <div className="text-xs font-bold text-white">Quản Lý Sản Xuất</div>
          </div>
        </div>

        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {group.title}
            </h3>
            <div className="space-y-0.5 mt-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    end={item.path === '/production'}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00249C] to-indigo-800 text-white shadow-md shadow-blue-900/20 translate-x-1'
                          : 'text-slate-600 hover:bg-indigo-50/80 hover:text-[#00249C]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase shadow-xs">
                        LÕI
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ISO/HACCP Dairy Quality Card */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/60 rounded-2xl text-indigo-900 text-xs shadow-xs space-y-1 mt-4">
        <div className="font-bold flex items-center space-x-1.5 text-indigo-950">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Dây Chuyền Chuẩn UHT</span>
        </div>
        <p className="text-[11px] text-indigo-800/80 leading-relaxed font-medium">
          Tiệt trùng vô trùng 140°C trong 4 giây, giữ trọn vẹn dinh dưỡng tự nhiên.
        </p>
      </div>
    </aside>
  );
}
