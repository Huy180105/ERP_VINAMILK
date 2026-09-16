import React, { useEffect, useState } from 'react';
import { InboundAPI, MasterDataAPI } from '../../services/api';
import { 
  Layers, CheckCircle2, XCircle, Plus, Search, Filter, 
  Printer, Edit2, Trash2, PackageCheck, AlertTriangle, FileText, Calendar, User, Eye
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function InboundProducts() {
  const [receipts, setReceipts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [pendingHandovers, setPendingHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [keyword, setKeyword] = useState('');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form Data State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    maPhieuNhapSP: '',
    maNVTao: 'NV001',
    ngayNhap: todayStr,
    ghiChu: '',
    maPhieuYCXSP: '',
    items: [
      { maSP: '', soLuongNhap: 100, ngaySanXuat: todayStr, hanSuDung: '', ghiChu: '' }
    ]
  });

  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    fetchReceipts();
    fetchProductsList();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await InboundAPI.getProductReceipts();
      setReceipts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await MasterDataAPI.getProducts();
      setProductsList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDefaultExpiry = (mfgDateStr, maSP = '') => {
    if (!mfgDateStr) return '';
    const mfg = new Date(mfgDateStr);
    
    let daysToAdd = 365;
    if (maSP === 'SP003' || maSP === 'SP006') daysToAdd = 210;
    else if (maSP === 'SP004') daysToAdd = 270;
    else if (maSP === 'SP007') daysToAdd = 730;

    mfg.setDate(mfg.getDate() + daysToAdd);
    return mfg.toISOString().split('T')[0];
  };

  const handleOpenCreateModal = async () => {
    setEditingReceipt(null);
    setFormErrors([]);
    let nextCode = '';
    let handovers = [];
    try {
      const [codeRes, handoverRes] = await Promise.all([
        InboundAPI.getNextProductReceiptCode(),
        InboundAPI.getPendingProductionHandovers()
      ]);
      nextCode = codeRes.data.code;
      handovers = handoverRes.data?.data || [];
    } catch (e) {
      console.error(e);
    }
    setPendingHandovers(handovers);

    if (!nextCode) {
      nextCode = generateAutoCode(receipts, 'maPhieuNhapSP', 'PNSP', 3, true);
    }

    const defaultMfg = todayStr;
    const defaultMaSP = productsList.length > 0 ? productsList[0].maSanPham : '';
    const defaultExp = calculateDefaultExpiry(defaultMfg, defaultMaSP);

    setFormData({
      maPhieuNhapSP: nextCode,
      maNVTao: 'NV001',
      ngayNhap: todayStr,
      ghiChu: '',
      maPhieuYCXSP: '',
      items: [
        { 
          maSP: defaultMaSP, 
          soLuongNhap: 1000, 
          ngaySanXuat: defaultMfg, 
          hanSuDung: defaultExp, 
          ghiChu: '' 
        }
      ]
    });
    setIsFormModalOpen(true);
  };

  const handleSelectHandover = (code) => {
    if (!code) {
      setFormData(prev => ({ ...prev, maPhieuYCXSP: '' }));
      return;
    }
    const selected = pendingHandovers.find(h => h.maPhieuYCXSP === code);
    if (selected && selected.chi_tiets && selected.chi_tiets.length > 0) {
      const defaultMfg = selected.phieu_nghiem_thu?.ngayNghiemThu || selected.ngayYeuCau || todayStr;
      const items = selected.chi_tiets.map(ct => {
        const mfg = ct.ngaySanXuat || defaultMfg;
        const exp = ct.hanSuDung || calculateDefaultExpiry(mfg, ct.maSanPham);
        return {
          maSP: ct.maSanPham,
          soLuongNhap: ct.soLuong,
          ngaySanXuat: mfg,
          hanSuDung: exp,
          ghiChu: ct.ghiChu || `Nhập kho theo phiếu bàn giao ${code}`
        };
      });
      setFormData(prev => ({
        ...prev,
        maPhieuYCXSP: code,
        ghiChu: prev.ghiChu || `Nhập kho theo phiếu bàn giao từ SX (${code})`,
        items: items
      }));
    } else {
      setFormData(prev => ({ ...prev, maPhieuYCXSP: code }));
    }
  };

  const handleOpenEditModal = (receipt) => {
    if (!['Chờ duyệt', 'Từ chối'].includes(receipt.trangThai)) {
      alert(`Chỉ được phép sửa phiếu ở trạng thái "Chờ duyệt" hoặc "Từ chối". Phiếu hiện tại: ${receipt.trangThai}`);
      return;
    }
    setEditingReceipt(receipt);
    setFormErrors([]);
    setFormData({
      maPhieuNhapSP: receipt.maPhieuNhapSP,
      maNVTao: receipt.maNVTao || 'NV001',
      ngayNhap: receipt.ngayNhap || todayStr,
      ghiChu: receipt.ghiChu || '',
      maPhieuYCXSP: receipt.maPhieuYCXSP || '',
      items: receipt.chi_tiets && receipt.chi_tiets.length > 0 ? receipt.chi_tiets.map(item => ({
        maSP: item.maSP,
        soLuongNhap: item.soLuongNhap || 1,
        ngaySanXuat: item.ngaySanXuat || todayStr,
        hanSuDung: item.hanSuDung || calculateDefaultExpiry(item.ngaySanXuat || todayStr, item.maSP),
        ghiChu: item.ghiChu || ''
      })) : [{ maSP: '', soLuongNhap: 100, ngaySanXuat: todayStr, hanSuDung: calculateDefaultExpiry(todayStr), ghiChu: '' }]
    });
    setIsFormModalOpen(true);
  };

  const handleAddItem = () => {
    const defaultMaSP = productsList.length > 0 ? productsList[0].maSanPham : '';
    const defaultExp = calculateDefaultExpiry(todayStr, defaultMaSP);
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { maSP: defaultMaSP, soLuongNhap: 500, ngaySanXuat: todayStr, hanSuDung: defaultExp, ghiChu: '' }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      alert('Phiếu nhập phải có tối thiểu 1 sản phẩm.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      const item = { ...updatedItems[index], [field]: value };
      
      // Tự động tính hạn sử dụng nếu thay đổi ngày sản xuất hoặc mã sản phẩm
      if (field === 'ngaySanXuat' || field === 'maSP') {
        item.hanSuDung = calculateDefaultExpiry(item.ngaySanXuat || todayStr, item.maSP);
      }
      updatedItems[index] = item;
      return { ...prev, items: updatedItems };
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.ghiChu || !formData.ghiChu.trim()) {
      errors.push('Ghi chú phiếu nhập không được để trống.');
    }
    if (!formData.items || formData.items.length === 0) {
      errors.push('Danh sách sản phẩm không được để trống.');
    }

    const today = new Date(todayStr);
    const minExpiry = new Date(todayStr);
    minExpiry.setDate(minExpiry.getDate() + 180); // HSD tối thiểu phải > today + 180 ngày

    formData.items.forEach((item, idx) => {
      const rowNum = idx + 1;
      if (!item.maSP) {
        errors.push(`Dòng thứ ${rowNum}: Chưa chọn Sản phẩm.`);
      }
      if (!item.soLuongNhap || Number(item.soLuongNhap) <= 0) {
        errors.push(`Dòng thứ ${rowNum}: Số lượng nhập phải lớn hơn 0.`);
      }
      if (!item.ngaySanXuat) {
        errors.push(`Dòng thứ ${rowNum}: Ngày sản xuất không được để trống.`);
      } else {
        const mfg = new Date(item.ngaySanXuat);
        if (mfg > today) {
          errors.push(`Dòng thứ ${rowNum}: Ngày sản xuất (${item.ngaySanXuat}) không được lớn hơn ngày hiện tại (${todayStr}).`);
        }
      }
      if (!item.hanSuDung) {
        errors.push(`Dòng thứ ${rowNum}: Hạn sử dụng không được để trống.`);
      } else {
        const exp = new Date(item.hanSuDung);
        if (exp <= minExpiry) {
          const minExpStr = minExpiry.toISOString().split('T')[0];
          errors.push(`Dòng thứ ${rowNum}: Hạn sử dụng (${item.hanSuDung}) không hợp lệ! Hạn sử dụng phải lớn hơn 180 ngày tính từ ngày hiện tại (sau ngày ${minExpStr}).`);
        }
      }
    });

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingReceipt) {
        await InboundAPI.updateProductReceipt(editingReceipt.maPhieuNhapSP, formData);
        alert('Cập nhật phiếu nhập sản phẩm thành công!');
      } else {
        await InboundAPI.createProductReceipt(formData);
        alert('Tạo phiếu nhập sản phẩm mới thành công! Trạng thái ban đầu: Chờ duyệt.');
      }
      setIsFormModalOpen(false);
      fetchReceipts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setFormErrors([msg]);
    }
  };

  // Actions
  const handleApprove = async (id) => {
    if (window.confirm(`Quản lý kho xác nhận DUYỆT phiếu nhập ${id}?`)) {
      try {
        await InboundAPI.approveProductReceipt(id);
        alert(`Đã duyệt thành công phiếu nhập ${id}!`);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi phê duyệt: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm(`Quản lý kho xác nhận TỪ CHỐI phiếu nhập ${id}?`)) {
      try {
        await InboundAPI.rejectProductReceipt(id);
        alert(`Đã từ chối phiếu nhập ${id}!`);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi từ chối: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleConfirmReceived = async (id) => {
    if (window.confirm(`Xác nhận "LẤY HÀNG THÀNH CÔNG" cho phiếu nhập ${id}?\n\nTrạng thái sẽ chuyển thành THÀNH CÔNG và hệ thống sẽ tự động tạo các lô tồn kho cho từng sản phẩm.`)) {
      try {
        await InboundAPI.confirmGoodsReceived(id);
        alert(`Xác nhận lấy hàng thành công! Tồn kho các lô thành phẩm đã được ghi nhận.`);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi xác nhận: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu nhập ${id}?`)) {
      try {
        await InboundAPI.deleteProductReceipt(id);
        alert(`Đã xóa phiếu nhập ${id}!`);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleOpenPrint = (receipt) => {
    setSelectedReceipt(receipt);
    setIsPrintModalOpen(true);
  };

  const handleOpenDetail = (receipt) => {
    setSelectedReceipt(receipt);
    setIsDetailModalOpen(true);
  };

  // Filtered receipts
  const filteredReceipts = receipts.filter(r => {
    const matchStatus = filterStatus === 'ALL' || r.trangThai === filterStatus;
    const kw = keyword.toLowerCase();
    const matchKw = !kw || 
      r.maPhieuNhapSP.toLowerCase().includes(kw) || 
      (r.ghiChu && r.ghiChu.toLowerCase().includes(kw)) ||
      (r.maPhieuYCXSP && r.maPhieuYCXSP.toLowerCase().includes(kw));
    return matchStatus && matchKw;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#001E50] flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Quản Lý Phiếu Nhập Sản Phẩm (Thành Phẩm Vinamilk)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình bàn giao từ xưởng sản xuất: Lập phiếu $\rightarrow$ Quản lý kho duyệt $\rightarrow$ Xác nhận lấy hàng thành công $\rightarrow$ Cập nhật Tồn kho
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Nhập Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'Chờ duyệt', label: 'Chờ duyệt' },
              { id: 'Đã duyệt', label: 'Đã duyệt' },
              { id: 'Thành công', label: 'Thành công' },
              { id: 'Từ chối', label: 'Từ chối' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#001E50] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, ghi chú..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Phiếu</th>
                <th className="p-3">Yêu Cầu Xuất SP</th>
                <th className="p-3">NV Tạo / Ngày Nhập</th>
                <th className="p-3">Chi Tiết Sản Phẩm Nhập</th>
                <th className="p-3">Ghi Chú</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center min-w-[200px]">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Đang nạp danh sách phiếu nhập...</td></tr>
              ) : filteredReceipts.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Không tìm thấy phiếu nhập sản phẩm nào.</td></tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.maPhieuNhapSP} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-[#001E50]">{r.maPhieuNhapSP}</td>
                    <td className="p-3 font-medium text-slate-700">
                      {r.maPhieuYCXSP ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-600">{r.maPhieuYCXSP}</span>
                      ) : (
                        <span className="text-slate-400 italic">Bàn giao trực tiếp</span>
                      )}
                    </td>
                    <td className="p-3 space-y-0.5">
                      <div className="font-semibold text-slate-800 flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{r.nhan_vien_tao ? r.nhan_vien_tao.hoTen : r.maNVTao}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{r.ngayNhap}</span>
                      </div>
                    </td>
                    <td className="p-3 space-y-1">
                      {r.chi_tiets && r.chi_tiets.map((detail, idx) => (
                        <div key={idx} className="bg-blue-50/70 p-2 rounded-lg font-mono text-[11px] border border-blue-100/80 space-y-0.5">
                          <div className="font-bold text-blue-900 flex justify-between">
                            <span>{detail.san_pham ? detail.san_pham.tenSanPham : detail.maSP}</span>
                            <span className="text-blue-700">SL: {detail.soLuongNhap?.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 flex justify-between">
                            <span>NSX: {detail.ngaySanXuat}</span>
                            <span>HSD: {detail.hanSuDung}</span>
                          </div>
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs truncate" title={r.ghiChu}>
                      {r.ghiChu}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={r.trangThai} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* 1. Trạng thái CHỜ DUYỆT -> QL Kho Duyệt / Từ chối / Sửa / Xóa */}
                        {r.trangThai === 'Chờ duyệt' && (
                          <>
                            <button
                              onClick={() => handleApprove(r.maPhieuNhapSP)}
                              title="Quản lý kho Duyệt"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1 shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => handleReject(r.maPhieuNhapSP)}
                              title="Quản lý kho Từ chối"
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1 shadow-sm cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              title="Sửa thông tin phiếu"
                              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1 shadow-sm cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              onClick={() => handleDelete(r.maPhieuNhapSP)}
                              title="Xóa phiếu"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* 2. Trạng thái ĐÃ DUYỆT -> Nút LẤY HÀNG THÀNH CÔNG (Nhân viên & Quản lý) */}
                        {r.trangThai === 'Đã duyệt' && (
                          <>
                            <button
                              onClick={() => handleConfirmReceived(r.maPhieuNhapSP)}
                              title="Xác nhận Lấy hàng thành công và tạo Tồn kho"
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1.5 shadow-md animate-pulse hover:animate-none cursor-pointer"
                            >
                              <PackageCheck className="w-4 h-4" />
                              <span>Lấy Hàng Thành Công</span>
                            </button>
                            <button
                              onClick={() => handleOpenPrint(r)}
                              title="In phiếu nhập"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* 3. Trạng thái TỪ CHỐI -> Cho phép Sửa lại, Xem chi tiết hoặc Xóa */}
                        {r.trangThai === 'Từ chối' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              title="Sửa & Gửi lại phiếu"
                              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1 shadow-sm cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa & Gửi lại</span>
                            </button>
                            <button
                              onClick={() => handleOpenDetail(r)}
                              title="Xem chi tiết"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.maPhieuNhapSP)}
                              title="Xóa phiếu từ chối"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* 4. Trạng thái THÀNH CÔNG / ĐÃ HOÀN THÀNH -> Chỉ cho phép Xem chi tiết & In phiếu (Không sửa) */}
                        {(r.trangThai === 'Thành công' || r.trangThai === 'Đã hoàn thành') && (
                          <>
                            <button
                              onClick={() => handleOpenDetail(r)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Chi tiết</span>
                            </button>
                            <button
                              onClick={() => handleOpenPrint(r)}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center space-x-1 shadow-sm cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>In phiếu</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM / SỬA PHIẾU NHẬP SẢN PHẨM */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-[#001E50] flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{editingReceipt ? 'Sửa Phiếu Nhập Sản Phẩm' : 'Lập Phiếu Nhập Sản Phẩm Mới'}</span>
              </h2>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {formErrors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Vui lòng kiểm tra lại các thông tin không hợp lệ:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-2">
                  {formErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Receipt Information Headers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Mã Phiếu Nhập</label>
                  <input
                    type="text"
                    value={formData.maPhieuNhapSP}
                    disabled
                    className="w-full bg-slate-200/70 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#001E50]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">NV Tạo Phiếu</label>
                  <input
                    type="text"
                    value="NV001 - Nguyễn Văn Hùng"
                    disabled
                    className="w-full bg-slate-200/70 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Ngày Nhập</label>
                  <input
                    type="date"
                    value={formData.ngayNhap}
                    disabled
                    className="w-full bg-slate-200/70 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-slate-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Ghi Chú Phiếu Nhập
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập ghi chú mẻ sản xuất, tiêu chuẩn QC..."
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Mã Phiếu YCXSP (Bàn giao từ SX)</label>
                  <select
                    value={formData.maPhieuYCXSP}
                    onChange={(e) => handleSelectHandover(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Nhập thủ công (Không chọn) --</option>
                    {pendingHandovers.map(h => (
                      <option key={h.maPhieuYCXSP} value={h.maPhieuYCXSP}>
                        {h.maPhieuYCXSP} - {h.ghiChu || `Phiếu bàn giao ${h.maPhieuYCXSP}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Danh Sách Sản Phẩm Nhập</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Sản Phẩm</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 w-5/12">Sản Phẩm</th>
                        <th className="p-2.5 w-2/12">Số Lượng Nhập</th>
                        <th className="p-2.5 w-2/12">Ngày Sản Xuất</th>
                        <th className="p-2.5 w-2/12">Hạn Sử Dụng</th>
                        <th className="p-2.5 w-1/12 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <select
                              value={item.maSP}
                              onChange={(e) => handleItemChange(idx, 'maSP', e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                              required
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {productsList.map(p => (
                                <option key={p.maSanPham} value={p.maSanPham}>
                                  {p.maSanPham} - {p.tenSanPham} ({p.donViTinh})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.soLuongNhap}
                              onChange={(e) => handleItemChange(idx, 'soLuongNhap', Number(e.target.value))}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none text-right"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              max={todayStr}
                              value={item.ngaySanXuat}
                              onChange={(e) => handleItemChange(idx, 'ngaySanXuat', e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={item.hanSuDung}
                              disabled
                              readOnly
                              title="Hạn sử dụng được tự động tính theo Ngày sản xuất + Thời hạn chuẩn của sản phẩm (không thể sửa thủ công)"
                              className="w-full bg-slate-200/70 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold text-slate-700 cursor-not-allowed"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Xóa dòng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  {editingReceipt ? 'Lưu Cập Nhật' : 'Lập Phiếu (Trạng Thái Chờ Duyệt)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: XEM CHI TIẾT PHIẾU NHẬP */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#001E50] flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Chi Tiết Phiếu Nhập Sản Phẩm: {selectedReceipt.maPhieuNhapSP}</span>
                </h2>
                <div className="mt-1">
                  <StatusBadge status={selectedReceipt.trangThai} />
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold">Người Tạo Phiếu:</span>
                <p className="font-bold text-slate-800">{selectedReceipt.nhan_vien_tao ? selectedReceipt.nhan_vien_tao.hoTen : selectedReceipt.maNVTao}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Ngày Nhập Phiếu:</span>
                <p className="font-bold text-slate-800 font-mono">{selectedReceipt.ngayNhap}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Căn Cứ YC Xuất SP:</span>
                <p className="font-bold text-slate-800 font-mono">{selectedReceipt.maPhieuYCXSP || 'Không có (Bàn giao trực tiếp)'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Ghi Chú Phiếu:</span>
                <p className="font-medium text-slate-800">{selectedReceipt.ghiChu}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Danh Sách Sản Phẩm Trong Phiếu</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">STT</th>
                      <th className="p-2.5">Mã & Tên Sản Phẩm</th>
                      <th className="p-2.5 text-right">Số Lượng Nhập</th>
                      <th className="p-2.5">Ngày Sản Xuất</th>
                      <th className="p-2.5">Hạn Sử Dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReceipt.chi_tiets && selectedReceipt.chi_tiets.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-blue-950">{d.san_pham ? d.san_pham.tenSanPham : d.maSP}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Mã: {d.maSP}</div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700">{d.soLuongNhap?.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-slate-600">{d.ngaySanXuat}</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-semibold">{d.hanSuDung}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenPrint(selectedReceipt);
                }}
                className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-slate-900 transition flex items-center space-x-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Xem Trang In Phiếu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: IN PHIẾU NHẬP SẢN PHẨM CHUẨN VINAMILK */}
      {/* ========================================================================= */}
      {isPrintModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-0 print:shadow-none print:w-full">
            {/* Action Bar inside Print Modal */}
            <div className="flex justify-between items-center border-b pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xem Trước Bản In Phiếu Nhập</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Thực Hiện In Phiếu</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Content Area */}
            <div className="space-y-6 text-slate-900 font-serif">
              {/* Company Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-base font-extrabold uppercase tracking-wide text-[#001E50]">CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK)</h1>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">Nhà Máy Sữa Thống Nhất - Kho Thành Phẩm Trung Tâm</p>
                  <p className="text-xs text-slate-600 font-sans">Địa chỉ: Số 10 Tân Trào, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh</p>
                </div>
                <div className="text-right font-sans">
                  <div className="text-xs font-bold font-mono text-slate-800">Mẫu số: 01-VT/VNM</div>
                  <div className="text-[11px] text-slate-500 italic">Ban hành theo Thông tư 200/2014/TT-BTC</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold uppercase tracking-wider text-[#001E50]">PHIẾU NHẬP KHO SẢN PHẨM</h2>
                <p className="text-xs font-mono italic text-slate-600">Số: <span className="font-bold text-slate-900">{selectedReceipt.maPhieuNhapSP}</span></p>
                <p className="text-xs font-sans text-slate-600">Ngày nhập: <span className="font-semibold">{selectedReceipt.ngayNhap}</span></p>
              </div>

              {/* General Info Table */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-sans">
                <div><span className="font-bold">Họ tên người lập phiếu:</span> {selectedReceipt.nhan_vien_tao ? selectedReceipt.nhan_vien_tao.hoTen : selectedReceipt.maNVTao}</div>
                <div><span className="font-bold">Trạng thái phiếu:</span> <span className="uppercase font-bold">{selectedReceipt.trangThai}</span></div>
                <div><span className="font-bold">Mã phiếu yêu cầu xuất SP:</span> {selectedReceipt.maPhieuYCXSP || 'Không có'}</div>
                <div><span className="font-bold">Địa điểm nhập kho:</span> Kho Thành Phẩm Trung Tâm Vinamilk</div>
                <div className="col-span-2"><span className="font-bold">Ghi chú phiếu nhập:</span> {selectedReceipt.ghiChu}</div>
              </div>

              {/* Detail Items Table */}
              <table className="w-full border-collapse border border-slate-900 text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-2 w-10">STT</th>
                    <th className="border border-slate-900 p-2">Mã SP</th>
                    <th className="border border-slate-900 p-2">Tên Sản Phẩm</th>
                    <th className="border border-slate-900 p-2">ĐVT</th>
                    <th className="border border-slate-900 p-2 text-right">Số Lượng</th>
                    <th className="border border-slate-900 p-2">Ngày Sản Xuất</th>
                    <th className="border border-slate-900 p-2">Hạn Sử Dụng</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.chi_tiets && selectedReceipt.chi_tiets.map((d, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="border border-slate-900 p-2 font-bold">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-mono">{d.maSP}</td>
                      <td className="border border-slate-900 p-2 text-left font-semibold">{d.san_pham ? d.san_pham.tenSanPham : d.maSP}</td>
                      <td className="border border-slate-900 p-2">{d.san_pham ? d.san_pham.donViTinh : 'Thùng'}</td>
                      <td className="border border-slate-900 p-2 text-right font-bold font-mono">{d.soLuongNhap?.toLocaleString()}</td>
                      <td className="border border-slate-900 p-2 font-mono">{d.ngaySanXuat}</td>
                      <td className="border border-slate-900 p-2 font-mono">{d.hanSuDung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 text-center text-xs font-sans pt-6">
                <div>
                  <p className="font-bold uppercase">Người Lập Phiếu</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký, họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-semibold">{selectedReceipt.nhan_vien_tao ? selectedReceipt.nhan_vien_tao.hoTen : selectedReceipt.maNVTao}</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Thủ Kho Nhận</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký, họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-semibold">Trần Thị Thu Thảo</p>
                </div>
                <div>
                  <p className="font-bold uppercase">Quản Lý Kho Duyệt</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký, họ tên, đóng dấu)</p>
                  <div className="h-16"></div>
                  <p className="font-semibold">Nguyễn Văn Hùng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

