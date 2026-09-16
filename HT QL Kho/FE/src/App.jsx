import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductionLayout from './components/ProductionLayout';
import PortalHome from './pages/PortalHome';

// Warehouse Pages
import Dashboard from './pages/Dashboard';
import Materials from './pages/MasterData/Materials';
import Products from './pages/MasterData/Products';
import Suppliers from './pages/MasterData/Suppliers';
import InboundRawMaterials from './pages/Inbound/RawMaterials';
import InboundProducts from './pages/Inbound/Products';
import OutboundRawMaterials from './pages/Outbound/RawMaterials';
import OutboundProducts from './pages/Outbound/Products';
import InventoryLots from './pages/Inventory/Lots';
import Reports from './pages/Reports';

// Production Pages
import ProductionDashboard from './pages/Production/ProductionDashboard';
import ProductionOrders from './pages/Production/ProductionOrders';
import ProductionStages from './pages/Production/ProductionStages';
import MaterialRequests from './pages/Production/MaterialRequests';
import SemiFinishedGoods from './pages/Production/SemiFinishedGoods';
import QualityControl from './pages/Production/QualityControl';
import ProductionReports from './pages/Production/ProductionReports';

// Other Subsystems Placeholder Pages
import HRModule from './pages/Subsystems/HRModule';
import SalesModule from './pages/Subsystems/SalesModule';
import FinanceModule from './pages/Subsystems/FinanceModule';

// Warehouse App Shell Wrapper Component
function WarehousePage({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-slate-800">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {/* Top Switcher Bar */}
          <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/70 p-3 rounded-2xl text-xs shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-[#00249C]">
                📌 Đang làm việc tại: <b>Phân Hệ Quản Lý Kho Vinamilk ERP</b>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/production')}
                className="bg-white hover:bg-slate-100 text-indigo-900 border border-indigo-200 font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-xs cursor-pointer flex items-center space-x-1"
              >
                <span>🏭 Chuyển Sang Phân Hệ Sản Xuất</span>
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: Portal Home */}
        <Route path="/" element={<PortalHome />} />

        {/* Route 2: Warehouse Module Routes */}
        <Route path="/warehouse" element={<WarehousePage><Dashboard /></WarehousePage>} />
        <Route path="/warehouse/master-data/materials" element={<WarehousePage><Materials /></WarehousePage>} />
        <Route path="/warehouse/master-data/products" element={<WarehousePage><Products /></WarehousePage>} />
        <Route path="/warehouse/master-data/suppliers" element={<WarehousePage><Suppliers /></WarehousePage>} />
        <Route path="/warehouse/inbound/materials" element={<WarehousePage><InboundRawMaterials /></WarehousePage>} />
        <Route path="/warehouse/inbound/products" element={<WarehousePage><InboundProducts /></WarehousePage>} />
        <Route path="/warehouse/outbound/materials" element={<WarehousePage><OutboundRawMaterials /></WarehousePage>} />
        <Route path="/warehouse/outbound/products" element={<WarehousePage><OutboundProducts /></WarehousePage>} />
        <Route path="/warehouse/inventory/lots" element={<WarehousePage><InventoryLots /></WarehousePage>} />
        <Route path="/warehouse/inventory/alerts" element={<WarehousePage><Dashboard /></WarehousePage>} />
        <Route path="/warehouse/reports/summary" element={<WarehousePage><Reports /></WarehousePage>} />

        {/* Direct Access Routes (Without /warehouse prefix) */}
        <Route path="/master-data/materials" element={<WarehousePage><Materials /></WarehousePage>} />
        <Route path="/master-data/products" element={<WarehousePage><Products /></WarehousePage>} />
        <Route path="/master-data/suppliers" element={<WarehousePage><Suppliers /></WarehousePage>} />
        <Route path="/inbound/materials" element={<WarehousePage><InboundRawMaterials /></WarehousePage>} />
        <Route path="/inbound/products" element={<WarehousePage><InboundProducts /></WarehousePage>} />
        <Route path="/outbound/materials" element={<WarehousePage><OutboundRawMaterials /></WarehousePage>} />
        <Route path="/outbound/products" element={<WarehousePage><OutboundProducts /></WarehousePage>} />
        <Route path="/inventory/lots" element={<WarehousePage><InventoryLots /></WarehousePage>} />
        <Route path="/inventory/alerts" element={<WarehousePage><Dashboard /></WarehousePage>} />
        <Route path="/reports/summary" element={<WarehousePage><Reports /></WarehousePage>} />

        {/* Route 3: Production Module Routes */}
        <Route path="/production" element={<ProductionLayout><ProductionDashboard /></ProductionLayout>} />
        <Route path="/production/orders" element={<ProductionLayout><ProductionOrders /></ProductionLayout>} />
        <Route path="/production/stages" element={<ProductionLayout><ProductionStages /></ProductionLayout>} />
        <Route path="/production/material-requests" element={<ProductionLayout><MaterialRequests /></ProductionLayout>} />
        <Route path="/production/semi-finished" element={<ProductionLayout><SemiFinishedGoods /></ProductionLayout>} />
        <Route path="/production/quality-control" element={<ProductionLayout><QualityControl /></ProductionLayout>} />
        <Route path="/production/compensations" element={<ProductionLayout><QualityControl /></ProductionLayout>} />
        <Route path="/production/reports" element={<ProductionLayout><ProductionReports /></ProductionLayout>} />

        {/* Other ERP Subsystems */}
        <Route path="/hr" element={<WarehousePage><HRModule /></WarehousePage>} />
        <Route path="/sales" element={<WarehousePage><SalesModule /></WarehousePage>} />
        <Route path="/finance" element={<WarehousePage><FinanceModule /></WarehousePage>} />

        {/* Fallback for any unknown route -> Portal Home */}
        <Route path="*" element={<PortalHome />} />
      </Routes>
    </BrowserRouter>
  );
}
