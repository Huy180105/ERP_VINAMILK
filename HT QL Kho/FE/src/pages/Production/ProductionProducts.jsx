import React, { useEffect, useState } from 'react';
import { ProductionAPI } from '../../services/api';
import { 
  Package, Plus, Search, Trash2, Edit3, CheckCircle2, 
  AlertCircle, Eye, Calendar, Sparkles, Filter, X
} from 'lucide-react';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function ProductionProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const initialForm = {
    maSanPham: '',
    tenSanPham: '',
    donViTinh: 'Thùng',
    hanSuDung: '180 ngày',
    donGia: 0,
    trangThai: 'Đang kinh doanh',
    ghiChu: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductionAPI.getProducts({ keyword: searchKey, trangThai: selectedStatus });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    const autoCode = generateAutoCode(products, 'maSanPham', 'SP', 3, false);
    setFormData({
      ...initialForm,
      maSanPham: autoCode,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setIsEditing(true);
    setFormData({
      maSanPham: prod.maSanPham,
      tenSanPham: prod.tenSanPham,
      donViTinh: prod.donViTinh || 'Thùng',
      hanSuDung: prod.hanSuDung || '180 ngày',
      donGia: prod.donGia || 0,
      trangThai: prod.trangThai || 'Đang kinh doanh',
      ghiChu: prod.ghiChu || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenSanPham.trim()) {
      alert('Vui lòng nhập tên sản phẩm.');
      return;
    }

    try {
      if (isEditing) {
        await ProductionAPI.updateProduct(formData.maSanPham, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await ProductionAPI.createProduct(formData);
        alert('Thêm sản phẩm thành phẩm mới thành công! Dữ liệu đã đồng bộ sang phân hệ Kho.');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert('Lỗi thao tác sản phẩm: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${id}?`)) {
      try {
        await ProductionAPI.deleteProduct(id);
        alert('Đã xóa sản phẩm thành công!');
        fetchProducts();
      } catch (err) {
        alert('Lỗi xóa sản phẩm: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ProductionAPI.updateProductStatus(id, { trangThai: newStatus });
      fetchProducts();
    } catch (err) {
      alert('Lỗi đổi trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đang kinh doanh':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Đang kinh doanh</span>;
      case 'Tạm ngừng':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Tạm ngừng</span>;
      case 'Ngừng sản xuất':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Ngừng sản xuất</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Package className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-black text-slate-800">Quản Lý Danh Mục Sản Phẩm (PR-FR01 — PR-FR06)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 ml-10">
            Sản phẩm do phân hệ Sản xuất sở hữu và quản lý duy nhất. Dữ liệu tự động đồng bộ sang phân hệ Kho (WMS) và Bán hàng.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã sản phẩm (SPxxx), tên sản phẩm..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tất cả Trạng Thái</option>
          <option value="Đang kinh doanh">Đang kinh doanh</option>
          <option value="Tạm ngừng">Tạm ngừng</option>
          <option value="Ngừng sản xuất">Ngừng sản xuất</option>
        </select>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer">
          Tìm Kiếm
        </button>
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Sản Phẩm</th>
                <th className="p-3.5">Tên Sản Phẩm Thành Phẩm</th>
                <th className="p-3.5 text-center">Đơn Vị Tính</th>
                <th className="p-3.5 text-center">Hạn Sử Dụng</th>
                <th className="p-3.5 text-right">Đơn Giá Niêm Yết</th>
                <th className="p-3.5 text-center">Trạng Thái (PR-FR06)</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Đang tải danh mục sản phẩm...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">Không tìm thấy sản phẩm nào.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.maSanPham} className="hover:bg-indigo-50/20 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-900">{p.maSanPham}</td>
                    <td className="p-3.5 font-bold text-slate-800">
                      <div>{p.tenSanPham}</div>
                      {p.ghiChu && <div className="text-[11px] text-slate-400 font-normal mt-0.5">{p.ghiChu}</div>}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">{p.donViTinh || 'Thùng'}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-600">{p.hanSuDung || '180 ngày'}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                      {p.donGia ? `${Number(p.donGia).toLocaleString()} đ` : 'Chưa niêm yết'}
                    </td>
                    <td className="p-3.5 text-center">
                      <select 
                        value={p.trangThai || 'Đang kinh doanh'}
                        onChange={(e) => handleStatusChange(p.maSanPham, e.target.value)}
                        className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Đang kinh doanh">Đang kinh doanh</option>
                        <option value="Tạm ngừng">Tạm ngừng</option>
                        <option value="Ngừng sản xuất">Ngừng sản xuất</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => { setSelectedProduct(p); setShowDetailModal(true); }}
                          title="Xem chi tiết (PR-FR05)"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Sửa sản phẩm (PR-FR02)"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.maSanPham)}
                          title="Xóa sản phẩm (PR-FR03)"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal (PR-FR01, PR-FR02) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>{isEditing ? `Cập Nhật Sản Phẩm (${formData.maSanPham})` : 'Thêm Sản Phẩm Mới (PR-FR01)'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    readOnly={isEditing}
                    value={formData.maSanPham}
                    onChange={(e) => setFormData({ ...formData, maSanPham: e.target.value.toUpperCase() })}
                    placeholder="VD: SP011"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn Vị Tính</label>
                  <select
                    value={formData.donViTinh}
                    onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Thùng">Thùng</option>
                    <option value="Hộp">Hộp</option>
                    <option value="Lốc">Lốc</option>
                    <option value="Chai">Chai</option>
                    <option value="Lon">Lon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Sản Phẩm Thành Phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Sữa Chua Uống Men Sống Probi Việt Quất 65ml"
                  value={formData.tenSanPham}
                  onChange={(e) => setFormData({ ...formData, tenSanPham: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Sử Dụng Tiêu Chuẩn</label>
                  <input
                    type="text"
                    placeholder="VD: 180 ngày hoặc 6 tháng"
                    value={formData.hanSuDung}
                    onChange={(e) => setFormData({ ...formData, hanSuDung: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn Giá Niêm Yết (VND)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 320000"
                    value={formData.donGia}
                    onChange={(e) => setFormData({ ...formData, donGia: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng Thái Khởi Tạo</label>
                <select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Đang kinh doanh">Đang kinh doanh</option>
                  <option value="Tạm ngừng">Tạm ngừng</option>
                  <option value="Ngừng sản xuất">Ngừng sản xuất</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Tiêu Chuẩn / Quy Cách</label>
                <textarea
                  rows="2"
                  placeholder="Ghi chú quy cách đóng thùng, tiêu chuẩn HACCP..."
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
                >
                  {isEditing ? 'Lưu Thay Đổi' : 'Lưu Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal (PR-FR05) */}
      {showDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>Chi Tiết Sản Phẩm (PR-FR05)</span>
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã sản phẩm:</span>
                  <span className="font-mono font-bold text-indigo-900">{selectedProduct.maSanPham}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tên sản phẩm:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[220px]">{selectedProduct.tenSanPham}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Đơn vị tính:</span>
                  <span className="font-semibold text-slate-700">{selectedProduct.donViTinh}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Hạn sử dụng:</span>
                  <span className="font-mono text-slate-700">{selectedProduct.hanSuDung}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Đơn giá niêm yết:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {selectedProduct.donGia ? `${Number(selectedProduct.donGia).toLocaleString()} VND` : 'Chưa niêm yết'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span>{getStatusBadge(selectedProduct.trangThai)}</span>
                </div>
                {selectedProduct.ghiChu && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Ghi chú:</span>
                    <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200">{selectedProduct.ghiChu}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
