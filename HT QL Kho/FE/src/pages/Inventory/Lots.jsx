import React, { useEffect, useState } from 'react';
import { InventoryAPI } from '../../services/api';
import { Clock, Search, Filter, Layers, Zap } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import FefoBadge from '../../components/FefoBadge';

export default function InventoryLots() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchKey, setSearchKey] = useState('');

  useEffect(() => {
    fetchLots();
  }, [typeFilter]);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const res = await InventoryAPI.getInventory({ type: typeFilter, keyword: searchKey });
      setLots(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>Tra Cứu Tồn Kho Theo Lô & Hạn Sử Dụng (FEFO)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý chi tiết từng lô sản phẩm thành phẩm & nguyên vật liệu thô trong kho Vinamilk
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tra cứu theo Mã lô (Batch ID), tên sản phẩm, tên NVL..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium"
        >
          <option value="">Tất cả Loại Lô Tồn Kho</option>
          <option value="product">Chỉ Lô Thành Phẩm Sữa</option>
          <option value="material">Chỉ Lô Nguyên Vật Liệu</option>
        </select>
        <button onClick={fetchLots} className="bg-[#0B2341] hover:bg-blue-900 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
          Lọc Dữ Liệu
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Lô (Batch ID)</th>
                <th className="p-3">Tên Lô / Mô Tả</th>
                <th className="p-3">Mặt Hàng Tham Chiếu</th>
                <th className="p-3">Ngày Sản Xuất</th>
                <th className="p-3">Hạn Sử Dụng</th>
                <th className="p-3 text-right">Tồn Khả Dụng</th>
                <th className="p-3 text-center">FEFO Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-400">Đang tải lô tồn kho...</td></tr>
              ) : lots.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-400">Không có lô tồn kho nào.</td></tr>
              ) : (
                lots.map((l) => {
                  const daysLeft = Math.ceil((new Date(l.hanSuDung) - new Date()) / (1000 * 60 * 60 * 24));
                  const itemName = l.san_pham?.tenSanPham || l.nguyen_vat_lieu?.tenNVL || '-';
                  return (
                    <tr key={l.maTonKho} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-[#0B2341]">{l.maTonKho}</td>
                      <td className="p-3 font-semibold text-slate-800">{l.tenTonKho}</td>
                      <td className="p-3 text-slate-600 font-medium">{itemName}</td>
                      <td className="p-3 text-slate-500 font-mono">{l.ngaySanXuat}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{l.hanSuDung}</td>
                      <td className="p-3 text-right font-semibold text-emerald-700">
                        {l.soLuongTonHienTai?.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <FefoBadge daysLeft={daysLeft} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
