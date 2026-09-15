import axios from 'axios';

// Dynamic API Base URL detection for both Docker (Nginx / Ngrok / Cloud) and Local Dev (Port 5173 / 8000)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    // Only when running Vite dev server standalone on port 5173, fallback to http://localhost:8000
    if (window.location.port === '5173') {
      return 'http://localhost:8000/api/warehouse';
    }
    // In all web deployments (Nginx Docker, Ngrok, Custom domains), use relative path to leverage Nginx reverse proxy
    return '/api/warehouse';
  }
  return '/api/warehouse';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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

export default api;
