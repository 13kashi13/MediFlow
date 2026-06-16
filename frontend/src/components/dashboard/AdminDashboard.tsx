import React from 'react';
import { Users, UserCog, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const mockAppointmentsData = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 78 },
  { name: 'Mar', value: 90 },
  { name: 'Apr', value: 81 },
  { name: 'May', value: 96 },
  { name: 'Jun', value: 105 },
];

const mockPatientGrowthData = [
  { name: 'Jan', value: 340 },
  { name: 'Feb', value: 398 },
  { name: 'Mar', value: 456 },
  { name: 'Apr', value: 502 },
  { name: 'May', value: 578 },
  { name: 'Jun', value: 634 },
];

const recentActivities = [
  { id: 1, patient: 'John Smith', action: 'Appointment scheduled', time: '10 minutes ago', doctor: 'Dr. Sarah Johnson' },
  { id: 2, patient: 'Emma Wilson', action: 'Prescription issued', time: '25 minutes ago', doctor: 'Dr. Michael Chen' },
  { id: 3, patient: 'Robert Brown', action: 'Check-up completed', time: '1 hour ago', doctor: 'Dr. Sarah Johnson' },
  { id: 4, patient: 'Lisa Anderson', action: 'Lab results uploaded', time: '2 hours ago', doctor: 'Dr. Emily Davis' },
];

const upcomingAppointments = [
  { id: 1, patient: 'Sarah Miller', time: '10:00 AM', doctor: 'Dr. Sarah Johnson', type: 'Consultation' },
  { id: 2, patient: 'James Davis', time: '11:30 AM', doctor: 'Dr. Michael Chen', type: 'Follow-up' },
  { id: 3, patient: 'Maria Garcia', time: '02:00 PM', doctor: 'Dr. Emily Davis', type: 'Emergency' },
  { id: 4, patient: 'David Wilson', time: '03:30 PM', doctor: 'Dr. Sarah Johnson', type: 'Consultation' },
];

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  delay: number;
}> = ({ icon, title, value, trend, delay }) => (
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
          {trend && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-teal/10 rounded-lg">{icon}</div>
      </div>
    </Card>
  </motion.div>
);

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Clinic oversight and operations management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-primary-teal" />}
          title="Total Patients"
          value="634"
          trend="+12% from last month"
          delay={0}
        />
        <StatCard
          icon={<UserCog className="w-6 h-6 text-primary-teal" />}
          title="Total Doctors"
          value="24"
          trend="+2 new doctors"
          delay={0.1}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-primary-teal" />}
          title="Appointments Today"
          value="18"
          delay={0.2}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-primary-teal" />}
          title="Monthly Revenue"
          value="$45k"
          trend="+8% from last month"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/doctors" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <UserCog className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Manage Doctors</span>
        </Link>
        <Link to="/patients" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Users className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Manage Patients</span>
        </Link>
        <Link to="/appointments" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Calendar className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Appointments</span>
        </Link>
        <Link to="/analytics" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <TrendingUp className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">View Reports</span>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Appointments Per Month
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockAppointmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#2FA084" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Patient Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Patient Growth
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockPatientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6FCF97"
                  strokeWidth={3}
                  dot={{ fill: '#6FCF97', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Upcoming Appointments
              </h3>
              <Link to="/appointments" className="text-sm text-primary-teal hover:text-primary-dark-teal">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-primary-secondary rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {appointment.patient}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {appointment.doctor} • {appointment.type}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-primary-teal">
                    {appointment.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Recent Activities
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-teal mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{activity.patient}</span> -{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {activity.doctor} • {activity.time}
                    </p>
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
