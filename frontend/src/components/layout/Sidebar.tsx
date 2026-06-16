import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  FileText,
  Bell,
  BarChart3,
  ScrollText,
  Settings,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
  {
    name: 'Patients',
    icon: <Users className="w-5 h-5" />,
    path: '/patients',
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    name: 'Doctors',
    icon: <UserCog className="w-5 h-5" />,
    path: '/doctors',
    roles: ['admin', 'receptionist'],
  },
  {
    name: 'Appointments',
    icon: <Calendar className="w-5 h-5" />,
    path: '/appointments',
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
  {
    name: 'Prescriptions',
    icon: <FileText className="w-5 h-5" />,
    path: '/prescriptions',
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    name: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    path: '/notifications',
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
  {
    name: 'Analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/analytics',
    roles: ['admin'],
  },
  {
    name: 'Audit Logs',
    icon: <ScrollText className="w-5 h-5" />,
    path: '/audit-logs',
    roles: ['admin'],
  },
  {
    name: 'Users',
    icon: <UsersRound className="w-5 h-5" />,
    path: '/users',
    roles: ['admin'],
  },
  {
    name: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/settings',
    roles: ['admin', 'doctor', 'receptionist', 'patient'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-border transition-transform duration-300 z-30',
          'w-[280px] flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-[72px] flex items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary-teal tracking-tight">MEDIFLOW</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-teal/10 text-primary-teal'
                        : 'text-text-secondary hover:bg-primary-secondary hover:text-text-primary'
                    )
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-text-secondary text-center">
            © 2026 MEDIFLOW
          </div>
        </div>
      </aside>
    </>
  );
};
