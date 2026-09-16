import React, { useEffect, useState } from 'react';
import { FinanceReportAPI, FinanceMasterDataAPI, ReceiptAPI } from '../../services/financeApi';
import { 
  FileText, 
  BookOpen, 
  Users, 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Filter,
  CheckCircle2,
  Clock,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function FinanceBaoCao() {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'cashbook' | 'counterparty' | 'reconciliation'

  // Global Date Filters
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  // Tab 1: Summary State
  const [summaryData, setSummaryData] = useState({
    tongThu: 0,
    tongChi: 0,
    chenhLech: 0,
    soPhieuThu: 0,
    soPhieuChi: 0,
    tongSoDuQuy: 0,
    monthlyChart: [],
  });

  // Tab 2: Cash Book State
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [cashBookData, setCashBookData] = useState({
    transactions: [],
    totalThu: 0,
    totalChi: 0,
    chenhLech: 0,
  });

  // Tab 3: Counterparty State
  const [counterpartyData, setCounterpartyData] = useState([]);
  const [loaiDoiTuong, setLoaiDoiTuong] = useState('');

  // Tab 4: Reconciliation State (FI-FR06)
  const [reconciliationData, setReconciliationData] = useState({
    accounts: [],
    pendingReconciliation: { count: 0, totalAmount: 0, items: [] },
    approvedItems: { receiptsCount: 0, receiptsTotal: 0, paymentsCount: 0, paymentsTotal: 0 },
    allVouchers: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'summary') {
      fetchSummary();
    } else if (activeTab === 'cashbook') {
      fetchCashBook();
    } else if (activeTab === 'counterparty') {
      fetchCounterpartyReport();
    } else if (activeTab === 'reconciliation') {
      fetchReconciliationReport();
    }
  }, [activeTab, tuNgay, denNgay, selectedAccount, loaiDoiTuong]);

  const fetchAccounts = async () => {
    try {
      const res = await FinanceMasterDataAPI.getAccounts();
      if (res.data.success) {
        setAccounts(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await FinanceReportAPI.getSummaryReport({ tuNgay, denNgay });
      if (res.data.success) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashBook = async () => {
    setLoading(true);
    try {
      const res = await FinanceReportAPI.getCashBookReport({ 
        maTaiKhoanQuy: selectedAccount, 
        tuNgay, 
        denNgay 
      });
      if (res.data.success) {
        setCashBookData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounterpartyReport = async () => {
    setLoading(true);
    try {
      const res = await FinanceReportAPI.getByCounterpartyReport({ 
        tuNgay, 
        denNgay, 
        loaiDoiTuong 
      });
      if (res.data.success) {
        setCounterpartyData(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliationReport = async () => {
    setLoading(true);
    try {
      const res = await FinanceReportAPI.getReconciliationReport({
        maTaiKhoanQuy: selectedAccount,
        tuNgay,
        denNgay
      });
      if (res.data.success) {
        setReconciliationData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcileApprove = async (id) => {
    try {
      const res = await ReceiptAPI.approveReceipt(id);
      if (res.data.success) {
        alert('Khớp lệnh đối soát và ghi nhận sổ quỹ thành công!');
        fetchReconciliationReport();
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#0052FF]" />
            <span>Hệ Thống Báo Cáo Tài Chính & Ngân Quỹ (FI-FR05, FI-FR06)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp luồng tiền, chi tiết sổ quỹ theo tài khoản, phân tích đối tượng và đối soát số dư ngân hàng.
          </p>
        </div>

        {/* Global Filter by Date */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Từ:</span>
          <input
            type="date"
            value={tuNgay}
            onChange={(e) => setTuNgay(e.target.value)}
            className="bg-transparent focus:outline-none text-xs"
          />
          <span>Đến:</span>
          <input
            type="date"
            value={denNgay}
            onChange={(e) => setDenNgay(e.target.value)}
            className="bg-transparent focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-lg p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-[#0B2341] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#0052FF] hover:bg-blue-50/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>1. Báo Cáo Tổng Hợp Thu Chi</span>
        </button>

        <button
          onClick={() => setActiveTab('cashbook')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === 'cashbook'
              ? 'bg-[#0B2341] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#0052FF] hover:bg-blue-50/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Sổ Quỹ Chi Tiết (TM & NH)</span>
        </button>

        <button
          onClick={() => setActiveTab('counterparty')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === 'counterparty'
              ? 'bg-[#0B2341] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#0052FF] hover:bg-blue-50/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Báo Cáo Theo Đối Tượng</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs font-bold transition cursor-pointer ${
            activeTab === 'reconciliation'
              ? 'bg-[#0B2341] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#0052FF] hover:bg-blue-50/60'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>4. Đối Soát Ngân Hàng & Sổ Phụ (FI-FR06)</span>
        </button>
      </div>

      {/* Tab 1: Tổng Hợp Thu Chi */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Tổng Thu Đã Duyệt</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-xl text-emerald-700">
                {Number(summaryData.tongThu || 0).toLocaleString()} VNĐ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{summaryData.soPhieuThu || 0} phiếu thu hiệu lực</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Tổng Chi Đã Duyệt</span>
                <div className="p-2 bg-red-50 text-red-600 rounded-md">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-xl text-red-700">
                {Number(summaryData.tongChi || 0).toLocaleString()} VNĐ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{summaryData.soPhieuChi || 0} phiếu chi hiệu lực</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Chênh Lệch Thu - Chi</span>
                <div className="p-2 bg-blue-50/60 text-[#0052FF] rounded-md">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className={`mt-3 font-mono font-bold text-xl ${summaryData.chenhLech >= 0 ? 'text-[#0B2341]' : 'text-amber-600'}`}>
                {Number(summaryData.chenhLech || 0).toLocaleString()} VNĐ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Dòng tiền thuần trong kỳ</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Tổng Số Dư Quỹ Hiện Tại</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-xl text-blue-700">
                {Number(summaryData.tongSoDuQuy || 0).toLocaleString()} VNĐ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Toàn bộ tài khoản tiền mặt & NH</p>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#0052FF]" />
              <span>Biểu Đồ So Sánh Thu - Chi 6 Tháng Gần Nhất</span>
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryData.monthlyChart || []} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="thang" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(val) => [`${Number(val).toLocaleString()} VNĐ`]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="thu" name="Tổng Thu" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chi" name="Tổng Chi" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sổ Quỹ Chi Tiết */}
      {activeTab === 'cashbook' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-700 shrink-0">Chọn Tài Khoản Quỹ:</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="">-- Tất cả tài khoản quỹ --</option>
                {accounts.map((acc) => (
                  <option key={acc.maTaiKhoanQuy} value={acc.maTaiKhoanQuy}>
                    {acc.tenTaiKhoanQuy} ({Number(acc.soDuHienTai).toLocaleString()} VNĐ)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div>Tổng Thu: <strong className="font-mono text-emerald-600">{cashBookData.totalThu.toLocaleString()} VNĐ</strong></div>
              <div>Tổng Chi: <strong className="font-mono text-red-600">{cashBookData.totalChi.toLocaleString()} VNĐ</strong></div>
              <div>Tồn Lũy Kế: <strong className="font-mono text-[#0B2341]">{cashBookData.chenhLech.toLocaleString()} VNĐ</strong></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Ngày GD</th>
                    <th className="py-3.5 px-4">Số Chứng Từ</th>
                    <th className="py-3.5 px-4">Loại</th>
                    <th className="py-3.5 px-4">Đối Tượng Giao Dịch</th>
                    <th className="py-3.5 px-4">Diễn Giải</th>
                    <th className="py-3.5 px-4 text-right">Số Tiền Thu</th>
                    <th className="py-3.5 px-4 text-right">Số Tiền Chi</th>
                    <th className="py-3.5 px-4 text-right">Số Dư Lũy Kế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-8 text-slate-400">Đang tải sổ quỹ...</td></tr>
                  ) : cashBookData.transactions.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-8 text-slate-400">Không có giao dịch nào trong khoảng thời gian này</td></tr>
                  ) : (
                    cashBookData.transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-slate-600">{tx.ngayGiaoDich}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2341]">{tx.maPhieu}</td>
                        <td className="py-3 px-4">
                          {tx.loaiPhieu === 'Thu' ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">Thu</span>
                          ) : (
                            <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-red-200">Chi</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{tx.tenDoiTuong}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{tx.dienGiai}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                          {tx.soTienThu > 0 ? Number(tx.soTienThu).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                          {tx.soTienChi > 0 ? Number(tx.soTienChi).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#0B2341]">
                          {Number(tx.soDuLuyKe).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Báo Cáo Theo Đối Tượng */}
      {activeTab === 'counterparty' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-slate-700">Lọc Theo Loại Đối Tượng:</label>
              <select
                value={loaiDoiTuong}
                onChange={(e) => setLoaiDoiTuong(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md px-3 py-2 focus:outline-none"
              >
                <option value="">Tất cả đối tượng</option>
                <option value="KH">Khách Hàng</option>
                <option value="NCC">Nhà Cung Cấp</option>
                <option value="NV">Nhân Viên</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Mã Ánh Xạ</th>
                    <th className="py-3.5 px-4">Loại</th>
                    <th className="py-3.5 px-4">Tên Đối Tượng</th>
                    <th className="py-3.5 px-4">Số Điện Thoại</th>
                    <th className="py-3.5 px-4 text-right">Tổng Tiền Thu</th>
                    <th className="py-3.5 px-4 text-right">Tổng Tiền Chi</th>
                    <th className="py-3.5 px-4 text-right">Chênh Lệch Thu - Chi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-400">Đang tải...</td></tr>
                  ) : counterpartyData.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-400">Chưa có số liệu phát sinh theo đối tượng</td></tr>
                  ) : (
                    counterpartyData.map((item) => (
                      <tr key={item.maDoiTuong} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2341]">{item.maDoiTuong}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.loaiDoiTuong}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{item.tenDoiTuong}</td>
                        <td className="py-3 px-4 text-slate-600">{item.soDienThoai || '-'}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                          {Number(item.tongThu).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                          {Number(item.tongChi).toLocaleString()}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${item.chenhLech >= 0 ? 'text-[#0B2341]' : 'text-amber-600'}`}>
                          {Number(item.chenhLech).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Đối Soát Ngân Hàng & Sổ Phụ (FI-FR06) */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Chứng Từ Chờ Đối Soát (Sổ Phụ)</span>
                <div className="p-2 bg-blue-50/60 text-[#0052FF] rounded-md">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-xl text-[#0B2341]">
                {Number(reconciliationData.pendingReconciliation?.totalAmount || 0).toLocaleString()} VNĐ
              </div>
              <p className="text-[11px] text-[#0052FF] font-medium mt-1">
                {reconciliationData.pendingReconciliation?.count || 0} phiếu đang chờ đối soát khớp lệnh
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Chứng Từ Thu Đã Khớp Sổ Quỹ</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-xl text-emerald-700">
                {Number(reconciliationData.approvedItems?.receiptsTotal || 0).toLocaleString()} VNĐ
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {reconciliationData.approvedItems?.receiptsCount || 0} giao dịch đã cập nhật số dư
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Tài Khoản Ngân Hàng Hoạt Động</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-xl text-blue-700">
                {reconciliationData.accounts?.length || 0} Tài Khoản
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Hệ thống tài khoản ngân hàng & tiền mặt</p>
            </div>
          </div>

          {/* Pending Items Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-[#0052FF]" />
                <span>Danh Sách Chứng Từ Đang Chờ Đối Soát Sao Kê (ChoDoiSoat)</span>
              </h3>
              <button
                onClick={fetchReconciliationReport}
                className="text-xs text-[#0052FF] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Làm mới đối soát</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Mã Phiếu</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Ngày Phát Sinh</th>
                    <th className="py-3 px-4">Đối Tượng</th>
                    <th className="py-3 px-4">Tài Khoản / Ngân Hàng</th>
                    <th className="py-3 px-4 text-right">Số Tiền (VNĐ)</th>
                    <th className="py-3 px-4">Nội Dung</th>
                    <th className="py-3 px-4 text-center">Hành Động Đối Soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reconciliationData.pendingReconciliation?.items.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-6 text-slate-400">
                        Không có chứng từ nào đang chờ đối soát. Sổ phụ và sổ cái hoàn toàn khớp nhau.
                      </td>
                    </tr>
                  ) : (
                    reconciliationData.pendingReconciliation?.items.map((item) => (
                      <tr key={item.maPhieu} className="hover:bg-blue-50/60/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#0B2341]">{item.maPhieu}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-[#0B2341] font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.loaiPhieu}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.ngay}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{item.tenDoiTuong}</td>
                        <td className="py-3 px-4 text-slate-600">{item.tenTaiKhoanQuy}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#0B2341]">
                          {Number(item.soTien).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{item.ghiChu}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleReconcileApprove(item.maPhieu)}
                            className="px-3 py-1.5 bg-[#0B2341] hover:bg-[#132F4C] text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 mx-auto cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Khớp Lệnh & Ghi Sổ</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
