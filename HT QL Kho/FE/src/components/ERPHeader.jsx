import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

const SALES_ROLES = [
  {
    id: 'NhanVienBanHang',
    name: 'Nhân viên bán hàng',
    description: 'Lập đơn hàng, tra cứu khách hàng & tồn kho',
    badge: 'Kinh doanh'
  },
  {
    id: 'QuanLyKinhDoanh',
    name: 'Quản lý kinh doanh',
    description: 'Duyệt đơn hàng, phê duyệt công nợ & báo cáo',
    badge: 'Quản lý'
  },
  {
    id: 'NhanVienGiaoHang',
    name: 'Nhân viên giao hàng',
    description: 'Nhận đơn giao, xác nhận giao & thanh toán',
    badge: 'Giao vận'
  }
];

export default function ERPHeader({ module = 'portal', showRoleSwitcher = false }) {
  const navigate = useNavigate();
  const isSales = module === 'sales';
  const roleStorageKey = isSales ? 'vinamilk_sales_role' : 'vinamilk_finance_role';
  const rolesList = isSales ? SALES_ROLES : FINANCE_ROLES;

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem(roleStorageKey) || (isSales ? 'NhanVienBanHang' : 'KeToanTruong');
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
    localStorage.setItem(roleStorageKey, roleId);
    const eventName = isSales ? 'sales_role_changed' : 'finance_role_changed';
    window.dispatchEvent(new CustomEvent(eventName, { detail: roleId }));
    setIsRoleDropdownOpen(false);
  };

  const activeRoleInfo = rolesList.find(r => r.id === currentRole) || rolesList[0];
  const initial = activeRoleInfo.name.charAt(0);

  const getModuleName = () => {
    switch (module) {
      case 'warehouse': return 'QUẢN LÝ KHO';
      case 'finance': return 'TÀI CHÍNH KẾ TOÁN';
      case 'production': return 'QUẢN LÝ SẢN XUẤT';
      case 'sales': return 'QUẢN LÝ BÁN HÀNG';
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
          {module !== 'portal' && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#002795] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cổng Thông Tin Portal</span>
            </button>
          )}

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
    </div>
  );
}
