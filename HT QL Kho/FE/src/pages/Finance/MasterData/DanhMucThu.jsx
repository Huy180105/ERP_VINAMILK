import React, { useEffect, useState } from 'react';
import { FinanceMasterDataAPI } from '../../../services/financeApi';
import { ListTree, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { generateAutoCode } from '../../../utils/codeGenerator';

export default function DanhMucThu() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    maDanhMucThu: '',
    tenDanhMucThu: '',
    moTa: '',
    trangThai: 1,
  });

  useEffect(() => {
    fetchData();
  }, [keyword]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await FinanceMasterDataAPI.getRevCategories({ keyword });
      if (res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    const autoCode = generateAutoCode(categories, 'maDanhMucThu', 'DMT', 2, false);
    setEditingItem(null);
    setFormData({
      maDanhMucThu: autoCode,
      tenDanhMucThu: '',
      moTa: '',
      trangThai: 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      maDanhMucThu: item.maDanhMucThu,
      tenDanhMucThu: item.tenDanhMucThu,
      moTa: item.moTa || '',
      trangThai: item.trangThai ? 1 : 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await FinanceMasterDataAPI.updateRevCategory(editingItem.maDanhMucThu, formData);
      } else {
        await FinanceMasterDataAPI.createRevCategory(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Xác nhận xóa danh mục thu ${id}?`)) {
      try {
        await FinanceMasterDataAPI.deleteRevCategory(id);
        fetchData();
      } catch (err) {
        alert('Lỗi: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <ListTree className="w-6 h-6 text-[#0052FF]" />
            <span>Danh Mục Khoản Mục Thu</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các khoản mục thu tiền (Bán hàng, thanh lý, lãi ngân hàng...)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#0B2341] hover:bg-[#132F4C] text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khoản Mục Thu</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên khoản thu..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">Tổng số: <b>{categories.length}</b> danh mục</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Khoản Thu</th>
                <th className="p-3.5">Tên Khoản Mục Thu</th>
                <th className="p-3.5">Mô Tả Chi Tiết</th>
                <th className="p-3.5 text-center">Trạng Thái</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-400">Đang tải danh mục...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-400">Không tìm thấy khoản mục thu nào</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.maDanhMucThu} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-[#0B2341]">{c.maDanhMucThu}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{c.tenDanhMucThu}</td>
                    <td className="p-3.5 text-slate-600">{c.moTa || '—'}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                        c.trangThai ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.trangThai ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        <span>{c.trangThai ? 'Kích hoạt' : 'Tạm khóa'}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-slate-500 hover:text-[#0052FF] hover:bg-blue-50/60 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.maDanhMucThu)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 -xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">
              {editingItem ? 'Cập Nhật Khoản Mục Thu' : 'Thêm Mới Khoản Mục Thu'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Khoản Thu:</label>
                <input
                  type="text"
                  value={formData.maDanhMucThu}
                  disabled={!!editingItem}
                  onChange={(e) => setFormData({ ...formData, maDanhMucThu: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Khoản Mục Thu:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thu tiền bán hàng"
                  value={formData.tenDanhMucThu}
                  onChange={(e) => setFormData({ ...formData, tenDanhMucThu: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô Tả / Diễn Giải:</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả mục đích khoản thu..."
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-medium"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="trangThaiDMT"
                  checked={!!formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked ? 1 : 0 })}
                  className="rounded border-slate-300 text-[#0052FF] focus:ring-purple-500"
                />
                <label htmlFor="trangThaiDMT" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Kích hoạt khoản mục này
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-xs font-bold bg-[#0B2341] hover:bg-[#132F4C] text-white shadow-sm"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Khoản Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
