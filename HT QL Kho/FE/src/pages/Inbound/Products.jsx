import React, { useEffect, useState } from 'react';
import { InboundAPI } from '../../services/api';
import { Layers, CheckCircle2, Package } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function InboundProducts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await InboundAPI.getProductReceipts();
      setReceipts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm(`Xác nhận tiếp nhận thành phẩm ${id} vào kho? Tồn kho sản phẩm sẽ được tự động cộng.`)) {
      try {
        await InboundAPI.completeProductReceipt(id);
        fetchReceipts();
      } catch (err) {
        alert('Lỗi xác nhận: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#001E50] flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Nhập Kho Thành Phẩm (Bàn Giao Từ Xưởng Sản Xuất)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tiếp nhận các lô sữa tươi, sữa chua đã được kiểm định QC đạt chuẩn từ nhà máy Vinamilk
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Phiếu Nhập</th>
                <th className="p-3">Căn Cứ Yêu Cầu SX</th>
                <th className="p-3">Ngày Nhập</th>
                <th className="p-3">Chi Tiết Lô Thành Phẩm</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Đang tải phiếu nhập sản phẩm...</td></tr>
              ) : receipts.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Chưa có phiếu nhập thành phẩm nào.</td></tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.maPhieuNhapSP} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#001E50]">{r.maPhieuNhapSP}</td>
                    <td className="p-3 font-medium text-slate-700">{r.maPhieuYCXSP || 'Bàn giao trực tiếp'}</td>
                    <td className="p-3 text-slate-600 font-mono">{r.ngayNhap}</td>
                    <td className="p-3 space-y-1">
                      {r.chi_tiets?.map((d, idx) => (
                        <div key={idx} className="bg-blue-50/60 p-2 rounded-lg font-mono text-[11px] border border-blue-100">
                          <span className="font-bold text-blue-900">{d.maTonKho}</span>: {d.soLuong?.toLocaleString()} Sản phẩm
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={r.trangThai} />
                    </td>
                    <td className="p-3 text-center">
                      {r.trangThai !== 'Hoàn thành' && (
                        <button
                          onClick={() => handleComplete(r.maPhieuNhapSP)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Xác Nhận Nhập Kho</span>
                        </button>
                      )}
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
