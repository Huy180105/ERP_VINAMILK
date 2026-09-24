import React, { useEffect, useState, useMemo } from 'react';
import { OutboundAPI, InventoryAPI } from '../../services/api';
import { ArrowUpRight, Plus, CheckCircle2, XCircle, Eye, Printer, Search } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { generateAutoCode } from '../../utils/codeGenerator';
import { useAuth } from '../../context/AuthContext';

export default function OutboundRawMaterials() {
  const { hasPermission } = useAuth();
  const [dispatches, setDispatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [detailModalDispatch, setDetailModalDispatch] = useState(null);

  const initialForm = {
    maPhieuXuatNVL: '',
    maXuong: 'XSX01',
    ngayXuat: new Date().toISOString().split('T')[0],
    ghiChu: '',
    maTonKho: '',
    soLuong: 100,
    maPhieuYeuCauNVL: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchDispatches();
    InventoryAPI.getInventory({ type: 'material' })
      .then(res => setAvailableLots((res.data.data || []).filter(l => l.soLuongTonHienTai > 0)))
      .catch(console.error);
  }, []);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const [dispRes, reqRes] = await Promise.all([
        OutboundAPI.getRawMaterialDispatches(),
        OutboundAPI.getPendingMaterialRequests()
      ]);
      setDispatches(dispRes.data.data || []);
      setPendingRequests(reqRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    const autoCode = generateAutoCode(dispatches, 'maPhieuXuatNVL', 'PXNVL', 2, true);
    setFormData({
      ...initialForm,
      maPhieuXuatNVL: autoCode,
      maTonKho: availableLots[0]?.maTonKho || '',
      ngayXuat: new Date().toISOString().split('T')[0],
      maPhieuYeuCauNVL: '',
    });
    setShowModal(true);
  };

  const handleCreateFromRequest = (req) => {
    const autoCode = generateAutoCode(dispatches, 'maPhieuXuatNVL', 'PXNVL', 2, true);
    
    // Tìm lô đầu tiên có mã nguyên vật liệu khớp với yêu cầu
    const requestedMaterialCode = req.chi_tiets?.[0]?.maNVL;
    const matchedLot = availableLots.find(l => l.maNVL === requestedMaterialCode) || availableLots[0];

    setFormData({
      ...initialForm,
      maPhieuXuatNVL: autoCode,
      maXuong: req.maXuong || 'XSX01',
      ngayXuat: new Date().toISOString().split('T')[0],
      ghiChu: req.lenh_san_xuat?.maLenh 
        ? `Xuất kho theo yêu cầu ${req.maPhieuYCNVL} (Lệnh: ${req.lenh_san_xuat?.maLenh})` 
        : `Xuất kho theo yêu cầu ${req.maPhieuYCNVL}`,
      maPhieuYeuCauNVL: req.maPhieuYCNVL,
      maTonKho: matchedLot?.maTonKho || '',
      soLuong: req.chi_tiets?.[0]?.soLuong || 100,
    });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await OutboundAPI.createRawMaterialDispatch({
        maPhieuXuatNVL: formData.maPhieuXuatNVL,
        maXuong: formData.maXuong,
        ngayXuat: formData.ngayXuat,
        ghiChu: formData.ghiChu,
        maPhieuYeuCauNVL: formData.maPhieuYeuCauNVL,
        items: [{ maTonKho: formData.maTonKho, soLuong: Number(formData.soLuong) }]
      });
      setShowModal(false);
      fetchDispatches();
      alert('Lập phiếu xuất kho NVL thành công! Trạng thái: Chờ duyệt.');
    } catch (err) {
      alert('Lỗi lập phiếu xuất: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm(`Xác nhận duyệt phiếu xuất ${id}?`)) {
      try {
        await OutboundAPI.approveRawMaterialDispatch(id);
        fetchDispatches();
      } catch (err) {
        alert('Lỗi duyệt phiếu xuất: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReject = async (id) => {
    const lyDo = window.prompt(`Nhập lý do từ chối phiếu xuất ${id}:`, 'Không đạt điều kiện xuất cấp');
    if (lyDo !== null) {
      try {
        await OutboundAPI.rejectRawMaterialDispatch(id, { lyDo });
        fetchDispatches();
      } catch (err) {
        alert('Lỗi từ chối phiếu: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm(`Xác nhận xuất kho phiếu ${id}? Tồn kho NVL sẽ được trừ tự động.`)) {
      try {
        await OutboundAPI.completeRawMaterialDispatch(id);
        fetchDispatches();
      } catch (err) {
        alert('Lỗi xuất kho: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const filteredDispatches = dispatches.filter(d => {
    if (!searchKey) return true;
    const kw = searchKey.toLowerCase();
    return (
      d.maPhieuXuatNVL?.toLowerCase().includes(kw) ||
      d.maXuong?.toLowerCase().includes(kw) ||
      d.ghiChu?.toLowerCase().includes(kw)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey]);

  const totalPages = Math.ceil(filteredDispatches.length / pageSize) || 1;
  const paginatedDispatches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDispatches.slice(start, start + pageSize);
  }, [filteredDispatches, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <ArrowUpRight className="w-6 h-6 text-amber-600" />
            <span>Xuất Kho Nguyên Vật Liệu Cấp Phát Cho Sản Xuất</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Xuất cấp sữa thô, đường, phụ gia, bao bì cho các xưởng chế biến Vinamilk (CF-FR35 - CF-FR43)
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-[#0B2341] hover:bg-blue-900 text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Phiếu Xuất NVL Mới</span>
        </button>
      </div>

      {/* Pending Material Requests */}
      <div className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center justify-between">
          <h2 className="font-bold text-blue-900 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Danh Sách Yêu Cầu NVL Từ Sản Xuất Chờ Cấp Phát</span>
          </h2>
          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
            {pendingRequests.length} yêu cầu
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Yêu Cầu</th>
                <th className="p-3">Lệnh Sản Xuất</th>
                <th className="p-3">Người Yêu Cầu</th>
                <th className="p-3">Ngày Yêu Cầu</th>
                <th className="p-3">Chi Tiết Cấp Phát</th>
                <th className="p-3">Ghi Chú</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRequests.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Không có yêu cầu NVL nào chờ xử lý.</td></tr>
              ) : (
                pendingRequests.map((req) => (
                  <tr key={req.maPhieuYCNVL} className="hover:bg-blue-50/30 transition">
                    <td className="p-3 font-mono font-bold text-blue-700">{req.maPhieuYCNVL}</td>
                    <td className="p-3 font-semibold text-slate-700">{req.lenh_san_xuat?.maLenh} - {req.lenh_san_xuat?.tenLenh}</td>
                    <td className="p-3 text-slate-700 font-medium">{req.nhan_vien?.hoTen || req.maNhanVien}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{req.ngayYeuCau}</td>
                    <td className="p-3 space-y-1">
                      {req.chi_tiets?.map((ct, idx) => (
                        <div key={idx} className="bg-slate-50 p-2 rounded-lg font-mono text-[11px] text-slate-600 flex justify-between border border-slate-100">
                          <span>{ct.nguyen_vat_lieu?.tenNVL || ct.maNVL}</span>
                          <span className="font-bold text-slate-800">SL: {ct.soLuong?.toLocaleString()}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-slate-500">{req.ghiChu}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleCreateFromRequest(req)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo Phiếu Xuất NVL</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatches History */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800">Lịch Sử Xuất Kho Nguyên Vật Liệu</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm phiếu xuất..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Phiếu Xuất</th>
                <th className="p-3">Xưởng Nhận</th>
                <th className="p-3">Ngày Xuất</th>
                <th className="p-3">Chi Tiết Lô Xuất</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Đang tải danh sách...</td></tr>
              ) : filteredDispatches.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Chưa có phiếu xuất NVL nào.</td></tr>
              ) : (
                paginatedDispatches.map((d) => (
                  <tr key={d.maPhieuXuatNVL} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#0B2341]">{d.maPhieuXuatNVL}</td>
                    <td className="p-3 font-semibold text-slate-800">{d.maXuong || 'Xưởng Sản Xuất 1'}</td>
                    <td className="p-3 text-slate-600 font-mono">{d.ngayXuat}</td>
                    <td className="p-3 space-y-1">
                      {d.chi_tiets?.map((item, idx) => (
                        <div key={idx} className="bg-amber-50 p-2 rounded-lg font-mono text-[11px] border border-amber-200">
                          <span className="font-bold text-amber-900">{item.maTonKho}</span>: {item.soLuong?.toLocaleString()} Unit
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={d.trangThai} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1.5 min-w-[130px]">
                        {/* Detail / Print Button */}
                        <button
                          onClick={() => setDetailModalDispatch(d)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded text-[11px] inline-flex items-center space-x-1 cursor-pointer w-full justify-center"
                          title="Xem chi tiết & in phiếu xuất (CF-FR43)"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          <span>Chi Tiết / In</span>
                        </button>

                        {/* Approval Flow */}
                        {d.trangThai === 'Chờ duyệt' && hasPermission('warehouse', 'approve') && (
                          <div className="flex items-center gap-1 w-full">
                            <button
                              onClick={() => handleApprove(d.maPhieuXuatNVL)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-1 rounded text-[11px] flex-1 inline-flex items-center justify-center space-x-1 cursor-pointer"
                              title="Duyệt xuất kho (CF-FR40)"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Duyệt</span>
                            </button>
                            <button
                              onClick={() => handleReject(d.maPhieuXuatNVL)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2 py-1 rounded text-[11px] flex-1 inline-flex items-center justify-center space-x-1 cursor-pointer"
                              title="Từ chối xuất kho (CF-FR41)"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Từ Chối</span>
                            </button>
                          </div>
                        )}

                        {/* Dispatch Completion */}
                        {d.trangThai === 'Đã duyệt' && (
                          <button
                            onClick={() => handleComplete(d.maPhieuXuatNVL)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center justify-center space-x-1 cursor-pointer w-full"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Xác Nhận Xuất Kho</span>
                          </button>
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
            totalItems={filteredDispatches.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2">Lập Phiếu Xuất NVL Cho Sản Xuất (CF-FR35)</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Phiếu Xuất (Tự động) *</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={formData.maPhieuXuatNVL}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Xưởng Tiếp Nhận *</label>
                <input
                  type="text"
                  required
                  value={formData.maXuong}
                  onChange={(e) => setFormData({ ...formData, maXuong: e.target.value })}
                  placeholder="VD: XSX01 - Phân Xưởng Tiệt Trùng UHT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn Lô NVL Cần Xuất *</label>
                {availableLots.length > 0 ? (
                  <select
                    value={formData.maTonKho}
                    onChange={(e) => setFormData({ ...formData, maTonKho: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                    required
                  >
                    {availableLots.map(l => (
                      <option key={l.maTonKho} value={l.maTonKho}>
                        {l.maTonKho} - {l.tenTonKho} (Tồn: {l.soLuongTonHienTai?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã lô (VD: LOT-NVL-20260901-01)"
                    value={formData.maTonKho}
                    onChange={(e) => setFormData({ ...formData, maTonKho: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                )}
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số Lượng Xuất *</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Xuất Kho</label>
                <textarea
                  rows="2"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer">Lưu Phiếu Xuất</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Print Modal (CF-FR43) */}
      {detailModalDispatch && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto print:m-0 print:p-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">VINAMILK ERP - PHÂN HỆ QUẢN LÝ KHO</span>
                <h2 className="text-lg font-bold text-[#0B2341]">PHIẾU XUẤT KHO NGUYÊN VẬT LIỆU</h2>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-slate-800">{detailModalDispatch.maPhieuXuatNVL}</div>
                <div className="text-slate-500">{detailModalDispatch.ngayXuat}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <p><span className="text-slate-500">Xưởng nhận:</span> <strong className="text-slate-800">{detailModalDispatch.maXuong || 'Xưởng chế biến'}</strong></p>
                <p><span className="text-slate-500">Mã yêu cầu SX:</span> <span className="font-mono text-blue-700 font-bold">{detailModalDispatch.maPhieuYeuCauNVL || 'Xuất thủ công'}</span></p>
              </div>
              <div>
                <p><span className="text-slate-500">Trạng thái:</span> <StatusBadge status={detailModalDispatch.trangThai} /></p>
                <p><span className="text-slate-500">Ghi chú:</span> {detailModalDispatch.ghiChu || 'Không có ghi chú'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-2">DANH SÁCH LÔ NGUYÊN VẬT LIỆU CẤP PHÁT</h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px] border-b">
                  <tr>
                    <th className="p-2 border-r">Mã Lô Xuất</th>
                    <th className="p-2 border-r">Tên Lô / Nguyên Liệu</th>
                    <th className="p-2 text-right">Số Lượng Xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailModalDispatch.chi_tiets?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono font-bold text-blue-900 border-r">{item.maTonKho}</td>
                      <td className="p-2 border-r">{item.ton_kho?.tenTonKho || 'Nguyên vật liệu sản xuất'}</td>
                      <td className="p-2 text-right font-bold text-amber-700">{item.soLuong?.toLocaleString()} Unit</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t">
              <div>
                <p className="font-bold text-slate-700">Thủ Kho Xuất</p>
                <p className="text-[10px] text-slate-400 mt-8">(Ký & ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Đại Diện Phân Xưởng</p>
                <p className="text-[10px] text-slate-400 mt-8">(Ký & ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Quản Lý Duyệt</p>
                <p className="text-[10px] text-slate-400 mt-8">(Ký & ghi rõ họ tên)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t print:hidden">
              <button
                onClick={() => setDetailModalDispatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Xuất (CF-FR43)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
