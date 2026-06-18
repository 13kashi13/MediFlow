import React, { useEffect, useState, useCallback } from 'react';
import { Users, UserCog, Calendar, TrendingUp, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatTime } from '../../utils/format';

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  patients?: { users?: { full_name?: string } };
  doctors?: { users?: { full_name?: string } };
};

const statusBadge: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  scheduled: 'info',
  confirmed: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  sub?: string;
  delay: number;
}> = ({ icon, title, value, sub, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
          {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
        </div>
        <div className="p-3 bg-primary-teal/10 rounded-lg">{icon}</div>
      </div>
    </Card>
  </motion.div>
);

const buildMonthlyChart = (appointments: Appointment[]) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const counts: Record<string, number> = {};
  appointments.forEach((a) => {
    const key = months[new Date(a.appointment_date).getMonth()];
    counts[key] = (counts[key] || 0) + 1;
  });
  return months.filter((m) => counts[m]).map((m) => ({ name: m, value: counts[m] }));
};

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const [patRes, docRes, apptRes] = await Promise.all([
        axiosInstance.get('/patients/'),
        axiosInstance.get('/doctors/'),
        axiosInstance.get('/appointments/'),
      ]);
      setPatients(patRes.data);
      setDoctors(docRes.data);
      setAppointments(apptRes.data);
    } catch (err: any) {
      // silent on poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const todayAll = appointments.filter((a) => a.appointment_date === today);
  const todayScheduled  = todayAll.filter((a) => a.status === 'scheduled').length;
  const todayConfirmed  = todayAll.filter((a) => a.status === 'confirmed').length;
  const todayCompleted  = todayAll.filter((a) => a.status === 'completed').length;
  const todayCancelled  = todayAll.filter((a) => a.status === 'cancelled').length;

  const upcoming = appointments
    .filter((a) => a.appointment_date >= today && a.status !== 'cancelled')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time))
    .slice(0, 6);

  const chartData = buildMonthlyChart(appointments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Clinic overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="text-xs text-text-secondary bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
          Live — refreshes every 20s
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-primary-teal" />} title="Total Patients" value={loading ? '—' : patients.length} delay={0} />
        <StatCard icon={<UserCog className="w-5 h-5 text-primary-teal" />} title="Total Doctors" value={loading ? '—' : doctors.length} delay={0.1} />
        <StatCard icon={<Calendar className="w-5 h-5 text-primary-teal" />} title="Appointments Today" value={loading ? '—' : todayAll.filter(a => a.status !== 'cancelled').length} delay={0.2} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-primary-teal" />} title="Total All Time" value={loading ? '—' : appointments.length} delay={0.3} />
      </div>

      {/* Today's Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-4">Today's Appointment Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{todayScheduled}</p>
              <p className="text-xs text-blue-600 font-medium">Pending</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <Users className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-700">{todayConfirmed}</p>
              <p className="text-xs text-amber-600 font-medium">In Waiting Room</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{todayCompleted}</p>
              <p className="text-xs text-green-600 font-medium">Completed</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">{todayCancelled}</p>
              <p className="text-xs text-red-500 font-medium">Cancelled</p>
            </div>
          </div>
        </Card>
      </motion.div>

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
          <span className="text-sm font-medium text-text-primary">All Appointments</span>
        </Link>
        <Link to="/analytics" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <TrendingUp className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Analytics</span>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-4">Appointments by Month</h3>
            {chartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-text-secondary">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#2FA084" radius={[6, 6, 0, 0]} name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-4">Cumulative Appointments</h3>
            {chartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-text-secondary">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData.map((d, i) => ({ ...d, total: chartData.slice(0, i + 1).reduce((s, x) => s + x.value, 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="total" stroke="#6FCF97" strokeWidth={2.5} dot={{ fill: '#6FCF97', r: 3 }} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Live Upcoming Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text-primary">Upcoming Appointments</h3>
            <Link to="/appointments" className="text-sm text-primary-teal hover:text-primary-dark-teal">View all →</Link>
          </div>
          {loading ? (
            <div className="py-8 text-center text-sm text-text-secondary">Loading…</div>
          ) : upcoming.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-secondary">No upcoming appointments</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 text-xs font-semibold text-text-secondary uppercase">Patient</th>
                    <th className="pb-2 pr-4 text-xs font-semibold text-text-secondary uppercase">Doctor</th>
                    <th className="pb-2 pr-4 text-xs font-semibold text-text-secondary uppercase">Date & Time</th>
                    <th className="pb-2 pr-4 text-xs font-semibold text-text-secondary uppercase">Type</th>
                    <th className="pb-2 text-xs font-semibold text-text-secondary uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((apt) => (
                    <tr key={apt.id} className="border-b border-border/50 last:border-0 hover:bg-primary-secondary/30">
                      <td className="py-2.5 pr-4 text-sm font-medium text-text-primary">{apt.patients?.users?.full_name || '—'}</td>
                      <td className="py-2.5 pr-4 text-sm text-text-secondary">{apt.doctors?.users?.full_name || '—'}</td>
                      <td className="py-2.5 pr-4 text-sm text-text-secondary">
                        {formatDate(apt.appointment_date)} · {formatTime(apt.appointment_time)}
                      </td>
                      <td className="py-2.5 pr-4 text-sm text-text-secondary capitalize">{apt.appointment_type}</td>
                      <td className="py-2.5">
                        <Badge variant={statusBadge[apt.status] ?? 'default'}>{apt.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
