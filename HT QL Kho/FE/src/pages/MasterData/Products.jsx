import React, { useEffect, useState, useMemo } from 'react';
import { MasterDataAPI } from '../../services/api';
import { Package, Award, Search, RefreshCw } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (keyword = searchKey) => {
    setLoading(true);
    try {
      const res = await MasterDataAPI.getProducts({ keyword });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchKey);
  };

  const handleReset = () => {
    setSearchKey('');
    setStatusFilter('');
    fetchProducts('');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredProducts = products.filter(p => {
    if (!statusFilter) return true;
    return (p.trangThai || 'Đang kinh doanh') === statusFilter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchKey]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Danh Mục Sản Phẩm Thành Phẩm Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Các dòng sản phẩm sữa đạt chuẩn chất lượng quốc tế được đồng bộ trực tiếp từ phân hệ Sản xuất
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center space-x-1.5 shrink-0">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Đạt chuẩn Quốc tế Monde Selection</span>
        </div>
      </div>

      {/* Thanh Tìm Kiếm & Bộ Lọc Sản Phẩm */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã sản phẩm (SP001...), tên sản phẩm..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang kinh doanh">Đang kinh doanh</option>
          <option value="Ngừng kinh doanh">Ngừng kinh doanh</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tìm kiếm</span>
        </button>
        {(searchKey || statusFilter) && (
          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-3 py-2 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
            title="Xóa lọc"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </form>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Sản Phẩm</th>
                <th className="p-3">Tên Sản Phẩm Thành Phẩm</th>
                <th className="p-3 text-center">Đơn Vị Tính</th>
                <th className="p-3 text-right">Đơn Giá Niêm Yết</th>
                <th className="p-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-400">Đang tải danh mục Sản phẩm...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-400">Không tìm thấy sản phẩm nào phù hợp.</td></tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.maSanPham} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#0B2341]">{p.maSanPham}</td>
                    <td className="p-3 font-semibold text-slate-800 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{p.tenSanPham}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-blue-700">{p.donViTinh || 'Hộp'}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {p.donGia ? `${Number(p.donGia).toLocaleString()} đ` : 'Chưa định giá'}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={p.trangThai || 'Đang kinh doanh'} />
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
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
}
