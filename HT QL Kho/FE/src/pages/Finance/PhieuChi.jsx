import React, { useEffect, useState } from 'react';
import { PaymentAPI, FinanceMasterDataAPI } from '../../services/financeApi';
import { 
  ArrowUpRight, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  CreditCard,
  Wallet,
  X,
  AlertCircle,
  Clock,
  Ban,
  Scale,
  ShoppingBag,
  Send,
  RefreshCw,
  ShieldAlert,
  Users,
  Building2
} from 'lucide-react';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function PhieuChi() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trangThai, setTrangThai] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  // Role state
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('vinamilk_finance_role') || 'KeToanTruong';
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
    items: [
      { maChiTietChi: 'CT1', maDanhMucChi: '', dienGiai: '', soTien: 0 }
    ],
  });

  useEffect(() => {
    fetchPayments();
    fetchDropdowns();

    const handleRoleChanged = (e) => {
      setCurrentRole(e.detail || localStorage.getItem('vinamilk_finance_role') || 'KeToanTruong');
    };
    window.addEventListener('finance_role_changed', handleRoleChanged);
    return () => window.removeEventListener('finance_role_changed', handleRoleChanged);
  }, [trangThai, tuNgay, denNgay]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await PaymentAPI.getPayments({ trangThai, tuNgay, denNgay });
      if (res.data.success) {
        setPayments(res.data.data || []);
      }
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
      if (dtRes.data.success) setCounterparties(dtRes.data.data || []);
      if (accRes.data.success) setAccounts(accRes.data.data || []);
      if (catRes.data.success) setCategories(catRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingPurchases = async () => {
    setLoadingPurchases(true);
    try {
      const res = await PaymentAPI.getPendingPurchases();
      if (res.data.success) {
        setPendingPurchases(res.data.data || []);
      }
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
      if (res.data.success) {
        setPendingPayrolls(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayrolls(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
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
      lyDoChi: `Thanh toán tiền mua nguyên vật liệu phiếu nhập kho ${pn.maPhieuNhapNVL} (NCC: ${pn.tenNCC})`,
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
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { maChiTietChi: `CTPC-${timestamp}-${newIdx}`, maDanhMucChi: categories[0]?.maDanhMucChi || '', dienGiai: '', soTien: 0 }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('Phiếu chi phải có ít nhất 1 dòng chi tiết');
      return;
    }
    const updated = formData.items.filter((_, idx) => idx !== index);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.soTien) || 0), 0);
  };

  // Check account balance vs amount (FI-BR04, FI-FR07)
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

    const payload = {
      ...formData,
      soTien: total,
    };

    try {
      const res = await PaymentAPI.createPayment(payload);
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
      alert('Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền phê duyệt phiếu chi tiền (Quy tắc 2.5.4.3 d). Hãy chuyển vai trò ở góc phải phía trên.');
      return;
    }

    // Kiểm tra số dư tài khoản
    const acc = accounts.find(a => a.maTaiKhoanQuy === payment.maTaiKhoanQuy);
    if (acc && acc.soDuHienTai < payment.soTien) {
      alert(`Hạn mức không đủ: Số dư quỹ hiện tại (${Number(acc.soDuHienTai).toLocaleString()} VNĐ) không đủ để chi số tiền ${Number(payment.soTien).toLocaleString()} VNĐ (Quy tắc FI-BR04 / FI-FR07).`);
      return;
    }

    if (window.confirm(`Xác nhận phê duyệt phiếu chi ${payment.maPhieuChi}? Số dư tài khoản quỹ sẽ tự động bị trừ ${Number(payment.soTien).toLocaleString()} VNĐ.`)) {
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
    }
  };

  const handleCancel = async (id) => {
    if (currentRole !== 'KeToanTruong') {
      alert('Từ chối quyền: Chỉ Kế toán trưởng mới có quyền hủy phiếu chi.');
      return;
    }

    const lyDoHuy = window.prompt(`Nhập lý do hủy phiếu chi ${id} (Số dư quỹ sẽ được hoàn trả lại nếu đã duyệt):`, 'Hủy theo yêu cầu kế toán');
    if (lyDoHuy !== null) {
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
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Xác nhận xóa phiếu chi ${id}? Chỉ xóa được phiếu ở trạng thái Mới.`)) {
      try {
        const res = await PaymentAPI.deletePayment(id);
        if (res.data.success) {
          fetchPayments();
        }
      } catch (err) {
        alert('Lỗi xóa phiếu chi: ' + (err.response?.data?.message || err.message));
      }
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
            <ArrowUpRight className="w-6 h-6 text-red-600" />
            <span>Quản Lý Phiếu Chi Tiền (FI-FR03, FI-BR02, FI-BR04)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập phiếu chi từ Phiếu Nhập NVL (Kho), Bảng Lương (Nhân sự) hoặc thủ công, kiểm soát hạn mức ngân quỹ chặt chẽ.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {currentRole !== 'KeToanTruong' && (
            <div className="hidden sm:flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-md text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Vai trò hiện tại không có quyền duyệt</span>
            </div>
          )}
          <button
            onClick={openCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-2 cursor-pointer"
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
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Moi">Mới lập</option>
            <option value="DaDuyet">Đã duyệt</option>
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
          className="p-2 text-slate-500 hover:text-[#0052FF] rounded-md hover:bg-blue-50/60 transition cursor-pointer"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0052FF]' : ''}`} />
        </button>
      </div>

      {/* Table */}
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
                payments.map((pc) => {
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
                        <td className="py-3 px-4 font-mono font-bold text-red-700">
                          {pc.maPhieuChi}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {pc.ngayChi ? new Date(pc.ngayChi).toLocaleDateString('vi-VN') : ''}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {pc.doiTuong ? pc.doiTuong.tenDoiTuong : 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {pc.maDoiTuong}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">
                          <div>{pc.lyDoChi || 'Không có ghi chú'}</div>
                          {pc.maPhieuNhapNVL && (
                            <span className="inline-block mt-1 bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[9px] px-1.5 py-0.5 rounded">
                              Kho: {pc.maPhieuNhapNVL}
                            </span>
                          )}
                          {pc.maBangLuong && (
                            <span className="inline-block mt-1 bg-blue-50/60 text-[#0B2341] border border-blue-200 font-mono text-[9px] px-1.5 py-0.5 rounded ml-1">
                              HRM: {pc.maBangLuong}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-red-700 font-mono text-sm">
                          {Number(pc.soTien).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">
                            {pc.taiKhoanQuy ? pc.taiKhoanQuy.tenTaiKhoanQuy : 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Hình thức: {pc.phuongThucChi === 'CK' ? 'Chuyển khoản' : 'Tiền mặt'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(pc.trangThai)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {pc.trangThai === 'Moi' && (
                              <>
                                <button
                                  onClick={() => handleApprove(pc)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    currentRole === 'KeToanTruong'
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-slate-300 hover:text-slate-400'
                                  }`}
                                  title={currentRole === 'KeToanTruong' ? "Duyệt phiếu chi (Kiểm tra hạn mức & trừ quỹ)" : "Chỉ Kế toán trưởng có thẩm quyền duyệt"}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
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

                            {pc.trangThai === 'DaDuyet' && currentRole === 'KeToanTruong' && (
                              <button
                                onClick={() => handleCancel(pc.maPhieuChi)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Hủy phiếu chi & hoàn nguyên số dư quỹ"
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
                                <FileText className="w-3.5 h-3.5 text-red-600" />
                                <span>Chi Tiết Khoản Mục Chi ({pc.chiTiets?.length || 0} khoản)</span>
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
                                  {pc.chiTiets?.map((ct) => (
                                    <tr key={ct.maChiTietChi}>
                                      <td className="py-2 px-3 font-mono text-slate-600">{ct.maChiTietChi}</td>
                                      <td className="py-2 px-3 font-medium text-slate-800">
                                        {ct.danhMucChi ? ct.danhMucChi.tenDanhMucChi : 'N/A'}
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
                                <span>Người lập: <strong>{pc.nhanVienLap ? pc.nhanVienLap.hoTen : pc.nguoiLap}</strong></span>
                                {pc.nguoiDuyet && (
                                  <span>Người duyệt: <strong>{pc.nhanVienDuyet ? pc.nhanVienDuyet.hoTen : pc.nguoiDuyet}</strong></span>
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
      </div>

      {/* Modal Lập Phiếu Chi Mới (3 Tabs: Purchase vs Payroll vs Manual) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 -xs p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-3xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-red-700 to-rose-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5" />
                <h3 className="font-bold text-sm">Lập Phiếu Chi Tiền (FI-FR03, FI-BR02)</h3>
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
                  createTab === 'purchase'
                    ? 'border-red-600 text-red-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Từ Nhập Kho NVL (Kho - FI-BR02)</span>
              </button>
              <button
                onClick={() => setCreateTab('payroll')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'payroll'
                    ? 'border-red-600 text-red-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Từ Bảng Lương (Nhân Sự - FI-BR02)</span>
              </button>
              <button
                onClick={() => setCreateTab('manual')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'manual'
                    ? 'border-red-600 text-red-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Chi Phí Khác (Thủ Công)</span>
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {/* Tab 1: Purchase Pending Table */}
              {createTab === 'purchase' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn Phiếu Nhập NVL chưa thanh toán ({pendingPurchases.length} phiếu):
                    </span>
                    <button
                      type="button"
                      onClick={fetchPendingPurchases}
                      className="text-[11px] text-red-600 hover:underline flex items-center space-x-1 cursor-pointer"
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
                              className={`hover:bg-red-50/60 transition ${selectedPurchase?.maPhieuNhapNVL === pn.maPhieuNhapNVL ? 'bg-red-50 border-l-4 border-red-600' : ''}`}
                            >
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{pn.maPhieuNhapNVL}</td>
                              <td className="py-2 px-3 text-slate-600">{pn.ngayNhap}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{pn.tenNCC}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-red-700">
                                {Number(pn.tongTien).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectPurchase(pn)}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition"
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
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Đã chọn: <strong>{selectedPurchase.maPhieuNhapNVL}</strong> - NCC: <strong>{selectedPurchase.tenNCC}</strong> (Tổng: <strong>{Number(selectedPurchase.tongTien).toLocaleString()} VNĐ</strong>)</span>
                      </div>
                      <span className="text-[10px] bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded">Khớp FI-BR02</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Payroll Pending Table */}
              {createTab === 'payroll' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn Bảng Lương nhân viên chưa thanh toán ({pendingPayrolls.length} bảng lương):
                    </span>
                    <button
                      type="button"
                      onClick={fetchPendingPayrolls}
                      className="text-[11px] text-red-600 hover:underline flex items-center space-x-1 cursor-pointer"
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
                              className={`hover:bg-blue-50/60/60 transition ${selectedPayroll?.maBangLuong === bl.maBangLuong ? 'bg-blue-50/60 border-l-4 border-[#0052FF]' : ''}`}
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
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md text-xs text-[#0B2341] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-[#0052FF] shrink-0" />
                        <span>Đã chọn: <strong>{selectedPayroll.maBangLuong}</strong> - NV: <strong>{selectedPayroll.tenNV}</strong> (Thực lãnh: <strong>{Number(selectedPayroll.thucLanh).toLocaleString()} VNĐ</strong>)</span>
                      </div>
                      <span className="text-[10px] bg-purple-200 text-[#0B2341] font-bold px-2 py-0.5 rounded">Khớp FI-BR02</span>
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
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
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
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Đối Tượng Nhận <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maDoiTuong}
                      onChange={(e) => setFormData({ ...formData, maDoiTuong: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tài Khoản Quỹ Chi Tiền <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maTaiKhoanQuy}
                      onChange={(e) => setFormData({ ...formData, maTaiKhoanQuy: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.maTaiKhoanQuy} value={acc.maTaiKhoanQuy}>
                          {acc.tenTaiKhoanQuy} (Số dư: {Number(acc.soDuHienTai).toLocaleString()} VNĐ)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phương Thức Chi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.phuongThucChi}
                      onChange={(e) => setFormData({ ...formData, phuongThucChi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <option value="CK">Chuyển khoản ngân hàng (CK)</option>
                      <option value="TM">Tiền mặt (TM)</option>
                    </select>
                  </div>
                </div>

                {/* Over Budget Alert (FI-BR04, FI-FR07) */}
                {isOverBudget && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-md text-xs text-red-900 flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">CẢNH BÁO VƯỢT HẠN MỨC SỐ DƯ (FI-BR04 / FI-FR07):</strong>
                      <span>Số tiền chi yêu cầu ({calculateTotal().toLocaleString()} đ) vượt quá số dư hiện tại của tài khoản quỹ ({currentAccBalance.toLocaleString()} đ). Khi phê duyệt, hệ thống sẽ tự động chặn nếu không đủ hạn mức.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lý Do Chi
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Chi thanh toán tiền nguyên liệu đợt 1..."
                    value={formData.lyDoChi}
                    onChange={(e) => setFormData({ ...formData, lyDoChi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {/* Items detail list */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Chi Tiết Khoản Mục Chi:</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer"
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
                          className="w-36 bg-white border border-slate-200 text-xs font-mono font-bold text-right text-red-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">Tổng cộng:</span>
                      <strong className="text-base font-mono font-bold text-red-700">
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
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-sm transition cursor-pointer"
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
