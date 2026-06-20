import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, Sun, Sunset, Moon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
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

// ── Time slot generation ──────────────────────────────────────────────
function generateSlots(startH: number, endH: number): string[] {
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

const MORNING_SLOTS   = generateSlots(9,  12);  // 09:00–11:45
const AFTERNOON_SLOTS = generateSlots(13, 16);  // 13:00–15:45  (1pm–4pm, lunch break 12–1)
const EVENING_SLOTS   = generateSlots(16, 20);  // 16:00–19:45  (4pm–8pm)

function to12h(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// ── Schema ────────────────────────────────────────────────────────────
const appointmentSchema = z.object({
  patient_id:       z.string().min(1, 'Patient is required'),
  doctor_id:        z.string().min(1, 'Doctor is required'),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Please select a time slot'),
  appointment_type: z.enum(['consultation', 'follow-up', 'emergency']),
  reason:           z.string().optional(),
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
  patients?: { users?: { full_name?: string } };
  doctors?:  { users?: { full_name?: string } };
};
type PatientOption = { id: string; user_id?: string; users?: { full_name?: string; id?: string } };
type DoctorOption  = { id: string; specialization?: string; users?: { full_name?: string } };

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  scheduled: 'info', confirmed: 'success', completed: 'default',
  cancelled: 'danger', 'no-show': 'warning',
};

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients,     setPatients]     = useState<PatientOption[]>([]);
  const [doctors,      setDoctors]      = useState<DoctorOption[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [isModalOpen,  setIsModalOpen]  = useState(false);

  // Submission guard — prevents double-submit on rapid clicks
  const isSubmittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<AppointmentFormData>({
      resolver: zodResolver(appointmentSchema) as any,
      defaultValues: { appointment_type: 'consultation' },
    });

  const watchedDate   = watch('appointment_date');
  const watchedDoctor = watch('doctor_id');
  const watchedTime   = watch('appointment_time');

  const [docAppointments, setDocAppointments] = useState<{appointment_time: string; status: string}[]>([]);

  useEffect(() => {
    if (!watchedDoctor || !watchedDate) { setDocAppointments([]); return; }
    // Fetch booked slots for this doctor+date — visible to all roles
    axiosInstance.get(`/appointments/slots?doctor_id=${watchedDoctor}&date=${watchedDate}`)
      .then(r => {
        // r.data is string[] of "HH:MM"
        setDocAppointments(r.data.map((t: string) => ({ appointment_time: t, status: 'scheduled', doctor_id: watchedDoctor, appointment_date: watchedDate })));
      })
      .catch(() => {});
  }, [watchedDoctor, watchedDate]);

  // Booked slots for the chosen doctor+date
  const bookedSlots = React.useMemo(() => {
    if (!watchedDate || !watchedDoctor) return new Set<string>();
    return new Set<string>(
      docAppointments.map((a: any) => (a.appointment_time || '').slice(0, 5))
    );
  }, [docAppointments, watchedDate, watchedDoctor]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [apptRes, patRes, docRes] = await Promise.all([
        axiosInstance.get('/appointments/'),
        axiosInstance.get('/patients/'),
        axiosInstance.get('/doctors/'),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDoctors((docRes.data as DoctorOption[]).filter(d => d.users?.full_name));
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openModal = () => {
    const myProfile = user?.role === 'patient'
      ? patients.find(p => p.user_id === user.id || p.users?.id === user.id)
      : null;
    reset({
      patient_id: myProfile?.id || '',
      doctor_id: '', appointment_date: '',
      appointment_time: '', appointment_type: 'consultation', reason: '',
    });
    setIsModalOpen(true);
  };

  const handleBook = async (data: AppointmentFormData) => {
    // Hard guard against rapid clicks
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);

    // Client-side slot conflict check
    if (bookedSlots.has(data.appointment_time)) {
      showToast('error', 'This slot is already taken. Choose another time.');
      isSubmittingRef.current = false;
      setSubmitting(false);
      return;
    }

    const myProfile = user?.role === 'patient'
      ? patients.find(p => p.user_id === user.id || p.users?.id === user.id)
      : null;

    const payload = {
      ...data,
      patient_id: user?.role === 'patient' && myProfile ? myProfile.id : data.patient_id,
      duration: 15,
    };

    try {
      await axiosInstance.post('/appointments/', payload);
      showToast('success', 'Appointment booked successfully!');
      setIsModalOpen(false);
      reset({});
      fetchAll();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to book appointment';
      showToast('error', msg);
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axiosInstance.patch(`/appointments/${id}`, { status });
      showToast('success', `Appointment ${status}`);
      fetchAll();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update');
    }
  };

  const todayApts    = appointments.filter(a => a.appointment_date === today);
  const upcomingApts = appointments.filter(a => a.appointment_date > today);
  const pName = (a: Appointment) => a.patients?.users?.full_name || a.patient_id;
  const dName = (a: Appointment) => a.doctors?.users?.full_name  || a.doctor_id;

  // Time slot picker section
  const SlotGroup: React.FC<{
    label: string;
    icon: React.ReactNode;
    slots: string[];
    color: string;
  }> = ({ label, icon, slots, color }) => (
    <div>
      <div className={`flex items-center gap-2 mb-2 text-sm font-semibold ${color}`}>
        {icon} {label}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map(slot => {
          const taken    = bookedSlots.has(slot);
          const selected = watchedTime === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={taken}
              onClick={() => !taken && setValue('appointment_time', slot, { shouldValidate: true })}
              className={`
                py-1.5 px-1 text-[11px] font-semibold rounded-lg border transition-all
                ${taken
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                  : selected
                    ? 'bg-primary-teal text-white border-primary-teal shadow-sm'
                    : 'bg-white text-text-primary border-border hover:border-primary-teal hover:text-primary-teal'
                }
              `}
            >
              {to12h(slot)}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and schedule appointments</p>
        </div>
        {(user?.role === 'patient' || user?.role === 'receptionist') && (
          <Button onClick={openModal}>
            <Plus className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        )}
      </div>

      {loading ? (
        <Card><div className="py-12 text-center text-sm text-text-secondary">Loading…</div></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {todayApts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">No appointments today</p>
              ) : todayApts.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 bg-primary-secondary rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{pName(apt)}</p>
                      <p className="text-xs text-text-secondary">{dName(apt)}</p>
                    </div>
                    <Badge variant={statusColors[apt.status] ?? 'default'}>{apt.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(apt.appointment_time)}</span>
                    <span className="capitalize">{apt.appointment_type}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {apt.status === 'scheduled' && user?.role !== 'admin' && (
                      <Button size="sm" variant="primary" onClick={() => updateStatus(apt.id, 'confirmed')}>Confirm</Button>
                    )}
                    {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                      <>
                        {user?.role !== 'admin' && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(apt.id, 'completed')}>Complete</Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Upcoming */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {upcomingApts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">No upcoming appointments</p>
              ) : upcomingApts.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 border border-border rounded-lg hover:border-primary-teal transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{pName(apt)}</p>
                      <p className="text-xs text-text-secondary">{dName(apt)}</p>
                    </div>
                    <Badge variant={statusColors[apt.status] ?? 'default'}>{apt.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{formatDate(apt.appointment_date)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(apt.appointment_time)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Book Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { if (!submitting) { setIsModalOpen(false); reset({}); } }} title="Book Appointment" size="xl">
        <form onSubmit={handleSubmit(handleBook)} className="space-y-5">

          {/* Patient select (hidden for patients) */}
          {user?.role !== 'patient' && (
            <Select label="Patient"
              options={patients.map(p => ({ value: p.id, label: p.users?.full_name || p.id }))}
              error={errors.patient_id?.message}
              {...register('patient_id')}
            />
          )}

          {/* Doctor */}
          {doctors.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              No doctors available yet.
            </div>
          ) : (
            <Select label="Doctor"
              options={doctors.map(d => ({
                value: d.id,
                label: `${d.users?.full_name}${d.specialization ? ` — ${d.specialization}` : ''}`,
              }))}
              error={errors.doctor_id?.message}
              {...register('doctor_id')}
            />
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
            <input
              type="date"
              min={today}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-teal"
              {...register('appointment_date')}
            />
            {errors.appointment_date && <p className="text-xs text-danger mt-1">{errors.appointment_date.message}</p>}
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Select Time Slot
              {watchedTime && <span className="ml-2 text-primary-teal font-semibold">— {to12h(watchedTime)} selected</span>}
            </label>

            {!watchedDoctor || !watchedDate ? (
              <div className="p-4 bg-primary-secondary rounded-lg text-sm text-text-secondary text-center">
                Select a doctor and date first to see available slots
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                <SlotGroup
                  label="Morning (9:00 AM – 12:00 PM)"
                  icon={<Sun className="w-4 h-4" />}
                  slots={MORNING_SLOTS}
                  color="text-amber-600"
                />
                <SlotGroup
                  label="Afternoon (1:00 PM – 4:00 PM)"
                  icon={<Sunset className="w-4 h-4" />}
                  slots={AFTERNOON_SLOTS}
                  color="text-orange-500"
                />
                <SlotGroup
                  label="Evening (4:00 PM – 8:00 PM)"
                  icon={<Moon className="w-4 h-4" />}
                  slots={EVENING_SLOTS}
                  color="text-indigo-500"
                />
              </div>
            )}
            {errors.appointment_time && (
              <p className="text-xs text-danger mt-2">{errors.appointment_time.message}</p>
            )}
          </div>

          {/* Type */}
          <Select label="Appointment Type"
            options={[
              { value: 'consultation', label: 'Consultation' },
              { value: 'follow-up',    label: 'Follow-up' },
              { value: 'emergency',    label: 'Emergency' },
            ]}
            error={errors.appointment_type?.message}
            {...register('appointment_type')}
          />

          {/* Reason */}
          <Textarea label="Reason (Optional)" placeholder="Enter reason for appointment"
            {...register('reason')} rows={2} />

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-teal inline-block" /> Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Unavailable</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-border inline-block" /> Available</span>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" disabled={submitting}
              onClick={() => { setIsModalOpen(false); reset({}); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={submitting || !watchedTime}>
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
