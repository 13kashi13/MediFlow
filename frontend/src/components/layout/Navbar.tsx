import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axiosInstance.get('/notifications/');
        const count = (res.data as any[]).filter((n) => !(n.is_read ?? n.isRead)).length;
        setUnreadCount(count);
      } catch {
        // non-critical
      }
    };
    fetchUnread();
    // Poll every 30s to keep badge fresh
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-[72px] bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-primary-secondary rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 hover:bg-primary-secondary rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-text-primary" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-danger rounded-full flex items-center justify-center text-[9px] font-bold text-white px-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 hover:bg-primary-secondary rounded-lg transition-colors"
          >
            <Avatar name={user?.name || ''} src={user?.avatar} size="sm" />
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-20"
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                    <p className="text-xs text-text-secondary">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-primary hover:bg-primary-secondary rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
