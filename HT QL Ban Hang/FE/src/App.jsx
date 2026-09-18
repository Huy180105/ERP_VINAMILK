import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import SalesDashboard from './pages/Sales/Dashboard';
import SalesOrders from './pages/Sales/Orders';

function SalesShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.26em] text-amber-100">Sales & Distribution</div>
            <h1 className="mt-1 text-xl font-black">Phân Hệ Quản Lý Bán Hàng</h1>
          </div>
          <nav className="flex gap-2 text-xs font-bold">
            <Link className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/30 hover:bg-white/20" to="/sales">Tổng quan</Link>
            <Link className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/30 hover:bg-white/20" to="/sales/orders">Đơn hàng</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SalesShell>
        <Routes>
          <Route path="/" element={<SalesDashboard />} />
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/orders" element={<SalesOrders />} />
        </Routes>
      </SalesShell>
    </BrowserRouter>
  );
}
