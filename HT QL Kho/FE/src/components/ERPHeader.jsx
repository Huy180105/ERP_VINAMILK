import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import VinamilkLogo from './VinamilkLogo';

const FINANCE_ROLES = [
  {
    id: 'KeToanTruong',
    name: 'Kế toán trưởng',
    description: 'Toàn quyền duyệt phiếu, quản trị danh mục',
    badge: 'Admin'
  },
  {
    id: 'KeToanThanhToan',
    name: 'Kế toán thanh toán',
    description: 'Lập phiếu, theo dõi công nợ',
    badge: 'User'
  },
  {
    id: 'ThuQuy',
    name: 'Thủ quỹ',
    description: 'Xác nhận thu/chi tiền mặt',
    badge: 'User'
  }
];

export default function ERPHeader({ module = 'portal', showRoleSwitcher = false }) {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('vinamilk_finance_role') || 'KeToanTruong';
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (roleId) => {
    setCurrentRole(roleId);
    localStorage.setItem('vinamilk_finance_role', roleId);
    window.dispatchEvent(new CustomEvent('finance_role_changed', { detail: roleId }));
    setIsRoleDropdownOpen(false);
  };

  const getNavItems = () => {
    if (module === 'warehouse') {
      return [
        { name: 'Tổng quan', path: '/warehouse' },
        { name: 'Nguyên vật liệu', path: '/warehouse/master-data/materials' },
        { name: 'Sản phẩm', path: '/warehouse/master-data/products' },
        { name: 'Nhà cung cấp', path: '/warehouse/master-data/suppliers' },
        { name: 'Nhập NVL', path: '/warehouse/inbound/materials' },
        { name: 'Nhập SP', path: '/warehouse/inbound/products' },
        { name: 'Xuất NVL', path: '/warehouse/outbound/materials' },
        { name: 'Xuất SP (FEFO)', path: '/warehouse/outbound/products' },
        { name: 'Tồn kho', path: '/warehouse/inventory/lots' },
        { name: 'Báo cáo', path: '/warehouse/reports/summary' }
      ];
    }
    if (module === 'finance') {
      return [
        { name: 'Tổng quan', path: '/finance' },
        { name: 'Khoản mục thu', path: '/finance/master-data/revenue-categories' },
        { name: 'Khoản mục chi', path: '/finance/master-data/expense-categories' },
        { name: 'Đối tượng', path: '/finance/master-data/counterparties' },
        { name: 'Tài khoản quỹ', path: '/finance/master-data/accounts' },
        { name: 'Phiếu thu', path: '/finance/receipts' },
        { name: 'Phiếu chi', path: '/finance/payments' },
        { name: 'Báo cáo', path: '/finance/reports' }
      ];
    }
    return [];
  };

  const navItems = getNavItems();
  const activeRoleInfo = FINANCE_ROLES.find(r => r.id === currentRole) || FINANCE_ROLES[0];
  const initial = activeRoleInfo.name.charAt(0);

  const getModuleName = () => {
    switch (module) {
      case 'warehouse': return 'QUẢN LÝ KHO';
      case 'finance': return 'TÀI CHÍNH KẾ TOÁN';
      default: return 'CỔNG THÔNG TIN';
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top bar */}
      <div className="bg-[#001F7D] text-white py-1.5 px-6 text-xs font-mono flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>VINAMILK ERP · HỆ THỐNG QUẢN TRỊ TỔNG THỂ · EST 1976</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className="hover:text-sky-200 cursor-pointer">Trang Chủ Vinamilk</button>
          <span className="text-white/30">|</span>
          <a href="#" className="hover:text-sky-200">Hỗ trợ</a>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="hover:opacity-90 transition-opacity cursor-pointer">
            <VinamilkLogo className="h-9 w-auto text-[#002795]" />
          </button>
          
          <div className="h-6 w-px bg-gray-200"></div>
          
          <div className="flex items-center gap-2">
            <h1 className="text-[#002795] font-black text-base uppercase tracking-wider font-display">
              {getModuleName()}
            </h1>
            <span className="bg-blue-50 border border-blue-200 text-[#002795] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
              ERP 4.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showRoleSwitcher && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2.5 hover:bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors cursor-pointer"
              >
                <div className="h-7 w-7 bg-[#002795] text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {initial}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-gray-900">{activeRoleInfo.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{activeRoleInfo.badge}</div>
                </div>
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-100 text-xs font-mono uppercase text-gray-400 font-semibold">
                    Chuyển đổi vai trò
                  </div>
                  <div className="py-1">
                    {FINANCE_ROLES.map(role => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start flex-col gap-0.5 transition-colors cursor-pointer ${
                          currentRole === role.id ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <div className="flex justify-between w-full items-center">
                          <span className={`text-xs font-bold ${currentRole === role.id ? 'text-[#002795]' : 'text-gray-900'}`}>
                            {role.name}
                          </span>
                          {currentRole === role.id && (
                            <span className="text-[#002795] text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500">{role.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sub-navigation bar */}
      {navItems.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="flex flex-row overflow-x-auto gap-7 hide-scrollbar">
            {navItems.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) => 
                  `whitespace-nowrap py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    isActive 
                      ? 'border-[#002795] text-[#002795]' 
                      : 'border-transparent text-gray-500 hover:text-[#002795]'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
