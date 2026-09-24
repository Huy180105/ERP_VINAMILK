import axios from 'axios';

// Dynamic API Base URL detection for both Docker (Nginx / Ngrok / Cloud) and Local Dev (Port 5173 / 8000)
const getApiRootUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.port === '5173') {
      return 'http://localhost:8000/api';
    }
    return '/api';
  }
  return '/api';
};

const apiRoot = getApiRootUrl();

// Warehouse API Axios Instance
const api = axios.create({
  baseURL: `${apiRoot}/warehouse`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Production API Axios Instance
const productionApi = axios.create({
  baseURL: `${apiRoot}/production`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export { api };

export const MasterDataAPI = {
  getMaterials: (params) => api.get('/master-data/materials', { params }),
  createMaterial: (data) => api.post('/master-data/materials', data),
  updateMaterial: (id, data) => api.put(`/master-data/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/master-data/materials/${id}`),
  getMaterialTypes: () => api.get('/master-data/material-types'),
  getProducts: (params) => api.get('/master-data/products', { params }),
  getSuppliers: (params) => api.get('/master-data/suppliers', { params }),
  createSupplier: (data) => api.post('/master-data/suppliers', data),
  updateSupplier: (id, data) => api.put(`/master-data/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/master-data/suppliers/${id}`),
  getWarehouses: (params) => api.get('/master-data/warehouses', { params }),
  createWarehouse: (data) => api.post('/master-data/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/master-data/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/master-data/warehouses/${id}`),
  getCustomers: (params) => api.get('/master-data/customers', { params }),
  getStaff: () => api.get('/master-data/staff'),
};

export const InventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  getFefoSuggestions: (params) => api.get('/inventory/fefo-suggestions', { params }),
  getNearExpiryAlerts: (days) => api.get('/inventory/alerts/near-expiry', { params: { days } }),
  getLowStockAlerts: (min_qty) => api.get('/inventory/alerts/low-stock', { params: { min_qty } }),
  getProductLocations: () => api.get('/inventory/locations/products'),
  getMaterialLocations: () => api.get('/inventory/locations/materials'),
  getReplenishments: (params) => api.get('/inventory/replenishments', { params }),
  getNextReplenishmentCode: () => api.get('/inventory/replenishments/next-code'),
  createReplenishment: (data) => api.post('/inventory/replenishments', data),
  updateReplenishmentStatus: (id, data) => api.put(`/inventory/replenishments/${id}/status`, data),
};

export const InboundAPI = {
  getNextRawMaterialReceiptCode: () => api.get('/inbound/raw-materials/next-code'),
  getRawMaterialReceipts: (params) => api.get('/inbound/raw-materials', { params }),
  getRawMaterialReceiptDetail: (id) => api.get(`/inbound/raw-materials/${id}`),
  createRawMaterialReceipt: (data) => api.post('/inbound/raw-materials', data),
  updateRawMaterialReceipt: (id, data) => api.put(`/inbound/raw-materials/${id}`, data),
  deleteRawMaterialReceipt: (id) => api.delete(`/inbound/raw-materials/${id}`),
  approveRawMaterialReceipt: (id) => api.put(`/inbound/raw-materials/${id}/approve`),
  rejectRawMaterialReceipt: (id, data) => api.put(`/inbound/raw-materials/${id}/reject`, data),
  completeRawMaterialReceipt: (id) => api.put(`/inbound/raw-materials/${id}/complete`),
  
  // Product Inbound Receipts (PhieuNhapSP)
  getNextProductReceiptCode: () => api.get('/inbound/products/next-code'),
  getPendingProductionHandovers: () => api.get('/inbound/products/pending-handovers'),
  getProductReceipts: (params) => api.get('/inbound/products', { params }),
  createProductReceipt: (data) => api.post('/inbound/products', data),
  updateProductReceipt: (id, data) => api.put(`/inbound/products/${id}`, data),
  deleteProductReceipt: (id) => api.delete(`/inbound/products/${id}`),
  approveProductReceipt: (id) => api.put(`/inbound/products/${id}/approve`),
  rejectProductReceipt: (id) => api.put(`/inbound/products/${id}/reject`),
  confirmGoodsReceived: (id) => api.put(`/inbound/products/${id}/confirm-received`),
  completeProductReceipt: (id) => api.put(`/inbound/products/${id}/complete`),
};

export const OutboundAPI = {
  getRawMaterialDispatches: (params) => api.get('/outbound/raw-materials', { params }),
  getPendingMaterialRequests: (params) => api.get('/outbound/raw-materials/pending-requests', { params }),
  createRawMaterialDispatch: (data) => api.post('/outbound/raw-materials', data),
  approveRawMaterialDispatch: (id) => api.put(`/outbound/raw-materials/${id}/approve`),
  rejectRawMaterialDispatch: (id, data) => api.put(`/outbound/raw-materials/${id}/reject`, data),
  completeRawMaterialDispatch: (id) => api.put(`/outbound/raw-materials/${id}/complete`),
  getProductDispatches: (params) => api.get('/outbound/products', { params }),
  approveProductDispatch: (id) => api.put(`/outbound/products/${id}/approve`),
  rejectProductDispatch: (id, data) => api.put(`/outbound/products/${id}/reject`, data),
  completeProductDispatch: (id) => api.put(`/outbound/products/${id}/complete`),
};

export const SalesAPI = {
  // Dashboard & Tồn kho
  getDashboard: () => api.get('/sales/dashboard'),
  checkStock: () => api.get('/sales/check-stock'),

  // Đơn hàng (SA-FR02)
  getOrders: (params) => api.get('/sales/orders', { params }),
  getOrderDetail: (id) => api.get(`/sales/orders/${id}`),
  createOrder: (data) => api.post('/sales/orders', data),
  updateOrder: (id, data) => api.put(`/sales/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/sales/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/sales/orders/${id}/status`, { trangThai: status }),

  // Khách hàng / NPP (SA-FR01)
  getCustomers: (params) => api.get('/sales/customers', { params }),
  getCustomerDetail: (id) => api.get(`/sales/customers/${id}`),
  createCustomer: (data) => api.post('/sales/customers', data),
  updateCustomer: (id, data) => api.put(`/sales/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/sales/customers/${id}`),

  // Giao hàng (SA-FR04)
  getDeliveries: (params) => api.get('/sales/deliveries', { params }),
  getDeliveryDetail: (id) => api.get(`/sales/deliveries/${id}`),
  createDelivery: (data) => api.post('/sales/deliveries', data),
  updateDeliveryStatus: (id, status) => api.put(`/sales/deliveries/${id}/status`, { trangThai: status }),

  // Hóa đơn & Thanh toán (SA-FR03)
  getInvoices: (params) => api.get('/sales/invoices', { params }),
  getInvoiceDetail: (id) => api.get(`/sales/invoices/${id}`),
  createInvoice: (data) => api.post('/sales/invoices', data),
  recordPayment: (data) => api.post('/sales/payments', data),

  // Công nợ (SA-FR05)
  getReceivables: (params) => api.get('/sales/receivables', { params }),
  getReceivableDetail: (id) => api.get(`/sales/receivables/${id}`),

  // Bảng giá sản phẩm (SA-FR06)
  getPricing: (params) => api.get('/sales/pricing', { params }),
  updatePrice: (id, data) => api.put(`/sales/pricing/${id}`, data),
};

export const ReportAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getAuditTrail: (maTonKho) => api.get(`/reports/audit-trail/${maTonKho}`),
};

// ==========================================
// 2. PHÂN HỆ QUẢN LÝ SẢN XUẤT (PRODUCTION APIs)
// ==========================================
export const ProductionAPI = {
  // Quản Lý Sản Phẩm (PR-FR01 -> PR-FR06)
  getProducts: (params) => productionApi.get('/products', { params }),
  createProduct: (data) => productionApi.post('/products', data),
  updateProduct: (id, data) => productionApi.put(`/products/${id}`, data),
  deleteProduct: (id) => productionApi.delete(`/products/${id}`),
  updateProductStatus: (id, data) => productionApi.put(`/products/${id}/status`, data),

  // Dashboard & Reports (PR-FR32 -> PR-FR37)
  getDashboardSummary: () => productionApi.get('/dashboard'),
  getVolumeReport: (params) => productionApi.get('/reports/volume', { params }),
  getEfficiencyReport: (params) => productionApi.get('/reports/efficiency', { params }),
  getQualityReport: (params) => productionApi.get('/reports/quality', { params }),

  // Lệnh Sản Xuất (PR-FR07 -> PR-FR12)
  getOrders: (params) => productionApi.get('/orders', { params }),
  getOrderById: (id) => productionApi.get(`/orders/${id}`),
  createOrder: (data) => productionApi.post('/orders', data),
  updateOrder: (id, data) => productionApi.put(`/orders/${id}`, data),
  deleteOrder: (id) => productionApi.delete(`/orders/${id}`),
  approveOrder: (id) => productionApi.put(`/orders/${id}/approve`),
  rejectOrder: (id) => productionApi.put(`/orders/${id}/reject`),
  completeOrder: (id) => productionApi.put(`/orders/${id}/complete`),

  // Quy Trình Công Đoạn (PR-FR18 -> PR-FR23)
  getStages: (params) => productionApi.get('/stages', { params }),
  startStage: (id) => productionApi.put(`/stages/${id}/start`),
  completeStage: (id, data) => productionApi.put(`/stages/${id}/complete`, data),
  recordIncident: (id, data) => productionApi.put(`/stages/${id}/incident`, data),
  resumeStage: (id) => productionApi.put(`/stages/${id}/resume`),
  assignStaff: (id, data) => productionApi.put(`/stages/${id}/assign`, data),

  // Yêu Cầu Cấp Phát & Tiêu Hao NVL (PR-FR13 -> PR-FR17)
  getMaterialRequests: (params) => productionApi.get('/material-requests', { params }),
  createMaterialRequest: (data) => productionApi.post('/material-requests', data),
  checkMaterialAvailability: () => productionApi.get('/material-requests/availability'),
  updateMaterialRequestStatus: (id, data) => productionApi.put(`/material-requests/${id}/status`, data),

  // Bán Thành Phẩm & Tiến Độ (PR-FR24 -> PR-FR27, PR-FR32)
  getSemiFinishedGoods: (params) => productionApi.get('/semi-finished', { params }),
  createSemiFinishedGood: (data) => productionApi.post('/semi-finished', data),
  getBTPTransfers: (params) => productionApi.get('/btp-transfers', { params }),
  createBTPTransfer: (data) => productionApi.post('/btp-transfers', data),
  getProgressLogs: (params) => productionApi.get('/progress-logs', { params }),

  // Kiểm Tra Chất Lượng QC, Làm Bù & Bàn Giao (PR-FR28 -> PR-FR31)
  getQCReports: (params) => productionApi.get('/qc-reports', { params }),
  createQCReport: (data) => productionApi.post('/qc-reports', data),
  getCompensations: (params) => productionApi.get('/compensations', { params }),
  getHandovers: (params) => productionApi.get('/handovers', { params }),
  handoverToWarehouse: (data) => productionApi.post('/handover-warehouse', data),

  // Tiếp Nhận Đề Nghị Bổ Sung Từ Kho (Screenshot 4)
  getWarehouseReplenishments: (params) => productionApi.get('/warehouse-replenishments', { params }),
  updateWarehouseReplenishmentStatus: (id, data) => productionApi.put(`/warehouse-replenishments/${id}/status`, data),
};

export default api;
