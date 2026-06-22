import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, Sun, Sunset, Moon, ChevronDown, ChevronUp, Zap, AlertCircle } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../lib/axios';

// ── Slot generation ─────────────────────────────────────────────────
function generateSlots(startH: number, endH: number): string[] {
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

const PERIODS = [
  { id: 'morning',   label: 'Morning',   range: '9:00 AM – 12:00 PM', slots: generateSlots(9, 12),  icon: Sun,    color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { id: 'afternoon', label: 'Afternoon', range: '1:00 PM – 5:00 PM',  slots: generateSlots(13, 17), icon: Sunset, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'evening',   label: 'Evening',   range: '5:00 PM – 8:00 PM',  slots: generateSlots(17, 20), icon: Moon,   color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
] as const;

// ── IST helpers ─────────────────────────────────────────────────────
function getISTToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}
function getISTNow(): string {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
}
function isSlotPast(slot: string, date: string): boolean {
  if (date !== getISTToday()) return false;
  return slot <= getISTNow();
}
function to12h(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

// ── Schema ───────────────────────────────────────────────────────────
const schema = z.object({
  patient_id:       z.string().optional(),
  doctor_id:        z.string().min(1, 'Doctor is required'),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.string().min(1, 'Please select a time slot'),
  appointment_type: z.enum(['consultation', 'follow-up', 'emergency']),
  reason:           z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type Appointment = {
  id: string; patient_id: string; doctor_id: string;
  appointment_date: string; appointment_time: string;
  duration: number; status: string; appointment_type: string; reason?: string;
  patients?: { users?: { full_name?: string } };
  doctors?:  { users?: { full_name?: string } };
};
type PatientOption = { id: string; user_id?: string; users?: { full_name?: string; id?: string } };
type DoctorOption  = { id: string; specialization?: string; users?: { full_name?: string } };

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  scheduled: 'info', confirmed: 'success', completed: 'default', cancelled: 'danger', 'no-show': 'warning',
};

// ── Slot Tab Panel ────────────────────────────────────────────────────
const SlotPicker: React.FC<{
  bookedSlots: Set<string>;
  selectedSlot: string;
  selectedDate: string;
  loading: boolean;
  onSelect: (slot: string) => void;
}> = ({ bookedSlots, selectedSlot, selectedDate, loading, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Auto-switch to the tab containing the earliest available slot
  useEffect(() => {
    if (!selectedDate) return;
    for (const p of PERIODS) {
      const hasAvail = p.slots.some(s => !bookedSlots.has(s) && !isSlotPast(s, selectedDate));
      if (hasAvail) { setActiveTab(p.id as any); return; }
    }
  }, [selectedDate, bookedSlots]);

  const activePeriod = PERIODS.find(p => p.id === activeTab)!;
  const Icon = activePeriod.icon;

  const countAvail = (p: typeof PERIODS[number]) =>
    p.slots.filter(s => !bookedSlots.has(s) && !isSlotPast(s, selectedDate)).length;

  const totalAvailable = PERIODS.flatMap(p => p.slots).filter(s => !bookedSlots.has(s) && !isSlotPast(s, selectedDate)).length;
  const earliestSlot = PERIODS.flatMap(p => p.slots).find(s => !bookedSlots.has(s) && !isSlotPast(s, selectedDate));

  return (
    <div className="space-y-3">
      {/* Earliest slot banner */}
      {!loading && earliestSlot && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-700 flex-1">
            Earliest available: {to12h(earliestSlot)}
          </span>
          <button type="button" onClick={() => onSelect(earliestSlot)}
            className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors">
            Select
          </button>
        </motion.div>
      )}

      {/* Tab buttons */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl">
        {PERIODS.map(p => {
          const avail = countAvail(p);
          const PIcon = p.icon;
          const isActive = activeTab === p.id;
          return (
            <button key={p.id} type="button" onClick={() => setActiveTab(p.id as any)}
              className={`flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl transition-all duration-200 text-center
                ${isActive ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              <PIcon className={`w-4 h-4 ${isActive ? p.color : ''}`} />
              <span className={`text-xs font-bold ${isActive ? 'text-text-primary' : ''}`}>{p.label}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                ${avail === 0 ? 'text-red-400' : isActive ? `${p.bg} ${p.color}` : 'text-text-secondary'}`}>
                {avail === 0 ? 'Full' : `${avail} open`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slot grid */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
          className={`p-4 rounded-2xl border-2 ${activePeriod.border} ${activePeriod.bg}/20`}>

          <div className="flex items-center gap-2 mb-3">
            <Icon className={`w-4 h-4 ${activePeriod.color}`} />
            <span className={`text-xs font-semibold ${activePeriod.color}`}>{activePeriod.range}</span>
            {loading && <span className="text-[10px] text-text-secondary animate-pulse ml-auto">Syncing…</span>}
          </div>

          {countAvail(activePeriod) === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium text-text-secondary">No slots available in this time period.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {activePeriod.slots.map(slot => {
                const booked   = bookedSlots.has(slot);
                const past     = isSlotPast(slot, selectedDate);
                const selected = selectedSlot === slot;
                const disabled = booked || past;
                return (
                  <motion.button key={slot} type="button" disabled={disabled}
                    whileHover={!disabled ? { scale: 1.03 } : {}}
                    whileTap={!disabled ? { scale: 0.97 } : {}}
                    onClick={() => !disabled && onSelect(selected ? '' : slot)}
                    title={past ? 'Time has passed' : booked ? 'Already booked' : to12h(slot)}
                    className={`
                      relative py-3 px-2 text-xs font-semibold rounded-xl border-2 transition-all duration-150 select-none
                      ${selected
                        ? 'bg-primary-teal border-primary-teal text-white shadow-lg shadow-primary-teal/25'
                        : past
                          ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                          : booked
                            ? 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed'
                            : 'bg-white border-gray-200 text-text-primary hover:border-primary-teal hover:shadow-sm hover:text-primary-teal cursor-pointer'
                      }`}>
                    {to12h(slot)}
                    {booked && !past && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                    )}
                    {selected && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-primary-teal" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Selected display */}
      {selectedSlot && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-primary-teal/10 border-2 border-primary-teal/30 rounded-xl">
          <Clock className="w-4 h-4 text-primary-teal flex-shrink-0" />
          <span className="text-sm font-bold text-primary-teal">Selected: {to12h(selectedSlot)}</span>
          <button type="button" onClick={() => onSelect('')} className="ml-auto text-xs text-text-secondary hover:text-danger transition-colors">✕ Clear</button>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary pt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-primary-teal inline-block" />Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-red-50 border border-red-100 inline-block" />Booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-gray-50 border border-gray-100 inline-block" />Past</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-white border border-gray-200 inline-block" />Available</span>
        <span className="ml-auto flex items-center gap-1 text-primary-teal font-medium">
          <span className="w-2 h-2 rounded-full bg-primary-teal animate-pulse inline-block" />
          Live sync
        </span>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
export const Appointments: React.FC = () => {
  const { user }        = useAuth();
  const { showToast }   = useToast();

  const [appointments,  setAppointments]  = useState<Appointment[]>([]);
  const [patients,      setPatients]      = useState<PatientOption[]>([]);
  const [doctors,       setDoctors]       = useState<DoctorOption[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [bookedSlots,   setBookedSlots]   = useState<Set<string>>(new Set());
  const [loadingSlots,  setLoadingSlots]  = useState(false);
  const [selectedSlot,  setSelectedSlot]  = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const isSubmittingRef = useRef(false);

  const today = getISTToday();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { appointment_type: 'consultation' } });

  const watchedDate   = watch('appointment_date');
  const watchedDoctor = watch('doctor_id');

  // Fetch booked slots whenever doctor or date changes + poll every 8s for real-time sync
  useEffect(() => {
    if (!watchedDoctor || !watchedDate) { setBookedSlots(new Set()); setSelectedSlot(''); return; }
    const fetchSlots = () => {
      setLoadingSlots(true);
      axiosInstance.get(`/appointments/slots?doctor_id=${watchedDoctor}&date=${watchedDate}`)
        .then(r => setBookedSlots(new Set<string>(r.data)))
        .catch(() => {})
        .finally(() => setLoadingSlots(false));
    };
    fetchSlots();
    setSelectedSlot('');
    // Poll every 8 seconds so if another user books a slot it appears greyed
    const interval = setInterval(fetchSlots, 8000);
    return () => clearInterval(interval);
  }, [watchedDoctor, watchedDate]);

  // Sync selected slot into form
  useEffect(() => {
    setValue('appointment_time', selectedSlot, { shouldValidate: !!selectedSlot });
  }, [selectedSlot, setValue]);

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
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openModal = () => {
    const myProfile = user?.role === 'patient'
      ? patients.find(p => p.user_id === user.id || p.users?.id === user.id) : null;
    reset({ patient_id: myProfile?.id || '', doctor_id: '', appointment_date: '',
            appointment_time: '', appointment_type: 'consultation', reason: '' });
    setSelectedSlot('');
    setBookedSlots(new Set());
    setIsModalOpen(true);
  };

  const handleBook = async (data: FormData) => {
    if (isSubmittingRef.current) return;
    if (!selectedSlot) { showToast('error', 'Please select a time slot'); return; }

    // Re-check slot still available
    if (bookedSlots.has(selectedSlot)) {
      showToast('error', 'This slot has just been booked. Please select another time.');
      setSelectedSlot('');
      return;
    }
    if (isSlotPast(selectedSlot, watchedDate)) {
      showToast('error', 'This time has passed. Please choose a future slot.');
      setSelectedSlot('');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    let resolvedPatientId = data.patient_id || '';
    if (user?.role === 'patient') {
      let myProfile = patients.find(p => p.user_id === user.id || (p as any).users?.id === user.id);
      if (!myProfile) {
        try {
          const res = await axiosInstance.get('/patients/');
          setPatients(res.data);
          myProfile = (res.data as PatientOption[]).find(p => p.user_id === user.id || (p as any).users?.id === user.id);
        } catch {}
      }
      if (!myProfile) { showToast('error', 'Patient profile not found.'); isSubmittingRef.current = false; setSubmitting(false); return; }
      resolvedPatientId = myProfile.id;
    }
    if (!resolvedPatientId) { showToast('error', 'Please select a patient.'); isSubmittingRef.current = false; setSubmitting(false); return; }

    try {
      await axiosInstance.post('/appointments/', { ...data, patient_id: resolvedPatientId, appointment_time: selectedSlot, duration: 15 });
      showToast('success', 'Appointment booked successfully!');
      setIsModalOpen(false);
      reset({});
      setSelectedSlot('');
      fetchAll();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to book appointment';
      // Slot just taken by someone else
      if (err?.response?.status === 409) {
        showToast('error', 'This slot has just been booked. Please select another time.');
        setBookedSlots(prev => new Set([...prev, selectedSlot]));
        setSelectedSlot('');
      } else {
        showToast('error', msg);
      }
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
    } catch (err: any) { showToast('error', err?.response?.data?.detail || 'Failed to update'); }
  };

  const todayApts    = appointments.filter(a => a.appointment_date === today);
  const upcomingApts = appointments.filter(a => a.appointment_date > today);
  const pName = (a: Appointment) => a.patients?.users?.full_name || a.patient_id;
  const dName = (a: Appointment) => a.doctors?.users?.full_name  || a.doctor_id;

  // Earliest available slot across all periods for the selected doctor+date
  const earliestSlot = [...PERIODS.flatMap(p => p.slots)]
    .find(s => !bookedSlots.has(s) && !isSlotPast(s, watchedDate));

  const totalAvailable = PERIODS.flatMap(p => p.slots)
    .filter(s => !bookedSlots.has(s) && !isSlotPast(s, watchedDate)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and schedule appointments</p>
        </div>
        {(user?.role === 'patient' || user?.role === 'receptionist') && (
          <Button onClick={openModal}><Plus className="w-4 h-4 mr-2" />Book Appointment</Button>
        )}
      </div>

      {loading ? (
        <Card><div className="py-12 text-center text-sm text-text-secondary">Loading…</div></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {todayApts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">No appointments today</p>
              ) : todayApts.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 bg-primary-secondary rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="text-sm font-semibold text-text-primary">{pName(apt)}</p>
                    <p className="text-xs text-text-secondary">{dName(apt)}</p></div>
                    <Badge variant={STATUS_COLORS[apt.status] ?? 'default'}>{apt.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(apt.appointment_time)}</span>
                    <span className="capitalize">{apt.appointment_type}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {user?.role === 'patient' && apt.status === 'scheduled' && (
                      <><Button size="sm" variant="primary" onClick={() => updateStatus(apt.id, 'confirmed')}>✓ Confirm Attendance</Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</Button></>
                    )}
                    {user?.role === 'patient' && apt.status === 'confirmed' && (
                      <span className="text-xs text-success font-semibold">✓ Attendance confirmed — see you soon!</span>
                    )}
                    {user?.role !== 'patient' && (
                      <>
                        {apt.status === 'scheduled' && user?.role !== 'admin' && (
                          <Button size="sm" variant="primary" onClick={() => updateStatus(apt.id, 'confirmed')}>Confirm</Button>
                        )}
                        {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                          <>{user?.role !== 'admin' && <Button size="sm" variant="secondary" onClick={() => updateStatus(apt.id, 'completed')}>Complete</Button>}
                          <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, 'cancelled')}>Cancel</Button></>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {upcomingApts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">No upcoming appointments</p>
              ) : upcomingApts.map((apt, i) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 border-2 border-border rounded-xl hover:border-primary-teal/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="text-sm font-semibold text-text-primary">{pName(apt)}</p>
                    <p className="text-xs text-text-secondary">{dName(apt)}</p></div>
                    <Badge variant={STATUS_COLORS[apt.status] ?? 'default'}>{apt.status}</Badge>
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

      {/* ── BOOK APPOINTMENT MODAL ──────────────────────────────── */}
      <Modal isOpen={isModalOpen}
        onClose={() => { if (!submitting) { setIsModalOpen(false); reset({}); setSelectedSlot(''); } }}
        title="Book an Appointment" size="xl">
        <form onSubmit={handleSubmit(handleBook)} className="space-y-5">

          {/* Step 1 — Patient (hidden for patients) */}
          {user?.role !== 'patient' && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Patient</label>
              <Select options={patients.map(p => ({ value: p.id, label: p.users?.full_name || p.id }))}
                error={errors.patient_id?.message} {...register('patient_id')} />
            </div>
          )}

          {/* Step 2 — Doctor */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Doctor</label>
            {doctors.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">No doctors available yet.</div>
            ) : (
              <Select options={doctors.map(d => ({ value: d.id, label: `${d.users?.full_name}${d.specialization ? ` — ${d.specialization}` : ''}` }))}
                error={errors.doctor_id?.message} {...register('doctor_id')} />
            )}
          </div>

          {/* Step 3 — Date */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" min={today}
              className="w-full border-2 border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-teal transition-colors"
              {...register('appointment_date')} />
            {errors.appointment_date && <p className="text-xs text-danger mt-1">{errors.appointment_date.message}</p>}
          </div>

          {/* Step 4 — Slot picker */}
          {watchedDoctor && watchedDate ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Time Slot</label>
                {loadingSlots && <span className="text-xs text-text-secondary animate-pulse">Loading slots…</span>}
                {!loadingSlots && watchedDoctor && watchedDate && (
                  <span className="text-xs font-semibold text-primary-teal">{totalAvailable} slots available</span>
                )}
              </div>

              {/* Earliest slot indicator */}
              {!loadingSlots && earliestSlot && (
                <div className="flex items-center gap-2 mb-3 p-2.5 bg-green-50 border border-green-200 rounded-xl">
                  <Zap className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-green-700">
                    Earliest available: {to12h(earliestSlot)}
                    <button type="button" onClick={() => setSelectedSlot(earliestSlot)}
                      className="ml-2 underline hover:no-underline">Select</button>
                  </span>
                </div>
              )}

              {!loadingSlots && totalAvailable === 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-sm text-danger font-medium">No slots available for this date. Please choose a different date.</span>
                </div>
              )}

              {!loadingSlots && totalAvailable > 0 && (
                <SlotPicker
                  bookedSlots={bookedSlots}
                  selectedSlot={selectedSlot}
                  selectedDate={watchedDate}
                  loading={loadingSlots}
                  onSelect={setSelectedSlot}
                />
              )}

              {selectedSlot && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-primary-teal/10 border-2 border-primary-teal/30 rounded-xl flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-teal flex-shrink-0" />
                  <span className="text-sm font-semibold text-primary-teal">Selected: {to12h(selectedSlot)}</span>
                  <button type="button" onClick={() => setSelectedSlot('')} className="ml-auto text-xs text-text-secondary hover:text-danger">Clear</button>
                </motion.div>
              )}
              {errors.appointment_time && !selectedSlot && (
                <p className="text-xs text-danger mt-1">{errors.appointment_time.message}</p>
              )}
            </div>
          ) : (
            <div className="p-5 bg-primary-secondary rounded-2xl border-2 border-dashed border-border text-center">
              <CalendarIcon className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-text-secondary">Select a doctor and date to view available slots</p>
            </div>
          )}

          {/* Step 5 — Type & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Appointment Type</label>
              <Select options={[{ value: 'consultation', label: 'Consultation' }, { value: 'follow-up', label: 'Follow-up' }, { value: 'emergency', label: 'Emergency' }]}
                error={errors.appointment_type?.message} {...register('appointment_type')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Reason (Optional)</label>
              <Textarea placeholder="e.g. Fever, regular checkup…" {...register('reason')} rows={2} />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1 border-t border-border">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-primary-teal inline-block" />Selected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-red-100 inline-block border border-red-200" />Booked</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-gray-50 inline-block border border-gray-100" />Past</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-white inline-block border border-border" />Available</span>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" disabled={submitting} onClick={() => { setIsModalOpen(false); reset({}); setSelectedSlot(''); }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={submitting || !selectedSlot}>
              {submitting ? 'Booking…' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
