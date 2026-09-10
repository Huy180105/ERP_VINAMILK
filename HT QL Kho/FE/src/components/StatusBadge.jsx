import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  let style = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let Icon = Clock;

  switch (status) {
    case 'Hoàn thành':
    case 'Đã duyệt':
    case 'Đang kinh doanh':
    case 'Còn hạn':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs';
      Icon = CheckCircle2;
      break;
    case 'Chờ duyệt':
    case 'Chờ xác nhận':
    case 'Chờ xử lý':
      style = 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs';
      Icon = Clock;
      break;
    case 'Từ chối':
    case 'Hủy':
    case 'Hết hạn':
      style = 'bg-rose-50 text-rose-800 border-rose-200 shadow-xs';
      Icon = XCircle;
      break;
    case 'Sắp hết hạn':
    case 'Tồn kho thấp':
      style = 'bg-orange-50 text-orange-800 border-orange-200 shadow-xs';
      Icon = AlertCircle;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${style}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{status || 'Không xác định'}</span>
    </span>
  );
}
