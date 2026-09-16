import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Truck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  FileText, 
  Building2, 
  Layers,
  AlertTriangle,
  Heart
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard Kho', path: '/warehouse', icon: LayoutDashboard },
      ]
    },
    {
      title: 'DANH MỤC CƠ BẢN',
      items: [
        { name: 'Nguyên Vật Liệu', path: '/warehouse/master-data/materials', icon: Boxes },
        { name: 'Sản Phẩm Vinamilk', path: '/warehouse/master-data/products', icon: Package },
        { name: 'Nhà Cung Cấp', path: '/warehouse/master-data/suppliers', icon: Building2 },
      ]
    },
    {
      title: 'QUẢN LÝ NHẬP KHO',
      items: [
        { name: 'Nhập NVL từ NCC', path: '/warehouse/inbound/materials', icon: ArrowDownLeft },
        { name: 'Nhập SP từ Xưởng', path: '/warehouse/inbound/products', icon: Layers },
      ]
    },
    {
      title: 'QUẢN LÝ XUẤT KHO',
      items: [
        { name: 'Xuất NVL cho Xưởng', path: '/warehouse/outbound/materials', icon: ArrowUpRight },
        { name: 'Xuất SP cho Đại Lý (FEFO)', path: '/warehouse/outbound/products', icon: Truck, highlight: true },
      ]
    },
    {
      title: 'TỒN KHO & LÔ HÀNG',
      items: [
        { name: 'Tra Cứu Lô & HSD', path: '/warehouse/inventory/lots', icon: Clock },
        { name: 'Cảnh Báo HSD / FEFO', path: '/warehouse/inventory/alerts', icon: AlertTriangle },
      ]
    },
    {
      title: 'BÁO CÁO & THỐNG KÊ',
      items: [
        { name: 'Nhập - Xuất - Tồn', path: '/warehouse/reports/summary', icon: FileText },
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
                    end={item.path === '/warehouse'}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0B2341] text-white shadow-sm  translate-x-1'
                          : 'text-slate-600 hover:bg-blue-50/70 hover:text-[#0B2341]'
                      }`
                    }
                  >
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-amber-500 ' : ''}`} />
                    <span>{item.name}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[9px] bg-amber-600 text-white font-semibold px-2 py-0.5 rounded-full uppercase shadow-sm">
                        FEFO
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Eco Dairy Soft Card */}
      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-lg text-emerald-900 text-xs shadow-sm space-y-1">
        <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500" />
          <span>Vinamilk Green Farm</span>
        </div>
        <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
          Nông trại sinh thái 100% thiên nhiên, nâng tầm vóc Việt.
        </p>
      </div>
    </aside>
  );
}
