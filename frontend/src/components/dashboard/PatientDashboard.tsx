import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, FileText, Bell, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatTime } from '../../utils/format';
import { axiosInstance } from '../../lib/axios';
import { useToast } from '../../contexts/ToastContext';

type Appointment = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason?: string;
  doctors?: { users?: { full_name?: string } };
};

type Prescription = {
  id: string;
  diagnosis: string;
  prescription_date: string;
  doctors?: { users?: { full_name?: string } };
};

const statusBadge: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  scheduled: 'info',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'danger',
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; delay: number }> = ({ icon, title, value, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
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
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const [apptRes, presRes, notifRes] = await Promise.all([
        axiosInstance.get('/appointments/'),
        axiosInstance.get('/prescriptions/'),
        axiosInstance.get('/notifications/'),
      ]);
      setAppointments(apptRes.data as Appointment[]);
      setPrescriptions(presRes.data as Prescription[]);
      const unread = (notifRes.data as any[]).filter((n) => !(n.is_read ?? n.isRead)).length;
      setUnreadCount(unread);
    } catch {
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

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await axiosInstance.patch(`/appointments/${id}`, { status });
      showToast('success', status === 'confirmed' ? 'Attendance confirmed!' : 'Appointment cancelled');
      fetchData();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update');
    }
  };

  // Upcoming = today or future, not cancelled
  const upcoming = appointments
    .filter((a) => a.appointment_date >= today && a.status !== 'cancelled')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time));

  // Past completed
  const pastAppointments = appointments
    .filter((a) => a.status === 'completed' || (a.appointment_date < today && a.status !== 'cancelled'))
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

  const nextAppointment = upcoming[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Health Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Welcome back, {user?.name || 'Patient'}</p>
        </div>
        <div className="text-xs text-text-secondary bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
          Live — refreshes every 20s
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Calendar className="w-6 h-6 text-primary-teal" />} title="Upcoming Appointments" value={loading ? '—' : upcoming.length} delay={0} />
        <StatCard icon={<FileText className="w-6 h-6 text-primary-teal" />} title="My Prescriptions" value={loading ? '—' : prescriptions.length} delay={0.1} />
        <StatCard icon={<Bell className="w-6 h-6 text-primary-teal" />} title="Unread Notifications" value={loading ? '—' : unreadCount} delay={0.2} />
      </div>

      {/* Book Appointment CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-teal to-[#40c3a2] rounded-2xl p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Book an Appointment</h2>
            <p className="text-sm text-white/90 mt-1">Need to see a doctor? Book your next visit now.</p>
          </div>
          <Link to="/appointments" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-teal font-semibold rounded-xl hover:bg-teal-50 transition-colors shadow-md shrink-0">
            <Calendar className="w-4 h-4" /> Book Now
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Next Appointment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Next Appointment</h3>
              <Link to="/appointments" className="text-sm text-primary-teal hover:text-primary-dark-teal flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-text-secondary">Loading…</div>
            ) : nextAppointment ? (
              <div className="p-4 bg-primary-secondary rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-text-primary">{nextAppointment.doctors?.users?.full_name || 'Doctor'}</p>
                    <p className="text-sm text-text-secondary capitalize">{nextAppointment.appointment_type}</p>
                  </div>
                  <Badge variant={statusBadge[nextAppointment.status] ?? 'default'}>
                    {nextAppointment.status === 'confirmed' ? 'Accepted ✓' : nextAppointment.status}
                  </Badge>
                </div>
                {nextAppointment.reason && <p className="text-sm text-text-secondary italic my-2">"{nextAppointment.reason}"</p>}
                <div className="flex items-center gap-2 text-sm text-primary-teal font-semibold mt-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(nextAppointment.appointment_date)} at {formatTime(nextAppointment.appointment_time)}
                </div>

                {/* Status info */}
                {nextAppointment.status === 'confirmed' && (
                  <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Your appointment has been accepted by the receptionist. Please arrive 15 mins early.
                  </div>
                )}

                {/* Actions — only for scheduled (not yet accepted) */}
                {nextAppointment.status === 'scheduled' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => updateStatus(nextAppointment.id, 'confirmed')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-teal text-white text-xs font-semibold rounded-lg hover:bg-primary-teal/90">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Attendance
                    </button>
                    <button onClick={() => updateStatus(nextAppointment.id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-danger text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-text-secondary bg-primary-secondary rounded-xl border border-dashed border-border">
                <Calendar className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">No upcoming appointments</p>
                <Link to="/appointments" className="text-xs text-primary-teal font-bold hover:underline">Book one now →</Link>
              </div>
            )}

            {/* All upcoming (mini list) */}
            {upcoming.length > 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Also upcoming</p>
                {upcoming.slice(1, 3).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-2.5 bg-primary-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{apt.doctors?.users?.full_name || 'Doctor'}</p>
                      <p className="text-xs text-text-secondary">{formatDate(apt.appointment_date)} · {formatTime(apt.appointment_time)}</p>
                    </div>
                    <Badge variant={statusBadge[apt.status] ?? 'default'}>{apt.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent Prescriptions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">My Prescriptions</h3>
              <Link to="/prescriptions" className="text-sm text-primary-teal hover:text-primary-dark-teal flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm text-text-secondary">Loading…</div>
            ) : prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.slice(0, 4).map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between p-3.5 bg-primary-secondary rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-border shadow-sm">
                        <FileText className="w-5 h-5 text-primary-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{rx.diagnosis}</p>
                        <p className="text-xs text-text-secondary">By {rx.doctors?.users?.full_name || 'Doctor'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-text-secondary">{formatDate(rx.prescription_date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-text-secondary bg-primary-secondary rounded-xl border border-dashed border-border">
                <FileText className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
                <p className="text-sm font-medium">No prescriptions yet</p>
                <p className="text-xs">Your prescriptions will appear after a doctor visit</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Past visits */}
      {pastAppointments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Past Visits</h3>
            <div className="space-y-2">
              {pastAppointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-primary-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{apt.doctors?.users?.full_name || 'Doctor'}</p>
                    <p className="text-xs text-text-secondary">{formatDate(apt.appointment_date)} · {apt.appointment_type}</p>
                  </div>
                  <Badge variant={statusBadge[apt.status] ?? 'default'}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
