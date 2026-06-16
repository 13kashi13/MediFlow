import React, { useState } from 'react';
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
import { formatDate, formatTime } from '../utils/format';
import { motion } from 'framer-motion';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['consultation', 'follow-up', 'emergency']),
  reason: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const mockAppointments = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    date: '2026-06-16',
    time: '10:00',
    duration: 30,
    status: 'scheduled' as const,
    type: 'consultation' as const,
    reason: 'Regular checkup',
    createdAt: '2026-06-10',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Emma Wilson',
    doctorId: '2',
    doctorName: 'Dr. Michael Chen',
    date: '2026-06-16',
    time: '11:30',
    duration: 30,
    status: 'confirmed' as const,
    type: 'follow-up' as const,
    reason: 'Follow-up consultation',
    createdAt: '2026-06-11',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michael Brown',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    date: '2026-06-17',
    time: '14:00',
    duration: 30,
    status: 'scheduled' as const,
    type: 'consultation' as const,
    reason: 'Annual physical',
    createdAt: '2026-06-12',
  },
];

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  scheduled: 'info',
  confirmed: 'success',
  completed: 'default',
  cancelled: 'danger',
  'no-show': 'warning',
};

export const Appointments: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [alternativeSlots] = useState([
    { date: '2026-06-16', time: '15:00' },
    { date: '2026-06-17', time: '10:00' },
    { date: '2026-06-17', time: '14:00' },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const watchedDate = watch('date');
  const watchedTime = watch('time');
  const watchedDoctor = watch('doctorId');

  React.useEffect(() => {
    if (watchedDate && watchedTime && watchedDoctor) {
      const conflict = appointments.some(
        (apt) =>
          apt.date === watchedDate &&
          apt.time === watchedTime &&
          apt.doctorId === watchedDoctor &&
          apt.status !== 'cancelled'
      );
      setHasConflict(conflict);
    } else {
      setHasConflict(false);
    }
  }, [watchedDate, watchedTime, watchedDoctor, appointments]);

  const handleAddAppointment = (data: AppointmentFormData) => {
    if (hasConflict) {
      showToast('error', 'Time slot is already booked. Please choose an alternative.');
      return;
    }

    const newAppointment = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      patientName: 'Patient Name',
      doctorName: 'Doctor Name',
      duration: 30,
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppointments([...appointments, newAppointment]);
    setIsAddModalOpen(false);
    reset();
    showToast('success', 'Appointment scheduled successfully');
  };

  const updateStatus = (id: string, status: string) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: status as any } : apt))
    );
    showToast('success', `Appointment ${status}`);
  };

  const todayAppointments = appointments.filter((apt) => apt.date === '2026-06-16');
  const upcomingAppointments = appointments.filter((apt) => apt.date > '2026-06-16');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and schedule appointments</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
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
                      <p className="text-sm font-semibold text-text-primary">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-text-secondary">{appointment.doctorName}</p>
                    </div>
                    <Badge variant={statusColors[appointment.status]}>{appointment.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(appointment.time)}
                    </span>
                    <span className="capitalize">{appointment.type}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(appointment.id, 'completed')}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateStatus(appointment.id, 'cancelled')}
                        >
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

        {/* Upcoming Appointments */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">
                No upcoming appointments
              </p>
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
                      <p className="text-sm font-semibold text-text-primary">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-text-secondary">{appointment.doctorName}</p>
                    </div>
                    <Badge variant={statusColors[appointment.status]}>{appointment.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {formatDate(appointment.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(appointment.time)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          reset();
          setHasConflict(false);
        }}
        title="Book Appointment"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleAddAppointment)} className="space-y-4">
          <Select
            label="Patient"
            options={[
              { value: '1', label: 'John Smith' },
              { value: '2', label: 'Emma Wilson' },
              { value: '3', label: 'Michael Brown' },
            ]}
            error={errors.patientId?.message}
            {...register('patientId')}
          />
          <Select
            label="Doctor"
            options={[
              { value: '1', label: 'Dr. Sarah Johnson - Cardiologist' },
              { value: '2', label: 'Dr. Michael Chen - Neurologist' },
              { value: '3', label: 'Dr. Emily Davis - Pediatrician' },
            ]}
            error={errors.doctorId?.message}
            {...register('doctorId')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
            <Input label="Time" type="time" error={errors.time?.message} {...register('time')} />
          </div>

          {hasConflict && (
            <div className="p-4 bg-red-50 border border-danger rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-danger mb-2">
                    Time slot is already booked
                  </p>
                  <p className="text-xs text-text-secondary mb-3">
                    Please choose an alternative time slot:
                  </p>
                  <div className="space-y-2">
                    {alternativeSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          reset({
                            ...watch(),
                            date: slot.date,
                            time: slot.time,
                          });
                        }}
                        className="block w-full text-left px-3 py-2 bg-white border border-border rounded-lg text-sm hover:border-primary-teal transition-colors"
                      >
                        {formatDate(slot.date)} at {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Select
            label="Type"
            options={[
              { value: 'consultation', label: 'Consultation' },
              { value: 'follow-up', label: 'Follow-up' },
              { value: 'emergency', label: 'Emergency' },
            ]}
            error={errors.type?.message}
            {...register('type')}
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
              onClick={() => {
                setIsAddModalOpen(false);
                reset();
                setHasConflict(false);
              }}
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
