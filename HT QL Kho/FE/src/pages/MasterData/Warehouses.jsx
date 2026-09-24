import React, { useEffect, useState } from 'react';
import { MasterDataAPI } from '../../services/api';
import { Building, Plus, Search, Trash2, Edit3, MapPin, Layers, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    maKho: '',
    tenKho: '',
    loaiKho: 'Kho thành phẩm',
    diaChi: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await MasterDataAPI.getWarehouses({ keyword: searchKey, loaiKho: selectedType });
      setWarehouses(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWarehouses();
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    const autoCode = generateAutoCode(warehouses, 'maKho', 'K', 3, false);
    setFormData({
      ...initialForm,
      maKho: autoCode,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (w) => {
    setIsEditing(true);
    setEditingId(w.maKho);
    setFormData({
      maKho: w.maKho,
      tenKho: w.tenKho,
      loaiKho: w.loaiKho || 'Kho thành phẩm',
      diaChi: w.diaChi || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenKho.trim()) {
      alert('Vui lòng nhập tên khu vực kho.');
      return;
    }

    try {
      if (isEditing) {
        await MasterDataAPI.updateWarehouse(editingId, formData);
        alert('Cập nhật khu vực kho thành công!');
      } else {
        await MasterDataAPI.createWarehouse(formData);
        alert('Thêm khu vực kho mới thành công!');
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa khu vực kho ${id}? (Chỉ xóa được khi chưa có lô hàng nào lưu trữ)`)) {
      try {
        await MasterDataAPI.deleteWarehouse(id);
        alert('Đã xóa khu vực kho thành công!');
        fetchWarehouses();
      } catch (err) {
        alert('Lỗi xóa khu vực kho: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Building className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-bold text-[#0B2341]">Kho & Vị Trí Lưu Trữ</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-10">
            Quản lý các khu vực lưu trữ nguyên vật liệu và thành phẩm.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#0B2341] hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow transition flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khu Vực Kho</span>
        </button>
      </div>

      {/* Filter and Search Bar (CF-FR13) */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã kho (K001...), tên khu vực kho..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả Loại Kho</option>
          <option value="Kho thành phẩm">Kho thành phẩm</option>
          <option value="Kho NVL">Kho NVL</option>
          <option value="Kho trung chuyển">Kho trung chuyển</option>
          <option value="Kho lạnh">Kho lạnh</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer">
          Lọc Dữ Liệu
        </button>
      </form>

      {/* Warehouses Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Kho</th>
                <th className="p-3.5">Tên Khu Vực / Vị Trí Lưu Trữ</th>
                <th className="p-3.5">Phân Loại Kho</th>
                <th className="p-3.5">Địa Chỉ / Vị Trí</th>
                <th className="p-3.5 text-center">Số Lô Đang Lưu Trữ</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">Đang tải danh mục khu vực kho...</td></tr>
              ) : warehouses.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">Không tìm thấy khu vực kho nào.</td></tr>
              ) : (
                warehouses.map((w) => (
                  <tr key={w.maKho} className="hover:bg-blue-50/20 transition">
                    <td className="p-3.5 font-mono font-bold text-[#0B2341]">{w.maKho}</td>
                    <td className="p-3.5 font-bold text-slate-800">{w.tenKho}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        w.loaiKho === 'Kho NVL' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        w.loaiKho === 'Kho lạnh' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {w.loaiKho || 'Kho thành phẩm'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{w.diaChi || 'Trụ sở chính'}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                        {w.ton_khos_count || 0} lô
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(w)}
                        title="Sửa khu vực kho (CF-FR11)"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.maKho)}
                        title="Xóa khu vực kho (CF-FR12)"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal (CF-FR10, CF-FR11) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0B2341] flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>{isEditing ? `Cập Nhật Khu Vực Kho (${formData.maKho})` : 'Thêm Khu Vực Kho Mới (CF-FR10)'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Kho (Tự động) *</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={formData.maKho}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-blue-900 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Khu Vực Kho *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kho Tổng Mega Plant Vinamilk Bình Dương"
                  value={formData.tenKho}
                  onChange={(e) => setFormData({ ...formData, tenKho: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân Loại Kho</label>
                <select
                  value={formData.loaiKho}
                  onChange={(e) => setFormData({ ...formData, loaiKho: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Kho thành phẩm">Kho thành phẩm</option>
                  <option value="Kho NVL">Kho NVL</option>
                  <option value="Kho trung chuyển">Kho trung chuyển</option>
                  <option value="Kho lạnh">Kho lạnh</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa Chỉ / Vị Trí Lưu Trữ</label>
                <textarea
                  rows="2"
                  placeholder="VD: Lô CN-01, KCN Mỹ Phước 2, Bến Cát, Bình Dương"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-5 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
                >
                  {isEditing ? 'Lưu Thay Đổi' : 'Lưu Khu Vực Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
