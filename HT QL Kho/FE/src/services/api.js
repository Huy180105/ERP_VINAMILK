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

export const MasterDataAPI = {
  getMaterials: (params) => api.get('/master-data/materials', { params }),
  createMaterial: (data) => api.post('/master-data/materials', data),
  updateMaterial: (id, data) => api.put(`/master-data/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/master-data/materials/${id}`),
  getMaterialTypes: () => api.get('/master-data/material-types'),
  getProducts: (params) => api.get('/master-data/products', { params }),
  getSuppliers: (params) => api.get('/master-data/suppliers', { params }),
  createSupplier: (data) => api.post('/master-data/suppliers', data),
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
};

export const InboundAPI = {
  getRawMaterialReceipts: (params) => api.get('/inbound/raw-materials', { params }),
  createRawMaterialReceipt: (data) => api.post('/inbound/raw-materials', data),
  approveRawMaterialReceipt: (id) => api.put(`/inbound/raw-materials/${id}/approve`),
  completeRawMaterialReceipt: (id) => api.put(`/inbound/raw-materials/${id}/complete`),
  
  // Product Inbound Receipts (PhieuNhapSP)
  getNextProductReceiptCode: () => api.get('/inbound/products/next-code'),
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
  createRawMaterialDispatch: (data) => api.post('/outbound/raw-materials', data),
  completeRawMaterialDispatch: (id) => api.put(`/outbound/raw-materials/${id}/complete`),
  getProductDispatches: (params) => api.get('/outbound/products', { params }),
  completeProductDispatch: (id) => api.put(`/outbound/products/${id}/complete`),
};

export const ReportAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getAuditTrail: (maTonKho) => api.get(`/reports/audit-trail/${maTonKho}`),
};

// ==========================================
// 2. PHÂN HỆ QUẢN LÝ SẢN XUẤT (PRODUCTION APIs)
// ==========================================
export const ProductionAPI = {
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
  handoverToWarehouse: (data) => productionApi.post('/handover-warehouse', data),
};

export default api;
