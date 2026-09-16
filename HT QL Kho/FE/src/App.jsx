import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ERPHeader from './components/ERPHeader';
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

// Finance Layout & Pages
import FinanceDashboard from './pages/Finance/Dashboard';
import DanhMucThu from './pages/Finance/MasterData/DanhMucThu';
import DanhMucChi from './pages/Finance/MasterData/DanhMucChi';
import DoiTuongGiaoDich from './pages/Finance/MasterData/DoiTuongGiaoDich';
import TaiKhoanQuy from './pages/Finance/MasterData/TaiKhoanQuy';
import PhieuThu from './pages/Finance/PhieuThu';
import PhieuChi from './pages/Finance/PhieuChi';
import FinanceBaoCao from './pages/Finance/BaoCao';

// Subsystem Preview Pages
import HRModule from './pages/Subsystems/HRModule';
import ProductionModule from './pages/Subsystems/ProductionModule';
import SalesModule from './pages/Subsystems/SalesModule';

// Warehouse App Shell Wrapper Component
function WarehousePage({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <ERPHeader module="warehouse" />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}

// Finance App Shell Wrapper Component
function FinancePage({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <ERPHeader module="finance" showRoleSwitcher />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        {children}
      </main>
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

        {/* Route 4: Warehouse Sub-pages WITHOUT /warehouse prefix */}
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

        {/* Route 5: Finance Subsystem (Phân Hệ Quản Lý Thu Chi) */}
        <Route path="/finance" element={<FinancePage><FinanceDashboard /></FinancePage>} />
        <Route path="/finance/master-data/revenue-categories" element={<FinancePage><DanhMucThu /></FinancePage>} />
        <Route path="/finance/master-data/expense-categories" element={<FinancePage><DanhMucChi /></FinancePage>} />
        <Route path="/finance/master-data/counterparties" element={<FinancePage><DoiTuongGiaoDich /></FinancePage>} />
        <Route path="/finance/master-data/accounts" element={<FinancePage><TaiKhoanQuy /></FinancePage>} />
        <Route path="/finance/receipts" element={<FinancePage><PhieuThu /></FinancePage>} />
        <Route path="/finance/payments" element={<FinancePage><PhieuChi /></FinancePage>} />
        <Route path="/finance/reports" element={<FinancePage><FinanceBaoCao /></FinancePage>} />

        {/* Route 6: Other ERP Subsystems */}
        <Route path="/hr" element={<WarehousePage><HRModule /></WarehousePage>} />
        <Route path="/production" element={<WarehousePage><ProductionModule /></WarehousePage>} />
        <Route path="/sales" element={<WarehousePage><SalesModule /></WarehousePage>} />

        {/* Fallback for any unknown route -> Portal Home */}
        <Route path="*" element={<PortalHome />} />
      </Routes>
    </BrowserRouter>
  );
}
