import React, { useEffect, useState } from 'react';
import { ReportAPI } from '../services/api';
import { FileText, Download, Calendar, RefreshCw } from 'lucide-react';

export default function Reports() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await ReportAPI.getSummary({ fromDate, toDate });
      setSummary(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#001E50] flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Báo Cáo Tổng Hợp Nhập - Xuất - Tồn Vinamilk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thống kê biến động nhập xuất tồn theo từng lô hàng trong kỳ báo cáo
          </p>
        </div>
        <button
          onClick={() => alert('Xuất báo cáo PDF/Excel thành công!')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel / PDF</span>
        </button>
      </div>

      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <span className="font-bold text-slate-700">Kỳ Báo Cáo:</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg p-2"
        />
        <span>Đến:</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg p-2"
        />
        <button
          onClick={fetchReport}
          className="bg-[#001E50] hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-lg transition flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tải Báo Cáo</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Lô</th>
                <th className="p-3">Loại Mặt Hàng</th>
                <th className="p-3">Tên Mặt Hàng</th>
                <th className="p-3 text-right">Tổng Nhập</th>
                <th className="p-3 text-right">Tổng Xuất</th>
                <th className="p-3 text-right">Tồn Hiện Tại</th>
                <th className="p-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-400">Đang tạo báo cáo...</td></tr>
              ) : summary.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center text-slate-400">Không có dữ liệu báo cáo.</td></tr>
              ) : (
                summary.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#001E50]">{row.maTonKho}</td>
                    <td className="p-3 font-semibold text-slate-600">{row.loai}</td>
                    <td className="p-3 font-medium text-slate-800">{row.tenMatHang}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">+{row.tongNhap?.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-amber-600">-{row.tongXuat?.toLocaleString()}</td>
                    <td className="p-3 text-right font-extrabold text-[#001E50]">{row.tonKhoHienTai?.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {row.trangThai}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
