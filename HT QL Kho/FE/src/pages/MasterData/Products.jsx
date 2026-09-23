import React, { useEffect, useState } from 'react';
import { MasterDataAPI } from '../../services/api';
import { Package, Award } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await MasterDataAPI.getProducts();
      setProducts(res.data.data || []);
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
            <Package className="w-6 h-6 text-blue-600" />
            <span>Danh Mục Sản Phẩm Thành Phẩm Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Các dòng sản phẩm sữa đạt chuẩn chất lượng quốc tế được đồng bộ trực tiếp từ phân hệ Sản xuất
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Đạt chuẩn Quốc tế Monde Selection</span>
        </div>
      </div>

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
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-400">Không có dữ liệu sản phẩm.</td></tr>
              ) : (
                products.map((p) => (
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
      </div>
    </div>
  );
}
