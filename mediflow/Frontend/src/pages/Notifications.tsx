import React, { useState } from 'react';
import { Bell, CheckCheck, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';
import { motion } from 'framer-motion';

const mockNotifications = [
  {
    id: '1',
    type: 'appointment' as const,
    title: 'Upcoming Appointment',
    message: 'You have an appointment with John Smith at 10:00 AM tomorrow',
    isRead: false,
    createdAt: '2026-06-15T14:30:00',
    link: '/appointments',
  },
  {
    id: '2',
    type: 'prescription' as const,
    title: 'New Prescription Created',
    message: 'Prescription for Emma Wilson has been created successfully',
    isRead: false,
    createdAt: '2026-06-15T12:15:00',
    link: '/prescriptions',
  },
  {
    id: '3',
    type: 'system' as const,
    title: 'System Update',
    message: 'MEDIFLOW will undergo scheduled maintenance tonight at 11 PM',
    isRead: true,
    createdAt: '2026-06-14T09:00:00',
  },
  {
    id: '4',
    type: 'reminder' as const,
    title: 'Appointment Reminder',
    message: 'Michael Brown has an appointment in 1 hour',
    isRead: true,
    createdAt: '2026-06-14T08:30:00',
    link: '/appointments',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="w-5 h-5 text-primary-teal" />;
    case 'prescription':
      return <FileText className="w-5 h-5 text-primary-green" />;
    case 'system':
      return <AlertCircle className="w-5 h-5 text-warning" />;
    case 'reminder':
      return <Bell className="w-5 h-5 text-primary-teal" />;
    default:
      return <Bell className="w-5 h-5 text-text-secondary" />;
  }
};

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((notification) =>
    filter === 'unread' ? !notification.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
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
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>
      </Card>

      {filteredNotifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={
              filter === 'unread'
                ? 'You have no unread notifications'
                : 'You have no notifications yet'
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  !notification.isRead ? 'bg-blue-50 border-primary-teal' : ''
                }`}
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
                      <h3 className="text-sm font-semibold text-text-primary">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <Badge variant="info" className="ml-2">
                          New
                        </Badge>
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
