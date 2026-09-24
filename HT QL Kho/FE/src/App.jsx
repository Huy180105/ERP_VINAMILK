import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ERPHeader from './components/ERPHeader';
import Sidebar from './components/Sidebar';
import FinanceSidebar from './components/FinanceSidebar';
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

// Finance Layout & Pages
import FinanceDashboard from './pages/Finance/Dashboard';
import DanhMucThu from './pages/Finance/MasterData/DanhMucThu';
import DanhMucChi from './pages/Finance/MasterData/DanhMucChi';
import DoiTuongGiaoDich from './pages/Finance/MasterData/DoiTuongGiaoDich';
import TaiKhoanQuy from './pages/Finance/MasterData/TaiKhoanQuy';
import PhieuThu from './pages/Finance/PhieuThu';
import PhieuChi from './pages/Finance/PhieuChi';
import FinanceBaoCao from './pages/Finance/BaoCao';

// Production Pages
import ProductionDashboard from './pages/Production/ProductionDashboard';
import ProductionOrders from './pages/Production/ProductionOrders';
import ProductionStages from './pages/Production/ProductionStages';
import MaterialRequests from './pages/Production/MaterialRequests';
import SemiFinishedGoods from './pages/Production/SemiFinishedGoods';
import QualityControl from './pages/Production/QualityControl';
import ProductionReports from './pages/Production/ProductionReports';

// Subsystem Preview Pages
import HRModule from './pages/Subsystems/HRModule';
import SalesSidebar from './components/SalesSidebar';
import SalesDashboard from './modules/Sales/pages/Dashboard';
import SalesOrders from './modules/Sales/pages/Orders';
import SalesDeliveries from './modules/Sales/pages/Deliveries';
import SalesInvoices from './modules/Sales/pages/Invoices';
import SalesReceivables from './modules/Sales/pages/Receivables';
import SalesCustomers from './modules/Sales/pages/Customers';
import SalesPricing from './modules/Sales/pages/Pricing';

// Warehouse App Shell Wrapper Component
function WarehousePage({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <ERPHeader module="warehouse" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}

// Finance App Shell Wrapper Component
function FinancePage({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <ERPHeader module="finance" showRoleSwitcher />
      <div className="flex flex-1">
        <FinanceSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}

function SalesPage({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <ERPHeader module="sales" />
      <div className="flex flex-1">
        <SalesSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
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

        {/* Route 6: Production Subsystem (Phân Hệ Quản Lý Sản Xuất) */}
        <Route path="/production" element={<ProductionLayout><ProductionDashboard /></ProductionLayout>} />
        <Route path="/production/orders" element={<ProductionLayout><ProductionOrders /></ProductionLayout>} />
        <Route path="/production/stages" element={<ProductionLayout><ProductionStages /></ProductionLayout>} />
        <Route path="/production/material-requests" element={<ProductionLayout><MaterialRequests /></ProductionLayout>} />
        <Route path="/production/semi-finished" element={<ProductionLayout><SemiFinishedGoods /></ProductionLayout>} />
        <Route path="/production/quality-control" element={<ProductionLayout><QualityControl /></ProductionLayout>} />
        <Route path="/production/compensations" element={<ProductionLayout><QualityControl /></ProductionLayout>} />
        <Route path="/production/reports" element={<ProductionLayout><ProductionReports /></ProductionLayout>} />

        {/* Route 7: Other ERP Subsystems */}
        <Route path="/hr" element={<WarehousePage><HRModule /></WarehousePage>} />
        <Route path="/sales" element={<SalesPage><SalesDashboard /></SalesPage>} />
        <Route path="/sales/orders" element={<SalesPage><SalesOrders /></SalesPage>} />
        <Route path="/sales/deliveries" element={<SalesPage><SalesDeliveries /></SalesPage>} />
        <Route path="/sales/invoices" element={<SalesPage><SalesInvoices /></SalesPage>} />
        <Route path="/sales/receivables" element={<SalesPage><SalesReceivables /></SalesPage>} />
        <Route path="/sales/customers" element={<SalesPage><SalesCustomers /></SalesPage>} />
        <Route path="/sales/pricing" element={<SalesPage><SalesPricing /></SalesPage>} />

        {/* Fallback for any unknown route -> Portal Home */}
        <Route path="*" element={<PortalHome />} />
      </Routes>
    </BrowserRouter>
  );
}
