import React from 'react';
import { Zap } from 'lucide-react';

export default function FefoBadge({ daysLeft }) {
  if (daysLeft === undefined || daysLeft === null) return null;

  let style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let label = `Còn ${daysLeft} ngày`;

  if (daysLeft <= 0) {
    style = 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold animate-pulse';
    label = 'ĐÃ HẾT HẠN';
  } else if (daysLeft <= 30) {
    style = 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 border-amber-300 font-extrabold shadow-xs';
    label = `ƯU TIÊN FEFO (${daysLeft} NÀY)`;
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${style}`}>
      <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
      <span>{label}</span>
    </span>
  );
}
