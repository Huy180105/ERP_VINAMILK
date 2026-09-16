import axios from 'axios';

const api = axios.create({
  baseURL: typeof window !== 'undefined' && ['3000', '80', '443'].includes(window.location.port)
    ? '/api/finance'
    : 'http://localhost:8000/api/finance',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor gắn X-User-Role từ localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.headers['X-User-Role'] = localStorage.getItem('vinamilk_finance_role') || 'KeToanTruong';
  }
  return config;
});

export const FinanceMasterDataAPI = {
  // Nguồn đối tượng từ Bán hàng, Kho, Nhân sự (FI-BR05)
  getAvailableSourceEntities: (params) => api.get('/master-data/source-entities', { params }),

  // 1. Danh mục khoản thu
  getRevCategories: (params) => api.get('/master-data/revenue-categories', { params }),
  createRevCategory: (data) => api.post('/master-data/revenue-categories', data),
  updateRevCategory: (id, data) => api.put(`/master-data/revenue-categories/${id}`, data),
  deleteRevCategory: (id) => api.delete(`/master-data/revenue-categories/${id}`),

  // 2. Danh mục khoản chi
  getExpCategories: (params) => api.get('/master-data/expense-categories', { params }),
  createExpCategory: (data) => api.post('/master-data/expense-categories', data),
  updateExpCategory: (id, data) => api.put(`/master-data/expense-categories/${id}`, data),
  deleteExpCategory: (id) => api.delete(`/master-data/expense-categories/${id}`),

  // 3. Đối tượng giao dịch
  getCounterparties: (params) => api.get('/master-data/counterparties', { params }),
  createCounterparty: (data) => api.post('/master-data/counterparties', data),
  updateCounterparty: (id, data) => api.put(`/master-data/counterparties/${id}`, data),
  toggleStatusCounterparty: (id) => api.put(`/master-data/counterparties/${id}/toggle-status`),
  deleteCounterparty: (id) => api.delete(`/master-data/counterparties/${id}`),

  // 4. Tài khoản quỹ / Ngân hàng
  getAccounts: (params) => api.get('/master-data/accounts', { params }),
  createAccount: (data) => api.post('/master-data/accounts', data),
  updateAccount: (id, data) => api.put(`/master-data/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/master-data/accounts/${id}`),
};

export const ReceiptAPI = {
  getPendingSales: (params) => api.get('/receipts/pending-sales', { params }),
  getReceipts: (params) => api.get('/receipts', { params }),
  getReceipt: (id) => api.get(`/receipts/${id}`),
  createReceipt: (data) => api.post('/receipts', data),
  approveReceipt: (id, data) => api.put(`/receipts/${id}/approve`, data),
  cancelReceipt: (id, data) => api.put(`/receipts/${id}/cancel`, data),
  sendToReconcile: (id) => api.put(`/receipts/${id}/reconcile`),
  deleteReceipt: (id) => api.delete(`/receipts/${id}`),
};

export const PaymentAPI = {
  getPendingPurchases: (params) => api.get('/payments/pending-purchases', { params }),
  getPendingPayrolls: (params) => api.get('/payments/pending-payrolls', { params }),
  getPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  approvePayment: (id, data) => api.put(`/payments/${id}/approve`, data),
  cancelPayment: (id, data) => api.put(`/payments/${id}/cancel`, data),
  sendToReconcile: (id) => api.put(`/payments/${id}/reconcile`),
  deletePayment: (id) => api.delete(`/payments/${id}`),
};

export const FinanceReportAPI = {
  getSummaryReport: (params) => api.get('/reports/summary', { params }),
  getCashBookReport: (params) => api.get('/reports/cash-book', { params }),
  getByCounterpartyReport: (params) => api.get('/reports/by-counterparty', { params }),
  getReconciliationReport: (params) => api.get('/reports/reconciliation', { params }),
};

export default api;
