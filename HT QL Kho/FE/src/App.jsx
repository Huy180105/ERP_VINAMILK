import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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

// Subsystem Preview Pages
import HRModule from './pages/Subsystems/HRModule';
import ProductionModule from './pages/Subsystems/ProductionModule';
import SalesModule from './pages/Subsystems/SalesModule';
import FinanceModule from './pages/Subsystems/FinanceModule';

// Warehouse App Shell Wrapper Component
function WarehousePage({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Quick Back to Portal Button */}
          <div className="mb-4 flex items-center justify-between bg-blue-50/70 border border-blue-200/60 p-2.5 rounded-xl text-xs">
            <span className="font-semibold text-[#00249C]">
              📌 Đang làm việc tại: <b>Phân Hệ Quản Lý Kho Vinamilk ERP</b>
            </span>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#00249C] hover:bg-blue-900 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition shadow-xs cursor-pointer"
            >
              ← Về Cổng Thông Tin Portal 5 Phân Hệ
            </button>
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

        {/* Route 2: Warehouse Dashboard */}
        <Route path="/warehouse" element={<WarehousePage><Dashboard /></WarehousePage>} />

        {/* Route 3: Warehouse Sub-pages WITH /warehouse prefix */}
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

        {/* Route 4: Warehouse Sub-pages WITHOUT /warehouse prefix (Direct Access Support) */}
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

        {/* Other ERP Subsystems */}
        <Route path="/hr" element={<WarehousePage><HRModule /></WarehousePage>} />
        <Route path="/production" element={<WarehousePage><ProductionModule /></WarehousePage>} />
        <Route path="/sales" element={<WarehousePage><SalesModule /></WarehousePage>} />
        <Route path="/finance" element={<WarehousePage><FinanceModule /></WarehousePage>} />

        {/* Fallback for any unknown route -> Portal Home */}
        <Route path="*" element={<PortalHome />} />
      </Routes>
    </BrowserRouter>
  );
}
