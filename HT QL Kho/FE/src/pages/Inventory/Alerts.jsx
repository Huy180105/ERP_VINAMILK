import React, { useEffect, useState } from 'react';
import { InventoryAPI, MasterDataAPI } from '../../services/api';
import { AlertTriangle, Clock, Plus, Search, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('low-stock'); // 'low-stock' or 'near-expiry'
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [minQtyThreshold, setMinQtyThreshold] = useState(500);

  const [nearExpiryAlerts, setNearExpiryAlerts] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [replenishments, setReplenishments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingReplenishments, setLoadingReplenishments] = useState(true);

  const [searchReplenishment, setSearchReplenishment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    maDeNghi: '',
    maSanPham: '',
    maKho: '',
    soLuong: 1000,
    ngayCanHang: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ghiChu: 'Tồn kho xuống dưới mức tối thiểu, đề nghị xưởng sản xuất bổ sung khẩn cấp.',
  });

  useEffect(() => {
    fetchAlerts();
    fetchReplenishments();
    MasterDataAPI.getProducts().then(res => setProducts(res.data.data || [])).catch(console.error);
    MasterDataAPI.getWarehouses().then(res => setWarehouses(res.data.data || [])).catch(console.error);
  }, []);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const [nearRes, lowRes] = await Promise.all([
        InventoryAPI.getNearExpiryAlerts(daysThreshold),
        InventoryAPI.getLowStockAlerts(minQtyThreshold)
      ]);
      setNearExpiryAlerts(nearRes.data.data || []);
      setLowStockAlerts(lowRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const fetchReplenishments = async () => {
    setLoadingReplenishments(true);
    try {
      const res = await InventoryAPI.getReplenishments({
        keyword: searchReplenishment,
        trangThai: statusFilter
      });
      setReplenishments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReplenishments(false);
    }
  };

  const handleApplyThresholds = (e) => {
    e.preventDefault();
    fetchAlerts();
  };

  const handleSearchReplenishments = (e) => {
    e.preventDefault();
    fetchReplenishments();
  };

  const handleOpenModal = async (prefillItem = null) => {
    let nextCode = '';
    try {
      const codeRes = await InventoryAPI.getNextReplenishmentCode();
      if (codeRes.data.success) {
        nextCode = codeRes.data.code;
      }
    } catch (e) {
      console.warn('Cannot fetch next-code for replenishment:', e.message);
    }

    if (!nextCode) {
      nextCode = generateAutoCode(replenishments, 'maDeNghi', 'DNSP', 2, true);
    }

    const defaultSP = prefillItem?.maSanPham || products[0]?.maSanPham || 'SP001';
    const defaultKho = prefillItem?.maKho || warehouses[0]?.maKho || 'K004';
    const defaultQty = prefillItem ? Math.max(minQtyThreshold * 2 - (prefillItem.soLuongTonHienTai || 0), 500) : 1000;

    setFormData({
      maDeNghi: nextCode,
      maSanPham: defaultSP,
      maKho: defaultKho,
      soLuong: defaultQty,
      ngayCanHang: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ghiChu: prefillItem 
        ? `Tồn lô ${prefillItem.maTonKho} (${prefillItem.tenTonKho}) chỉ còn ${prefillItem.soLuongTonHienTai}, dưới định mức tối thiểu. Đề nghị sản xuất gấp.`
        : 'Tồn kho xuống dưới mức tối thiểu, đề nghị xưởng sản xuất bổ sung khẩn cấp.',
    });
    setShowModal(true);
  };

  const handleCreateReplenishment = async (e) => {
    e.preventDefault();
    try {
      await InventoryAPI.createReplenishment(formData);
      alert('Gửi đề nghị bổ sung sản phẩm sang phân hệ Sản Xuất thành công! (CF-FR60)');
      setShowModal(false);
      fetchReplenishments();
    } catch (err) {
      alert('Lỗi tạo đề nghị bổ sung: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Cảnh Báo Kho & Đề Nghị Bổ Sung</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tồn kho giảm dưới mức tối thiểu và gửi yêu cầu bổ sung sang xưởng sản xuất (CF-FR53 - CF-FR61)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#0B2341] hover:bg-blue-900 text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Lập Đề Nghị Bổ Sung (CF-FR60)</span>
        </button>
      </div>

      {/* Threshold Filter Bar */}
      <form onSubmit={handleApplyThresholds} className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 font-semibold whitespace-nowrap">Số ngày HSD:</span>
          <input
            type="number"
            min="1"
            max="365"
            value={daysThreshold}
            onChange={(e) => setDaysThreshold(Number(e.target.value))}
            className="w-20 bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-center text-slate-800"
          />
          <span className="text-slate-400">ngày</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span className="text-slate-600 font-semibold whitespace-nowrap">Mức tồn tối thiểu:</span>
          <input
            type="number"
            min="1"
            value={minQtyThreshold}
            onChange={(e) => setMinQtyThreshold(Number(e.target.value))}
            className="w-24 bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-center text-slate-800"
          />
          <span className="text-slate-400">đơn vị</span>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded transition cursor-pointer ml-auto"
        >
          Áp Dụng
        </button>
      </form>

      {/* Alert Section with Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('low-stock')}
            className={`px-5 py-3 text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'low-stock'
                ? 'border-b-2 border-rose-600 text-rose-600 bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Dưới Mức Tối Thiểu ({lowStockAlerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('near-expiry')}
            className={`px-5 py-3 text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'near-expiry'
                ? 'border-b-2 border-amber-500 text-amber-600 bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Sắp Hết Hạn ({nearExpiryAlerts.length})</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Lô</th>
                <th className="p-3">Tên Sản Phẩm / Lô Hàng</th>
                <th className="p-3">Vị Trí Lưu Kho</th>
                <th className="p-3 text-center">Hạn Sử Dụng</th>
                <th className="p-3 text-right">Tồn Hiện Tại</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingAlerts ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-400">Đang quét dữ liệu cảnh báo...</td></tr>
              ) : (activeTab === 'low-stock' ? lowStockAlerts : nearExpiryAlerts).length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Không có cảnh báo nào trong điều kiện này.</td></tr>
              ) : (
                (activeTab === 'low-stock' ? lowStockAlerts : nearExpiryAlerts).map((lot) => (
                  <tr key={lot.maTonKho} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-blue-900">{lot.maTonKho}</td>
                    <td className="p-3 font-semibold text-slate-800">{lot.tenTonKho || lot.sanPham?.tenSanPham || lot.nguyenVatLieu?.tenNVL}</td>
                    <td className="p-3 text-slate-600">{lot.kho?.tenKho || lot.maKho || 'Kho Tổng'}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{lot.hanSuDung}</td>
                    <td className="p-3 text-right font-bold text-rose-600">
                      {lot.soLuongTonHienTai?.toLocaleString()} {lot.sanPham?.donViTinh || lot.nguyenVatLieu?.donVi || 'hộp'}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lot.soLuongTonHienTai <= 100 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lot.soLuongTonHienTai === 0 ? 'Hết hàng' : 'Tồn thấp'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenModal(lot)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] inline-flex items-center space-x-1.5 cursor-pointer shadow-sm transition hover:scale-105 active:scale-95"
                        title="Tạo đề nghị bổ sung sản phẩm gửi sang Sản Xuất (CF-FR60)"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Đề Nghị SX</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replenishments List Section (CF-FR61) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Đề Nghị Bổ Sung Đã Gửi Sang Sản Xuất (CF-FR61)</h2>
            <p className="text-[11px] text-slate-500">Tra cứu danh sách đề nghị đã gửi và trạng thái tiếp nhận từ nhà máy</p>
          </div>
          <form onSubmit={handleSearchReplenishments} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, sản phẩm..."
                value={searchReplenishment}
                onChange={(e) => setSearchReplenishment(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ChoDuyet">Chờ tiếp nhận</option>
              <option value="DaTiepNhan">Đã tiếp nhận</option>
              <option value="HoanThanh">Đã nhập kho</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer"
            >
              Lọc
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Đề Nghị</th>
                <th className="p-3">Sản Phẩm</th>
                <th className="p-3">Kho Tiếp Nhận</th>
                <th className="p-3 text-right">Số Lượng Đề Nghị</th>
                <th className="p-3 text-center">Ngày Cần Hàng</th>
                <th className="p-3 text-center">Ngày Gửi</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingReplenishments ? (
                <tr><td colSpan="8" className="p-4 text-center text-slate-400">Đang tải danh sách đề nghị...</td></tr>
              ) : replenishments.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-slate-400">Chưa có đề nghị bổ sung nào được gửi.</td></tr>
              ) : (
                replenishments.map((r) => (
                  <tr key={r.maDeNghi} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-blue-700">{r.maDeNghi}</td>
                    <td className="p-3 font-semibold text-slate-800">{r.san_pham?.tenSanPham || r.maSanPham}</td>
                    <td className="p-3 text-slate-600">{r.kho?.tenKho || r.maKho}</td>
                    <td className="p-3 text-right font-bold text-blue-900">{r.soLuong?.toLocaleString()}</td>
                    <td className="p-3 text-center font-mono text-slate-600">{r.ngayCanHang}</td>
                    <td className="p-3 text-center font-mono text-[11px] text-slate-500">{r.ngayDeNghi?.slice(0, 10)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.trangThai === 'HoanThanh' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : r.trangThai === 'DaTiepNhan' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.trangThai === 'HoanThanh' ? 'Đã nhập kho' : r.trangThai === 'DaTiepNhan' ? 'Đã tiếp nhận' : 'Chờ tiếp nhận'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{r.ghiChu}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Lập Đề Nghị Bổ Sung (CF-FR60) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2 flex items-center space-x-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Lập Đề Nghị Bổ Sung Sản Phẩm Sang Sản Xuất (CF-FR60)</span>
            </h3>
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2.5 rounded-lg text-[11px] flex items-center space-x-2">
              <Send className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Đề nghị này sẽ tự động chuyển sang phân hệ <strong>Quản Lý Sản Xuất</strong> để Quản đốc xưởng (Anh Long) tiếp nhận và duyệt Lệnh sản xuất.</span>
            </div>
            <form onSubmit={handleCreateReplenishment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã Đề Nghị (Tự động) *</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.maDeNghi}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày Cần Hàng *</label>
                  <input
                    type="date"
                    required
                    value={formData.ngayCanHang}
                    onChange={(e) => setFormData({ ...formData, ngayCanHang: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sản Phẩm Cần Bổ Sung *</label>
                <select
                  value={formData.maSanPham}
                  onChange={(e) => setFormData({ ...formData, maSanPham: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  required
                >
                  {products.map(p => (
                    <option key={p.maSanPham} value={p.maSanPham}>
                      {p.maSanPham} - {p.tenSanPham} ({p.donViTinh || 'Thùng'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kho Tiếp Nhận *</label>
                <select
                  value={formData.maKho}
                  onChange={(e) => setFormData({ ...formData, maKho: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  required
                >
                  {warehouses.map(w => (
                    <option key={w.maKho} value={w.maKho}>
                      {w.maKho} - {w.tenKho} ({w.loaiKho})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số Lượng Đề Nghị Sản Xuất *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.soLuong}
                  onChange={(e) => setFormData({ ...formData, soLuong: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lý Do Đề Nghị Bổ Sung *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  placeholder="Lý do bổ sung (VD: Tồn kho giảm dưới mức an toàn 500 thùng, đơn hàng đại lý tăng cao...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                ></textarea>
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
                  className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer shadow-sm"
                >
                  Gửi Đề Nghị Sang Sản Xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
