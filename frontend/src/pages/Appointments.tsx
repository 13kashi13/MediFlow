import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatTime } from '../utils/format';
import { motion } from 'framer-motion';
import { axiosInstance } from '../lib/axios';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient is required'),
  doctor_id: z.string().min(1, 'Doctor is required'),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Time is required'),
  appointment_type: z.enum(['consultation', 'follow-up', 'emergency']),
  reason: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: string;
  appointment_type: string;
  reason?: string;
  created_at?: string;
  patients?: { users?: { full_name?: string } };
  doctors?: { users?: { full_name?: string } };
};

type PatientOption = { id: string; users?: { full_name?: string } };
type DoctorOption = { id: string; specialization?: string; users?: { full_name?: string } };

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  scheduled: 'info',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'danger',
  'no-show': 'warning',
};

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const watchedDate = watch('appointment_date');
  const watchedTime = watch('appointment_time');
  const watchedDoctor = watch('doctor_id');

  const hasConflict = React.useMemo(() => {
    if (!watchedDate || !watchedTime || !watchedDoctor) return false;
    return appointments.some(
      (apt) =>
        apt.appointment_date === watchedDate &&
        apt.appointment_time === watchedTime &&
        apt.doctor_id === watchedDoctor &&
        apt.status !== 'cancelled'
    );
  }, [watchedDate, watchedTime, watchedDoctor, appointments]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [apptRes, patRes, docRes] = await Promise.all([
        axiosInstance.get('/appointments/'),
        axiosInstance.get('/patients/'),
        axiosInstance.get('/doctors/'),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      // Doctors: filter out any entries with no user data and sort by name
      const validDoctors = (docRes.data as DoctorOption[]).filter(
        (d) => d.users?.full_name
      );
      setDoctors(validDoctors);
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openBookModal = () => {
    // For patients, find their own patient profile
    let patientId = '';
    if (user?.role === 'patient') {
      const myProfile = patients.find(
        (p) => (p as any).user_id === user.id || (p as any).users?.id === user.id
      );
      patientId = myProfile?.id || '';
    }
    reset({
      patient_id: patientId,
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      appointment_type: 'consultation',
      reason: '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddAppointment = async (data: AppointmentFormData) => {
    if (hasConflict) {
      showToast('error', 'Time slot is already booked. Please choose another.');
      return;
    }
    // For patients, always use their own profile id (from the fetched list)
    const myPatientProfile = user?.role === 'patient'
      ? patients.find((p) => (p as any).user_id === user.id || (p as any).users?.id === user.id)
      : null;

    const payload = {
      ...data,
      patient_id: user?.role === 'patient' && myPatientProfile
        ? myPatientProfile.id
        : data.patient_id,
      duration: 30,
    };
    try {
      await axiosInstance.post('/appointments/', payload);
      showToast('success', 'Appointment scheduled successfully');
      setIsAddModalOpen(false);
      reset({});
      fetchAll();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to book appointment');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axiosInstance.patch(`/appointments/${id}`, { status });
      showToast('success', `Appointment ${status}`);
      fetchAll();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update appointment');
    }
  };

  const todayAppointments = appointments.filter((apt) => apt.appointment_date === today);
  const upcomingAppointments = appointments.filter((apt) => apt.appointment_date > today);

  const patientName = (apt: Appointment) =>
    apt.patients?.users?.full_name || apt.patient_id;
  const doctorName = (apt: Appointment) =>
    apt.doctors?.users?.full_name || apt.doctor_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and schedule appointments</p>
        </div>
        {(user?.role === 'patient' || user?.role === 'receptionist') && (
          <Button onClick={openBookModal}>
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <div className="py-12 text-center text-sm text-text-secondary">Loading appointments…</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  No appointments scheduled for today
                </p>
              ) : (
                todayAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-primary-secondary rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{patientName(appointment)}</p>
                        <p className="text-xs text-text-secondary">{doctorName(appointment)}</p>
                      </div>
                      <Badge variant={statusColors[appointment.status] ?? 'default'}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(appointment.appointment_time)}
                      </span>
                      <span className="capitalize">{appointment.appointment_type}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {appointment.status === 'scheduled' && user?.role !== 'admin' && (
                        <Button size="sm" variant="primary" onClick={() => updateStatus(appointment.id, 'confirmed')}>
                          Confirm
                        </Button>
                      )}
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                        <>
                          {user?.role !== 'admin' && (
                            <Button size="sm" variant="secondary" onClick={() => updateStatus(appointment.id, 'completed')}>
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => updateStatus(appointment.id, 'cancelled')}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">No upcoming appointments</p>
              ) : (
                upcomingAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border border-border rounded-lg hover:border-primary-teal transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{patientName(appointment)}</p>
                        <p className="text-xs text-text-secondary">{doctorName(appointment)}</p>
                      </div>
                      <Badge variant={statusColors[appointment.status] ?? 'default'}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {formatDate(appointment.appointment_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(appointment.appointment_time)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); reset({}); }}
        title="Book Appointment"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleAddAppointment)} className="space-y-4">

          {/* Patient field — hidden for patients (auto-filled from their profile) */}
          {user?.role !== 'patient' && (
            <Select
              label="Patient"
              options={patients.map((p) => ({
                value: p.id,
                label: p.users?.full_name || p.id,
              }))}
              error={errors.patient_id?.message}
              {...register('patient_id')}
            />
          )}

          {/* Doctor dropdown */}
          {doctors.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              No doctors are available yet. Please ask an admin to add doctor profiles.
            </div>
          ) : (
            <Select
              label="Doctor"
              options={doctors.map((d) => ({
                value: d.id,
                label: `${d.users?.full_name}${d.specialization ? ` – ${d.specialization}` : ''}`,
              }))}
              error={errors.doctor_id?.message}
              {...register('doctor_id')}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              error={errors.appointment_date?.message}
              {...register('appointment_date')}
            />
            <Input
              label="Time"
              type="time"
              error={errors.appointment_time?.message}
              {...register('appointment_time')}
            />
          </div>

          {hasConflict && (
            <div className="p-4 bg-red-50 border border-danger rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
              <p className="text-sm font-medium text-danger">
                This time slot is already booked for the selected doctor.
              </p>
            </div>
          )}

          <Select
            label="Appointment Type"
            options={[
              { value: 'consultation', label: 'Consultation' },
              { value: 'follow-up', label: 'Follow-up' },
              { value: 'emergency', label: 'Emergency' },
            ]}
            error={errors.appointment_type?.message}
            {...register('appointment_type')}
          />

          <Textarea
            label="Reason (Optional)"
            placeholder="Enter reason for appointment"
            error={errors.reason?.message}
            {...register('reason')}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setIsAddModalOpen(false); reset({}); }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={hasConflict}>
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
