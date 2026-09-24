import React, { useEffect, useState, useMemo } from 'react';
import { InventoryAPI } from '../../services/api';
import { Clock, Search } from 'lucide-react';
import FefoBadge from '../../components/FefoBadge';
import Pagination from '../../components/Pagination';

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLots();
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchKey, lots]);

  const totalPages = Math.ceil(lots.length / pageSize) || 1;
  const paginatedLots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return lots.slice(start, start + pageSize);
  }, [lots, currentPage, pageSize]);

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

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tra cứu theo Mã lô (Batch ID), tên sản phẩm, tên NVL..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 font-medium outline-none"
        >
          <option value="">Tất cả Loại Lô Tồn Kho</option>
          <option value="product">Chỉ Lô Thành Phẩm Sữa</option>
          <option value="material">Chỉ Lô Nguyên Vật Liệu</option>
        </select>
        <button type="submit" className="bg-[#0B2341] hover:bg-blue-900 text-white text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer">
          Lọc Dữ Liệu
        </button>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Lô (Batch ID)</th>
                <th className="p-3">Tên Lô / Mô Tả</th>
                <th className="p-3">Mặt Hàng Tham Chiếu</th>
                <th className="p-3">Kho Lưu Trữ</th>
                <th className="p-3">Ngày Sản Xuất</th>
                <th className="p-3">Hạn Sử Dụng</th>
                <th className="p-3 text-center">Chất Lượng</th>
                <th className="p-3 text-right">Tồn Khả Dụng</th>
                <th className="p-3 text-center">FEFO Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="9" className="p-4 text-center text-slate-400">Đang tải lô tồn kho...</td></tr>
              ) : lots.length === 0 ? (
                <tr><td colSpan="9" className="p-4 text-center text-slate-400">Không có lô tồn kho nào.</td></tr>
              ) : (
                paginatedLots.map((l) => {
                  const daysLeft = Math.ceil((new Date(l.hanSuDung) - new Date()) / (1000 * 60 * 60 * 24));
                  const itemName = l.san_pham?.tenSanPham || l.sanPham?.tenSanPham || l.nguyen_vat_lieu?.tenNVL || l.nguyenVatLieu?.tenNVL || '-';
                  const rawQ = String(l.trangThaiChatLuong || '').trim().toLowerCase();
                  const qualityStatus = (rawQ.includes('kiểm tra') || rawQ.includes('kiem tra'))
                    ? 'Chờ kiểm tra'
                    : (rawQ.includes('không') || rawQ.includes('khong') || rawQ.includes('hỏng') || rawQ.includes('hong'))
                    ? 'Không đạt'
                    : 'Đạt';
                  return (
                    <tr key={l.maTonKho} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-[#0B2341]">{l.maTonKho}</td>
                      <td className="p-3 font-semibold text-slate-800">{l.tenTonKho}</td>
                      <td className="p-3 text-slate-600 font-medium">{itemName}</td>
                      <td className="p-3 text-slate-600 font-medium">{l.kho?.tenKho || l.maKho || 'Kho Tổng'}</td>
                      <td className="p-3 text-slate-500 font-mono">{l.ngaySanXuat}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{l.hanSuDung}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          qualityStatus === 'Đạt'
                            ? 'bg-emerald-100 text-emerald-700'
                            : qualityStatus === 'Chờ kiểm tra'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {qualityStatus}
                        </span>
                      </td>
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
        <div className="p-3 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={lots.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
}
