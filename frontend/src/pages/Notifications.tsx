import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { axiosInstance } from '../lib/axios';
import { useToast } from '../contexts/ToastContext';
import type { Notification } from '../types';

const getIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="w-5 h-5 text-primary-teal" />;
    case 'prescription':
      return <FileText className="w-5 h-5 text-primary-green" />;
    case 'system':
      return <AlertCircle className="w-5 h-5 text-warning" />;
    case 'reminder':
    default:
      return <Bell className="w-5 h-5 text-text-secondary" />;
  }
};

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notifications/');
      // Normalize snake_case fields from backend to camelCase used in the Notification type
      const normalized = res.data.map((n: any) => ({
        ...n,
        isRead: n.isRead ?? n.is_read ?? false,
        userId: n.userId ?? n.user_id,
        createdAt: n.createdAt ?? n.created_at,
      }));
      setNotifications(normalized);
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // optimistic update already done, ignore errors silently
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // fallback: mark individually
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.allSettled(unread.map((n) => axiosInstance.patch(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
            All
          </Button>
          <Button variant={filter === 'unread' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('unread')}>
            Unread ({unreadCount})
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="py-12 text-center text-sm text-text-secondary">Loading notifications…</div>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification: Notification, index: number) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all ${!notification.isRead ? 'bg-blue-50 border-primary-teal' : ''}`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">{notification.title}</h3>
                      {!notification.isRead && (
                        <Badge variant="info" className="ml-2">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{notification.message}</p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(notification.createdAt, 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
