import React, { useEffect, useState } from 'react';
import { MasterDataAPI } from '../../services/api';
import { Building2, Plus, Search, Mail, Phone, MapPin } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await MasterDataAPI.getSuppliers();
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await MasterDataAPI.createSupplier(formData);
      setShowModal(false);
      setFormData({ maNCC: '', tenNCC: '', maSoThue: '', diaChi: '', soDienThoai: '', email: '' });
      fetchSuppliers();
    } catch (err) {
      alert('Lỗi thêm Nhà cung cấp: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#001E50] flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Danh Mục Nhà Cung Cấp & Trang Trại Sữa Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các trang trại bò sữa sinh thái & nhà cung cấp nguyên vật liệu đối tác của Vinamilk
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#001E50] hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nhà Cung Cấp Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-slate-400 text-xs">Đang tải danh sách...</p>
        ) : (
          suppliers.map((s) => (
            <div key={s.maNCC} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    {s.maNCC}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1.5">{s.tenNCC}</h3>
                </div>
                <span className="text-[10px] text-slate-400">MST: {s.maSoThue || 'Chưa cập nhật'}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#001E50] border-b pb-2">Thêm Nhà Cung Cấp Mới</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã NCC *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: NCC003"
                  value={formData.maNCC}
                  onChange={(e) => setFormData({ ...formData, maNCC: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Số Thuế</label>
                <input
                  type="text"
                  placeholder="0312345678"
                  value={formData.maSoThue}
                  onChange={(e) => setFormData({ ...formData, maSoThue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa Chỉ</label>
                <input
                  type="text"
                  placeholder="Đà Lạt, Lâm Đồng"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001E50] hover:bg-blue-900 text-white rounded-lg font-medium"
                >
                  Lưu NCC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
