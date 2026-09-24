import React, { useEffect, useState, useMemo } from 'react';
import { PaymentAPI, FinanceMasterDataAPI } from '../../services/financeApi';
import Pagination from '../../components/Pagination';
import { 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  X,
  Ban,
  Scale,
  ShoppingBag,
  RefreshCw,
  ShieldAlert,
  Users,
  Clock,
  Pencil
} from 'lucide-react';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function PhieuChi() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trangThai, setTrangThai] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  // Pagination for PhieuChi
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(payments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return payments.slice(start, start + pageSize);
  }, [payments, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [trangThai, tuNgay, denNgay]);

  // Role state
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('vinamilk_finance_role') || 'KeToanThanhToan';
  });

  // Master data for dropdowns
  const [counterparties, setCounterparties] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pending Purchases (FI-BR02) & Payrolls (FI-BR03)
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [pendingPayrolls, setPendingPayrolls] = useState([]);
  const [loadingPayrolls, setLoadingPayrolls] = useState(false);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [createTab, setCreateTab] = useState('purchase'); // 'purchase' | 'payroll' | 'manual'
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const [formData, setFormData] = useState({
    maPhieuChi: '',
    ngayChi: new Date().toISOString().split('T')[0],
    maDoiTuong: '',
    lyDoChi: '',
    phuongThucChi: 'CK',
    maTaiKhoanQuy: '',
    maPhieuNhapNVL: '',
    maBangLuong: '',
    items: [{ maChiTietChi: 'CT1', maDanhMucChi: '', dienGiai: '', soTien: 0 }],
  });

  useEffect(() => {
    fetchPayments();
    fetchDropdowns();

    const handleRoleChanged = (e) => {
      setCurrentRole(e.detail || localStorage.getItem('vinamilk_finance_role') || 'KeToanThanhToan');
    };
    window.addEventListener('finance_role_changed', handleRoleChanged);
    return () => window.removeEventListener('finance_role_changed', handleRoleChanged);
  }, [trangThai, tuNgay, denNgay]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await PaymentAPI.getPayments({ trangThai, tuNgay, denNgay });
      if (res.data.success) setPayments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [dtRes, accRes, catRes] = await Promise.all([
        FinanceMasterDataAPI.getCounterparties(),
        FinanceMasterDataAPI.getAccounts(),
        FinanceMasterDataAPI.getExpCategories(),
      ]);
      if (dtRes.data.success) setCounterparties((dtRes.data.data || []).filter(item => item.trangThai));
      if (accRes.data.success) setAccounts((accRes.data.data || []).filter(item => item.trangThai));
      if (catRes.data.success) setCategories((catRes.data.data || []).filter(item => item.trangThai));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const res = await PaymentAPI.getPendingPurchases();
      if (res.data.success) setPendingPurchases(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchPendingPayrolls = async () => {
    setLoadingPayrolls(true);
    try {
      const res = await PaymentAPI.getPendingPayrolls();
      if (res.data.success) setPendingPayrolls(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayrolls(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    const autoCode = generateAutoCode(payments, 'maPhieuChi', 'PC', 3, true);
    setSelectedPurchase(null);
    setSelectedPayroll(null);
    setCreateTab('purchase');
    setFormData({
      maPhieuChi: autoCode,
      ngayChi: new Date().toISOString().split('T')[0],
      maDoiTuong: counterparties[0]?.maDoiTuong || '',
      lyDoChi: '',
      phuongThucChi: 'CK',
      maTaiKhoanQuy: accounts[0]?.maTaiKhoanQuy || '',
      maPhieuNhapNVL: '',
      maBangLuong: '',
      items: [
        { maChiTietChi: `CTPC-${Date.now().toString().slice(-4)}-1`, maDanhMucChi: categories[0]?.maDanhMucChi || '', dienGiai: '', soTien: 0 }
      ],
    });
    setModalOpen(true);
    fetchPendingPurchases();
    fetchPendingPayrolls();
  };

  const handleSelectPurchase = (pn) => {
    setSelectedPurchase(pn);
    setSelectedPayroll(null);
    const timestamp = Date.now().toString().slice(-6);
    const matchedDt = counterparties.find(c => c.loaiDoiTuong === 'NCC' && c.maThamChieu === pn.maNCC);

    setFormData(prev => ({
      ...prev,
      maPhieuNhapNVL: pn.maPhieuNhapNVL,
      maBangLuong: '',
      maDoiTuong: matchedDt ? matchedDt.maDoiTuong : prev.maDoiTuong,
      soTien: pn.tongTien,
      phuongThucChi: 'CK',
      lyDoChi: `Thanh toán tiền mua NVL phiếu nhập kho ${pn.maPhieuNhapNVL} (NCC: ${pn.tenNCC})`,
      items: [
        {
          maChiTietChi: `CTPC-${timestamp}-1`,
          maDanhMucChi: categories.find(c => c.maDanhMucChi === 'DMC01')?.maDanhMucChi || categories[0]?.maDanhMucChi || '',
          dienGiai: `Chi tiền nhập hàng theo phiếu nhập NVL ${pn.maPhieuNhapNVL}`,
          soTien: pn.tongTien
        }
      ]
    }));
  };

  const openEditModal = (payment) => {
    setEditingId(payment.maPhieuChi);
    setSelectedPurchase(null);
    setSelectedPayroll(null);
    setCreateTab('manual');
    setFormData({
      maPhieuChi: payment.maPhieuChi,
      ngayChi: String(payment.ngayChi).slice(0, 10),
      maDoiTuong: payment.maDoiTuong || '', lyDoChi: payment.lyDoChi || '',
      phuongThucChi: payment.phuongThucChi || 'CK', maTaiKhoanQuy: payment.maTaiKhoanQuy || '',
      maPhieuNhapNVL: payment.maPhieuNhapNVL || '', maBangLuong: payment.maBangLuong || '',
      items: (payment.chiTiets || payment.chi_tiets || []).map(item => ({
        maChiTietChi: item.maChiTietChi, maDanhMucChi: item.maDanhMucChi || '', dienGiai: item.dienGiai || '', soTien: item.soTien,
      })),
    });
    setModalOpen(true);
  };

  const handleSelectPayroll = (bl) => {
    setSelectedPayroll(bl);
    setSelectedPurchase(null);
    const timestamp = Date.now().toString().slice(-6);
    const matchedDt = counterparties.find(c => c.loaiDoiTuong === 'NV' && c.maThamChieu === bl.maNV);

    setFormData(prev => ({
      ...prev,
      maBangLuong: bl.maBangLuong,
      maPhieuNhapNVL: '',
      maDoiTuong: matchedDt ? matchedDt.maDoiTuong : prev.maDoiTuong,
      soTien: bl.thucLanh,
      phuongThucChi: 'CK',
      lyDoChi: `Chi trả lương kỳ ${bl.thangNam} cho nhân viên ${bl.tenNV} (Mã BL: ${bl.maBangLuong})`,
      items: [
        {
          maChiTietChi: `CTPC-${timestamp}-1`,
          maDanhMucChi: categories.find(c => c.maDanhMucChi === 'DMC02')?.maDanhMucChi || categories[0]?.maDanhMucChi || '',
          dienGiai: `Lương thực lãnh tháng ${bl.thangNam} - ${bl.tenNV}`,
          soTien: bl.thucLanh
        }
      ]
    }));
  };

  const handleAddItem = () => {
    const timestamp = Date.now().toString().slice(-4);
    const newIdx = formData.items.length + 1;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { maChiTietChi: `CTPC-${timestamp}-${newIdx}`, maDanhMucChi: categories[0]?.maDanhMucChi || '', dienGiai: '', soTien: 0 }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('Phiếu chi phải có ít nhất 1 dòng chi tiết');
      return;
    }
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.soTien) || 0), 0);
  };

  // Kiểm tra hạn mức quỹ (FI-BR04, FI-FR07)
  const selectedAccountObj = accounts.find(a => a.maTaiKhoanQuy === formData.maTaiKhoanQuy);
  const currentAccBalance = selectedAccountObj ? parseFloat(selectedAccountObj.soDuHienTai) : 0;
  const isOverBudget = calculateTotal() > currentAccBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = calculateTotal();
    if (total <= 0) {
      alert('Tổng số tiền phiếu chi phải lớn hơn 0');
      return;
    }

    try {
      const payload = { ...formData, soTien: total };
      const res = editingId
        ? await PaymentAPI.updatePayment(editingId, payload)
        : await PaymentAPI.createPayment(payload);
      if (res.data.success) {
        setModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      alert('Lỗi tạo phiếu chi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (payment) => {
    if (currentRole !== 'KeToanTruong') {
      alert('Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền phê duyệt phiếu chi tiền (Quy tắc 2.5.4.3 d).');
      return;
    }

    const acc = accounts.find(a => a.maTaiKhoanQuy === payment.maTaiKhoanQuy);
    if (acc && acc.soDuHienTai < payment.soTien) {
      alert(`Hạn mức không đủ: Số dư quỹ hiện tại (${Number(acc.soDuHienTai).toLocaleString()} VNĐ) không đủ để chi ${Number(payment.soTien).toLocaleString()} VNĐ (FI-BR04 / FI-FR07).`);
      return;
    }

    if (!window.confirm(`Xác nhận phê duyệt phiếu chi ${payment.maPhieuChi}? Số dư tài khoản quỹ sẽ tự động trừ ${Number(payment.soTien).toLocaleString()} VNĐ.`)) return;
    try {
      const res = await PaymentAPI.approvePayment(payment.maPhieuChi);
      if (res.data.success) {
        alert(res.data.message);
        fetchPayments();
        fetchDropdowns();
      }
    } catch (err) {
      alert('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id) => {
    if (currentRole !== 'KeToanTruong') {
      alert('Từ chối quyền: Chỉ Kế toán trưởng mới có quyền hủy phiếu chi.');
      return;
    }

    const lyDoHuy = window.prompt(`Nhập lý do hủy phiếu chi ${id} (Số dư quỹ sẽ được hoàn lại nếu đã duyệt):`, 'Hủy theo yêu cầu kế toán');
    if (lyDoHuy === null) return;

    try {
      const res = await PaymentAPI.cancelPayment(id, { lyDoHuy });
      if (res.data.success) {
        alert(res.data.message);
        fetchPayments();
        fetchDropdowns();
      }
    } catch (err) {
      alert('Lỗi hủy phiếu chi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSendToReconcile = async (id) => {
    if (!window.confirm(`Chuyển phiếu chi ${id} sang trạng thái Chờ đối soát ngân hàng (FI-FR06)?`)) return;
    try {
      const res = await PaymentAPI.sendToReconcile(id);
      if (res.data.success) {
        alert(res.data.message);
        fetchPayments();
      }
    } catch (err) {
      alert('Lỗi chuyển trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCompleteReconciliation = async (payment) => {
    if (!window.confirm(`Xác nhận khớp lệnh đối soát cho phiếu chi ${payment.maPhieuChi}? Số dư quỹ sẽ được ghi nhận.`)) return;
    try {
      const res = await PaymentAPI.completeReconciliation(payment.maPhieuChi);
      if (res.data.success) {
        alert(res.data.message);
        fetchPayments();
        fetchDropdowns();
      }
    } catch (err) {
      alert('Lỗi khớp lệnh: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xác nhận xóa phiếu chi ${id}? Chỉ xóa được phiếu ở trạng thái Mới.`)) return;
    try {
      const res = await PaymentAPI.deletePayment(id);
      if (res.data.success) fetchPayments();
    } catch (err) {
      alert('Lỗi xóa phiếu chi: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DaDuyet':
        return (
          <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-200 flex items-center space-x-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã Duyệt (Trừ Quỹ)</span>
          </span>
        );
      case 'ChoDoiSoat':
        return (
          <span className="bg-blue-50 text-[#0B2341] font-bold px-2.5 py-1 rounded-full text-[10px] border border-blue-200 flex items-center space-x-1 w-fit">
            <Scale className="w-3 h-3" />
            <span>Chờ Đối Soát (FI-FR06)</span>
          </span>
        );
      case 'Huy':
        return (
          <span className="bg-slate-100 text-slate-500 font-bold px-2.5 py-1 rounded-full text-[10px] border border-slate-200 flex items-center space-x-1 w-fit">
            <Ban className="w-3 h-3 text-red-500" />
            <span>Đã Hủy</span>
          </span>
        );
      default:
        return (
          <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-amber-200 flex items-center space-x-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>Mới Lập (Chờ Duyệt)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <ArrowUpRight className="w-6 h-6 text-rose-600" />
            <span>Quản Lý Phiếu Chi Tiền (FI-FR04, FI-BR02)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập phiếu chi từ Phiếu Nhập NVL (Kho) hoặc Bảng Lương (Nhân sự), kiểm duyệt hạn mức số dư quỹ theo chuẩn VAS.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {currentRole !== 'KeToanTruong' && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-md text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Chỉ Kế toán trưởng có quyền duyệt</span>
            </div>
          )}
          <button
            onClick={openCreateModal}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Phiếu Chi Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Moi">Mới lập</option>
            <option value="DaDuyet">Đã duyệt</option>
            <option value="ChoDoiSoat">Chờ đối soát</option>
            <option value="Huy">Đã hủy</option>
          </select>

          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Từ:</span>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
              className="bg-transparent focus:outline-none text-xs"
            />
            <span>Đến:</span>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
              className="bg-transparent focus:outline-none text-xs"
            />
          </div>
        </div>

        <button
          onClick={fetchPayments}
          className="p-2 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-10"></th>
                <th className="py-3.5 px-4">Mã Phiếu Chi</th>
                <th className="py-3.5 px-4">Ngày Chi</th>
                <th className="py-3.5 px-4">Đối Tượng Nhận</th>
                <th className="py-3.5 px-4">Lý Do Chi / Nguồn Gốc</th>
                <th className="py-3.5 px-4 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3.5 px-4">Tài Khoản Quỹ</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400 font-medium">
                    Đang tải danh sách phiếu chi...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400 font-medium">
                    Không tìm thấy phiếu chi nào
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((pc) => {
                  const isExpanded = expandedRows[pc.maPhieuChi];
                  return (
                    <React.Fragment key={pc.maPhieuChi}>
                      <tr className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleRow(pc.maPhieuChi)}
                            className="p-1 hover:bg-slate-200 rounded-md transition text-slate-400 cursor-pointer"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-700">{pc.maPhieuChi}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {pc.ngayChi ? new Date(pc.ngayChi).toLocaleDateString('vi-VN') : ''}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{(pc.doiTuong || pc.doi_tuong)?.tenDoiTuong ?? 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{pc.maDoiTuong}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">
                          <div>{pc.lyDoChi || 'Không có ghi chú'}</div>
                          {pc.maPhieuNhapNVL && (
                            <span className="inline-block mt-1 bg-red-50 text-red-700 border border-red-200 font-mono text-[9px] px-1.5 py-0.5 rounded mr-1">
                              Kho: {pc.maPhieuNhapNVL}
                            </span>
                          )}
                          {pc.maBangLuong && (
                            <span className="inline-block mt-1 bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[9px] px-1.5 py-0.5 rounded">
                              Lương: {pc.maBangLuong}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700 font-mono text-sm">
                          {Number(pc.soTien).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">{(pc.taiKhoanQuy || pc.tai_khoan_quy)?.tenTaiKhoanQuy ?? 'N/A'}</div>
                          <div className="text-[10px] text-slate-400">
                            {pc.phuongThucChi === 'CK' ? 'Chuyển khoản' : 'Tiền mặt'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">{getStatusBadge(pc.trangThai)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {pc.trangThai === 'Moi' && (
                              <>
                                <button onClick={() => openEditModal(pc)} className="p-1.5 text-slate-500 hover:text-[#0052FF] hover:bg-blue-50 rounded-lg transition cursor-pointer" title="Sửa phiếu chi">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApprove(pc)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    currentRole === 'KeToanTruong' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-300'
                                  }`}
                                  title={currentRole === 'KeToanTruong' ? 'Duyệt phiếu chi' : 'Chỉ Kế toán trưởng có thẩm quyền duyệt'}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSendToReconcile(pc.maPhieuChi)}
                                  className="p-1.5 text-[#0052FF] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                  title="Chuyển sang Chờ đối soát ngân hàng"
                                >
                                  <Scale className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(pc.maPhieuChi)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Xóa phiếu chi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {pc.trangThai === 'ChoDoiSoat' && (
                              <button
                                onClick={() => handleCompleteReconciliation(pc)}
                                className="px-2 py-1 bg-[#0B2341] hover:bg-[#132F4C] text-white rounded-md text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                                title="Khớp lệnh đối soát và ghi sổ quỹ"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Khớp Lệnh</span>
                              </button>
                            )}

                            {pc.trangThai === 'DaDuyet' && currentRole === 'KeToanTruong' && (
                              <button
                                onClick={() => handleCancel(pc.maPhieuChi)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Hủy phiếu chi & hoàn nguyên quỹ"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Detail Sub-table */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan="9" className="p-4">
                            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-3">
                              <h4 className="font-bold text-xs text-slate-700 flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#0052FF]" />
                                <span>Chi Tiết Khoản Mục Chi ({(pc.chiTiets || pc.chi_tiets)?.length || 0} khoản)</span>
                              </h4>
                              <table className="w-full text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-semibold">
                                  <tr>
                                    <th className="py-2 px-3 text-left">Mã Chi Tiết</th>
                                    <th className="py-2 px-3 text-left">Khoản Mục Chi</th>
                                    <th className="py-2 px-3 text-left">Diễn Giải Cụ Thể</th>
                                    <th className="py-2 px-3 text-right">Số Tiền (VNĐ)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {(pc.chiTiets || pc.chi_tiets)?.map((ct) => (
                                    <tr key={ct.maChiTietChi}>
                                      <td className="py-2 px-3 font-mono text-slate-600">{ct.maChiTietChi}</td>
                                      <td className="py-2 px-3 font-medium text-slate-800">
                                        {(ct.danhMucChi || ct.danh_muc_chi)?.tenDanhMucChi ?? 'N/A'}
                                      </td>
                                      <td className="py-2 px-3 text-slate-600">{ct.dienGiai || '-'}</td>
                                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                                        {Number(ct.soTien).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                                <span>Người lập: <strong>{(pc.nhanVienLap || pc.nhan_vien_lap)?.hoTen ?? pc.nguoiLap}</strong></span>
                                {pc.nguoiDuyet && (
                                  <span>Người duyệt: <strong>{(pc.nhanVienDuyet || pc.nhan_vien_duyet)?.hoTen ?? pc.nguoiDuyet}</strong></span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={payments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modal Lập Phiếu Chi Mới */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-3xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5" />
                <h3 className="font-bold text-sm">Lập Phiếu Chi Tiền (FI-FR04, FI-BR02)</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/70 hover:text-white rounded-lg p-1 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Header */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 shrink-0">
              <button
                onClick={() => setCreateTab('purchase')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'purchase' ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Từ Phiếu Nhập Kho NVL</span>
              </button>
              <button
                onClick={() => setCreateTab('payroll')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'payroll' ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Từ Bảng Lương Nhân Sự</span>
              </button>
              <button
                onClick={() => setCreateTab('manual')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'manual' ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Chi Phí Khác (Thủ Công)</span>
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {/* Tab 1: Pending Purchases Table */}
              {createTab === 'purchase' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn Phiếu Nhập NVL chưa thanh toán ({pendingPurchases.length} phiếu):
                    </span>
                    <button
                      type="button"
                      onClick={fetchPendingPurchases}
                      className="text-[11px] text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingPurchases ? 'animate-spin' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Mã Phiếu Nhập</th>
                          <th className="py-2 px-3">Ngày Nhập</th>
                          <th className="py-2 px-3">Nhà Cung Cấp</th>
                          <th className="py-2 px-3 text-right">Tổng Tiền (VNĐ)</th>
                          <th className="py-2 px-3 text-center">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingPurchases ? (
                          <tr><td colSpan="5" className="text-center py-4 text-slate-400">Đang tải...</td></tr>
                        ) : pendingPurchases.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-4 text-slate-400">Không có phiếu nhập NVL nào chờ thanh toán</td></tr>
                        ) : (
                          pendingPurchases.map((pn) => (
                            <tr
                              key={pn.maPhieuNhapNVL}
                              className={`hover:bg-rose-50/60 transition ${selectedPurchase?.maPhieuNhapNVL === pn.maPhieuNhapNVL ? 'bg-rose-50 border-l-4 border-rose-600' : ''}`}
                            >
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{pn.maPhieuNhapNVL}</td>
                              <td className="py-2 px-3 text-slate-600">{pn.ngayNhap}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{pn.tenNCC}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                                {Number(pn.tongTien).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectPurchase(pn)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition"
                                >
                                  Chọn
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedPurchase && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-900 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Đã chọn: <strong>{selectedPurchase.maPhieuNhapNVL}</strong> - NCC: <strong>{selectedPurchase.tenNCC}</strong> ({Number(selectedPurchase.tongTien).toLocaleString()} VNĐ)</span>
                      </div>
                      <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded">FI-BR02</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Pending Payrolls Table */}
              {createTab === 'payroll' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn Bảng Lương nhân viên chưa thanh toán ({pendingPayrolls.length} bảng lương):
                    </span>
                    <button
                      type="button"
                      onClick={fetchPendingPayrolls}
                      className="text-[11px] text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingPayrolls ? 'animate-spin' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Mã Bảng Lương</th>
                          <th className="py-2 px-3">Kỳ Tháng</th>
                          <th className="py-2 px-3">Nhân Viên</th>
                          <th className="py-2 px-3 text-right">Thực Lãnh (VNĐ)</th>
                          <th className="py-2 px-3 text-center">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingPayrolls ? (
                          <tr><td colSpan="5" className="text-center py-4 text-slate-400">Đang tải...</td></tr>
                        ) : pendingPayrolls.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-4 text-slate-400">Không có bảng lương nào chờ chi tiền</td></tr>
                        ) : (
                          pendingPayrolls.map((bl) => (
                            <tr
                              key={bl.maBangLuong}
                              className={`hover:bg-blue-50/60 transition ${selectedPayroll?.maBangLuong === bl.maBangLuong ? 'bg-blue-50 border-l-4 border-[#0052FF]' : ''}`}
                            >
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{bl.maBangLuong}</td>
                              <td className="py-2 px-3 text-slate-600">{bl.thangNam}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{bl.tenNV}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-[#0B2341]">
                                {Number(bl.thucLanh).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectPayroll(bl)}
                                  className="px-2.5 py-1 bg-[#0B2341] hover:bg-[#132F4C] text-white rounded-md text-[10px] font-bold cursor-pointer transition"
                                >
                                  Chọn
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedPayroll && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-[#0B2341] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                        <span>Đã chọn: <strong>{selectedPayroll.maBangLuong}</strong> - NV: <strong>{selectedPayroll.tenNV}</strong> ({Number(selectedPayroll.thucLanh).toLocaleString()} VNĐ)</span>
                      </div>
                      <span className="text-[10px] bg-purple-200 text-[#0B2341] font-bold px-2 py-0.5 rounded">FI-BR02</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Input Fields */}
              <form id="pcForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã Phiếu Chi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.maPhieuChi}
                      onChange={(e) => setFormData({ ...formData, maPhieuChi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày Chi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.ngayChi}
                      onChange={(e) => setFormData({ ...formData, ngayChi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Đối Tượng Nhận <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maDoiTuong}
                      onChange={(e) => setFormData({ ...formData, maDoiTuong: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      {counterparties.map((dt) => (
                        <option key={dt.maDoiTuong} value={dt.maDoiTuong}>
                          {dt.tenDoiTuong} ({dt.loaiDoiTuong})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Tài Khoản Quỹ / Ngân Hàng <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[10px] font-mono font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                        Số dư: {currentAccBalance.toLocaleString()} đ
                      </span>
                    </div>
                    <select
                      value={formData.maTaiKhoanQuy}
                      onChange={(e) => setFormData({ ...formData, maTaiKhoanQuy: e.target.value })}
                      className={`w-full bg-slate-50 border text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                        isOverBudget ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-rose-400'
                      }`}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.maTaiKhoanQuy} value={acc.maTaiKhoanQuy}>
                          {acc.tenTaiKhoanQuy} (Dư: {Number(acc.soDuHienTai).toLocaleString()} đ)
                        </option>
                      ))}
                    </select>
                    {isOverBudget && (
                      <span className="text-[10px] text-red-600 mt-1 block">
                        Cảnh báo: Tổng tiền chi vượt quá số dư khả dụng (FI-BR04 / FI-FR07)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phương Thức Chi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.phuongThucChi}
                      onChange={(e) => setFormData({ ...formData, phuongThucChi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="CK">Chuyển khoản ngân hàng (CK)</option>
                      <option value="TM">Tiền mặt (TM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lý Do Chi
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thanh toán tiền mua nguyên vật liệu..."
                    value={formData.lyDoChi}
                    onChange={(e) => setFormData({ ...formData, lyDoChi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                {/* Items detail list */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Chi Tiết Khoản Mục Chi:</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm dòng</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        <select
                          value={item.maDanhMucChi}
                          onChange={(e) => handleItemChange(idx, 'maDanhMucChi', e.target.value)}
                          className="w-44 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.maDanhMucChi} value={cat.maDanhMucChi}>
                              {cat.tenDanhMucChi}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Diễn giải chi tiết..."
                          value={item.dienGiai}
                          onChange={(e) => handleItemChange(idx, 'dienGiai', e.target.value)}
                          className="flex-1 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />

                        <input
                          type="number"
                          placeholder="Số tiền"
                          min="0"
                          value={item.soTien}
                          onChange={(e) => handleItemChange(idx, 'soTien', e.target.value)}
                          className="w-36 bg-white border border-slate-200 text-xs font-mono font-bold text-right text-rose-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md cursor-pointer"
                          title="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">Tổng cộng:</span>
                      <strong className={`text-base font-mono font-bold ${isOverBudget ? 'text-red-600' : 'text-rose-700'}`}>
                        {calculateTotal().toLocaleString()} VNĐ
                      </strong>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-md transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="pcForm"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-md shadow-sm transition cursor-pointer"
              >
                Lưu Phiếu Chi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
