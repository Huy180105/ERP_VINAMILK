import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved);
    return null; // Not logged in
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
  }, [user, navigate, location]);

  const login = (userData) => {
    setUser(userData);
    navigate('/');
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    if (user.vaiTro === 'Admin' || user.vaiTro === 'Quản trị viên') return true;

    // Kho permissions
    if (module === 'warehouse') {
      if (['Quản lý kho', 'Quản lý', 'Trưởng Phòng Kho Vận', 'Admin', 'Quản trị viên'].includes(user.vaiTro)) return true;
      if (['Nhân viên kho', 'Nhân viên', 'Thủ kho', 'Thủ Kho Trưởng / Kiểm Soát FEFO'].includes(user.vaiTro)) {
        if (action === 'approve' || action === 'reject') return false; // Chỉ Quản lý mới duyệt
        return true;
      }
      return true;
    }
    
    // Production permissions
    if (module === 'production') {
      if (user.vaiTro === 'Quản lý sản xuất') return true;
      if (user.vaiTro === 'Nhân viên sản xuất') {
        if (action === 'approve') return false;
        return true;
      }
    }

    // Finance permissions
    if (module === 'finance') {
      if (user.vaiTro === 'Kế toán trưởng') return true;
      if (user.vaiTro === 'Kế toán thanh toán' || user.vaiTro === 'Thủ quỹ') {
        if (action === 'approve') return false;
        return true;
      }
    }

    // Sales permissions
    if (module === 'sales') {
      if (user.vaiTro === 'Quản lý bán hàng' || user.vaiTro === 'Nhân viên bán hàng') return true;
    }

    // HR permissions
    if (module === 'hr') {
      if (user.vaiTro === 'Quản lý nhân sự' || user.vaiTro === 'Chuyên viên nhân sự') return true;
    }

    return false; // Default deny
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
