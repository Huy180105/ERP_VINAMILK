import React, { useEffect, useState } from 'react';
import { OutboundAPI, InventoryAPI } from '../../services/api';
import { ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function OutboundRawMaterials() {
  const [dispatches, setDispatches] = useState([]);
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
      const res = await OutboundAPI.getRawMaterialDispatches();
      setDispatches(res.data.data || []);
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
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
