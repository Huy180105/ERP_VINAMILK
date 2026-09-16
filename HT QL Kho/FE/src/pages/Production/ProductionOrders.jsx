import React, { useEffect, useState } from 'react';
import { ProductionAPI, MasterDataAPI } from '../../services/api';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  Play, 
  Check, 
  X,
  Package,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ProductionOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchKey, setSearchKey] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    maLenh: '',
    tenLenh: '',
    maNhanVien: 'NV001',
    ngayTaoLenh: new Date().toISOString().split('T')[0],
    items: [{ maSanPham: 'SP001', soLuong: 5000, ghiChu: '' }],
  });

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [prodRes, staffRes] = await Promise.all([
        MasterDataAPI.getProducts(),
        MasterDataAPI.getStaff()
      ]);
      setProducts(prodRes.data.data || []);
      setStaffList(staffRes.data.data || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ProductionAPI.getOrders({
        keyword: searchKey,
        trangThai: statusFilter
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await ProductionAPI.createOrder(formData);
      alert('Tạo Lệnh Sản Xuất mới thành công!');
      setShowCreateModal(false);
      setFormData({
        maLenh: '',
        tenLenh: '',
        maNhanVien: 'NV001',
        ngayTaoLenh: new Date().toISOString().split('T')[0],
        items: [{ maSanPham: products[0]?.maSanPham || 'SP001', soLuong: 5000, ghiChu: '' }],
      });
      fetchOrders();
    } catch (err) {
      alert('Lỗi tạo lệnh: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm(`Xác nhận DUYỆT & KÍCH HOẠT Lệnh sản xuất ${id}? Dây chuyền 6 công đoạn sẽ được tự động thiết lập.`)) {
      try {
        await ProductionAPI.approveOrder(id);
        alert(`Lệnh sản xuất ${id} đã được duyệt thành công!`);
        fetchOrders();
      } catch (err) {
        alert('Lỗi duyệt lệnh: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm(`Bạn có chắc chắn muốn TỪ CHỐI lệnh ${id}?`)) {
      try {
        await ProductionAPI.rejectOrder(id);
        fetchOrders();
      } catch (err) {
        alert('Lỗi từ chối lệnh: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm(`Xác nhận HOÀN THÀNH toàn bộ Lệnh sản xuất ${id}?`)) {
      try {
        await ProductionAPI.completeOrder(id);
        alert(`Lệnh ${id} đã được ghi nhận hoàn thành!`);
        fetchOrders();
      } catch (err) {
        alert('Lỗi hoàn thành lệnh: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Xóa lệnh sản xuất ${id}? Hành động này không thể hoàn tác.`)) {
      try {
        await ProductionAPI.deleteOrder(id);
        alert(`Đã xóa lệnh ${id}`);
        fetchOrders();
      } catch (err) {
        alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const viewOrderDetails = async (id) => {
    try {
      const res = await ProductionAPI.getOrderById(id);
      setSelectedOrder(res.data.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Lỗi tải thông tin chi tiết lệnh');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đang thực hiện':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span><span>Đang thực hiện</span></span>;
      case 'Hoàn thành':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center space-x-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /><span>Hoàn thành</span></span>;
      case 'Chờ duyệt':
        return <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center space-x-1"><Clock className="w-3 h-3 text-amber-600" /><span>Chờ duyệt</span></span>;
      case 'Từ chối':
        return <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center space-x-1"><XCircle className="w-3 h-3 text-rose-600" /><span>Từ chối</span></span>;
      default:
        return <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#001E50] flex items-center space-x-2.5">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <span>Quản Lý Lệnh Sản Xuất (Production Orders)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lập kế hoạch mẻ sản xuất, phê duyệt kế hoạch dây chuyền và theo dõi tiến độ hoàn thành (PR-FR07 → PR-FR12)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#00249C] hover:bg-blue-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lập Lệnh Sản Xuất Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lệnh, tên lệnh, tên sản phẩm..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="">Tất cả Trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đang thực hiện">Đang thực hiện</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Từ chối">Từ chối</option>
        </select>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer">
          Lọc Lệnh
        </button>
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-4">Mã Lệnh</th>
                <th className="p-4">Nội Dung / Tên Lệnh Sản Xuất</th>
                <th className="p-4">Sản Phẩm & Sản Lượng</th>
                <th className="p-4">Người Phụ Trách</th>
                <th className="p-4">Ngày Tạo</th>
                <th className="p-4 text-center">Tiến Độ</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">Đang tải danh sách lệnh sản xuất...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">Không tìm thấy lệnh sản xuất phù hợp.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.maLenh} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-black text-[#00249C]">{o.maLenh}</td>
                    <td className="p-4 font-semibold text-slate-900 max-w-xs">{o.tenLenh}</td>
                    <td className="p-4 text-slate-700">
                      {o.chi_tiets?.map((ct, idx) => (
                        <div key={idx} className="font-medium">
                          <span className="text-indigo-900 font-bold">{ct.san_pham?.tenSanPham || ct.maSanPham}</span>
                          <span className="text-slate-500 text-[11px] block">Số lượng: <b>{Number(ct.soLuong).toLocaleString('vi-VN')} {ct.san_pham?.donViTinh || 'Hộp'}</b></span>
                        </div>
                      ))}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {o.nhan_vien?.hoTen || o.maNhanVien || 'Thủ kho'}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{o.ngayTaoLenh}</td>
                    <td className="p-4 text-center">
                      <div className="w-24 mx-auto space-y-1">
                        <div className="text-[10px] font-extrabold text-indigo-700">{o.tienDoPhanTram}%</div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${o.tienDoPhanTram === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                            style={{ width: `${o.tienDoPhanTram}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">{getStatusBadge(o.trangThai)}</td>
                    <td className="p-4 text-center space-x-1.5">
                      <button 
                        onClick={() => viewOrderDetails(o.maLenh)}
                        title="Xem chi tiết" 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {o.trangThai === 'Chờ duyệt' && (
                        <>
                          <button 
                            onClick={() => handleApprove(o.maLenh)} 
                            title="Duyệt Lệnh & Kích hoạt dây chuyền" 
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(o.maLenh)} 
                            title="Từ chối lệnh" 
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(o.maLenh)} 
                            title="Xóa lệnh" 
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {o.trangThai === 'Đang thực hiện' && (
                        <button 
                          onClick={() => handleComplete(o.maLenh)} 
                          title="Xác nhận hoàn thành lệnh" 
                          className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#001E50] flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Lập Lệnh Sản Xuất Mới</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Lệnh Sản Xuất (Để trống sẽ tự sinh)</label>
                <input
                  type="text"
                  placeholder="VD: LSX005"
                  value={formData.maLenh}
                  onChange={(e) => setFormData({ ...formData, maLenh: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên / Nội Dung Lệnh Sản Xuất *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Sản xuất 10.000 hộp Sữa Tươi Tiệt Trùng 100% 180ml"
                  value={formData.tenLenh}
                  onChange={(e) => setFormData({ ...formData, tenLenh: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người Phụ Trách</label>
                  <select
                    value={formData.maNhanVien}
                    onChange={(e) => setFormData({ ...formData, maNhanVien: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {staffList.map((st) => (
                      <option key={st.maNV} value={st.maNV}>{st.hoTen} ({st.maNV})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày Tạo Lệnh *</label>
                  <input
                    type="date"
                    required
                    value={formData.ngayTaoLenh}
                    onChange={(e) => setFormData({ ...formData, ngayTaoLenh: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl space-y-2.5">
                <div className="font-bold text-indigo-950 flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Sản Phẩm Cần Sản Xuất Kế Hoạch</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Chọn Sản Phẩm *</label>
                    <select
                      value={formData.items[0].maSanPham}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[0].maSanPham = e.target.value;
                        setFormData({ ...formData, items });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                    >
                      {products.map((p) => (
                        <option key={p.maSanPham} value={p.maSanPham}>{p.tenSanPham} ({p.donViTinh || 'Hộp'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Số Lượng Sản Xuất *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.items[0].soLuong}
                      onChange={(e) => {
                        const items = [...formData.items];
                        items[0].soLuong = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, items });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00249C] hover:bg-blue-900 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Lưu & Tạo Lệnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">CHI TIẾT LỆNH SẢN XUẤT</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedOrder.maLenh} - {selectedOrder.tenLenh}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border">
              <div><span className="text-slate-500">Người lập lệnh:</span> <b>{selectedOrder.nhan_vien?.hoTen || selectedOrder.maNhanVien}</b></div>
              <div><span className="text-slate-500">Ngày lập:</span> <b>{selectedOrder.ngayTaoLenh}</b></div>
              <div><span className="text-slate-500">Trạng thái:</span> {getStatusBadge(selectedOrder.trangThai)}</div>
              <div><span className="text-slate-500">Tổng công đoạn:</span> <b>{selectedOrder.cong_doans?.length || 0} khâu</b></div>
            </div>

            {/* Stages List in this order */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#00249C] uppercase tracking-wider">Tiến Độ Các Công Đoạn Dây Chuyền</h4>
              <div className="space-y-2">
                {selectedOrder.cong_doans?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">Chưa khởi tạo công đoạn (Lệnh đang chờ duyệt).</p>
                ) : (
                  selectedOrder.cong_doans?.map((stg) => (
                    <div key={stg.maCongDoan} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Khâu {stg.khau}: {stg.tenLenh}</div>
                        <div className="text-[11px] text-slate-500">Phụ trách: {stg.nhan_vien?.hoTen || stg.maNhanVien} | Nhân công: {stg.nhanCong} người</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stg.trangThai === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' : stg.trangThai === 'Đang thực hiện' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                        {stg.trangThai}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
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
