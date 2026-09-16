import React, { useEffect, useState } from 'react';
import { ReceiptAPI, FinanceMasterDataAPI } from '../../services/financeApi';
import { 
  ArrowDownLeft, 
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
  ShieldAlert
} from 'lucide-react';

export default function PhieuThu() {
  const [receipts, setReceipts] = useState([]);
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

  // Pending Sales Receipts (FI-BR01)
  const [pendingSales, setPendingSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [createTab, setCreateTab] = useState('sales'); // 'sales' | 'manual'
  const [selectedSale, setSelectedSale] = useState(null);

  const [formData, setFormData] = useState({
    maPhieuThu: '',
    ngayThu: new Date().toISOString().split('T')[0],
    maDoiTuong: '',
    lyDoThu: '',
    phuongThucThu: 'TM',
    maTaiKhoanQuy: '',
    maThanhToan: '',
    maCongNo: '',
    maHoaDon: '',
    items: [
      { maChiTietThu: 'CT1', maDanhMucThu: '', dienGiai: '', soTien: 0 }
    ],
  });

  useEffect(() => {
    fetchReceipts();
    fetchDropdowns();

    const handleRoleChanged = (e) => {
      setCurrentRole(e.detail || localStorage.getItem('vinamilk_finance_role') || 'KeToanTruong');
    };
    window.addEventListener('finance_role_changed', handleRoleChanged);
    return () => window.removeEventListener('finance_role_changed', handleRoleChanged);
  }, [trangThai, tuNgay, denNgay]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await ReceiptAPI.getReceipts({ trangThai, tuNgay, denNgay });
      if (res.data.success) {
        setReceipts(res.data.data || []);
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
        FinanceMasterDataAPI.getRevCategories(),
      ]);
      if (dtRes.data.success) setCounterparties(dtRes.data.data || []);
      if (accRes.data.success) setAccounts(accRes.data.data || []);
      if (catRes.data.success) setCategories(catRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingSales = async () => {
    setLoadingSales(true);
    try {
      const res = await ReceiptAPI.getPendingSales();
      if (res.data.success) {
        setPendingSales(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSales(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    const timestamp = Date.now().toString().slice(-6);
    setSelectedSale(null);
    setCreateTab('sales');
    setFormData({
      maPhieuThu: `PT-${timestamp}`,
      ngayThu: new Date().toISOString().split('T')[0],
      maDoiTuong: counterparties[0]?.maDoiTuong || '',
      lyDoThu: '',
      phuongThucThu: 'TM',
      maTaiKhoanQuy: accounts[0]?.maTaiKhoanQuy || '',
      maThanhToan: '',
      maCongNo: '',
      maHoaDon: '',
      items: [
        { maChiTietThu: `CTPT-${timestamp}-1`, maDanhMucThu: categories[0]?.maDanhMucThu || '', dienGiai: '', soTien: 0 }
      ],
    });
    setModalOpen(true);
    fetchPendingSales();
  };

  const handleSelectSaleRecord = (sale) => {
    setSelectedSale(sale);
    const timestamp = Date.now().toString().slice(-6);
    
    // Tìm đối tượng khớp với khách hàng nếu có
    const matchedDt = counterparties.find(c => c.loaiDoiTuong === 'KH' && c.maThamChieu === sale.maKhachHang);

    setFormData(prev => ({
      ...prev,
      maThanhToan: sale.maThanhToan,
      maCongNo: sale.maCongNo || '',
      maHoaDon: sale.maHoaDon || '',
      maDoiTuong: matchedDt ? matchedDt.maDoiTuong : prev.maDoiTuong,
      soTien: sale.soTien,
      phuongThucThu: sale.phuongThucThanhToan === 'Chuyển khoản' ? 'CK' : 'TM',
      lyDoThu: `Thu tiền bán hàng đợt thanh toán ${sale.maThanhToan} (Đơn hàng: ${sale.maDonHang})`,
      items: [
        {
          maChiTietThu: `CTPT-${timestamp}-1`,
          maDanhMucThu: categories.find(c => c.maDanhMucThu === 'DMT01')?.maDanhMucThu || categories[0]?.maDanhMucThu || '',
          dienGiai: `Thanh toán đơn hàng ${sale.maDonHang} - Khách hàng ${sale.tenKhachHang}`,
          soTien: sale.soTien
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
        { maChiTietThu: `CTPT-${timestamp}-${newIdx}`, maDanhMucThu: categories[0]?.maDanhMucThu || '', dienGiai: '', soTien: 0 }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('Phiếu thu phải có ít nhất 1 dòng chi tiết');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = calculateTotal();
    if (total <= 0) {
      alert('Tổng số tiền phiếu thu phải lớn hơn 0');
      return;
    }

    const payload = {
      ...formData,
      soTien: total,
    };

    try {
      const res = await ReceiptAPI.createReceipt(payload);
      if (res.data.success) {
        setModalOpen(false);
        fetchReceipts();
      }
    } catch (err) {
      alert('Lỗi tạo phiếu thu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (id) => {
    if (currentRole !== 'KeToanTruong') {
      alert('Từ chối quyền: Chỉ Kế toán trưởng mới có thẩm quyền phê duyệt phiếu thu tiền (Quy tắc 2.5.4.2 d). Hãy chuyển vai trò ở góc phải phía trên.');
      return;
    }

    if (window.confirm(`Xác nhận phê duyệt phiếu thu ${id}? Số dư quỹ sẽ tự động tăng tương ứng.`)) {
      try {
        const res = await ReceiptAPI.approveReceipt(id);
        if (res.data.success) {
          alert(res.data.message);
          fetchReceipts();
        }
      } catch (err) {
        alert('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSendToReconcile = async (id) => {
    if (window.confirm(`Chuyển phiếu thu ${id} sang trạng thái Chờ đối soát ngân hàng (FI-FR06)?`)) {
      try {
        const res = await ReceiptAPI.sendToReconcile(id);
        if (res.data.success) {
          alert(res.data.message);
          fetchReceipts();
        }
      } catch (err) {
        alert('Lỗi chuyển trạng thái: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCancel = async (id) => {
    if (currentRole !== 'KeToanTruong') {
      alert('Từ chối quyền: Chỉ Kế toán trưởng mới có quyền hủy phiếu thu.');
      return;
    }

    const lyDoHuy = window.prompt(`Nhập lý do hủy phiếu thu ${id} (Số dư quỹ sẽ được hoàn nguyên nếu đã duyệt):`, 'Hủy theo yêu cầu kế toán');
    if (lyDoHuy !== null) {
      try {
        const res = await ReceiptAPI.cancelReceipt(id, { lyDoHuy });
        if (res.data.success) {
          alert(res.data.message);
          fetchReceipts();
        }
      } catch (err) {
        alert('Lỗi hủy phiếu thu: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Xác nhận xóa phiếu thu ${id}? Chỉ xóa được phiếu ở trạng thái Mới.`)) {
      try {
        const res = await ReceiptAPI.deleteReceipt(id);
        if (res.data.success) {
          fetchReceipts();
        }
      } catch (err) {
        alert('Lỗi xóa phiếu thu: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DaDuyet':
        return (
          <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px] border border-emerald-200 flex items-center space-x-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã Duyệt (Tăng Quỹ)</span>
          </span>
        );
      case 'ChoDoiSoat':
        return (
          <span className="bg-blue-50/60 text-[#0B2341] font-bold px-2.5 py-1 rounded-full text-[10px] border border-blue-200 flex items-center space-x-1 w-fit">
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
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            <span>Quản Lý Phiếu Thu Tiền (FI-FR02, FI-BR01)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập phiếu thu từ chứng từ Bán Hàng hoặc thủ công, kiểm duyệt tự động tăng số dư quỹ theo chuẩn mực kế toán.
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Phiếu Thu Mới</span>
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
          onClick={fetchReceipts}
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
                <th className="py-3.5 px-4">Mã Phiếu Thu</th>
                <th className="py-3.5 px-4">Ngày Thu</th>
                <th className="py-3.5 px-4">Đối Tượng Nộp</th>
                <th className="py-3.5 px-4">Lý Do Thu / Nguồn Gốc</th>
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
                    Đang tải danh sách phiếu thu...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400 font-medium">
                    Không tìm thấy phiếu thu nào
                  </td>
                </tr>
              ) : (
                receipts.map((pt) => {
                  const isExpanded = expandedRows[pt.maPhieuThu];
                  return (
                    <React.Fragment key={pt.maPhieuThu}>
                      <tr className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleRow(pt.maPhieuThu)}
                            className="p-1 hover:bg-slate-200 rounded-md transition text-slate-400 cursor-pointer"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {pt.maPhieuThu}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {pt.ngayThu ? new Date(pt.ngayThu).toLocaleDateString('vi-VN') : ''}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {pt.doiTuong ? pt.doiTuong.tenDoiTuong : 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {pt.maDoiTuong}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">
                          <div>{pt.lyDoThu || 'Không có ghi chú'}</div>
                          {pt.maThanhToan && (
                            <span className="inline-block mt-1 bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[9px] px-1.5 py-0.5 rounded">
                              Nguồn: Bán hàng ({pt.maThanhToan})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono text-sm">
                          {Number(pt.soTien).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700">
                            {pt.taiKhoanQuy ? pt.taiKhoanQuy.tenTaiKhoanQuy : 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Hình thức: {pt.phuongThucThu === 'CK' ? 'Chuyển khoản' : 'Tiền mặt'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(pt.trangThai)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {pt.trangThai === 'Moi' && (
                              <>
                                <button
                                  onClick={() => handleApprove(pt.maPhieuThu)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    currentRole === 'KeToanTruong'
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-slate-300 hover:text-slate-400'
                                  }`}
                                  title={currentRole === 'KeToanTruong' ? "Duyệt phiếu thu" : "Chỉ Kế toán trưởng có thẩm quyền duyệt"}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSendToReconcile(pt.maPhieuThu)}
                                  className="p-1.5 text-[#0052FF] hover:bg-blue-50/60 rounded-lg transition cursor-pointer"
                                  title="Chuyển sang Chờ đối soát ngân hàng (FI-FR06)"
                                >
                                  <Scale className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(pt.maPhieuThu)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Xóa phiếu thu"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {pt.trangThai === 'ChoDoiSoat' && (
                              <button
                                onClick={() => handleApprove(pt.maPhieuThu)}
                                className="px-2 py-1 bg-[#0B2341] hover:bg-[#132F4C] text-white rounded-md text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                                title="Khớp lệnh đối soát và duyệt vào quỹ"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Khớp Lệnh</span>
                              </button>
                            )}

                            {pt.trangThai === 'DaDuyet' && currentRole === 'KeToanTruong' && (
                              <button
                                onClick={() => handleCancel(pt.maPhieuThu)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Hủy phiếu thu & hoàn nguyên số dư"
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
                                <span>Chi Tiết Khoản Mục Thu ({pt.chiTiets?.length || 0} khoản)</span>
                              </h4>
                              <table className="w-full text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-semibold">
                                  <tr>
                                    <th className="py-2 px-3 text-left">Mã Chi Tiết</th>
                                    <th className="py-2 px-3 text-left">Khoản Mục Thu</th>
                                    <th className="py-2 px-3 text-left">Diễn Giải Cụ Thể</th>
                                    <th className="py-2 px-3 text-right">Số Tiền (VNĐ)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {pt.chiTiets?.map((ct) => (
                                    <tr key={ct.maChiTietThu}>
                                      <td className="py-2 px-3 font-mono text-slate-600">{ct.maChiTietThu}</td>
                                      <td className="py-2 px-3 font-medium text-slate-800">
                                        {ct.danhMucThu ? ct.danhMucThu.tenDanhMucThu : 'N/A'}
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
                                <span>Người lập: <strong>{pt.nhanVienLap ? pt.nhanVienLap.hoTen : pt.nguoiLap}</strong></span>
                                {pt.nguoiDuyet && (
                                  <span>Người duyệt: <strong>{pt.nhanVienDuyet ? pt.nhanVienDuyet.hoTen : pt.nguoiDuyet}</strong></span>
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

      {/* Modal Lập Phiếu Thu Mới (2 Tabs: From Sales vs Manual) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 -xs p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-3xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="w-5 h-5" />
                <h3 className="font-bold text-sm">Lập Phiếu Thu Tiền (FI-FR02, FI-BR01)</h3>
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
                onClick={() => setCreateTab('sales')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'sales'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Từ Chứng Từ Bán Hàng (FI-BR01)</span>
              </button>
              <button
                onClick={() => setCreateTab('manual')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
                  createTab === 'manual'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Lập Thu Tiền Khác (Thủ Công)</span>
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {/* Tab 1: Select Pending Sales Payment */}
              {createTab === 'sales' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn chứng từ thanh toán bán hàng chưa lập phiếu thu ({pendingSales.length} chứng từ sẵn sàng):
                    </span>
                    <button
                      type="button"
                      onClick={fetchPendingSales}
                      className="text-[11px] text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingSales ? 'animate-spin' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Mã Thanh Toán</th>
                          <th className="py-2 px-3">Đơn Hàng</th>
                          <th className="py-2 px-3">Khách Hàng</th>
                          <th className="py-2 px-3 text-right">Số Tiền (VNĐ)</th>
                          <th className="py-2 px-3 text-center">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingSales ? (
                          <tr><td colSpan="5" className="text-center py-4 text-slate-400">Đang tải...</td></tr>
                        ) : pendingSales.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-4 text-slate-400">Không có chứng từ bán hàng nào chờ thu tiền</td></tr>
                        ) : (
                          pendingSales.map((sale) => (
                            <tr
                              key={sale.maThanhToan}
                              className={`hover:bg-emerald-50/60 transition ${selectedSale?.maThanhToan === sale.maThanhToan ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''}`}
                            >
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{sale.maThanhToan}</td>
                              <td className="py-2 px-3 font-mono text-slate-600">{sale.maDonHang}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{sale.tenKhachHang}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                                {Number(sale.soTien).toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectSaleRecord(sale)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition"
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

                  {selectedSale && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Đã chọn: <strong>{selectedSale.maThanhToan}</strong> - KH: <strong>{selectedSale.tenKhachHang}</strong> (Số tiền: <strong>{Number(selectedSale.soTien).toLocaleString()} VNĐ</strong>)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded">Khớp FI-BR01</span>
                    </div>
                  )}
                </div>
              )}

              {/* Form Input Fields */}
              <form id="ptForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã Phiếu Thu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.maPhieuThu}
                      onChange={(e) => setFormData({ ...formData, maPhieuThu: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày Thu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.ngayThu}
                      onChange={(e) => setFormData({ ...formData, ngayThu: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Đối Tượng Nộp <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maDoiTuong}
                      onChange={(e) => setFormData({ ...formData, maDoiTuong: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                      Tài Khoản Quỹ / Ngân Hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maTaiKhoanQuy}
                      onChange={(e) => setFormData({ ...formData, maTaiKhoanQuy: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.maTaiKhoanQuy} value={acc.maTaiKhoanQuy}>
                          {acc.tenTaiKhoanQuy} (Dư: {Number(acc.soDuHienTai).toLocaleString()} đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phương Thức Thu <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.phuongThucThu}
                      onChange={(e) => setFormData({ ...formData, phuongThucThu: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="TM">Tiền mặt (TM)</option>
                      <option value="CK">Chuyển khoản ngân hàng (CK)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lý Do Thu
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thu tiền bán sữa theo đơn hàng..."
                    value={formData.lyDoThu}
                    onChange={(e) => setFormData({ ...formData, lyDoThu: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Items detail list */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Chi Tiết Khoản Mục Thu:</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm dòng</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                        <select
                          value={item.maDanhMucThu}
                          onChange={(e) => handleItemChange(idx, 'maDanhMucThu', e.target.value)}
                          className="w-44 bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.maDanhMucThu} value={cat.maDanhMucThu}>
                              {cat.tenDanhMucThu}
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
                          className="w-36 bg-white border border-slate-200 text-xs font-mono font-bold text-right text-emerald-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
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
                      <strong className="text-base font-mono font-bold text-emerald-700">
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
                form="ptForm"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-sm transition cursor-pointer"
              >
                Lưu Phiếu Thu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
