import React from 'react';
import { Calendar, Users, Bell, UserPlus } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const waitingRoom = [
  { id: 1, patient: 'Sarah Miller', doctor: 'Dr. Johnson', status: 'Waiting (15m)' },
  { id: 2, patient: 'James Davis', doctor: 'Dr. Chen', status: 'In Consultation' },
];

const upcomingArrivals = [
  { id: 3, patient: 'Maria Garcia', doctor: 'Dr. Davis', time: '02:00 PM' },
  { id: 4, patient: 'David Wilson', doctor: 'Dr. Johnson', time: '03:30 PM' },
];

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  delay: number;
}> = ({ icon, title, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
        </div>
        <div className="p-3 bg-primary-teal/10 rounded-lg">{icon}</div>
      </div>
    </Card>
  </motion.div>
);

export const ReceptionistDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Front Desk Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage appointments and patient flow
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-primary-teal" />}
          title="Patients in Waiting Room"
          value="4"
          delay={0}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-primary-teal" />}
          title="Total Appointments Today"
          value="18"
          delay={0.1}
        />
        <StatCard
          icon={<UserPlus className="w-6 h-6 text-primary-teal" />}
          title="New Registrations"
          value="5"
          delay={0.2}
        />
        <StatCard
          icon={<Bell className="w-6 h-6 text-primary-teal" />}
          title="Unread Messages"
          value="2"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/appointments" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Calendar className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Book Appointment</span>
        </Link>
        <Link to="/patients" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <UserPlus className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Register Patient</span>
        </Link>
        <Link to="/notifications" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Bell className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Send Notification</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Room */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Waiting Room
              </h3>
            </div>
            <div className="space-y-3">
              {waitingRoom.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-primary-secondary rounded-lg border-l-4 border-l-amber-500">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{apt.patient}</p>
                    <p className="text-xs text-text-secondary">Seeing {apt.doctor}</p>
                  </div>
                  <div className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-md">
                    {apt.status}
                  </div>
                </div>
              ))}
              {waitingRoom.length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">Waiting room is empty.</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Arrivals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Upcoming Arrivals
              </h3>
              <Link to="/appointments" className="text-sm text-primary-teal hover:text-primary-dark-teal">
                View schedule
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingArrivals.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-primary-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{apt.patient}</p>
                    <p className="text-xs text-text-secondary">Seeing {apt.doctor}</p>
                  </div>
                  <div className="text-sm font-medium text-primary-teal">
                    {apt.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
