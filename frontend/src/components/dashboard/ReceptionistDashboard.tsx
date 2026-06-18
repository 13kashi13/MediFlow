import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Bell, CheckCircle2, UserCheck, XCircle, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import { useToast } from '../../contexts/ToastContext';
import { formatTime, formatDate } from '../../utils/format';
import { Badge } from '../ui/Badge';

type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason?: string;
  patients?: { users?: { full_name?: string } };
  doctors?: { users?: { full_name?: string } };
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: string;
  delay: number;
}> = ({ icon, title, value, color = 'text-primary-teal', delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
        </div>
        <div className={`p-3 bg-primary-teal/10 rounded-lg`}>{icon}</div>
      </div>
    </Card>
  </motion.div>
);

export const ReceptionistDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/appointments/');
      setAppointments(res.data);
    } catch (err: any) {
      // silent on poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    // Poll every 20 seconds so dashboard stays live
    const interval = setInterval(fetchAppointments, 20000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await axiosInstance.patch(`/appointments/${id}`, { status });
      const label = status === 'confirmed' ? 'accepted' : 'declined';
      showToast('success', `Appointment ${label}`);
      fetchAppointments();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update appointment');
    }
  };

  const markCompleted = async (id: string) => {
    try {
      await axiosInstance.patch(`/appointments/${id}`, { status: 'completed' });
      showToast('success', 'Appointment marked as completed');
      fetchAppointments();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update');
    }
  };

  const todayAppointments = appointments.filter((apt) => apt.appointment_date === today);

  // New requests: scheduled today — needs accept/decline
  const pendingRequests = todayAppointments.filter((apt) => apt.status === 'scheduled');
  // Waiting room: confirmed today — patient is physically present
  const waitingRoom = todayAppointments.filter((apt) => apt.status === 'confirmed');
  // Upcoming future appointments still scheduled
  const futureRequests = appointments.filter(
    (apt) => apt.appointment_date > today && apt.status === 'scheduled'
  );
  const totalToday = todayAppointments.filter((apt) => apt.status !== 'cancelled').length;

  const patientName = (apt: Appointment) => apt.patients?.users?.full_name || 'Patient';
  const doctorName = (apt: Appointment) => apt.doctors?.users?.full_name || 'Doctor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Front Desk Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="text-xs text-text-secondary bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
          Live — refreshes every 20s
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-primary-teal" />} title="Total Today" value={loading ? '—' : totalToday} delay={0} />
        <StatCard icon={<Bell className="w-5 h-5 text-amber-500" />} title="Pending Requests" value={loading ? '—' : pendingRequests.length} delay={0.1} />
        <StatCard icon={<Clock className="w-5 h-5 text-primary-teal" />} title="Waiting Room" value={loading ? '—' : waitingRoom.length} delay={0.2} />
        <StatCard icon={<Calendar className="w-5 h-5 text-primary-teal" />} title="Future Bookings" value={loading ? '—' : futureRequests.length} delay={0.3} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/appointments" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Calendar className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Book Appointment</span>
        </Link>
        <Link to="/patients" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Users className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Register Patient</span>
        </Link>
        <Link to="/notifications" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Bell className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Notifications</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── PENDING REQUESTS (Accept / Decline) ─────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Appointment Requests</h3>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                {pendingRequests.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-text-secondary text-center py-8">Loading…</p>
              ) : pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-text-secondary bg-primary-secondary rounded-xl border border-dashed border-border">
                  <Bell className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">No pending requests</p>
                  <p className="text-xs">New appointment requests will appear here</p>
                </div>
              ) : (
                pendingRequests.map((apt) => (
                  <div key={apt.id} className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-text-primary">{patientName(apt)}</p>
                        <p className="text-xs text-text-secondary">
                          {doctorName(apt)} • {apt.appointment_type}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
                        </p>
                        {apt.reason && <p className="text-xs text-text-secondary italic mt-1">"{apt.reason}"</p>}
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="flex gap-2 mt-3 pt-2 border-t border-amber-200">
                      <button
                        onClick={() => updateStatus(apt.id, 'confirmed')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary-teal text-white text-xs font-bold rounded-lg hover:bg-primary-teal/90 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, 'cancelled')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-50 text-danger text-xs font-bold rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* ── WAITING ROOM (Mark Complete) ─────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Waiting Room</h3>
              <span className="text-xs text-text-secondary">{waitingRoom.length} patient{waitingRoom.length !== 1 ? 's' : ''} inside</span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-text-secondary text-center py-8">Loading…</p>
              ) : waitingRoom.length === 0 ? (
                <div className="p-8 text-center text-text-secondary bg-primary-secondary rounded-xl border border-dashed border-border">
                  <Users className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">Waiting room is empty</p>
                  <p className="text-xs">Accepted patients will appear here</p>
                </div>
              ) : (
                waitingRoom.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3.5 bg-primary-secondary rounded-lg border-l-4 border-l-amber-500">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{patientName(apt)}</p>
                      <p className="text-xs text-text-secondary">
                        {doctorName(apt)} • {formatTime(apt.appointment_time)}
                      </p>
                    </div>
                    <button
                      onClick={() => markCompleted(apt.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                      title="Mark visit done"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── FUTURE BOOKINGS ──────────────────────────────────────── */}
      {futureRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Upcoming Booking Requests</h3>
              <Link to="/appointments" className="text-sm text-primary-teal hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {futureRequests.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3.5 bg-primary-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{patientName(apt)}</p>
                    <p className="text-xs text-text-secondary">
                      {doctorName(apt)} • {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(apt.id, 'confirmed')}
                      className="px-3 py-1 bg-primary-teal text-white text-xs font-bold rounded-lg hover:bg-primary-teal/90"
                    >Accept</button>
                    <button
                      onClick={() => updateStatus(apt.id, 'cancelled')}
                      className="px-3 py-1 bg-red-50 text-danger text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100"
                    >Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
