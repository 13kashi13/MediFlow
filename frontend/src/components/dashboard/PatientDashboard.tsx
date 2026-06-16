import React from 'react';
import { Calendar, FileText, Bell, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const myUpcomingAppointments = [
  { id: 1, doctor: 'Dr. Sarah Johnson', time: '10:00 AM, Tomorrow', type: 'Consultation', status: 'Confirmed' },
];

const recentPrescriptions = [
  { id: 1, date: 'Oct 12, 2023', doctor: 'Dr. Michael Chen', diagnosis: 'Common Cold' },
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

export const PatientDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Health Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Welcome back. Here is an overview of your health records.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Calendar className="w-6 h-6 text-primary-teal" />}
          title="Upcoming Appointments"
          value="1"
          delay={0}
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-primary-teal" />}
          title="Active Prescriptions"
          value="2"
          delay={0.1}
        />
        <StatCard
          icon={<Bell className="w-6 h-6 text-primary-teal" />}
          title="Unread Messages"
          value="0"
          delay={0.2}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/appointments" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Calendar className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Book Appointment</span>
        </Link>
        <Link to="/prescriptions" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <FileText className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">My Prescriptions</span>
        </Link>
        <Link to="/settings" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Activity className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Update Profile</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Next Appointment
              </h3>
              <Link to="/appointments" className="text-sm text-primary-teal hover:text-primary-dark-teal">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {myUpcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-primary-teal/5 border border-primary-teal/20 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-text-primary">{apt.doctor}</p>
                      <p className="text-sm text-text-secondary">{apt.type}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-dark-teal font-medium">
                    <Calendar className="w-4 h-4" />
                    {apt.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Prescriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Recent Prescriptions
              </h3>
              <Link to="/prescriptions" className="text-sm text-primary-teal hover:text-primary-dark-teal">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentPrescriptions.map((rx) => (
                <div key={rx.id} className="flex items-center justify-between p-3 bg-primary-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-5 h-5 text-primary-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{rx.diagnosis}</p>
                      <p className="text-xs text-text-secondary">Prescribed by {rx.doctor}</p>
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {rx.date}
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
