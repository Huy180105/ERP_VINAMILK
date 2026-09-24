import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  let displayStatus = status;
  if (status === 'Hoàn thành' || status === 'Đã hoàn thành') {
    displayStatus = 'Đã nhập kho';
  }

  let style = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let Icon = Clock;

  switch (displayStatus) {
    case 'Đã nhập kho':
    case 'Đã xuất kho':
    case 'Thành công':
    case 'Đã duyệt':
    case 'Đang kinh doanh':
    case 'Còn hạn':
    case 'Đạt':
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
    case 'Chưa xử lý':
    case 'Chờ tiếp nhận':
    case 'Chờ kiểm tra':
      style = 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm';
      Icon = Clock;
      break;
    case 'Từ chối':
    case 'Hủy':
    case 'Hết hạn':
    case 'Không đạt':
      style = 'bg-rose-50 text-rose-800 border-rose-200 shadow-sm';
      Icon = XCircle;
      break;
    case 'Sắp hết hạn':
    case 'Tồn kho thấp':
    case 'Ưu tiên xuất FEFO':
      style = 'bg-orange-50 text-orange-800 border-orange-200 shadow-sm';
      Icon = AlertCircle;
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${style}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{displayStatus || 'Không xác định'}</span>
    </span>
  );
}
