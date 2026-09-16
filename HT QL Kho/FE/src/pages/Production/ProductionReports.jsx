import React, { useEffect, useState } from 'react';
import { ProductionAPI } from '../../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Layers, 
  Download, 
  Printer, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  PieChart as PieIcon,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';

export default function ProductionReports() {
  const [volumeData, setVolumeData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [qualityData, setQualityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [volRes, effRes, qualRes] = await Promise.all([
        ProductionAPI.getVolumeReport(),
        ProductionAPI.getEfficiencyReport(),
        ProductionAPI.getQualityReport()
      ]);
      setVolumeData(volRes.data.data);
      setEfficiencyData(effRes.data.data);
      setQualityData(qualRes.data.data);
    } catch (err) {
      console.error('Error fetching production reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!volumeData?.byProduct) return;
    let csv = 'Mã Sản Phẩm,Tên Sản Phẩm,Đơn Vị Tính,Tổng Sản Lượng Kế Hoạch (Hộp)\n';
    volumeData.byProduct.forEach((p) => {
      csv += `"${p.maSanPham}","${p.tenSanPham}","${p.donViTinh}",${p.tongKeHoach}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_San_Luong_Vinamilk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#001E50] flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Báo Cáo & Phân Tích Hiệu Suất Sản Xuất (PR-FR34 → PR-FR37)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp sản lượng theo ngày/tháng, đánh giá chỉ số hiệu suất thiết bị OEE, tỷ lệ lỗi và chi phí từng công đoạn
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-[#00249C] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* OEE 4-Gauge Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-5 rounded-3xl shadow-md space-y-2">
          <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider">CHỈ SỐ HIỆU SUẤT TỔNG THỂ (OEE)</span>
          <div className="text-3xl font-black text-amber-300">88.0%</div>
          <p className="text-[11px] text-blue-100 font-medium">Đạt tiêu chuẩn nhà máy sữa hiện đại toàn cầu</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TÍNH KHẢ DỤNG THIẾT BỊ (AVAILABILITY)</span>
          <div className="text-2xl font-black text-slate-900">95.2%</div>
          <p className="text-[11px] text-emerald-600 font-bold">Thời gian dừng máy sự cố &lt; 4.8%</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">HIỆU SUẤT TỐC ĐỘ (PERFORMANCE)</span>
          <div className="text-2xl font-black text-slate-900">93.8%</div>
          <p className="text-[11px] text-indigo-600 font-bold">Dây chuyền chiết rót đạt 24.000 hộp/giờ</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TỶ LỆ CHẤT LƯỢNG (QUALITY RATE)</span>
          <div className="text-2xl font-black text-emerald-600">98.6%</div>
          <p className="text-[11px] text-slate-500 font-medium">Tỷ lệ phế phẩm chỉ chiếm 1.4%</p>
        </div>
      </div>

      {/* Chart Row 1: Volume By Product & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Volume Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#001E50]">Sản Lượng Phân Bổ Theo Sản Phẩm (Vinamilk Product Mix)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tổng số lượng hộp/hũ theo kế hoạch phân bổ các dòng sữa</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData?.byProduct || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tenSanPham" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split(' ').slice(0, 3).join(' ')} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="tongKeHoach" name="Số lượng (Hộp)" fill="#00249C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Causes Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#001E50]">Phân Tích Nguyên Nhân Phế Phẩm (QC Defect Analysis)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ các loại lỗi kỹ thuật ghi nhận trong các mẻ sản xuất</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {qualityData?.defectCauses?.map((df, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{df.nguyenNhan}</div>
                  <div className="text-[11px] text-slate-500">Ghi nhận: <b>{df.soLuong} sản phẩm</b></div>
                </div>
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {df.tyLe}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Performance & Costs Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#001E50]">Tổng Hợp Hiệu Suất & Chi Phí Từng Công Đoạn Dây Chuyền</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-3">Tên Công Đoạn</th>
                <th className="p-3 text-center">Số Mẻ Đã Chạy</th>
                <th className="p-3 text-center">Nhân Công TB (Người)</th>
                <th className="p-3 text-right">Tổng Chi Phí Phát Sinh</th>
                <th className="p-3 text-center">Đánh Giá Hiệu Suất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {efficiencyData?.stagesPerformance?.map((stg, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900">{stg.tenLenh}</td>
                  <td className="p-3 text-center font-mono font-bold text-indigo-700">{stg.soLanChay} mẻ</td>
                  <td className="p-3 text-center font-mono">{Math.round(stg.nhanCongTB || 4)} công nhân</td>
                  <td className="p-3 text-right font-mono font-black text-blue-900">
                    {Number(stg.tongChiPhi || 0).toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Tối ưu định mức
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
