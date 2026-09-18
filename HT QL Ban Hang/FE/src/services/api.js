import axios from 'axios';

// Dynamic API Base URL detection for both Docker (Port 3000 / Nginx) and Local Dev (Port 5173 / 8000)
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If accessed via Nginx (Port 3000 / Production), use relative path to leverage Nginx reverse proxy
    if (window.location.port === '3000' || window.location.port === '80' || window.location.port === '443') {
      return '/api/warehouse';
    }
  }
  return 'http://localhost:8000/api/warehouse';
};

export const api = axios.create({
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
  getProductReceipts: (params) => api.get('/inbound/products', { params }),
  completeProductReceipt: (id) => api.put(`/inbound/products/${id}/complete`),
};

export const OutboundAPI = {
  getRawMaterialDispatches: (params) => api.get('/outbound/raw-materials', { params }),
  createRawMaterialDispatch: (data) => api.post('/outbound/raw-materials', data),
  completeRawMaterialDispatch: (id) => api.put(`/outbound/raw-materials/${id}/complete`),
  getProductDispatches: (params) => api.get('/outbound/products', { params }),
  completeProductDispatch: (id) => api.put(`/outbound/products/${id}/complete`),
};

export const SalesAPI = {
  getDashboard: () => api.get('/sales/dashboard'),
  getOrders: (params) => api.get('/sales/orders', { params }),
  createOrder: (data) => api.post('/sales/orders', data),
  updateOrder: (id, data) => api.put(`/sales/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/sales/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/sales/orders/${id}/status`, { trangThai: status }),
  getCustomers: (params) => api.get('/sales/customers', { params }),
  getDeliveries: (params) => api.get('/sales/deliveries', { params }),
  getInvoices: (params) => api.get('/sales/invoices', { params }),
  getReceivables: (params) => api.get('/sales/receivables', { params }),
};

export const ReportAPI = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getAuditTrail: (maTonKho) => api.get(`/reports/audit-trail/${maTonKho}`),
};

export default api;
