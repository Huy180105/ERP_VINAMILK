import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  let style = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let Icon = Clock;

  switch (status) {
    case 'Đã xuất kho':
    case 'Đã duyệt':
    case 'Đang kinh doanh':
    case 'Còn hạn':
    case 'Hoàn thành':
    case 'Đã hoàn thành':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm';
      Icon = CheckCircle2;
      break;
    case 'Đã tiếp nhận':
      style = 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm';
      Icon = CheckCircle2;
      break;
    case 'Chờ duyệt':
    case 'Chờ xác nhận':
    case 'Chờ xử lý':
      style = 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm';
      Icon = Clock;
      break;
    case 'Từ chối':
    case 'Hủy':
    case 'Hết hạn':
      style = 'bg-rose-50 text-rose-800 border-rose-200 shadow-sm';
      Icon = XCircle;
      break;
    case 'Sắp hết hạn':
    case 'Tồn kho thấp':
      style = 'bg-orange-50 text-orange-800 border-orange-200 shadow-sm';
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
