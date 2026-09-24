import React, { useEffect, useState } from 'react';
import { OutboundAPI, InventoryAPI, MasterDataAPI } from '../../services/api';
import { Truck, CheckCircle2, Zap } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import FefoBadge from '../../components/FefoBadge';

export default function OutboundProducts() {
  const [dispatches, setDispatches] = useState([]);
  const [fefoSuggestions, setFefoSuggestions] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [customersMap, setCustomersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFefoModal, setShowFefoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('SP001');

  useEffect(() => {
    fetchDispatches();
    fetchFefoSuggestions('SP001');
    MasterDataAPI.getProducts().then(res => setProductsList(res.data.data || [])).catch(console.error);
    MasterDataAPI.getCustomers().then(res => {
      const map = {};
      (res.data?.data || []).forEach(c => {
        map[c.maKhachHang] = c.tenKhachHang;
      });
      setCustomersMap(map);
    }).catch(console.error);
  }, []);

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const res = await OutboundAPI.getProductDispatches();
      setDispatches(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFefoSuggestions = async (maSP) => {
    try {
      const res = await InventoryAPI.getFefoSuggestions({ maSP });
      setFefoSuggestions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm(`Xác nhận xuất kho giao hàng cho khách hàng theo phiếu ${id}? Tồn kho sẽ giảm theo lô.`)) {
      try {
        await OutboundAPI.completeProductDispatch(id);
        fetchDispatches();
      } catch (err) {
        alert('Lỗi xuất hàng: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with FEFO Highlight */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0B2341] flex items-center space-x-2">
            <Truck className="w-6 h-6 text-amber-600" />
            <span>Xuất Kho Thành Phẩm Cho Nhà Phân Phối / Khách Hàng (FEFO Engine)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ứng dụng thuật toán **FEFO (First Expired, First Out)** tự động đề xuất xuất lô hàng gần hết hạn trước
          </p>
        </div>
        <button
          onClick={() => setShowFefoModal(true)}
          className="bg-[#D97706] hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow transition flex items-center space-x-2 cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Tra Cứu Lô Gợi Ý FEFO</span>
        </button>
      </div>

      {/* FEFO Quick Recommendation Cards */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wide">
              Top Lô Thành Phẩm Ưu Tiên Xuất Trước Theo Nguyên Tắc FEFO
            </h3>
          </div>
          <span className="text-[11px] text-amber-800 font-medium">Hạn sử dụng gần nhất</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {fefoSuggestions.slice(0, 3).map((lot, idx) => {
            const daysLeft = Math.ceil((new Date(lot.hanSuDung) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <div key={idx} className="bg-white p-3.5 rounded-md border border-amber-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0B2341] text-xs">{lot.maTonKho}</span>
                  <FefoBadge daysLeft={daysLeft} />
                </div>
                <p className="text-xs font-semibold text-slate-800">{lot.tenTonKho}</p>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t">
                  <span>HSD: <b className="text-slate-800">{lot.hanSuDung}</b></span>
                  <span>Tồn: <b className="text-emerald-700">{lot.soLuongTonHienTai?.toLocaleString()}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatch List Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Mã Phiếu Xuất</th>
                <th className="p-3">Nhà Phân Phối / Khách Hàng</th>
                <th className="p-3">Ngày Xuất</th>
                <th className="p-3">Chi Tiết Lô Thành Phẩm Xuất</th>
                <th className="p-3 text-center">Trạng Thái</th>
                <th className="p-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Đang tải danh sách...</td></tr>
              ) : dispatches.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-400">Chưa có phiếu xuất sản phẩm nào.</td></tr>
              ) : (
                dispatches.map((d) => (
                  <tr key={d.maPhieuXuatSP} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-[#0B2341]">{d.maPhieuXuatSP}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">
                        {d.khach_hang?.tenKhachHang || 
                         d.khachHang?.tenKhachHang || 
                         d.don_hang?.khach_hang?.tenKhachHang || 
                         customersMap[d.maKhachHang] || 
                         customersMap[d.don_hang?.maKhachHang] || 
                         'Đại Lý Phân Phối Vinamilk'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Mã KH: {d.maKhachHang || d.don_hang?.maKhachHang || d.maDonHang || '-'}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{d.ngayXuat}</td>
                    <td className="p-3 space-y-1">
                      {d.chi_tiets?.map((item, idx) => (
                        <div key={idx} className="bg-blue-50 p-2 rounded-lg font-mono text-[11px] border border-blue-200">
                          <span className="font-bold text-blue-900">{item.maTonKho}</span>: {item.soLuong?.toLocaleString()} Sản phẩm
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={d.trangThai} />
                    </td>
                    <td className="p-3 text-center">
                      {d.trangThai !== 'Đã xuất kho' && d.trangThai !== 'Hoàn thành' && (
                        <button
                          onClick={() => handleComplete(d.maPhieuXuatSP)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] shadow-sm transition inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Xuất Hàng</span>
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

      {/* FEFO Modal Lookup */}
      {showFefoModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#0B2341] flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Thuật Toán Gợi Ý Xuất Hàng FEFO</span>
              </h3>
              <button onClick={() => setShowFefoModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Chọn Sản Phẩm Cần Tra Cứu FEFO:</label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  fetchFefoSuggestions(e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium"
              >
                {productsList.length > 0 ? productsList.map(p => (
                  <option key={p.maSanPham} value={p.maSanPham}>
                    {p.maSanPham} - {p.tenSanPham}
                  </option>
                )) : (
                  <>
                    <option value="SP001">SP001 - Sữa Tươi Tiệt Trùng Vinamilk 100% 180ml</option>
                    <option value="SP002">SP002 - Sữa Chua Ăn Vinamilk Có Đường 100g</option>
                  </>
                )}
              </select>

              <div className="divide-y border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                {fefoSuggestions.length === 0 ? (
                  <p className="p-4 text-center text-slate-400 text-xs">Không có lô tồn kho nào còn hạn sử dụng cho sản phẩm này.</p>
                ) : (
                  fefoSuggestions.map((lot, idx) => {
                    const daysLeft = Math.ceil((new Date(lot.hanSuDung) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-blue-900">{lot.maTonKho}</span>
                          <p className="text-slate-500 text-[11px] mt-0.5">NSX: {lot.ngaySanXuat} | HSD: <b>{lot.hanSuDung}</b></p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold text-emerald-700">{lot.soLuongTonHienTai?.toLocaleString()} Hộp</p>
                          <FefoBadge daysLeft={daysLeft} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
