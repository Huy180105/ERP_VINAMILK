import React, { useEffect, useMemo, useState } from 'react';
import { SalesAPI } from '../../../services/api';
import {
  Tag,
  Search,
  CheckCircle2,
  AlertCircle,
  PencilLine,
  X,
  PackageCheck,
  TrendingUp,
  Layers
} from 'lucide-react';

const currency = (val) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(val || 0));

export default function SalesPricing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const res = await SalesAPI.getPricing();
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Không thể tải bảng giá sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const notify = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.tenLoaiSP).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'all' || p.tenLoaiSP === categoryFilter;
      const q = keyword.toLowerCase();
      const matchKey =
        !keyword.trim() ||
        (p.maSanPham || '').toLowerCase().includes(q) ||
        (p.tenSanPham || '').toLowerCase().includes(q);
      return matchCat && matchKey;
    });
  }, [products, categoryFilter, keyword]);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewPrice(Number(product.giaBan || 0));
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (newPrice < 0) {
      notify('error', 'Giá bán không được âm.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SalesAPI.updatePrice(editingProduct.maSanPham, { giaBan: newPrice });
      notify('success', `Đã cập nhật giá bán mới cho ${editingProduct.tenSanPham}!`);
      setEditingProduct(null);
      fetchPricing();
    } catch (err) {
      notify('error', 'Không thể cập nhật giá bán sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all ${
            notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 text-[#002795]">
            <Tag className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SA-FR06</span>
        </div>
        <h1 className="text-xl font-black text-[#0B2341] mt-2">Bảng Giá Bán & Danh Mục Sản Phẩm</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý chính sách giá bán niêm yết các sản phẩm thành phẩm Vinamilk áp dụng cho kênh phân phối và đơn hàng bán lẻ.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã sản phẩm, tên sản phẩm..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-2xl outline-none"
          >
            <option value="all">Tất cả ngành hàng</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Hiển thị: <span className="font-bold text-[#0B2341]">{filteredProducts.length}</span> mặt hàng
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Mã Sản Phẩm</th>
                <th className="px-5 py-4">Tên Sản Phẩm</th>
                <th className="px-5 py-4">Ngành Hàng</th>
                <th className="px-5 py-4">Quy Cách Đóng Gói</th>
                <th className="px-5 py-4">Đơn Vị Tính</th>
                <th className="px-5 py-4 text-right">Giá Bán Niêm Yết</th>
                <th className="px-5 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Đang nạp bảng giá sản phẩm...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.maSanPham} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#002795]">{p.maSanPham}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{p.tenSanPham}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {p.tenLoaiSP || 'Thành phẩm'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.quyCachDongGoi || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{p.donViTinh || 'Hộp'}</td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 text-sm">
                      {currency(p.giaBan)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => openEditModal(p)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#002795] px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                        Đổi Giá
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chỉnh Sửa Giá Bán */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {editingProduct.maSanPham}
                </span>
                <h2 className="text-base font-black text-[#0B2341] mt-1">Điều Chỉnh Giá Bán</h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">{editingProduct.tenSanPham}</p>
                <p className="text-slate-500">Đơn vị: {editingProduct.donViTinh || 'Hộp'}</p>
                <p className="text-slate-500">Giá hiện tại: <span className="font-bold text-slate-800">{currency(editingProduct.giaBan)}</span></p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Giá Bán Mới (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#002795]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#002795] hover:bg-blue-900 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Lưu Giá Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

