import React, { useEffect, useState } from 'react';
import { OutboundAPI, InventoryAPI } from '../../services/api';
import { ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function OutboundRawMaterials() {
  const [dispatches, setDispatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const initialForm = {
    maPhieuXuatNVL: '',
    maXuong: 'XSX01',
    ngayXuat: new Date().toISOString().split('T')[0],
    ghiChu: '',
    maTonKho: '',
    soLuong: 100,
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
    const autoCode = generateAutoCode(dispatches, 'maPhieuXuatNVL', 'PXNVL', 3, true);
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
    const autoCode = generateAutoCode(dispatches, 'maPhieuXuatNVL', 'PXNVL', 3, true);
    
    // Tìm lô đầu tiên có mã nguyên vật liệu khớp với yêu cầu
    const requestedMaterialCode = req.chi_tiets?.[0]?.maNVL;
    const matchedLot = availableLots.find(l => l.maSanPham === requestedMaterialCode) || availableLots[0];

    setFormData({
      ...initialForm,
      maPhieuXuatNVL: autoCode,
      maXuong: req.maLenh ? `Xuất cho lệnh: ${req.maLenh}` : 'XSX01',
      ngayXuat: new Date().toISOString().split('T')[0],
      ghiChu: `Xuất kho theo phiếu yêu cầu ${req.maPhieuYCNVL}`,
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
    } catch (err) {
      alert('Lỗi lập phiếu xuất: ' + (err.response?.data?.message || err.message));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <ArrowUpRight className="w-6 h-6 text-amber-600" />
            <span>Xuất Kho Nguyên Vật Liệu Cấp Phát Cho Sản Xuất</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Xuất cấp sữa thô, đường, phụ gia, bao bì cho các xưởng chế biến Vinamilk
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">Lịch Sử Xuất Kho Nguyên Vật Liệu</h2>
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
              ) : dispatches.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Chưa có phiếu xuất NVL nào.</td></tr>
              ) : (
                dispatches.map((d) => (
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
                      {d.trangThai !== 'Hoàn thành' && (
                        <button
                          onClick={() => handleComplete(d.maPhieuXuatNVL)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Xác Nhận Xuất Kho</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2">Lập Phiếu Xuất NVL Cho Sản Xuất</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Phiếu Xuất (Tự động) *</label>
                <input type="text" required readOnly value={formData.maPhieuXuatNVL} className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed" />
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
                    placeholder="Nhập mã lô (VD: TK-NVL-001)"
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
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer">Lưu Phiếu Xuất</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
