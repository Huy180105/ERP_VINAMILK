import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import ProductionSidebar from './ProductionSidebar';

export default function ProductionLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-slate-800">
      <Header />
      <div className="flex flex-1">
        <ProductionSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {/* Top Switcher Bar */}
          <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-slate-50 border border-indigo-200/70 p-3 rounded-2xl text-xs shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-[#00249C]">
                🏭 Đang làm việc tại: <b className="text-indigo-900">Phân Hệ Quản Lý Sản Xuất Vinamilk ERP</b>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/warehouse')}
                className="bg-white hover:bg-slate-100 text-[#00249C] border border-blue-200 font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <span>📦 Chuyển Sang Phân Hệ Kho</span>
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-[#00249C] hover:bg-blue-900 text-white font-bold px-3.5 py-1.5 rounded-xl text-[11px] transition shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <span>← Về Cổng Thông Tin Portal</span>
              </button>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
