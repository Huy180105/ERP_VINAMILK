import React, { useEffect, useState, useMemo } from 'react';
import { MasterDataAPI } from '../../services/api';
import { Building2, Plus, Mail, Phone, MapPin, Edit3, Trash2, Search, RefreshCw } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { generateAutoCode } from '../../utils/codeGenerator';
import { isValidPhone, isValidEmail } from '../../utils/validateInput';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    maNCC: '',
    tenNCC: '',
    maSoThue: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async (keyword = searchKey) => {
    setLoading(true);
    try {
      const res = await MasterDataAPI.getSuppliers({ keyword });
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers(searchKey);
  };

  const handleReset = () => {
    setSearchKey('');
    fetchSuppliers('');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, suppliers]);

  const totalPages = Math.ceil(suppliers.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return suppliers.slice(start, start + pageSize);
  }, [suppliers, currentPage, pageSize]);

  const [isEditing, setIsEditing] = useState(false);

  const handleOpenModal = () => {
    setIsEditing(false);
    const autoCode = generateAutoCode(suppliers, 'maNCC', 'NCC', 3, false);
    setFormData({
      maNCC: autoCode,
      tenNCC: '',
      maSoThue: '',
      diaChi: '',
      soDienThoai: '',
      email: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (s) => {
    setIsEditing(true);
    setFormData({
      maNCC: s.maNCC,
      tenNCC: s.tenNCC,
      maSoThue: s.maSoThue || '',
      diaChi: s.diaChi || '',
      soDienThoai: s.soDienThoai || '',
      email: s.email || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhà cung cấp ${id}? (Chỉ xóa được khi chưa có giao dịch nhập kho)`)) {
      try {
        await MasterDataAPI.deleteSupplier(id);
        alert('Đã xóa nhà cung cấp thành công!');
        fetchSuppliers();
      } catch (err) {
        alert('Lỗi xóa NCC: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.soDienThoai && !isValidPhone(formData.soDienThoai)) {
      alert('Số điện thoại không đúng định dạng! Vui lòng nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc 02x).');
      return;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      alert('Email liên hệ không đúng định dạng! Ví dụ hợp lệ: contact@vinamilk.com.vn');
      return;
    }
    try {
      if (isEditing) {
        await MasterDataAPI.updateSupplier(formData.maNCC, formData);
        alert('Cập nhật nhà cung cấp thành công!');
      } else {
        await MasterDataAPI.createSupplier(formData);
        alert('Thêm nhà cung cấp mới thành công!');
      }
      setShowModal(false);
      setFormData({ maNCC: '', tenNCC: '', maSoThue: '', diaChi: '', soDienThoai: '', email: '' });
      fetchSuppliers();
    } catch (err) {
      alert('Lỗi thao tác Nhà cung cấp: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Danh Mục Nhà Cung Cấp & Trang Trại Sữa Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các trang trại bò sữa sinh thái & nhà cung cấp nguyên vật liệu đối tác của Vinamilk
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-[#0B2341] hover:bg-blue-900 text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhà Cung Cấp Mới</span>
        </button>
      </div>

      {/* Thanh Tìm Kiếm Nhà Cung Cấp */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã NCC (NCC001...), tên nhà cung cấp, địa chỉ, SĐT, MST..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tìm kiếm</span>
        </button>
        {searchKey && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center p-8 text-slate-400 text-xs">Đang tải danh sách nhà cung cấp...</div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Không tìm thấy nhà cung cấp nào phù hợp với từ khóa "{searchKey}".
          </div>
        ) : (
          paginatedSuppliers.map((s) => (
            <div key={s.maNCC} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    {s.maNCC}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1.5">{s.tenNCC}</h3>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEditModal(s)}
                    title="Sửa nhà cung cấp (CF-FR07)"
                    className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.maNCC)}
                    title="Xóa nhà cung cấp (CF-FR08)"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="text-[10px] text-slate-400 font-mono">MST: {s.maSoThue || 'Chưa cập nhật'}</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{s.diaChi || 'Địa chỉ đang cập nhật'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{s.soDienThoai || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{s.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={suppliers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0B2341] border-b pb-2">
              {isEditing ? `Cập Nhật Nhà Cung Cấp (${formData.maNCC})` : 'Thêm Nhà Cung Cấp Mới (CF-FR06)'}
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã NCC (Tự động tạo) *</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={formData.maNCC}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 font-mono font-bold text-blue-900 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Nhà Cung Cấp / Trang Trại *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nông Trại Bò Sữa Vinamilk Lâm Đồng"
                  value={formData.tenNCC}
                  onChange={(e) => setFormData({ ...formData, tenNCC: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Số Thuế (Chỉ nhập số)</label>
                <input
                  type="text"
                  placeholder="VD: 0312345678"
                  maxLength={13}
                  value={formData.maSoThue}
                  onChange={(e) => setFormData({ ...formData, maSoThue: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-mono outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa Chỉ Chi Nhánh / Nông Trại</label>
                <input
                  type="text"
                  placeholder="VD: Tu Tra, Đơn Dương, Lâm Đồng"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 02633844..."
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Liên Hệ</label>
                  <input
                    type="email"
                    placeholder="contact@..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
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
                  className="px-4 py-2 bg-[#0B2341] hover:bg-blue-900 text-white rounded-lg font-medium cursor-pointer"
                >
                  {isEditing ? 'Lưu Thay Đổi' : 'Thêm Nhà Cung Cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
