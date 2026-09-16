import React, { useEffect, useState } from 'react';
import { ProductionAPI, MasterDataAPI } from '../../services/api';
import { 
  GitMerge, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Users, 
  Search, 
  Filter, 
  Layers, 
  Clock, 
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function ProductionStages() {
  const [stages, setStages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedOrderFilter, setSelectedOrderFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Incident Modal State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedStageForIncident, setSelectedStageForIncident] = useState(null);
  const [incidentReason, setIncidentReason] = useState('');

  // Assign Staff Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStageForAssign, setSelectedStageForAssign] = useState(null);
  const [assignForm, setAssignForm] = useState({ maNhanVien: 'NV001', nhanCong: 4, chiPhi: 2000000 });

  useEffect(() => {
    fetchStages();
    fetchOrdersAndStaff();
  }, []);

  const fetchOrdersAndStaff = async () => {
    try {
      const [ordRes, staffRes] = await Promise.all([
        ProductionAPI.getOrders(),
        MasterDataAPI.getStaff()
      ]);
      setOrders(ordRes.data.data || []);
      setStaffList(staffRes.data.data || []);
    } catch (err) {
      console.error('Error fetching meta data:', err);
    }
  };

  const fetchStages = async (orderId = '') => {
    setLoading(true);
    try {
      const res = await ProductionAPI.getStages({ maLenh: orderId });
      setStages(res.data.data || []);
    } catch (err) {
      console.error('Error fetching stages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderFilterChange = (e) => {
    const val = e.target.value;
    setSelectedOrderFilter(val);
    fetchStages(val);
  };

  const handleStartStage = async (id, stageName) => {
    try {
      await ProductionAPI.startStage(id);
      alert(`Đã kích hoạt vận hành công đoạn "${stageName}"!`);
      fetchStages(selectedOrderFilter);
    } catch (err) {
      alert('Lỗi bắt đầu công đoạn: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCompleteStage = async (id, stageName) => {
    if (window.confirm(`Xác nhận HOÀN THÀNH công đoạn "${stageName}"? Hệ thống sẽ ghi nhận bán thành phẩm và mở khóa khâu tiếp theo.`)) {
      try {
        await ProductionAPI.completeStage(id);
        alert(`Công đoạn "${stageName}" đã hoàn thành! Bán thành phẩm đã được cập nhật.`);
        fetchStages(selectedOrderFilter);
      } catch (err) {
        alert('Lỗi hoàn thành công đoạn: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const openIncidentModal = (stage) => {
    setSelectedStageForIncident(stage);
    setIncidentReason('');
    setShowIncidentModal(true);
  };

  const handleRecordIncident = async (e) => {
    e.preventDefault();
    if (!selectedStageForIncident) return;
    try {
      await ProductionAPI.recordIncident(selectedStageForIncident.maCongDoan, {
        lyDoSuCo: incidentReason
      });
      alert(`Đã ghi nhận sự cố cho công đoạn ${selectedStageForIncident.tenLenh}!`);
      setShowIncidentModal(false);
      fetchStages(selectedOrderFilter);
    } catch (err) {
      alert('Lỗi ghi nhận sự cố: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResumeStage = async (id, stageName) => {
    try {
      await ProductionAPI.resumeStage(id);
      alert(`Đã khôi phục hoạt động cho công đoạn "${stageName}"!`);
      fetchStages(selectedOrderFilter);
    } catch (err) {
      alert('Lỗi tiếp tục công đoạn: ' + (err.response?.data?.message || err.message));
    }
  };

  const openAssignModal = (stage) => {
    setSelectedStageForAssign(stage);
    setAssignForm({
      maNhanVien: stage.maNhanVien || 'NV001',
      nhanCong: stage.nhanCong || 4,
      chiPhi: stage.chiPhi || 2000000
    });
    setShowAssignModal(true);
  };

  const handleSaveAssign = async (e) => {
    e.preventDefault();
    if (!selectedStageForAssign) return;
    try {
      await ProductionAPI.assignStaff(selectedStageForAssign.maCongDoan, assignForm);
      alert('Đã cập nhật phân công nhân sự và nhân công thành công!');
      setShowAssignModal(false);
      fetchStages(selectedOrderFilter);
    } catch (err) {
      alert('Lỗi phân công: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#001E50] flex items-center space-x-2.5">
            <GitMerge className="w-6 h-6 text-indigo-600" />
            <span>Điều Phối 6 Công Đoạn Sản Xuất Sữa (Production Stages)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tình trạng vận hành, phân công kỹ thuật viên, xử lý sự cố và chuyển giao bán thành phẩm (PR-FR18 → PR-FR23)
          </p>
        </div>

        {/* Filter by Order */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Lọc Theo Lệnh SX:</label>
          <select
            value={selectedOrderFilter}
            onChange={handleOrderFilterChange}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Tất Cả Lệnh Sản Xuất --</option>
            {orders.map((o) => (
              <option key={o.maLenh} value={o.maLenh}>{o.maLenh} - {o.tenLenh}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stages Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border">Đang tải dữ liệu công đoạn dây chuyền...</div>
        ) : stages.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border">Không có công đoạn nào được tìm thấy. Vui lòng duyệt Lệnh sản xuất để kích hoạt dây chuyền.</div>
        ) : (
          stages.map((stg) => {
            const isRunning = stg.trangThai === 'Đang thực hiện';
            const isCompleted = stg.trangThai === 'Hoàn thành';
            const isIncident = stg.trangThai?.includes('Sự cố') || stg.trangThai?.includes('Tạm dừng');

            return (
              <div 
                key={stg.maCongDoan}
                className={`bg-white rounded-3xl p-5 border transition shadow-xs flex flex-col justify-between space-y-4 ${
                  isRunning ? 'border-blue-500 ring-2 ring-blue-500/10' :
                  isIncident ? 'border-rose-400 bg-rose-50/20' :
                  isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-700 font-mono">
                      KHÂU {stg.khau} | {stg.maCongDoan}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                      isRunning ? 'bg-blue-600 text-white animate-pulse' :
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isIncident ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {stg.trangThai}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{stg.tenLenh}</h3>
                    <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                      Lệnh SX: {stg.maLenh}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phụ trách:</span>
                      <b className="text-slate-800">{stg.nhan_vien?.hoTen || stg.maNhanVien || 'Kỹ sư xưởng'}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nhân công vận hành:</span>
                      <b className="text-slate-800">{stg.nhanCong || 4} công nhân</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chi phí khâu:</span>
                      <b className="text-indigo-900">{Number(stg.chiPhi || 0).toLocaleString('vi-VN')} VNĐ</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bán thành phẩm đầu ra:</span>
                      <b className="text-emerald-700 truncate max-w-[150px]">{stg.thanhPham || 'Chờ bàn giao'}</b>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {stg.trangThai === 'Chờ thực hiện' && (
                    <button
                      onClick={() => handleStartStage(stg.maCongDoan, stg.tenLenh)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Bắt Đầu</span>
                    </button>
                  )}

                  {isRunning && (
                    <>
                      <button
                        onClick={() => handleCompleteStage(stg.maCongDoan, stg.tenLenh)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hoàn Thành</span>
                      </button>
                      <button
                        onClick={() => openIncidentModal(stg)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition border border-rose-200"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Sự Cố</span>
                      </button>
                    </>
                  )}

                  {isIncident && (
                    <button
                      onClick={() => handleResumeStage(stg.maCongDoan, stg.tenLenh)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi Phục Vận Hành</span>
                    </button>
                  )}

                  <button
                    onClick={() => openAssignModal(stg)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Phân công nhân sự & nhân công"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Incident Modal */}
      {showIncidentModal && selectedStageForIncident && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Ghi Nhận Sự Cố & Tạm Dừng Khâu</span>
              </h3>
              <button onClick={() => setShowIncidentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Công Đoạn Gặp Sự Cố</label>
                <div className="p-3 bg-slate-100 rounded-xl font-bold text-slate-800">
                  {selectedStageForIncident.maCongDoan} - {selectedStageForIncident.tenLenh}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết Nguyên Nhân Sự Cố *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="VD: Cảm biến nhiệt độ UHT báo lỗi quá áp suất, cần dừng máy bảo trì 15 phút..."
                  value={incidentReason}
                  onChange={(e) => setIncidentReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
                >
                  Xác Nhận Tạm Dừng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedStageForAssign && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#001E50] flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Phân Công Nhân Sự Công Đoạn</span>
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Công Đoạn</label>
                <div className="p-3 bg-slate-100 rounded-xl font-bold text-slate-800">
                  {selectedStageForAssign.maCongDoan} - {selectedStageForAssign.tenLenh}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kỹ Thuật Viên Phụ Trách</label>
                <select
                  value={assignForm.maNhanVien}
                  onChange={(e) => setAssignForm({ ...assignForm, maNhanVien: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {staffList.map((st) => (
                    <option key={st.maNV} value={st.maNV}>{st.hoTen} ({st.maNV})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Lượng Nhân Công</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={assignForm.nhanCong}
                    onChange={(e) => setAssignForm({ ...assignForm, nhanCong: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chi Phí Dự Toán (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={assignForm.chiPhi}
                    onChange={(e) => setAssignForm({ ...assignForm, chiPhi: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00249C] hover:bg-blue-900 text-white rounded-xl font-bold shadow-md"
                >
                  Lưu Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
