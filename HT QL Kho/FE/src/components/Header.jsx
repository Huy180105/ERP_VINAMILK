import React from 'react';
import { Search, Bell, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-[#00249C] via-[#001D80] to-[#001458] text-white shadow-lg px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 border-b border-blue-800/40">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-4">
        <div className="bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-2xl flex items-center shadow-md border border-white/40 transform transition hover:scale-105">
          <span className="font-black text-2xl tracking-tighter text-[#00249C] italic">VINAMILK</span>
          <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold px-1.5 py-0.5 rounded-full ml-1.5 tracking-wider uppercase shadow-sm">EST 1976</span>
        </div>
        <div className="hidden md:flex flex-col border-l border-blue-400/30 pl-4">
          <span className="font-extrabold text-sm text-white tracking-wide flex items-center space-x-1.5">
            <span>HỆ THỐNG QUẢN LÝ KHO ERP</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </span>
          <span className="text-[11px] text-blue-200/90 font-medium">Vinamilk Enterprise Resource Planning</span>
        </div>
      </div>

      {/* Global Search - Soft Rounded Pill */}
      <div className="hidden lg:flex items-center relative w-96">
        <input 
          type="text" 
          placeholder="Tra cứu nhanh lô hàng, mã NVL, sản phẩm..." 
          className="w-full bg-white/10 border border-white/20 text-xs text-white placeholder-blue-200/70 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white/15 transition-all duration-300 shadow-inner"
        />
        <Search className="w-4 h-4 text-blue-200 absolute left-3" />
      </div>

      {/* User & Quality Standard Badges */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-semibold backdrop-blur">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Đạt chuẩn Quốc Tế ISO/HACCP</span>
        </div>

        <button className="relative p-2 rounded-full hover:bg-white/10 text-blue-200 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#00249C] animate-ping"></span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#00249C]"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-blue-400/30 pl-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white/60 flex items-center justify-center font-bold text-sm text-white shadow-md">
            TK
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-white flex items-center space-x-1">
              <span>Nguyễn Văn Hùng</span>
              <UserCheck className="w-3 h-3 text-blue-300" />
            </span>
            <span className="text-[10px] text-blue-200 font-medium">Thủ Kho Trưởng</span>
          </div>
        </div>
      </div>
    </header>
  );
}
