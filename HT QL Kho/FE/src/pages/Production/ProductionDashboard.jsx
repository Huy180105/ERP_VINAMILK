import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductionAPI } from '../../services/api';
import { 
  Factory, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  RotateCcw, 
  ArrowRight, 
  Plus, 
  Boxes, 
  Sparkles,
  Activity,
  Layers
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
  Area 
} from 'recharts';

export default function ProductionDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [volumeData, setVolumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, volRes] = await Promise.all([
        ProductionAPI.getDashboardSummary(),
        ProductionAPI.getVolumeReport()
      ]);
      setSummary(sumRes.data.data);
      setVolumeData(volRes.data.data);
    } catch (err) {
      console.error('Error fetching production dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const stagesPipeline = [
    { step: 1, name: 'Chuẩn bị NVL', desc: 'Kiểm tra & Cân định lượng', icon: Boxes, color: 'bg-blue-500' },
    { step: 2, name: 'Phối Trộn', desc: 'Đồng hóa sữa & vi chất', icon: Layers, color: 'bg-indigo-500' },
    { step: 3, name: 'Tiệt Trùng UHT', desc: '140°C trong 4 giây', icon: Sparkles, color: 'bg-purple-500' },
    { step: 4, name: 'Đồng Hóa', desc: 'Áp suất 200 bar', icon: Activity, color: 'bg-pink-500' },
    { step: 5, name: 'Chiết Rót', desc: 'Vô trùng Tetra Pak', icon: Factory, color: 'bg-amber-500' },
    { step: 6, name: 'Đóng Gói & QC', desc: 'Thùng carton & Nghiệm thu', icon: ShieldCheck, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#001E50] via-[#00249C] to-indigo-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>HỆ THỐNG ĐIỀU HÀNH DÂY CHUYỀN SẢN XUẤT VINAMILK</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Trung Tâm Giám Sát Sản Xuất</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Giám sát thời gian thực quy trình tiệt trùng, chiết rót tự động, quản lý mẻ sản xuất, định mức tiêu hao và chỉ số OEE nhà máy.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/production/orders')}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Lệnh Sản Xuất Mới</span>
          </button>
          <button
            onClick={() => navigate('/production/quality-control')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Nghiệm Thu QC</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">LỆNH ĐANG CHẠY</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${summary?.inProgressOrders || 0} / ${summary?.totalOrders || 0}`}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {summary?.pendingOrders || 0} lệnh đang chờ duyệt
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-bold">{summary?.completedOrders || 0} lệnh hoàn thành</span>
            <span onClick={() => navigate('/production/orders')} className="text-blue-600 font-bold hover:underline cursor-pointer">Chi tiết →</span>
          </div>
        </div>

        {/* Card 2: Planned vs Output */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">SẢN LƯỢNG KẾ HOẠCH</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? '...' : Number(summary?.totalPlannedUnits || 0).toLocaleString('vi-VN')}
            </div>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              Đơn vị: Hộp / Hũ / Gói tiêu chuẩn
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Đã nghiệm thu: <b>{Number(summary?.totalInspected || 0).toLocaleString('vi-VN')}</b></span>
            <span onClick={() => navigate('/production/reports')} className="text-indigo-600 font-bold hover:underline cursor-pointer">Báo cáo →</span>
          </div>
        </div>

        {/* Card 3: Quality Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">CHẤT LƯỢNG ĐẠT CHUẨN</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {loading ? '...' : `${summary?.qualityRate || 99}%`}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {summary?.totalDefective || 0} sản phẩm lỗi phát sinh
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-600 font-semibold">{summary?.compensationOrdersCount || 0} phiếu làm bù</span>
            <span onClick={() => navigate('/production/quality-control')} className="text-emerald-600 font-bold hover:underline cursor-pointer">QC →</span>
          </div>
        </div>

        {/* Card 4: OEE Efficiency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">HIỆU SUẤT TỔNG THỂ (OEE)</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${summary?.oeeRate || 87.1}%`}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              ↑ Vượt 2.1% so với mục tiêu tháng
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">6 Dây chuyền tự động</span>
            <span onClick={() => navigate('/production/stages')} className="text-amber-600 font-bold hover:underline cursor-pointer">Dây chuyền →</span>
          </div>
        </div>
      </div>

      {/* 6 Stages Standard Pipeline Monitor */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#00249C] flex items-center space-x-2">
              <Factory className="w-4 h-4 text-blue-600" />
              <span>Dây Chuyền 6 Công Đoạn Sản Xuất Sữa Chuẩn Vinamilk</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình khép kín tự động từ khâu nạp sữa thô tới đóng gói thùng carton xuất kho
            </p>
          </div>
          <button 
            onClick={() => navigate('/production/stages')}
            className="text-xs font-bold text-[#00249C] hover:underline flex items-center space-x-1"
          >
            <span>Quản Lý Công Đoạn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stagesPipeline.map((stg) => {
            const Icon = stg.icon;
            return (
              <div 
                key={stg.step}
                onClick={() => navigate('/production/stages')}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-indigo-50/50 hover:border-indigo-300 transition cursor-pointer space-y-2.5 text-center group"
              >
                <div className="flex justify-center">
                  <div className={`w-10 h-10 rounded-2xl text-white ${stg.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Khâu {stg.step}</span>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#00249C]">{stg.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{stg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Volume & Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#00249C]">Xu Hướng Sản Lượng Kế Hoạch & Thực Tế (Tháng 4 - 9/2026)</h3>
              <p className="text-xs text-slate-500 mt-0.5">So sánh khối lượng sản xuất theo tháng (Đơn vị: Hộp tiêu chuẩn)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span><span className="text-slate-600">Kế hoạch</span></span>
              <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-slate-600">Thực tế</span></span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData?.monthlyTrends || []}>
                <defs>
                  <linearGradient id="colorKeHoach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00249C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00249C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThucTe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="thang" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="keHoach" name="Kế hoạch" stroke="#00249C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKeHoach)" />
                <Area type="monotone" dataKey="thucTe" name="Thực tế đạt" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorThucTe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Material & QC Status Widget (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#00249C] mb-3">Tình Trạng Vật Tư & Điều Phối</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-950">Phiếu Yêu Cầu NVL</div>
                  <div className="text-[11px] text-blue-700">{summary?.materialRequests?.pending || 0} phiếu đang chờ Kho xuất</div>
                </div>
                <button 
                  onClick={() => navigate('/production/material-requests')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  Xử lý
                </button>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-purple-950">Bán Thành Phẩm BTP</div>
                  <div className="text-[11px] text-purple-700">5 khâu đệm trung gian ổn định</div>
                </div>
                <button 
                  onClick={() => navigate('/production/semi-finished')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  Kiểm tra
                </button>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-950">Lệnh Sản Xuất Bù</div>
                  <div className="text-[11px] text-amber-700">{summary?.compensationOrdersCount || 0} mẻ bù phế phẩm</div>
                </div>
                <button 
                  onClick={() => navigate('/production/compensations')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  Xem
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-900 to-[#00249C] text-white rounded-2xl text-xs space-y-2 shadow-sm">
            <div className="font-bold flex items-center space-x-1.5 text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Tiêu Chuẩn Net Zero Vinamilk</span>
            </div>
            <p className="text-[11px] text-blue-100 leading-relaxed font-medium">
              100% dây chuyền tự động hóa giúp giảm 15% năng lượng tiêu thụ & tối ưu định mức nguyên liệu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
