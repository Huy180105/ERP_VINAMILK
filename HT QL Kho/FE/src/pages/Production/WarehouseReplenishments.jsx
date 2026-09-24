import React, { useEffect, useState, useMemo } from 'react';
import { ProductionAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import { 
  PackageCheck, Search, CheckCircle2, XCircle, AlertCircle, 
  Calendar, Building2, Clock, RefreshCw, AlertTriangle, X, Check, Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WarehouseReplenishments() {
  const navigate = useNavigate();
  const [replenishments, setReplenishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchReplenishments();
  }, []);

  const fetchReplenishments = async () => {
    setLoading(true);
    try {
      const res = await ProductionAPI.getWarehouseReplenishments();
      setReplenishments(res.data.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đề nghị bổ sung:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (item) => {
    if (!window.confirm(`Xác nhận tiếp nhận đề nghị bổ sung sản phẩm ${item.maSanPham} (${item.san_pham?.tenSanPham || ''}) với số lượng ${item.soLuong?.toLocaleString()}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await ProductionAPI.updateWarehouseReplenishmentStatus(item.maDeNghi, {
        trangThai: 'DaTiepNhan',
      });
      alert(res.data.message || 'Tiếp nhận đề nghị thành công!');
      fetchReplenishments();
    } catch (err) {
      alert('Lỗi tiếp nhận: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (item) => {
    setSelectedItem(item);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await ProductionAPI.updateWarehouseReplenishmentStatus(selectedItem.maDeNghi, {
        trangThai: 'TuChoi',
        ghiChu: rejectReason.trim(),
      });
      alert(res.data.message || 'Đã từ chối đề nghị bổ sung.');
      setShowRejectModal(false);
      fetchReplenishments();
    } catch (err) {
      alert('Lỗi từ chối đề nghị: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = replenishments.filter((item) => {
    const matchStatus = selectedStatus === 'ALL' || item.trangThai === selectedStatus;
    const kw = searchKey.toLowerCase().trim();
    const matchKey = !kw || 
      item.maDeNghi?.toLowerCase().includes(kw) ||
      item.maSanPham?.toLowerCase().includes(kw) ||
      item.san_pham?.tenSanPham?.toLowerCase().includes(kw) ||
      item.ghiChu?.toLowerCase().includes(kw) ||
      item.kho?.tenKho?.toLowerCase().includes(kw);
    return matchStatus && matchKey;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, selectedStatus]);

  const pendingCount = replenishments.filter(r => r.trangThai === 'ChoDuyet').length;
  const acceptedCount = replenishments.filter(r => r.trangThai === 'DaTiepNhan').length;
  const approvedCount = replenishments.filter(r => r.trangThai === 'DaDuyet').length;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ChoDuyet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ tiếp nhận</span>
          </span>
        );
      case 'DaTiepNhan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã tiếp nhận</span>
          </span>
        );
      case 'DaDuyet':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            <span>Đã duyệt LSX</span>
          </span>
        );
      case 'HoanThanh':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã nhập kho</span>
          </span>
        );
      case 'TuChoi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Từ chối</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Screenshot 4 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Đề Nghị Bổ Sung Thành Phẩm Từ Kho</span>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200 animate-pulse">
                  {pendingCount} đề nghị mới
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tiếp nhận nhu cầu thiếu hàng từ kho và chuyển trực tiếp thành lệnh sản xuất chờ duyệt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} đề nghị chờ tiếp nhận</span>
          </div>
          <button
            onClick={fetchReplenishments}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đề nghị, mã SP, tên sản phẩm, kho yêu cầu..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ChoDuyet', label: 'Chờ tiếp nhận' },
            { id: 'DaTiepNhan', label: 'Đã tiếp nhận' },
            { id: 'DaDuyet', label: 'Đã duyệt LSX' },
            { id: 'TuChoi', label: 'Từ chối' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Đề Nghị</th>
                <th className="p-3.5">Sản Phẩm & Quy Cách</th>
                <th className="p-3.5">Kho Yêu Cầu</th>
                <th className="p-3.5 text-right">SL Đề Nghị</th>
                <th className="p-3.5">Thời Gian</th>
                <th className="p-3.5">Lý Do / Ghi Chú</th>
                <th className="p-3.5 text-center">Trạng Thái</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Đang tải danh sách đề nghị bổ sung thành phẩm...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Không tìm thấy phiếu đề nghị bổ sung nào</p>
                    <p className="text-[11px] mt-1 text-slate-400">Hiện tại không có đề nghị bổ sung hàng nào phù hợp với bộ lọc hiện tại.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.maDeNghi} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-blue-900">
                      {item.maDeNghi}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{item.san_pham?.tenSanPham || item.maSanPham}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Mã SP: {item.maSanPham} • ĐVT: {item.san_pham?.donViTinh || 'Thùng'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.kho?.tenKho || item.maKho}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Mã kho: {item.maKho}
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-blue-700">
                      <span className="text-sm">{item.soLuong?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        {item.san_pham?.donViTinh || 'Thùng'}
                      </span>
                    </td>
                    <td className="p-3.5 space-y-0.5 text-[11px]">
                      <div className="text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Cần: <span className="font-semibold text-rose-600">{item.ngayCanHang || 'Gấp'}</span></span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Lập: {item.ngayDeNghi ? new Date(item.ngayDeNghi).toLocaleDateString('vi-VN') : '-'}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-slate-700 line-clamp-2" title={item.ghiChu}>
                        {item.ghiChu || '-'}
                      </p>
                    </td>
                    <td className="p-3.5 text-center">
                      {renderStatusBadge(item.trangThai)}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.trangThai === 'ChoDuyet' && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleAccept(item)}
                            disabled={actionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Tiếp nhận đề nghị này và đưa vào kế hoạch sản xuất"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tiếp nhận</span>
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(item)}
                            disabled={actionLoading}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Từ chối đề nghị này"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      )}

                      {item.trangThai === 'DaTiepNhan' && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate('/production/orders')}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-blue-200 transition cursor-pointer"
                            title="Chuyển đến màn hình Lệnh Sản Xuất để lập lệnh"
                          >
                            <span>Lập LSX</span>
                          </button>
                        </div>
                      )}

                      {(item.trangThai === 'DaDuyet' || item.trangThai === 'HoanThanh' || item.trangThai === 'TuChoi') && (
                        <span className="text-[11px] text-slate-400 italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Từ Chối Đề Nghị Bổ Sung</span>
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div><span className="text-slate-500">Mã đề nghị:</span> <strong className="font-mono">{selectedItem.maDeNghi}</strong></div>
                <div><span className="text-slate-500">Sản phẩm:</span> <strong>{selectedItem.san_pham?.tenSanPham || selectedItem.maSanPham}</strong></div>
                <div><span className="text-slate-500">Số lượng:</span> <strong>{selectedItem.soLuong?.toLocaleString()} {selectedItem.san_pham?.donViTinh || 'Thùng'}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do từ chối *</label>
                <textarea
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do không tiếp nhận (Ví dụ: Dây chuyền đang bảo trì, không đủ NVL dự trữ...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
