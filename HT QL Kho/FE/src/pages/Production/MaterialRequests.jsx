import React, { useEffect, useState } from 'react';
import { ProductionAPI, MasterDataAPI } from '../../services/api';
import { 
  Boxes, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Database,
  Layers,
  Sparkles,
  X,
  PackageCheck
} from 'lucide-react';

export default function MaterialRequests() {
  const [requests, setRequests] = useState([]);
  const [stockAvailability, setStockAvailability] = useState([]);
  const [orders, setOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'availability'

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    maPhieuYCNVL: '',
    maLenh: 'LSX001',
    ngayYeuCau: new Date().toISOString().split('T')[0],
    ghiChu: '',
    items: [{ maNVL: 'NVL001', soLuong: 5000 }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        ProductionAPI.getMaterialRequests(),
        ProductionAPI.checkMaterialAvailability(),
        ProductionAPI.getOrders(),
        MasterDataAPI.getMaterials()
      ]);

      if (results[0].status === 'fulfilled') setRequests(results[0].value.data.data || []);
      if (results[1].status === 'fulfilled') setStockAvailability(results[1].value.data.data || []);
      if (results[2].status === 'fulfilled') setOrders(results[2].value.data.data || []);
      if (results[3].status === 'fulfilled') setMaterials(results[3].value.data.data || []);
    } catch (err) {
      console.error('Error fetching material data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await ProductionAPI.createMaterialRequest(formData);
      alert('Tạo Phiếu yêu cầu cấp phát NVL thành công! Đã gửi thông báo sang Phân hệ Kho.');
      setShowCreateModal(false);
      setFormData({
        maPhieuYCNVL: '',
        maLenh: orders[0]?.maLenh || 'LSX001',
        ngayYeuCau: new Date().toISOString().split('T')[0],
        ghiChu: '',
        items: [{ maNVL: materials[0]?.maNVL || 'NVL001', soLuong: 5000 }],
      });
      fetchData();
    } catch (err) {
      alert('Lỗi tạo yêu cầu NVL: ' + (err.response?.data?.message || err.message));
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { maNVL: materials[0]?.maNVL || 'NVL001', soLuong: 1000 }]
    });
  };

  const removeItemRow = (idx) => {
    const newItems = formData.items.filter((_, i) => i !== idx);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#001E50] flex items-center space-x-2.5">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Phiếu Yêu Cầu & Cấp Phát Nguyên Vật Liệu (PR-FR13 → PR-FR17)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gửi yêu cầu vật tư từ Xưởng sang Kho, kiểm tra tồn kho khả dụng thời gian thực và quản lý định mức tiêu hao
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#00249C] hover:bg-blue-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phiếu Yêu Cầu NVL</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-[#00249C] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Danh Sách Phiếu Yêu Cầu NVL ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'availability'
              ? 'bg-[#00249C] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Tra Cứu Tồn Kho Khả Dụng (Liên Kết Kho)</span>
        </button>
      </div>

      {/* Tab 1: Requests List */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-4">Mã Phiếu</th>
                  <th className="p-4">Lệnh Sản Xuất</th>
                  <th className="p-4">Danh Mục NVL & Số Lượng Cần</th>
                  <th className="p-4">Người Lập Phiếu</th>
                  <th className="p-4">Ngày Yêu Cầu</th>
                  <th className="p-4 text-center">Trạng Thái Kho</th>
                  <th className="p-4">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-400">Đang tải phiếu yêu cầu NVL...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-400">Chưa có phiếu yêu cầu nguyên vật liệu nào.</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.maPhieuYCNVL} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-black text-[#00249C]">{r.maPhieuYCNVL}</td>
                      <td className="p-4 font-bold text-slate-800">
                        {r.lenh_san_xuat?.maLenh} - {r.lenh_san_xuat?.tenLenh}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {r.chi_tiets?.map((ct, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-[11px]">
                              <span className="font-semibold text-slate-900">• {ct.tenNVL || ct.nguyen_vat_lieu?.tenNVL}:</span>
                              <span className="font-bold text-blue-700">{Number(ct.soLuong).toLocaleString('vi-VN')} {ct.nguyen_vat_lieu?.donVi || 'Đơn vị'}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {r.nhan_vien?.hoTen || r.maNhanVien}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{r.ngayYeuCau}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.trangThai === 'Đã xuất kho' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : r.trangThai === 'Từ chối' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.trangThai}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">{r.ghiChu || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Warehouse Stock Availability */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#00249C] flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Số Lượng Nguyên Vật Liệu Tồn Kho Khả Dụng (Live Warehouse Sync)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu đồng bộ trực tiếp từ phân hệ Quản lý Kho Vinamilk, đảm bảo đủ nguyên liệu trước khi kích hoạt mẻ sản xuất
              </p>
            </div>
            <button 
              onClick={fetchData} 
              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100"
            >
              Làm Mới Tồn Kho
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockAvailability.map((m) => (
              <div key={m.maNVL} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-700 bg-white px-2 py-0.5 rounded-md font-mono border">
                    {m.maNVL}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.tinhTrang === 'Đầy đủ' ? 'bg-emerald-100 text-emerald-800' :
                    m.tinhTrang === 'Sắp hết' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {m.tinhTrang}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{m.tenNVL}</h4>
                  <p className="text-[10px] text-slate-500">{m.phanLoai}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Tồn khả dụng:</span>
                  <b className="text-sm font-black text-blue-800 font-mono">
                    {Number(m.soLuongTonKhaDung).toLocaleString('vi-VN')} {m.donVi}
                  </b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Material Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#001E50] flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Tạo Phiếu Yêu Cầu Cấp Phát NVL Mới</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Phiếu (Tự sinh)</label>
                  <input
                    type="text"
                    placeholder="VD: YCNVL003"
                    value={formData.maPhieuYCNVL}
                    onChange={(e) => setFormData({ ...formData, maPhieuYCNVL: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Áp Dụng Cho Lệnh SX *</label>
                  <select
                    value={formData.maLenh}
                    onChange={(e) => setFormData({ ...formData, maLenh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    {orders.map((o) => (
                      <option key={o.maLenh} value={o.maLenh}>{o.maLenh} - {o.tenLenh}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Yêu Cầu</label>
                <input
                  type="text"
                  placeholder="VD: Cấp phát NVL phục vụ khâu phối trộn mẻ sáng"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              {/* Items List */}
              <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Danh Mục Nguyên Vật Liệu Yêu Cầu</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm NVL</span>
                  </button>
                </div>

                {formData.items.map((it, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <select
                        value={it.maNVL}
                        onChange={(e) => {
                          const items = [...formData.items];
                          items[idx].maNVL = e.target.value;
                          setFormData({ ...formData, items });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-medium text-xs"
                      >
                        {materials.map((m) => (
                          <option key={m.maNVL} value={m.maNVL}>{m.tenNVL} ({m.donVi})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32">
                      <input
                        type="number"
                        min="1"
                        placeholder="Số lượng"
                        value={it.soLuong}
                        onChange={(e) => {
                          const items = [...formData.items];
                          items[idx].soLuong = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, items });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-xs"
                      />
                    </div>

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00249C] hover:bg-blue-900 text-white rounded-xl font-bold shadow-md"
                >
                  Gửi Yêu Cầu Sang Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
