import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, LogOut } from 'lucide-react';
import VinamilkLogo from './VinamilkLogo';
import { useAuth } from '../context/AuthContext';

export default function ERPHeader({ module = 'portal' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-2.5">
        
        {/* Left: Logo & Portal Return */}
        <div className="flex items-center space-x-6">
          <VinamilkLogo className="h-8" />
          
          <div className="h-6 w-px bg-slate-200"></div>

          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-blue-700 transition font-medium text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cổng Thông Tin Portal</span>
          </button>
        </div>

        {/* Right: User Menu */}
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{user.hoTen}</span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-blue-100">{user.vaiTro}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500">
              <UserCircle className="w-5 h-5" />
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
