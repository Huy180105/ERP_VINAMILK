import React, { useState, useEffect } from 'react';
import { Search, Bell, ShieldCheck, Sparkles, UserCheck, ChevronDown, UserCog } from 'lucide-react';

const ROLES = [
  {
    id: 'KeToanTruong',
    name: 'Trần Thị Thu Thảo',
    title: 'Kế Toán Trưởng',
    initials: 'KT',
    badge: 'Toàn quyền duyệt',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
  },
  {
    id: 'KeToanThanhToan',
    name: 'Lê Văn Thanh',
    title: 'Kế Toán Thanh Toán',
    initials: 'TT',
    badge: 'Lập phiếu / Không duyệt',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40'
  },
  {
    id: 'ThuQuy',
    name: 'Hoàng Minh Quý',
    title: 'Thủ Quỹ',
    initials: 'TQ',
    badge: 'Sổ quỹ & Đối soát',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40'
  },
];

export default function FinanceHeader() {
  const [currentRoleId, setCurrentRoleId] = useState(() => {
    return localStorage.getItem('vinamilk_finance_role') || 'KeToanTruong';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentRole = ROLES.find(r => r.id === currentRoleId) || ROLES[0];

  const handleSelectRole = (roleId) => {
    setCurrentRoleId(roleId);
    localStorage.setItem('vinamilk_finance_role', roleId);
    window.dispatchEvent(new CustomEvent('finance_role_changed', { detail: roleId }));
    setDropdownOpen(false);
  };

  return (
    <header className="bg-[#0B2341] text-white  px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 border-b border-purple-800/40">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-4">
        <div className="bg-white/95  px-3.5 py-1.5 rounded-lg flex items-center shadow-sm border border-white/40 transform transition hover:scale-105">
          <span className="font-bold text-2xl tracking-tighter text-[#0B2341] italic">VINAMILK</span>
          <span className="text-[9px] bg-amber-600 text-white font-semibold px-1.5 py-0.5 rounded-full ml-1.5 tracking-wider uppercase shadow-sm">EST 1976</span>
        </div>
        <div className="hidden md:flex flex-col border-l border-purple-400/30 pl-4">
          <span className="font-semibold text-sm text-white tracking-wide flex items-center space-x-1.5">
            <span>HỆ THỐNG QUẢN LÝ THU CHI ERP</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 " />
          </span>
          <span className="text-[11px] text-purple-200/90 font-medium">Vinamilk Enterprise Resource Planning - Finance Module</span>
        </div>
      </div>

      {/* Global Search */}
      <div className="hidden lg:flex items-center relative w-80">
        <input 
          type="text" 
          placeholder="Tra cứu nhanh phiếu thu, chi, đối tượng..." 
          className="w-full bg-white/10 border border-white/20 text-xs text-white placeholder-purple-200/70 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/15 transition-all duration-300 shadow-inner"
        />
        <Search className="w-4 h-4 text-purple-200 absolute left-3" />
      </div>

      {/* Right controls: Quality badge + Role Switcher */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 rounded-full text-emerald-300 text-xs font-semibold ">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Chuẩn Mực Kế Toán VAS</span>
        </div>

        {/* Role Switcher Component */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
            title="Chuyển đổi vai trò người dùng (Kế toán trưởng / Kế toán thanh toán / Thủ quỹ)"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-white/60 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              {currentRole.initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white flex items-center space-x-1">
                <span>{currentRole.name}</span>
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-purple-200 font-medium">{currentRole.title}</span>
                <span className={`text-[9px] px-1 rounded border ${currentRole.badgeColor}`}>
                  {currentRole.badge}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-purple-300 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-sm border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                  <UserCog className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Chọn Vai Trò (Phân Quyền 2.5.2)</span>
                </span>
              </div>

              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={`w-full px-4 py-2.5 text-left flex items-start space-x-3 hover:bg-blue-50/60 transition cursor-pointer ${
                    currentRoleId === role.id ? 'bg-blue-50/60/80 border-l-4 border-[#0052FF]' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#0B2341] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {role.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{role.name}</span>
                      {currentRoleId === role.id && <UserCheck className="w-3.5 h-3.5 text-[#0052FF]" />}
                    </div>
                    <p className="text-[11px] font-semibold text-[#0B2341]">{role.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{role.badge}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
