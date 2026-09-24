import React, { useEffect, useState, useMemo } from 'react';
import { InboundAPI, MasterDataAPI } from '../../services/api';
import { ArrowDownLeft, Plus, CheckCircle2, XCircle, Edit3, Trash2, Printer, Search, Eye } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { generateAutoCode } from '../../utils/codeGenerator';
import { useAuth } from '../../context/AuthContext';

export default function InboundRawMaterials() {
  const { hasPermission } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [detailModalReceipt, setDetailModalReceipt] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const defaultExp = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const initialForm = {
    maPhieuNhapNVL: '',
    maNCC: '',
    ngayNhap: today,
    ghiChu: '',
    maTonKho: '',
    maNVL: '',
    soLuong: 1000,
    donGia: 25000,
    ngaySanXuat: today,
    hanSuDung: defaultExp,
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchReceipts();
    MasterDataAPI.getSuppliers().then(res => setSuppliers(res.data.data || [])).catch(console.error);
    MasterDataAPI.getMaterials().then(res => setMaterials(res.data.data || [])).catch(console.error);
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await InboundAPI.getRawMaterialReceipts({ keyword: searchKey, trangThai: statusFilter });
      setReceipts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  const handleOpenModal = async () => {
    setIsEditing(false);
    let nextCode = '';
    let nextLot = '';
    try {
      const codeRes = await InboundAPI.getNextRawMaterialReceiptCode();
      if (codeRes.data.success) {
        nextCode = codeRes.data.code;
        nextLot = codeRes.data.lotCode;
      }
    } catch (e) {
      console.warn('Cannot fetch next-code from API, using fallback:', e.message);
    }

    if (!nextCode) {
      nextCode = generateAutoCode(receipts, 'maPhieuNhapNVL', 'PNNVL', 2, true);
    }
    if (!nextLot) {
      const existingLots = receipts.flatMap(r => r.chi_tiets || []);
      nextLot = generateAutoCode(existingLots, 'maTonKho', 'LOT-NVL-', 2, true);
    }

    setFormData({
      ...initialForm,
      maPhieuNhapNVL: nextCode,
      maTonKho: nextLot,
      maNCC: suppliers[0]?.maNCC || 'NCC001',
      maNVL: materials[0]?.maNVL || 'NVL001',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (r) => {
    setIsEditing(true);
    const firstDetail = r.chi_tiets?.[0] || {};
    setFormData({
      maPhieuNhapNVL: r.maPhieuNhapNVL,
      maNCC: r.maNCC,
      ngayNhap: r.ngayNhap || today,
      ghiChu: r.ghiChu || '',
      maTonKho: firstDetail.maTonKho || '',
      maNVL: firstDetail.ton_kho?.maNVL || materials[0]?.maNVL || 'NVL001',
      soLuong: firstDetail.soLuong || 1000,
      donGia: firstDetail.donGia || 25000,
      ngaySanXuat: firstDetail.ngaySanXuat || today,
      hanSuDung: firstDetail.hanSuDung || defaultExp,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        maPhieuNhapNVL: formData.maPhieuNhapNVL,
        maNCC: formData.maNCC,
        ngayNhap: formData.ngayNhap,
        ghiChu: formData.ghiChu,
        items: [{
          maTonKho: formData.maTonKho,
          maNVL: formData.maNVL,
          soLuong: Number(formData.soLuong),
          donGia: Number(formData.donGia),
          ngaySanXuat: formData.ngaySanXuat,
          hanSuDung: formData.hanSuDung,
        }]
      };

      if (isEditing) {
        await InboundAPI.updateRawMaterialReceipt(formData.maPhieuNhapNVL, payload);
        alert('Cập nhật phiếu nhập NVL thành công!');
      } else {
        await InboundAPI.createRawMaterialReceipt(payload);
        alert('Lập phiếu nhập nguyên vật liệu thành công! Đã tự động liên kết tạo Phiếu Chi sang phân hệ Thu - Chi.');
      }
      setShowModal(false);
      fetchReceipts();
    } catch (err) {
      alert('Lỗi thao tác phiếu nhập: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa phiếu nhập ${id}?`)) {
      try {
        await InboundAPI.deleteRawMaterialReceipt(id);
        alert('Đã xóa phiếu nhập NVL thành công!');
        fetchReceipts();
      } catch (err) {
        alert('Lỗi xóa phiếu: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm(`Xác nhận duyệt phiếu nhập ${id}?`)) {
      try {
        await InboundAPI.approveRawMaterialReceipt(id);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi duyệt phiếu: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReject = async (id) => {
    const lyDo = window.prompt(`Nhập lý do từ chối phiếu nhập ${id}:`, 'Không đạt tiêu chuẩn kiểm nghiệm chất lượng');
    if (lyDo !== null) {
      try {
        await InboundAPI.rejectRawMaterialReceipt(id, { lyDo });
        fetchReceipts();
      } catch (err) {
        alert('Lỗi từ chối phiếu: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm(`Xác nhận nhập kho thực tế cho phiếu ${id}? Tồn kho sẽ được tự động cộng theo lô.`)) {
      try {
        await InboundAPI.completeRawMaterialReceipt(id);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi xác nhận nhập kho: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const matchStatus = !statusFilter || r.trangThai === statusFilter;
      const kw = searchKey.toLowerCase().trim();
      const matchKw = !kw || 
        r.maPhieuNhapNVL?.toLowerCase().includes(kw) ||
        r.nha_cung_cap?.tenNCC?.toLowerCase().includes(kw) ||
        r.ghiChu?.toLowerCase().includes(kw);
      return matchStatus && matchKw;
    });
  }, [receipts, statusFilter, searchKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchKey]);

  const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [filteredReceipts, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            <span>Nhập Kho Nguyên Vật Liệu (Từ Nhà Cung Cấp)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tiếp nhận sữa thô, đường, bao bì từ các nông trại & đối tác Vinamilk (CF-FR14 - CF-FR22)
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-[#0B2341] hover:bg-blue-900 text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Nhập NVL Mới</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã phiếu nhập, nhà cung cấp, ghi chú..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Đã nhập kho">Đã nhập kho</option>
          <option value="Từ chối">Từ chối</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer">
          Lọc Dữ Liệu
        </button>
      </form>

      {/* Table List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Phiếu</th>
                <th className="p-3">Nhà Cung Cấp</th>
                <th className="p-3">Ngày Nhập</th>
                <th className="p-3">Chi Tiết Lô & NVL</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Đang tải phiếu nhập...</td></tr>
              ) : filteredReceipts.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Không tìm thấy phiếu nhập NVL nào phù hợp.</td></tr>
              ) : (
                paginatedReceipts.map((r) => (
                  <tr key={r.maPhieuNhapNVL} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#0B2341]">{r.maPhieuNhapNVL}</td>
                    <td className="p-3 font-medium text-slate-800">{r.nha_cung_cap?.tenNCC || r.maNCC}</td>
                    <td className="p-3 text-slate-600 font-mono">{r.ngayNhap}</td>
                    <td className="p-3 space-y-1">
                      {r.chi_tiets?.map((d, idx) => (
                        <div key={idx} className="bg-slate-100 p-2 rounded-lg font-mono text-[11px]">
                          <span className="font-bold text-blue-900">{d.maTonKho}</span>: {d.soLuong?.toLocaleString()} (NSX: {d.ngaySanXuat} - HSD: {d.hanSuDung})
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={r.trangThai} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1.5 min-w-[130px]">
                        {/* Detail / Print Button */}
                        <button
                          onClick={() => setDetailModalReceipt(r)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded text-[11px] inline-flex items-center space-x-1 cursor-pointer w-full justify-center"
                          title="Xem chi tiết & in phiếu (CF-FR18, CF-FR22)"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          <span>Chi Tiết / In</span>
                        </button>

                        {/* Approval Flow */}
                        {r.trangThai === 'Chờ duyệt' && hasPermission('warehouse', 'approve') && (
                          <div className="flex items-center gap-1 w-full">
                            <button
                              onClick={() => handleApprove(r.maPhieuNhapNVL)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-1 rounded text-[11px] flex-1 inline-flex items-center justify-center space-x-1 cursor-pointer"
                              title="Duyệt phiếu (CF-FR19)"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => handleReject(r.maPhieuNhapNVL)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2 py-1 rounded text-[11px] flex-1 inline-flex items-center justify-center space-x-1 cursor-pointer"
                              title="Từ chối phiếu (CF-FR20)"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Từ Chối</span>
                            </button>
                          </div>
                        )}

                        {/* Goods Receipt Completion */}
                        {r.trangThai === 'Đã duyệt' && (
                          <button
                            onClick={() => handleComplete(r.maPhieuNhapNVL)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded text-[11px] inline-flex items-center justify-center space-x-1 cursor-pointer w-full"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Nhập Kho Thực Tế</span>
                          </button>
                        )}

                        {/* Edit & Delete for Pending/Rejected */}
                        {(r.trangThai === 'Chờ duyệt' || r.trangThai === 'Từ chối') && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 w-full justify-center">
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              className="text-amber-600 hover:text-amber-800 text-[11px] font-medium flex items-center space-x-0.5 cursor-pointer"
                              title="Sửa phiếu nhập (CF-FR15)"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa</span>
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleDelete(r.maPhieuNhapNVL)}
                              className="text-rose-600 hover:text-rose-800 text-[11px] font-medium flex items-center space-x-0.5 cursor-pointer"
                              title="Xóa phiếu nhập (CF-FR16)"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredReceipts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2">
              {isEditing ? `Cập Nhật Phiếu Nhập NVL (${formData.maPhieuNhapNVL})` : 'Lập Phiếu Nhập Nguyên Vật Liệu Mới (CF-FR14)'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã Phiếu Nhập (Tự động) *</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.maPhieuNhapNVL}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày Nhập *</label>
                  <input
                    type="date"
                    required
                    value={formData.ngayNhap}
                    onChange={(e) => setFormData({ ...formData, ngayNhap: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhà Cung Cấp / Trang Trại *</label>
                <select
                  value={formData.maNCC}
                  onChange={(e) => setFormData({ ...formData, maNCC: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {suppliers.map(s => (
                    <option key={s.maNCC} value={s.maNCC}>{s.maNCC} - {s.tenNCC}</option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-3 space-y-2">
                <h4 className="font-bold text-slate-800">Thông Tin Lô Hàng & Nguyên Vật Liệu</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mã Lô Tồn Kho (Tự động) *</label>
                    <input
                      type="text"
                      required
                      readOnly
                      value={formData.maTonKho}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nguyên Vật Liệu *</label>
                    <select
                      value={formData.maNVL}
                      onChange={(e) => setFormData({ ...formData, maNVL: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    >
                      {materials.map(m => (
                        <option key={m.maNVL} value={m.maNVL}>{m.maNVL} - {m.tenNVL}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Số Lượng Nhập *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.soLuong}
                      onChange={(e) => setFormData({ ...formData, soLuong: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Đơn Giá (đ)</label>
                    <input
                      type="number"
                      value={formData.donGia}
                      onChange={(e) => setFormData({ ...formData, donGia: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ngày Sản Xuất *</label>
                    <input
                      type="date"
                      required
                      value={formData.ngaySanXuat}
                      onChange={(e) => setFormData({ ...formData, ngaySanXuat: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hạn Sử Dụng (HSD) *</label>
                    <input
                      type="date"
                      required
                      value={formData.hanSuDung}
                      onChange={(e) => setFormData({ ...formData, hanSuDung: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Nhập Kho</label>
                  <textarea
                    rows="2"
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    placeholder="VD: Nhập lô sữa tươi thô tiêu chuẩn Organic Mộc Châu..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer"
                >
                  {isEditing ? 'Lưu Thay Đổi' : 'Tạo Phiếu Nhập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Print Modal (CF-FR18, CF-FR22) */}
      {detailModalReceipt && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto print:m-0 print:p-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">VINAMILK ERP - PHÂN HỆ QUẢN LÝ KHO</span>
                <h2 className="text-lg font-bold text-[#0B2341]">PHIẾU NHẬP KHO NGUYÊN VẬT LIỆU</h2>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-slate-800">{detailModalReceipt.maPhieuNhapNVL}</div>
                <div className="text-slate-500">{detailModalReceipt.ngayNhap}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <p><span className="text-slate-500">Nhà cung cấp:</span> <strong className="text-slate-800">{detailModalReceipt.nha_cung_cap?.tenNCC || detailModalReceipt.maNCC}</strong></p>
                <p><span className="text-slate-500">Mã số thuế:</span> <span className="font-mono">{detailModalReceipt.nha_cung_cap?.maSoThue || '0301458999'}</span></p>
                <p><span className="text-slate-500">Địa chỉ:</span> {detailModalReceipt.nha_cung_cap?.diaChi || 'Việt Nam'}</p>
              </div>
              <div>
                <p><span className="text-slate-500">Trạng thái:</span> <StatusBadge status={detailModalReceipt.trangThai} /></p>
                <p><span className="text-slate-500">Nhân viên tạo:</span> {detailModalReceipt.nhan_vien_tao?.hoTen || 'Nguyễn Văn Hùng'}</p>
                <p><span className="text-slate-500">Ghi chú:</span> {detailModalReceipt.ghiChu || 'Không có ghi chú'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-2">DANH SÁCH LÔ NGUYÊN VẬT LIỆU TIẾP NHẬN</h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px] border-b">
                  <tr>
                    <th className="p-2 border-r">Mã Lô</th>
                    <th className="p-2 border-r">Tên Lô / NVL</th>
                    <th className="p-2 border-r text-center">NSX - HSD</th>
                    <th className="p-2 border-r text-right">Số Lượng</th>
                    <th className="p-2 border-r text-right">Đơn Giá</th>
                    <th className="p-2 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailModalReceipt.chi_tiets?.map((d, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono font-bold text-blue-900 border-r">{d.maTonKho}</td>
                      <td className="p-2 border-r">{d.ton_kho?.tenTonKho || 'Nguyên vật liệu'}</td>
                      <td className="p-2 text-center border-r font-mono text-[10px]">{d.ngaySanXuat} / {d.hanSuDung}</td>
                      <td className="p-2 text-right border-r font-bold">{d.soLuong?.toLocaleString()}</td>
                      <td className="p-2 text-right border-r font-mono">{(d.donGia || 0).toLocaleString()} đ</td>
                      <td className="p-2 text-right font-bold text-emerald-700 font-mono">{((d.donGia || 0) * (d.soLuong || 0)).toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t">
              <div>
                <p className="font-bold text-slate-700">Người Giao Hàng</p>
                <p className="text-[10px] text-slate-400 mt-8">(Ký & ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Thủ Kho Tiếp Nhận</p>
                <p className="text-[10px] text-slate-400 mt-8">(Ký & ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Quản Lý Phê Duyệt</p>
                <p className="text-[10px] text-slate-400 mt-8">(Ký & ghi rõ họ tên)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t print:hidden">
              <button
                onClick={() => setDetailModalReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Nhập (CF-FR22)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
