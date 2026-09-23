import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceReportAPI, ReceiptAPI, PaymentAPI } from '../../services/financeApi';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Scale, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar,
  ChevronRight
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

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    tongThu: 0,
    tongChi: 0,
    chenhLech: 0,
    tongSoDuQuy: 0,
    soPhieuThu: 0,
    soPhieuChi: 0,
    monthlyChart: [],
  });
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, recRes, payRes] = await Promise.all([
        FinanceReportAPI.getSummaryReport(),
        ReceiptAPI.getReceipts(),
        PaymentAPI.getPayments(),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (recRes.data.success) setRecentReceipts((recRes.data.data || []).slice(0, 5));
      if (payRes.data.success) setRecentPayments((payRes.data.data || []).slice(0, 5));
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard tài chính:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (amount) => (amount || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-[#0052FF]" />
            <span>Tổng Quan Tài Chính & Dòng Tiền Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tổng hợp thu chi, kiểm soát số dư quỹ tiền mặt và tài khoản ngân hàng thời gian thực.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/finance/receipts')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Lập Phiếu Thu</span>
          </button>
          <button
            onClick={() => navigate('/finance/payments')}
            className="bg-[#0B2341] hover:bg-[#132F4C] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Lập Phiếu Chi</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Thu */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Thu Đã Duyệt</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600">{formatVND(summary.tongThu)}</div>
            <p className="text-[11px] text-slate-400 mt-1">Từ {summary.soPhieuThu} phiếu thu hợp lệ</p>
          </div>
        </div>

        {/* Card 2: Tổng Chi */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Chi Đã Duyệt</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-rose-600">{formatVND(summary.tongChi)}</div>
            <p className="text-[11px] text-slate-400 mt-1">Từ {summary.soPhieuChi} phiếu chi hợp lệ</p>
          </div>
        </div>

        {/* Card 3: Chênh Lệch Dòng Tiền */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dòng Tiền Thuần (Net)</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-xl font-bold ${summary.chenhLech >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              {formatVND(summary.chenhLech)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.chenhLech >= 0 ? 'Thu vượt chi (+)' : 'Chi vượt thu (-)'}
            </p>
          </div>
        </div>

        {/* Card 4: Tổng Số Dư Quỹ & Ngân Hàng */}
        <div className="bg-[#0B2341] text-white p-5 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Tổng Số Dư Quỹ & NH</span>
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{formatVND(summary.tongSoDuQuy)}</div>
            <p className="text-[11px] text-blue-200 mt-1">Khả dụng trong toàn hệ thống</p>
          </div>
        </div>
      </div>

      {/* Chart: Cash Flow 6 Months */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#0052FF]" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Biểu Đồ Biến Động Dòng Tiền Thu - Chi (6 Tháng Gần Nhất)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Đơn vị: VNĐ</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.monthlyChart || []} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="thang" tick={{ fontSize: 11 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748B" tickFormatter={(val) => `${(val / 1000000).toLocaleString()} Tr`} />
              <Tooltip 
                formatter={(value) => [formatVND(value), '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="thu" name="Tổng Thu" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chi" name="Tổng Chi" fill="#F43F5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Receipts & Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Receipts */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Phiếu Thu Gần Nhất</h4>
            </div>
            <button
              onClick={() => navigate('/finance/receipts')}
              className="text-xs text-[#0052FF] hover:text-[#0B2341] font-semibold flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentReceipts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Chưa có phiếu thu nào</div>
            ) : (
              recentReceipts.map((r) => (
                <div key={r.maPhieuThu} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{r.maPhieuThu}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-xs">{r.lyDoThu || 'Không có ghi chú'}</p>
                    <span className="text-[10px] text-slate-400">{r.ngayThu}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold text-emerald-600 block">{formatVND(r.soTien)}</span>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      r.trangThai === 'DaDuyet' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.trangThai === 'DaDuyet' ? 'Đã duyệt' : 'Mới'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Phiếu Chi Gần Nhất</h4>
            </div>
            <button
              onClick={() => navigate('/finance/payments')}
              className="text-xs text-[#0052FF] hover:text-[#0B2341] font-semibold flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Chưa có phiếu chi nào</div>
            ) : (
              recentPayments.map((p) => (
                <div key={p.maPhieuChi} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{p.maPhieuChi}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-xs">{p.lyDoChi || 'Không có ghi chú'}</p>
                    <span className="text-[10px] text-slate-400">{p.ngayChi}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold text-rose-600 block">{formatVND(p.soTien)}</span>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      p.trangThai === 'DaDuyet' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.trangThai === 'DaDuyet' ? 'Đã duyệt' : 'Mới'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
