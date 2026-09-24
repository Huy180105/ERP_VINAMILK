import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  ReceiptText,
  CircleDollarSign,
  Users,
  Tag,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export default function SalesSidebar() {
  const navItems = [
    {
      title: 'TỔNG QUAN',
      items: [
        { name: 'Dashboard Bán Hàng', path: '/sales', icon: LayoutDashboard },
      ]
    },
    {
      title: 'NGHIỆP VỤ BÁN HÀNG',
      items: [
        { name: 'Quản Lý Đơn Hàng', path: '/sales/orders', icon: ShoppingCart },
        { name: 'Quản Lý Giao Hàng', path: '/sales/deliveries', icon: Truck },
        { name: 'Hóa Đơn & Thanh Toán', path: '/sales/invoices', icon: ReceiptText },
        { name: 'Quản Lý Công Nợ', path: '/sales/receivables', icon: CircleDollarSign },
      ]
    },
    {
      title: 'DANH MỤC & BẢNG GIÁ',
      items: [
        { name: 'Khách Hàng / NPP', path: '/sales/customers', icon: Users },
        { name: 'Bảng Giá Sản Phẩm', path: '/sales/pricing', icon: Tag },
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
                    end={item.path === '/sales'}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0B2341] text-white shadow-sm translate-x-1'
                          : 'text-slate-600 hover:bg-blue-50/70 hover:text-[#0B2341]'
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

      {/* Sales Assurance Card */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 rounded-lg text-[#0B2341] text-xs shadow-sm space-y-1.5">
        <div className="font-bold flex items-center space-x-1.5 text-[#002795]">
          <PackageCheck className="w-4 h-4 text-[#002795]" />
          <span>Kênh Phân Phối Chuẩn</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Liên thông Kho hàng - Giao nhận - Tài chính kế toán theo thời gian thực.
        </p>
      </div>
    </aside>
  );
}
