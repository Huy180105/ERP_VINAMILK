import React, { useEffect, useState } from 'react';
import { FinanceMasterDataAPI } from '../../../services/financeApi';
import { generateAutoCode } from '../../../utils/codeGenerator';
import { Landmark, Plus, Search, Edit2, Trash2, Wallet, CreditCard } from 'lucide-react';

export default function TaiKhoanQuy() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [loaiTaiKhoan, setLoaiTaiKhoan] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    maTaiKhoanQuy: '',
    tenTaiKhoanQuy: '',
    loaiTaiKhoan: 'TM',
    soTaiKhoan: '',
    nganHang: '',
    soDuHienTai: 0,
    trangThai: 1,
  });

  useEffect(() => {
    fetchData();
  }, [keyword, loaiTaiKhoan]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await FinanceMasterDataAPI.getAccounts({ keyword, loaiTaiKhoan });
      if (res.data.success) setAccounts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item ? {
      maTaiKhoanQuy: item.maTaiKhoanQuy,
      tenTaiKhoanQuy: item.tenTaiKhoanQuy,
      loaiTaiKhoan: item.loaiTaiKhoan,
      soTaiKhoan: item.soTaiKhoan || '',
      nganHang: item.nganHang || '',
      soDuHienTai: item.soDuHienTai || 0,
      trangThai: item.trangThai ? 1 : 0,
    } : {
      maTaiKhoanQuy: generateAutoCode(accounts, 'maTaiKhoanQuy', 'TKQ', 3),
      tenTaiKhoanQuy: '',
      loaiTaiKhoan: 'TM',
      soTaiKhoan: '',
      nganHang: '',
      soDuHienTai: 0,
      trangThai: 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await FinanceMasterDataAPI.updateAccount(editingItem.maTaiKhoanQuy, formData);
      } else {
        await FinanceMasterDataAPI.createAccount(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Xác nhận xóa tài khoản quỹ ${id}?`)) return;
    try {
      await FinanceMasterDataAPI.deleteAccount(id);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatVND = (num) => (num || 0).toLocaleString('vi-VN') + ' đ';
  const totalBalance = accounts.reduce((acc, cur) => acc + (parseFloat(cur.soDuHienTai) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Landmark className="w-6 h-6 text-[#0052FF]" />
            <span>Tài Khoản Quỹ Tiền Mặt & Ngân Hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý số dư ngân quỹ, quỹ tiền mặt và tài khoản thanh toán ngân hàng
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#0B2341] hover:bg-[#132F4C] text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tài Khoản Quỹ</span>
        </button>
      </div>

      {/* KPI Total Balance Card */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white p-5 rounded-lg shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-purple-200 uppercase tracking-wide font-bold">Tổng Số Dư Khả Dụng Trong Các Quỹ</span>
          <div className="text-2xl font-bold">{formatVND(totalBalance)}</div>
        </div>
        <div className="p-3 bg-white/10 rounded-lg">
          <Wallet className="w-8 h-8 text-purple-200" />
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Tìm theo tên quỹ, mã, số TK..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={loaiTaiKhoan}
            onChange={(e) => setLoaiTaiKhoan(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-md px-3 py-2 focus:outline-none"
          >
            <option value="">Tất cả loại quỹ</option>
            <option value="TM">Tiền Mặt</option>
            <option value="NH">Tài Khoản Ngân Hàng</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">Tổng số: <b>{accounts.length}</b> tài khoản quỹ</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Mã Quỹ</th>
                <th className="p-3.5">Loại Quỹ</th>
                <th className="p-3.5">Tên Tài Khoản Quỹ</th>
                <th className="p-3.5">Số Tài Khoản / Ngân Hàng</th>
                <th className="p-3.5 text-right">Số Dư Hiện Tại</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-400">Không tìm thấy tài khoản quỹ nào</td></tr>
              ) : (
                accounts.map((item) => (
                  <tr key={item.maTaiKhoanQuy} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-[#0B2341]">{item.maTaiKhoanQuy}</td>
                    <td className="p-3.5">
                      {item.loaiTaiKhoan === 'TM' ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          <Wallet className="w-3 h-3 mr-1" />
                          <span>Tiền Mặt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          <CreditCard className="w-3 h-3 mr-1" />
                          <span>Ngân Hàng</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{item.tenTaiKhoanQuy}</td>
                    <td className="p-3.5">
                      {item.soTaiKhoan ? (
                        <div className="font-mono text-[11px]">
                          <span className="font-bold text-slate-800">{item.soTaiKhoan}</span>
                          <span className="block text-slate-500 text-[10px]">{item.nganHang}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Quỹ nội bộ</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-bold text-sm text-emerald-600 font-mono">
                      {formatVND(item.soDuHienTai)}
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 text-slate-500 hover:text-[#0052FF] hover:bg-blue-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.maTaiKhoanQuy)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-3">
              {editingItem ? 'Cập Nhật Tài Khoản Quỹ' : 'Thêm Mới Tài Khoản Quỹ'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã Quỹ:</label>
                  <input
                    type="text"
                    value={formData.maTaiKhoanQuy}
                    disabled={!!editingItem}
                    onChange={(e) => setFormData({ ...formData, maTaiKhoanQuy: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-mono font-bold disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loại Quỹ:</label>
                  <select
                    value={formData.loaiTaiKhoan}
                    onChange={(e) => setFormData({ ...formData, loaiTaiKhoan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-semibold"
                  >
                    <option value="TM">Tiền Mặt</option>
                    <option value="NH">Ngân Hàng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Tài Khoản Quỹ:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Vietcombank - TK Thanh Toán"
                  value={formData.tenTaiKhoanQuy}
                  onChange={(e) => setFormData({ ...formData, tenTaiKhoanQuy: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-medium"
                />
              </div>

              {formData.loaiTaiKhoan === 'NH' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số Tài Khoản:</label>
                    <input
                      type="text"
                      placeholder="Số tài khoản ngân hàng"
                      value={formData.soTaiKhoan}
                      onChange={(e) => setFormData({ ...formData, soTaiKhoan: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Ngân Hàng:</label>
                    <input
                      type="text"
                      placeholder="Ngân Hàng Ngoại Thương VN (Vietcombank)"
                      value={formData.nganHang}
                      onChange={(e) => setFormData({ ...formData, nganHang: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-medium"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số Dư (VNĐ):</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soDuHienTai}
                  onChange={(e) => setFormData({ ...formData, soDuHienTai: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-xs font-bold bg-[#0B2341] hover:bg-[#132F4C] text-white shadow-sm"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Tạo Quỹ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
