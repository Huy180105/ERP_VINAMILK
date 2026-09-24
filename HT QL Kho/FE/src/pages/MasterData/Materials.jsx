import React, { useEffect, useState, useMemo } from 'react';
import { MasterDataAPI } from '../../services/api';
import { Boxes, Plus, Search, Trash2, Edit3 } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { generateAutoCode } from '../../utils/codeGenerator';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    maNVL: '',
    maLoaiNVL: '',
    tenNVL: '',
    donVi: 'Kg',
    ghiChu: '',
  });

  useEffect(() => {
    fetchMaterials();
    fetchMaterialTypes();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await MasterDataAPI.getMaterials({ keyword: searchKey, maLoaiNVL: selectedType });
      setMaterials(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialTypes = async () => {
    try {
      const res = await MasterDataAPI.getMaterialTypes();
      setMaterialTypes(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleOpenModal = async () => {
    setIsEditing(false);
    let list = materials;
    if (searchKey || selectedType || !list.length) {
      try {
        const res = await MasterDataAPI.getMaterials();
        list = res.data.data || [];
        setMaterials(list);
      } catch (err) {
        console.error(err);
      }
    }
    const autoCode = generateAutoCode(list, 'maNVL', 'NVL', 3, false);
    setFormData({
      maNVL: autoCode,
      maLoaiNVL: materialTypes[0]?.maLoaiNVL || '',
      tenNVL: '',
      donVi: 'Kg',
      ghiChu: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditing(true);
    setFormData({
      maNVL: item.maNVL,
      maLoaiNVL: item.maLoaiNVL || '',
      tenNVL: item.tenNVL,
      donVi: item.donVi || 'Kg',
      ghiChu: item.ghiChu || '',
    });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await MasterDataAPI.updateMaterial(formData.maNVL, formData);
        alert('Cập nhật nguyên vật liệu thành công!');
      } else {
        await MasterDataAPI.createMaterial(formData);
        alert('Thêm nguyên vật liệu mới thành công!');
      }
      setShowModal(false);
      setFormData({ maNVL: '', maLoaiNVL: '', tenNVL: '', donVi: 'Kg', ghiChu: '' });
      fetchMaterials();
    } catch (err) {
      alert('Lỗi thao tác NVL: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa nguyên vật liệu ${id}?`)) {
      try {
        await MasterDataAPI.deleteMaterial(id);
        fetchMaterials();
      } catch (err) {
        alert('Lỗi xóa NVL');
      }
    }
  };

  const totalPages = Math.ceil(materials.length / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return materials.slice(start, start + pageSize);
  }, [materials, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Danh Mục Nguyên Vật Liệu Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý nguyên vật liệu thô (Sữa tươi thô, đường, bao bì...) phục vụ các nhà máy sản xuất Vinamilk
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-[#0B2341] hover:bg-blue-900 text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nguyên Vật Liệu Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã NVL, tên nguyên vật liệu..."
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
          <option value="">Tất cả Loại NVL</option>
          {materialTypes.map((t) => (
            <option key={t.maLoaiNVL} value={t.maLoaiNVL}>
              {t.tenLoaiNVL}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer">
          Lọc Dữ Liệu
        </button>
      </form>

      {/* Table List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã NVL</th>
                <th className="p-3">Tên Nguyên Vật Liệu</th>
                <th className="p-3">Phân Loại</th>
                <th className="p-3 text-center">Đơn Vị Tính</th>
                <th className="p-3">Ghi Chú</th>
                <th className="p-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Đang tải danh mục NVL...</td></tr>
              ) : materials.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Không tìm thấy dữ liệu.</td></tr>
              ) : (
                paginatedMaterials.map((m) => (
                  <tr key={m.maNVL} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#0B2341]">{m.maNVL}</td>
                    <td className="p-3 font-semibold text-slate-800">{m.tenNVL}</td>
                    <td className="p-3 text-slate-600">{m.loai_n_v_l?.tenLoaiNVL || m.maLoaiNVL || 'Khác'}</td>
                    <td className="p-3 text-center font-bold text-blue-700 bg-blue-50/50 rounded-lg">{m.donVi || 'Kg'}</td>
                    <td className="p-3 text-slate-500">{m.ghiChu || '-'}</td>
                    <td className="p-3 text-center space-x-1.5">
                      <button 
                        onClick={() => handleOpenEditModal(m)} 
                        title="Sửa NVL (CF-FR02)"
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.maNVL)} 
                        title="Xóa NVL (CF-FR03)"
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
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
        <div className="p-3 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={materials.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2">
              {isEditing ? `Cập Nhật Nguyên Vật Liệu (${formData.maNVL})` : 'Thêm Nguyên Vật Liệu Mới (CF-FR01)'}
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã NVL (Tự động) *</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={formData.maNVL}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Nguyên Vật Liệu *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hương Liệu Dâu Tự Nhiên"
                  value={formData.tenNVL}
                  onChange={(e) => setFormData({ ...formData, tenNVL: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn Vị Tính</label>
                <select
                  value={formData.donVi}
                  onChange={(e) => setFormData({ ...formData, donVi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Kg">Kg</option>
                  <option value="Lít">Lít</option>
                  <option value="Cái">Cái</option>
                  <option value="Hộp">Hộp</option>
                  <option value="Thùng">Thùng</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi Chú</label>
                <textarea
                  rows="2"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer"
                >
                  {isEditing ? 'Lưu Thay Đổi' : 'Lưu NVL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
