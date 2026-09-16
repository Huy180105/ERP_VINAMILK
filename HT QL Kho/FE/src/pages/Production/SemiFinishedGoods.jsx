import React, { useEffect, useState } from 'react';
import { ProductionAPI } from '../../services/api';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  GitCompare, 
  CheckCircle2, 
  Clock, 
  Layers, 
  X,
  FileSpreadsheet,
  Activity
} from 'lucide-react';

export default function SemiFinishedGoods() {
  const [btpList, setBtpList] = useState([]);
  const [btpTransfers, setBtpTransfers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'transfers'

  // Create BTP Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    maPhieuYCBTP: '',
    maLenh: 'LSX001',
    ngayYeuCau: new Date().toISOString().split('T')[0],
    ghiChu: '',
    items: [{ maBTP: 'BTP001', soLuong: 5000 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [btpRes, trfRes, ordRes] = await Promise.all([
        ProductionAPI.getSemiFinishedGoods(),
        ProductionAPI.getBTPTransfers(),
        ProductionAPI.getOrders()
      ]);
      setBtpList(btpRes.data.data || []);
      setBtpTransfers(trfRes.data.data || []);
      setOrders(ordRes.data.data || []);
    } catch (err) {
      console.error('Error fetching BTP data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      await ProductionAPI.createBTPTransfer(transferForm);
      alert('Tạo Phiếu điều chuyển Bán thành phẩm thành công!');
      setShowTransferModal(false);
      fetchData();
    } catch (err) {
      alert('Lỗi tạo phiếu: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#001E50] flex items-center space-x-2.5">
            <FlaskConical className="w-6 h-6 text-purple-600" />
            <span>Quản Lý Bán Thành Phẩm & Tiến Độ (PR-FR24 → PR-FR27, PR-FR32)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi khối lượng bán thành phẩm trung gian (Sữa lọc, Sữa tiệt trùng, Sữa đồng hóa) và điều phối giữa các khâu
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phiếu Chuyển BTP Khâu</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Danh Mục Bán Thành Phẩm ({btpList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Phiếu Điều Chuyển BTP Giữa Các Công Đoạn ({btpTransfers.length})</span>
        </button>
      </div>

      {/* Tab 1: BTP Inventory */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border">Đang tải danh mục Bán thành phẩm...</div>
          ) : btpList.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border">Chưa phát sinh Bán thành phẩm.</div>
          ) : (
            btpList.map((btp) => (
              <div key={btp.maBTP} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-mono">
                    {btp.maBTP}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {btp.trangThai || 'Đạt chuẩn'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{btp.tenBTP}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{btp.ghiChu || 'BTP phục vụ khâu chiết rót đóng hộp'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Khối lượng hiện có:</span>
                  <b className="text-base font-black text-purple-900 font-mono">
                    {Number(btp.soLuong).toLocaleString('vi-VN')} {btp.donVi || 'Lít'}
                  </b>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: BTP Transfers */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="p-4">Mã Phiếu Chuyển</th>
                  <th className="p-4">Lệnh Sản Xuất</th>
                  <th className="p-4">Danh Mục BTP & Khối Lượng Chuyển</th>
                  <th className="p-4">Người Điều Phối</th>
                  <th className="p-4">Ngày Chuyển</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">Đang tải phiếu điều chuyển BTP...</td></tr>
                ) : btpTransfers.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-400">Chưa có phiếu điều chuyển BTP nào.</td></tr>
                ) : (
                  btpTransfers.map((t) => (
                    <tr key={t.maPhieuYCBTP} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-black text-purple-800">{t.maPhieuYCBTP}</td>
                      <td className="p-4 font-bold text-slate-900">{t.lenh_san_xuat?.maLenh} - {t.lenh_san_xuat?.tenLenh}</td>
                      <td className="p-4">
                        {t.chi_tiets?.map((ct, idx) => (
                          <div key={idx} className="font-semibold text-slate-800 text-[11px]">
                            • {ct.tenBTP || ct.maBTP}: <b className="text-purple-700">{Number(ct.soLuong).toLocaleString('vi-VN')} Lít</b>
                          </div>
                        ))}
                      </td>
                      <td className="p-4 text-slate-600">{t.nhan_vien?.hoTen || t.maNhanVien}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{t.ngayYeuCau}</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {t.trangThai || 'Đã duyệt chuyển'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#001E50] flex items-center space-x-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <span>Tạo Phiếu Điều Chuyển BTP Sang Công Đoạn Tiếp Theo</span>
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Phiếu (Tự sinh)</label>
                  <input
                    type="text"
                    placeholder="VD: YCBTP003"
                    value={transferForm.maPhieuYCBTP}
                    onChange={(e) => setTransferForm({ ...transferForm, maPhieuYCBTP: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lệnh Sản Xuất *</label>
                  <select
                    value={transferForm.maLenh}
                    onChange={(e) => setTransferForm({ ...transferForm, maLenh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold"
                  >
                    {orders.map((o) => (
                      <option key={o.maLenh} value={o.maLenh}>{o.maLenh} - {o.tenLenh}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn Bán Thành Phẩm *</label>
                  <select
                    value={transferForm.items[0].maBTP}
                    onChange={(e) => {
                      const items = [...transferForm.items];
                      items[0].maBTP = e.target.value;
                      setTransferForm({ ...transferForm, items });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    {btpList.map((b) => (
                      <option key={b.maBTP} value={b.maBTP}>{b.tenBTP} ({b.maBTP})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối Lượng Chuyển (Lít/Hộp) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferForm.items[0].soLuong}
                    onChange={(e) => {
                      const items = [...transferForm.items];
                      items[0].soLuong = parseInt(e.target.value) || 0;
                      setTransferForm({ ...transferForm, items });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md"
                >
                  Xác Nhận Chuyển BTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
