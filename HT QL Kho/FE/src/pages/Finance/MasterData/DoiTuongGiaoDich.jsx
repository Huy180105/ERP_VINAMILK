import React, { useEffect, useState } from 'react';
import { FinanceMasterDataAPI } from '../../../services/financeApi';
import { Users, Plus, Search, Trash2, Phone, MapPin, CheckCircle2, XCircle, RefreshCw, X } from 'lucide-react';
import { generateAutoCode } from '../../../utils/codeGenerator';

export default function DoiTuongGiaoDich() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [loaiDoiTuong, setLoaiDoiTuong] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [sourceEntities, setSourceEntities] = useState([]);
  const [alreadyMapped, setAlreadyMapped] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const [formData, setFormData] = useState({
    maDoiTuong: '',
    maThamChieu: '',
    loaiDoiTuong: 'KH',
    trangThai: 1,
  });

  useEffect(() => {
    fetchData();
  }, [keyword, loaiDoiTuong]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await FinanceMasterDataAPI.getCounterparties({ keyword, loaiDoiTuong });
      if (res.data.success) setList(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async (loai) => {
    setLoadingSources(true);
    try {
      const res = await FinanceMasterDataAPI.getAvailableSourceEntities({ loaiDoiTuong: loai });
      if (res.data.success) {
        setSourceEntities(res.data.data || []);
        setAlreadyMapped(res.data.mapped || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSources(false);
    }
  };

  const openCreateModal = () => {
    const loai = 'KH';
    const autoCode = generateAutoCode(list, 'maDoiTuong', 'DT', 3, false);
    setFormData({
      maDoiTuong: autoCode,
      maThamChieu: '',
      loaiDoiTuong: loai,
      trangThai: 1,
    });
    setSelectedSource(null);
    setModalOpen(true);
    fetchSources(loai);
  };

  const handleLoaiChange = (e) => {
    const newLoai = e.target.value;
    setFormData(prev => ({
      ...prev,
      loaiDoiTuong: newLoai,
      maThamChieu: '',
      maDoiTuong: '',
    }));
    setSelectedSource(null);
    fetchSources(newLoai);
  };

  const handleSelectSource = (e) => {
    const maGoc = e.target.value;
    const found = sourceEntities.find(s => (s.maGoc || s.id) === maGoc);
    setSelectedSource(found || null);

    let generatedCode = '';
    if (maGoc) {
      generatedCode = maGoc.startsWith(formData.loaiDoiTuong)
        ? `DT-${maGoc}`
        : `DT-${formData.loaiDoiTuong}-${maGoc}`;
    }

    setFormData(prev => ({
      ...prev,
      maThamChieu: maGoc,
      maDoiTuong: generatedCode || prev.maDoiTuong,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.maThamChieu && formData.loaiDoiTuong !== 'Khac') {
      alert('Vui lòng chọn đối tượng gốc cần ánh xạ');
      return;
    }

    try {
      const res = await FinanceMasterDataAPI.createCounterparty(formData);
      if (res.data.success) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await FinanceMasterDataAPI.toggleStatusCounterparty(id);
      if (res.data.success) fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xác nhận xóa đối tượng giao dịch ${id}? Không thể xóa nếu đã phát sinh chứng từ.`)) return;
    try {
      const res = await FinanceMasterDataAPI.deleteCounterparty(id);
      if (res.data.success) fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa đối tượng');
    }
  };

  const getLoaiBadge = (loai) => {
    switch (loai) {
      case 'KH':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-blue-200">Khách Hàng</span>;
      case 'NCC':
        return <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-200">Nhà Cung Cấp</span>;
      case 'NV':
        return <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-purple-200">Nhân Viên</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-slate-200">Khác</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-6 h-6 text-[#0052FF]" />
            <span>Danh Mục Đối Tượng Giao Dịch (FI-BR05)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bảng ánh xạ đối tượng giao dịch tập trung từ Khách Hàng (Bán hàng), Nhà Cung Cấp (Kho), và Nhân Viên (Nhân sự).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#0B2341] hover:bg-[#132F4C] text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ánh Xạ Đối Tượng Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              placeholder="Tìm theo tên, mã ánh xạ, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={loaiDoiTuong}
            onChange={(e) => setLoaiDoiTuong(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-3 py-2 focus:outline-none"
          >
            <option value="">Tất cả loại đối tượng</option>
            <option value="KH">Khách Hàng</option>
            <option value="NCC">Nhà Cung Cấp</option>
            <option value="NV">Nhân Viên</option>
          </select>
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-[#0052FF] rounded-md hover:bg-blue-50 transition cursor-pointer"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0052FF]' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Mã Ánh Xạ</th>
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">Mã Gốc Tham Chiếu</th>
                <th className="py-3.5 px-4">Tên Đối Tượng (Trực Tiếp Từ Gốc)</th>
                <th className="py-3.5 px-4">Liên Hệ / MST</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400 font-medium">Đang tải dữ liệu...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400 font-medium">Chưa có đối tượng giao dịch nào phù hợp</td></tr>
              ) : (
                list.map((item) => (
                  <tr key={item.maDoiTuong} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2341]">{item.maDoiTuong}</td>
                    <td className="py-3 px-4">{getLoaiBadge(item.loaiDoiTuong)}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">{item.maThamChieu || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{item.tenDoiTuong || 'Không xác định'}</div>
                      {item.diaChi && (
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5 truncate max-w-xs">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{item.diaChi}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.soDienThoai && (
                        <div className="text-[11px] text-slate-600 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{item.soDienThoai}</span>
                        </div>
                      )}
                      {item.maSoThue && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">MST: {item.maSoThue}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item.maDoiTuong)}
                        className="inline-flex items-center space-x-1 cursor-pointer"
                        title="Bấm để bật/tắt hoạt động"
                      >
                        {item.trangThai ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full text-[10px] border border-slate-200 flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>Tạm khóa</span>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(item.maDoiTuong)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa ánh xạ"
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

      {/* Modal Ánh Xạ Đối Tượng */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Thiết Lập Ánh Xạ Đối Tượng Giao Dịch
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loại Đối Tượng:</label>
                  <select
                    value={formData.loaiDoiTuong}
                    onChange={handleLoaiChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-semibold"
                  >
                    <option value="KH">Khách Hàng (Bán Hàng)</option>
                    <option value="NCC">Nhà Cung Cấp (Kho/Mua Hàng)</option>
                    <option value="NV">Nhân Viên (Nhân Sự/Lương)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Ánh Xạ Finance:</label>
                  <input
                    type="text"
                    value={formData.maDoiTuong}
                    onChange={(e) => setFormData({ ...formData, maDoiTuong: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn Bản Ghi Gốc Để Ánh Xạ:
                </label>
                {loadingSources ? (
                  <div className="text-xs text-slate-400 p-2">Đang tải danh sách nguồn...</div>
                ) : (
                  <select
                    value={formData.maThamChieu}
                    onChange={handleSelectSource}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-medium"
                  >
                    <option value="">-- Chọn bản ghi nguồn --</option>
                    {sourceEntities.map((s) => {
                      const id = s.maGoc || s.id;
                      const isMapped = alreadyMapped.includes(id);
                      return (
                        <option key={id} value={id} disabled={isMapped}>
                          {id} - {s.ten} {isMapped ? '(Đã ánh xạ)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {selectedSource && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-[#002795]">{selectedSource.ten}</div>
                  <div>SĐT: {selectedSource.soDienThoai || 'N/A'} | MST: {selectedSource.maSoThue || 'N/A'}</div>
                  <div className="text-slate-500">{selectedSource.diaChi || 'Chưa cập nhật địa chỉ'}</div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t">
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
                  Lưu Ánh Xạ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
