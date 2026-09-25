import axios from 'axios';

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

const api = axios.create({
  baseURL: `${apiRoot}/hr`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor tự động gắn role và thông tin người dùng từ localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const role = localStorage.getItem('vinamilk_hr_role') || 'QuanLyNhanSu';
    const phone = localStorage.getItem('vinamilk_hr_user_phone') || '';
    const name = localStorage.getItem('vinamilk_hr_user_name') || 'Quản lý nhân sự';

    config.headers['X-User-Role'] = role;
    if (phone) config.headers['X-User-Phone'] = phone;
    if (name) config.headers['X-User-Name'] = name;
  }
  return config;
});

export const HRApi = {
  // 0. Dashboard & Báo cáo
  getDashboardSummary: () => api.get('/dashboard'),
  getStaffReport: (params) => api.get('/reports/staff', { params }),
  getPayrollFundReport: (params) => api.get('/reports/payroll', { params }),

  // 1. Hồ sơ nhân viên (HR-FR01 -> HR-FR04)
  getEmployees: (params) => api.get('/employees', { params }),
  getEmployeeDetail: (id) => api.get(`/employees/${id}`),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),

  // 2. Cơ cấu phòng ban & chức vụ (HR-FR05 -> HR-FR08)
  getDepartments: (params) => api.get('/departments', { params }),
  getDepartmentDetail: (id) => api.get(`/departments/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  getPositions: (params) => api.get('/positions', { params }),
  getPositionDetail: (id) => api.get(`/positions/${id}`),
  createPosition: (data) => api.post('/positions', data),
  updatePosition: (id, data) => api.put(`/positions/${id}`, data),
  deletePosition: (id) => api.delete(`/positions/${id}`),

  // 3. Hợp đồng lao động (HR-FR09 -> HR-FR12)
  getContracts: (params) => api.get('/contracts', { params }),
  getContractDetail: (id) => api.get(`/contracts/${id}`),
  createContract: (data) => api.post('/contracts', data),
  updateContract: (id, data) => api.put(`/contracts/${id}`, data),
  deleteContract: (id) => api.delete(`/contracts/${id}`),

  // 4. Chấm công & Phép / Tăng ca (HR-FR13 -> HR-FR16)
  getTimesheets: (params) => api.get('/timesheets', { params }),
  recordTimesheet: (data) => api.post('/timesheets', data),
  updateTimesheet: (id, data) => api.put(`/timesheets/${id}`, data),
  lockTimesheets: (data) => api.post('/timesheets/lock', data),

  // 5. Tính lương & Báo cáo lương (HR-FR17, HR-FR18, HR-FR20)
  getPayrolls: (params) => api.get('/payroll', { params }),
  calculateMonthlyPayroll: (data) => api.post('/payroll/calculate', data),
  updatePayroll: (id, data) => api.put(`/payroll/${id}`, data),
  lockPayroll: (data) => api.post('/payroll/lock', data),
  unlockPayroll: (data) => api.post('/payroll/unlock', data),
  exportPayroll: (params) => api.get('/payroll/export', { params }),

  // 6. Tài khoản & Phân quyền (HR-FR21 -> HR-FR24)
  getAccounts: (params) => api.get('/accounts', { params }),
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  toggleAccountLock: (id) => api.put(`/accounts/${id}/toggle-lock`),
  assignRole: (id, data) => api.put(`/accounts/${id}/assign-role`, data),
};

export default HRApi;

