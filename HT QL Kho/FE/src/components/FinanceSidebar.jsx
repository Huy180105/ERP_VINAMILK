import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Landmark, 
  FileText, 
  ListTree,
  Coins,
  ShieldCheck
} from 'lucide-react';

export default function FinanceSidebar() {
  const navItems = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard Thu Chi', path: '/finance', icon: LayoutDashboard },
      ]
    },
    {
      title: 'DANH MỤC CƠ BẢN',
      items: [
        { name: 'Khoản Mục Thu', path: '/finance/master-data/revenue-categories', icon: ListTree },
        { name: 'Khoản Mục Chi', path: '/finance/master-data/expense-categories', icon: ListTree },
        { name: 'Đối Tượng Giao Dịch', path: '/finance/master-data/counterparties', icon: Users },
        { name: 'Tài Khoản Quỹ / NH', path: '/finance/master-data/accounts', icon: Landmark },
      ]
    },
    {
      title: 'QUẢN LÝ THU TIỀN',
      items: [
        { name: 'Lập & Duyệt Phiếu Thu', path: '/finance/receipts', icon: ArrowDownLeft },
      ]
    },
    {
      title: 'QUẢN LÝ CHI TIỀN',
      items: [
        { name: 'Lập & Duyệt Phiếu Chi', path: '/finance/payments', icon: ArrowUpRight },
      ]
    },
    {
      title: 'BÁO CÁO & SỔ QUỸ',
      items: [
        { name: 'Tổng Hợp & Sổ Quỹ', path: '/finance/reports', icon: FileText },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#FAF8F5] border-r border-slate-200/70 min-h-[calc(100vh-61px)] flex flex-col justify-between p-3 ">
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
                    end={item.path === '/finance'}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0B2341] text-white shadow-sm  translate-x-1'
                          : 'text-slate-600 hover:bg-blue-50/60/70 hover:text-[#0B2341]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Finance Assurance Card */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-blue-200/60 rounded-lg text-[#0B2341] text-xs shadow-sm space-y-1">
        <div className="font-bold flex items-center space-x-1.5 text-[#0B2341]">
          <Coins className="w-4 h-4 text-[#0052FF]" />
          <span>Kiểm Soát Tài Chính</span>
        </div>
        <p className="text-[11px] text-[#0B2341] leading-relaxed font-medium">
          Minh bạch dòng tiền, kiểm soát ngân quỹ theo chuẩn mực kế toán VAS.
        </p>
      </div>
    </aside>
  );
}
