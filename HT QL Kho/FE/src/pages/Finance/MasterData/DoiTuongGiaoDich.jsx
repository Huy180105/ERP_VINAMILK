import React, { useEffect, useState } from 'react';
import { FinanceMasterDataAPI } from '../../../services/financeApi';
import { Users, Plus, Search, Trash2, Phone, Mail, MapPin, ToggleLeft, ToggleRight, CheckCircle2, XCircle, Building2, User, RefreshCw, X } from 'lucide-react';

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
      if (res.data.success) {
        setList(res.data.data || []);
      }
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
    setFormData({
      maDoiTuong: '',
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

    // Chuẩn hóa mã ánh xạ ngắn gọn theo chuẩn Vinamilk ERP (ví dụ: DT-NCC003, DT-KH002, DT-NV003)
    let generatedCode = '';
    if (maGoc) {
      if (maGoc.startsWith(formData.loaiDoiTuong)) {
        generatedCode = `DT-${maGoc}`;
      } else {
        generatedCode = `DT-${formData.loaiDoiTuong}-${maGoc}`;
      }
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
      const errorMsg = err.response?.data?.message || err.message;
      const errorsObj = err.response?.data?.errors;
      let detailedMsg = errorMsg;
      if (errorsObj) {
        detailedMsg += '\n' + Object.values(errorsObj).flat().join('\n');
      }
      alert('Lỗi: ' + detailedMsg);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await FinanceMasterDataAPI.toggleStatusCounterparty(id);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi chuyển trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Xác nhận xóa đối tượng giao dịch ${id}? Lưu ý: Không thể xóa đối tượng đã phát sinh phiếu thu/chi.`)) {
      try {
        const res = await FinanceMasterDataAPI.deleteCounterparty(id);
        if (res.data.success) {
          fetchData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa đối tượng');
      }
    }
  };

  const getLoaiBadge = (loai) => {
    switch (loai) {
      case 'KH':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-blue-200">Khách Hàng</span>;
      case 'NCC':
        return <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-200">Nhà Cung Cấp</span>;
      case 'NV':
        return <span className="bg-blue-50/60 text-[#0B2341] font-bold px-2 py-0.5 rounded-full text-[10px] border border-blue-200">Nhân Viên</span>;
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
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={loaiDoiTuong}
            onChange={(e) => setLoaiDoiTuong(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Tất cả loại đối tượng</option>
            <option value="KH">Khách Hàng</option>
            <option value="NCC">Nhà Cung Cấp</option>
            <option value="NV">Nhân Viên</option>
          </select>
        </div>

        <button
          onClick={fetchData}
          className="p-2 text-slate-500 hover:text-[#0052FF] rounded-md hover:bg-blue-50/60 transition cursor-pointer"
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
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-medium">
                    Đang tải dữ liệu đối tượng giao dịch...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-medium">
                    Chưa có đối tượng giao dịch nào phù hợp
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.maDoiTuong} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B2341]">
                      {item.maDoiTuong}
                    </td>
                    <td className="py-3 px-4">
                      {getLoaiBadge(item.loaiDoiTuong)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                      {item.maThamChieu || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
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
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          MST: {item.maSoThue}
                        </div>
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
                            <span>Tạm ngưng</span>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(item.maDoiTuong)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Xóa đối tượng (chỉ khi chưa có chứng từ)"
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

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 -xs p-4">
          <div className="bg-white rounded-lg shadow-sm w-full max-w-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-[#0B2341] to-[#0B2341] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <h3 className="font-bold text-sm">Ánh Xạ Đối Tượng Giao Dịch (FI-BR05)</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/70 hover:text-white rounded-lg p-1 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại Đối Tượng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.loaiDoiTuong}
                    onChange={handleLoaiChange}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="KH">Khách Hàng (Bán Hàng)</option>
                    <option value="NCC">Nhà Cung Cấp (Kho / Thu Mua)</option>
                    <option value="NV">Nhân Viên (Nhân Sự)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã Ánh Xạ Trong Thu Chi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ví dụ: DT-NCC003"
                    value={formData.maDoiTuong}
                    onChange={(e) => setFormData({ ...formData, maDoiTuong: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn Đối Tượng Gốc Cần Ánh Xạ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maThamChieu}
                  onChange={handleSelectSource}
                  disabled={loadingSources}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value="">-- Chọn từ danh sách phân hệ nguồn --</option>
                  {sourceEntities.map((s) => {
                    const code = s.maGoc || s.id;
                    const isMapped = alreadyMapped.includes(code);
                    return (
                      <option key={code} value={code} disabled={isMapped}>
                        {code} - {s.ten} {s.soDienThoai ? `(${s.soDienThoai})` : ''}{isMapped ? ' [ĐÃ ÁNH XẠ]' : ''}
                      </option>
                    );
                  })}
                </select>
                {loadingSources && (
                  <p className="text-[11px] text-[#0052FF] mt-1">Đang tải danh sách từ phân hệ nguồn...</p>
                )}
              </div>

              {/* Source Entity Info Preview */}
              {selectedSource && (
                <div className="p-3.5 bg-blue-50/60/70 border border-blue-200 rounded-md space-y-1.5 text-xs text-[#0B2341]">
                  <div className="font-bold flex items-center space-x-1.5 text-[#0B2341]">
                    <Building2 className="w-4 h-4 text-[#0052FF]" />
                    <span>Thông tin đối tượng gốc (Được liên kết tự động, không lưu trùng):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Tên: </span>
                      <strong className="text-slate-800">{selectedSource.ten}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Mã gốc: </span>
                      <strong className="text-[#0B2341] font-mono">{selectedSource.maGoc || selectedSource.id}</strong>
                    </div>
                    {selectedSource.soDienThoai && (
                      <div>
                        <span className="text-slate-500">Điện thoại: </span>
                        <span>{selectedSource.soDienThoai}</span>
                      </div>
                    )}
                    {selectedSource.maSoThue && (
                      <div>
                        <span className="text-slate-500">Mã số thuế: </span>
                        <span>{selectedSource.maSoThue}</span>
                      </div>
                    )}
                    {selectedSource.diaChi && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Địa chỉ: </span>
                        <span>{selectedSource.diaChi}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B2341] hover:bg-[#132F4C] text-white font-bold text-xs rounded-md shadow-sm transition cursor-pointer"
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
