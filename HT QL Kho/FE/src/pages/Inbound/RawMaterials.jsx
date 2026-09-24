import React, { useEffect, useState } from 'react';
import { InboundAPI, MasterDataAPI } from '../../services/api';
import { ArrowDownLeft, Plus, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { generateAutoCode } from '../../utils/codeGenerator';
import { useAuth } from '../../context/AuthContext';

export default function InboundRawMaterials() {
  const { hasPermission } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      const res = await InboundAPI.getRawMaterialReceipts();
      setReceipts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    const autoCode = generateAutoCode(receipts, 'maPhieuNhapNVL', 'PNNVL', 2, true);
    const autoLot = generateAutoCode(receipts.flatMap(r => r.chi_tiets || []), 'maTonKho', 'TK-NVL-', 3, true);
    setFormData({
      ...initialForm,
      maPhieuNhapNVL: autoCode,
      maTonKho: autoLot,
      maNCC: suppliers[0]?.maNCC || 'NCC001',
      maNVL: materials[0]?.maNVL || 'NVL001',
    });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await InboundAPI.createRawMaterialReceipt({
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
      });
      setShowModal(false);
      fetchReceipts();
    } catch (err) {
      alert('Lỗi tạo phiếu nhập: ' + (err.response?.data?.message || err.message));
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

  const handleComplete = async (id) => {
    if (window.confirm(`Xác nhận hoàn thành phiếu ${id}? Tồn kho sẽ được tự động cộng theo lô.`)) {
      try {
        await InboundAPI.completeRawMaterialReceipt(id);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi xác nhận hoàn thành: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            <span>Nhập Kho Nguyên Vật Liệu (Từ Nhà Cung Cấp)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tiếp nhận sữa thô, đường, bao bì từ các nông trại & đối tác Vinamilk
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
              ) : receipts.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Chưa có phiếu nhập NVL nào.</td></tr>
              ) : (
                receipts.map((r) => (
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
                    <td className="p-3 text-center space-y-2 flex flex-col items-center">
                      {r.trangThai === 'Chờ duyệt' && hasPermission('warehouse', 'approve') && (
                        <button
                          onClick={() => handleApprove(r.maPhieuNhapNVL)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center justify-center space-x-1 cursor-pointer w-full max-w-[120px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Duyệt Phiếu</span>
                        </button>
                      )}
                      {r.trangThai === 'Đã duyệt' && (
                        <button
                          onClick={() => handleComplete(r.maPhieuNhapNVL)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center justify-center space-x-1 cursor-pointer w-full max-w-[120px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Nhập Kho Thực Tế</span>
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
          <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2">Lập Phiếu Nhập Nguyên Vật Liệu Mới</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã Phiếu Nhập (Tự động) *</label>
                  <input type="text" required readOnly value={formData.maPhieuNhapNVL} className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày Nhập *</label>
                  <input type="date" required value={formData.ngayNhap} onChange={(e) => setFormData({ ...formData, ngayNhap: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhà Cung Cấp / Trang Trại *</label>
                <select value={formData.maNCC} onChange={(e) => setFormData({ ...formData, maNCC: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium">
                  {suppliers.length > 0 ? suppliers.map(s => (
                    <option key={s.maNCC} value={s.maNCC}>{s.maNCC} - {s.tenNCC}</option>
                  )) : (
                    <>
                      <option value="NCC001">NCC001 - Nông Trại Sữa Vinamilk Mộc Châu</option>
                      <option value="NCC002">NCC002 - Tập Đoàn Hóa Chất Á Châu</option>
                    </>
                  )}
                </select>
              </div>

              <div className="border-t pt-3 space-y-2">
                <h4 className="font-bold text-slate-800">Thông Tin Lô Hàng & Nguyên Vật Liệu</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mã Lô Tồn Kho *</label>
                    <input type="text" required value={formData.maTonKho} onChange={(e) => setFormData({ ...formData, maTonKho: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nguyên Vật Liệu *</label>
                    <select value={formData.maNVL} onChange={(e) => setFormData({ ...formData, maNVL: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2">
                      {materials.length > 0 ? materials.map(m => (
                        <option key={m.maNVL} value={m.maNVL}>{m.maNVL} - {m.tenNVL}</option>
                      )) : (
                        <>
                          <option value="NVL001">NVL001 - Sữa Bò Tươi Nguyên Chất</option>
                          <option value="NVL002">NVL002 - Đường Tinh Luyện</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Số Lượng Nhập *</label>
                    <input type="number" required min="1" value={formData.soLuong} onChange={(e) => setFormData({ ...formData, soLuong: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Đơn Giá (đ)</label>
                    <input type="number" value={formData.donGia} onChange={(e) => setFormData({ ...formData, donGia: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ngày Sản Xuất *</label>
                    <input type="date" required value={formData.ngaySanXuat} onChange={(e) => setFormData({ ...formData, ngaySanXuat: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hạn Sử Dụng (HSD) *</label>
                    <input type="date" required value={formData.hanSuDung} onChange={(e) => setFormData({ ...formData, hanSuDung: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer">Tạo Phiếu Nhập</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
