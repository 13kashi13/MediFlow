import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Clock, Plus, Phone, MapPin, Mail, ShieldAlert, Heart, Trash, CheckCircle2, FileText, ClipboardList } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatTime } from '../../utils/format';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';

type Medication = {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

type ApiAppointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason?: string;
  patients?: {
    id: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    blood_group?: string;
    emergency_contact?: string;
    users?: { id: string; full_name: string; email: string };
  };
};

const statusColors: Record<string, string> = {
  confirmed:  'bg-amber-100 text-amber-700',
  scheduled:  'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-gray-100 text-gray-500',
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; delay: number }> = ({ icon, title, value, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="w-full">
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between min-h-[64px]">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className={`font-bold text-text-primary ${typeof value === 'string' && value.length > 10 ? 'text-lg leading-tight' : 'text-3xl'}`}>{value}</h3>
        </div>
        <div className="p-3 bg-primary-teal/10 rounded-lg flex-shrink-0 ml-2">{icon}</div>
      </div>
    </Card>
  </motion.div>
);

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Prescription modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ApiAppointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<Medication[]>([
    { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  // Medical Record modal
  const [isMedRecordOpen, setIsMedRecordOpen] = useState(false);
  const [medRecordAppt, setMedRecordAppt] = useState<ApiAppointment | null>(null);
  const [medSymptoms, setMedSymptoms] = useState('');
  const [medDiagnosis, setMedDiagnosis] = useState('');
  const [medTreatment, setMedTreatment] = useState('');
  const [medNotes, setMedNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [apptRes, docRes] = await Promise.all([
        axiosInstance.get('/appointments/'),
        axiosInstance.get('/doctors/'),
      ]);
      setAppointments(apptRes.data);
      // Find this doctor's profile
      const myDoc = (docRes.data as any[]).find(
        (d) => d.users?.id === user?.id || d.user_id === user?.id
      );
      setDoctorProfile(myDoc || null);
    } catch {
      // silent on poll
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Only this doctor's appointments
  const myAppointments = doctorProfile
    ? appointments.filter((a) => a.doctor_id === doctorProfile.id)
    : appointments;

  const todayApts = myAppointments.filter((a) => a.appointment_date === today && a.status !== 'cancelled');
  const upcomingApts = myAppointments.filter((a) => a.appointment_date > today && a.status !== 'cancelled');
  const pendingToday = todayApts.filter((a) => a.status === 'scheduled' || a.status === 'confirmed');

  const nextApptText = React.useMemo(() => {
    if (pendingToday.length === 0) return 'None today';
    const sorted = [...pendingToday].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    return `${formatTime(sorted[0].appointment_time)} – ${sorted[0].patients?.users?.full_name || 'Patient'}`;
  }, [pendingToday]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axiosInstance.patch(`/appointments/${id}`, { status });
      showToast('success', `Appointment marked as ${status}`);
      fetchData();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update');
    }
  };

  const openVisitModal = (apt: ApiAppointment) => {
    setSelectedAppointment(apt);
    setDiagnosis('');
    setNotes('');
    setMedications([{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setIsModalOpen(true);
  };

  const openMedRecordModal = (apt: ApiAppointment) => {
    setMedRecordAppt(apt);
    setMedSymptoms('');
    setMedDiagnosis('');
    setMedTreatment('');
    setMedNotes('');
    setIsMedRecordOpen(true);
  };

  const handleSaveMedRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medRecordAppt || !doctorProfile) {
      showToast('error', 'Missing appointment or doctor profile');
      return;
    }
    if (!medDiagnosis.trim()) {
      showToast('error', 'Diagnosis is required');
      return;
    }
    try {
      await axiosInstance.post('/medical-records/', {
        patient_id: medRecordAppt.patient_id,
        doctor_id: doctorProfile.id,
        diagnosis: medDiagnosis,
        symptoms: medSymptoms || undefined,
        treatment: medTreatment || undefined,
        notes: medNotes || undefined,
        visit_date: today,
      });
      showToast('success', 'Medical record uploaded — patient notified');
      setIsMedRecordOpen(false);
      setMedRecordAppt(null);
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to save medical record');
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
  };

  const handleMedChange = (i: number, field: keyof Medication, val: string) => {
    const updated = [...medications];
    updated[i] = { ...updated[i], [field]: val };
    setMedications(updated);
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !doctorProfile) {
      showToast('error', !doctorProfile ? 'Doctor profile not found. Complete your profile first.' : 'No appointment selected.');
      return;
    }
    if (!diagnosis.trim()) { showToast('error', 'Diagnosis is required'); return; }
    const activeMeds = medications.filter((m) => m.medication_name.trim());
    if (!activeMeds.length) { showToast('error', 'At least one medication required'); return; }
    for (const m of activeMeds) {
      if (!m.dosage || !m.frequency || !m.duration) {
        showToast('error', 'All medications need dosage, frequency and duration'); return;
      }
    }
    try {
      await axiosInstance.post('/prescriptions/', {
        patient_id: selectedAppointment.patient_id,
        doctor_id: doctorProfile.id,
        diagnosis,
        notes: notes || undefined,
        prescription_date: today,
        medications: activeMeds,
      });
      await axiosInstance.patch(`/appointments/${selectedAppointment.id}`, { status: 'completed' });
      showToast('success', 'Prescription saved & visit completed');
      setIsModalOpen(false);
      setSelectedAppointment(null);
      fetchData();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to save prescription');
    }
  };

  const pat = selectedAppointment?.patients;
  const patUser = pat?.users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Welcome, {user?.name}. {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-xs text-text-secondary bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
          Live — refreshes every 20s
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Calendar className="w-5 h-5 text-primary-teal" />} title="Today's Appointments" value={loading ? '—' : todayApts.length} delay={0} />
        <StatCard icon={<Users className="w-5 h-5 text-amber-500" />} title="Pending Patients" value={loading ? '—' : pendingToday.length} delay={0.1} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} title="Completed Today" value={loading ? '—' : todayApts.filter(a => a.status === 'completed').length} delay={0.2} />
        <StatCard icon={<Clock className="w-5 h-5 text-primary-teal" />} title="Next Patient" value={loading ? '—' : nextApptText} delay={0.3} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/prescriptions" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <FileText className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Prescriptions</span>
        </Link>
        <Link to="/patients" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Users className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">My Patients</span>
        </Link>
        <Link to="/appointments" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Calendar className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">All Appointments</span>
        </Link>
      </div>

      {/* Today's Schedule */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Schedule</h3>
          {loading ? (
            <div className="py-8 text-center text-sm text-text-secondary">Loading…</div>
          ) : todayApts.length === 0 ? (
            <div className="py-10 text-center text-sm text-text-secondary">No appointments today</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 pr-4 text-sm font-semibold text-text-secondary">Time</th>
                    <th className="pb-3 pr-4 text-sm font-semibold text-text-secondary">Patient</th>
                    <th className="pb-3 pr-4 text-sm font-semibold text-text-secondary">Type</th>
                    <th className="pb-3 pr-4 text-sm font-semibold text-text-secondary">Status</th>
                    <th className="pb-3 text-sm font-semibold text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayApts
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((apt) => (
                    <tr key={apt.id} className="border-b border-border/50 last:border-0 hover:bg-primary-secondary/20 transition-colors">
                      <td className="py-3 pr-4 text-sm font-semibold text-text-primary">{formatTime(apt.appointment_time)}</td>
                      <td className="py-3 pr-4 text-sm font-semibold text-primary-teal">
                        {apt.patients?.users?.full_name || apt.patient_id}
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-secondary capitalize">{apt.appointment_type}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium capitalize ${statusColors[apt.status] || 'bg-gray-100 text-gray-700'}`}>
                          {apt.status === 'confirmed' ? 'in waiting room' : apt.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {apt.status === 'completed' ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                            {/* Still allow uploading medical report after completion */}
                            <button
                              onClick={() => openMedRecordModal(apt)}
                              title="Upload Medical Report"
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <ClipboardList className="w-3.5 h-3.5" /> Report
                            </button>
                          </div>
                        ) : apt.status === 'cancelled' ? (
                          <span className="text-xs text-gray-400 font-medium">Cancelled</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Mark Complete without prescription */}
                            <button
                              onClick={() => updateStatus(apt.id, 'completed')}
                              title="Mark checkup done"
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </button>
                            {/* Write prescription */}
                            <Button size="sm" onClick={() => openVisitModal(apt)}>
                              Prescribe
                            </Button>
                            {/* Upload medical report */}
                            <button
                              onClick={() => openMedRecordModal(apt)}
                              title="Upload Medical Report"
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <ClipboardList className="w-3.5 h-3.5" /> Report
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Upcoming */}
      {upcomingApts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Upcoming Appointments</h3>
              <span className="text-sm text-text-secondary">{upcomingApts.length} scheduled</span>
            </div>
            <div className="space-y-2">
              {upcomingApts.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-primary-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{apt.patients?.users?.full_name || 'Patient'}</p>
                    <p className="text-xs text-text-secondary">{formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)} · {apt.appointment_type}</p>
                  </div>
                  <Badge variant={apt.status === 'confirmed' ? 'success' : 'info'}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Prescription Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedAppointment(null); }} title="Write Prescription" size="xl">
        {selectedAppointment && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Patient info panel */}
            <div className="lg:col-span-1 bg-primary-secondary/30 p-5 rounded-xl border border-border space-y-4">
              <div className="text-center pb-4 border-b border-border">
                <div className="w-14 h-14 bg-primary-teal text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  {(patUser?.full_name || 'P')[0].toUpperCase()}
                </div>
                <h4 className="text-base font-bold text-text-primary">{patUser?.full_name || 'Patient'}</h4>
                {pat?.gender && <p className="text-xs text-text-secondary capitalize">{pat.gender}{pat.date_of_birth && ` · ${calculateAge(pat.date_of_birth)} yrs`}</p>}
              </div>
              <div className="space-y-3 text-sm">
                {pat?.date_of_birth && <div><span className="text-xs text-text-secondary block">Date of Birth</span><span className="font-semibold">{formatDate(pat.date_of_birth)}</span></div>}
                {pat?.blood_group && <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-primary-teal" /><div><span className="text-xs text-text-secondary block">Blood Group</span><span className="font-semibold">{pat.blood_group}</span></div></div>}
                {patUser?.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-teal" /><div><span className="text-xs text-text-secondary block">Email</span><span className="font-semibold break-all text-xs">{patUser.email}</span></div></div>}
                {pat?.address && pat.address !== 'Not set' && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-teal" /><div><span className="text-xs text-text-secondary block">Address</span><span className="font-semibold text-xs">{pat.address}</span></div></div>}
                {pat?.emergency_contact && pat.emergency_contact !== '0000000000' && <div className="flex items-center gap-2 pt-2 border-t border-border/60"><ShieldAlert className="w-4 h-4 text-primary-teal" /><div><span className="text-xs text-text-secondary block">Emergency</span><span className="font-semibold">{pat.emergency_contact}</span></div></div>}
                <div className="pt-2 border-t border-border/60"><span className="text-xs text-text-secondary block">Reason</span><span className="text-sm">{selectedAppointment.reason || 'Not specified'}</span></div>
              </div>
            </div>

            {/* Prescription form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="pb-2 border-b border-border">
                <h3 className="text-base font-bold text-text-primary">Prescription — {formatDate(today)}</h3>
                <p className="text-xs text-text-secondary">For {patUser?.full_name || 'patient'}</p>
              </div>
              <form onSubmit={handleSavePrescription} className="space-y-4">
                <Input label="Diagnosis" placeholder="e.g. Hypertension" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-text-primary">Medications</label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setMedications([...medications, { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }])}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  {medications.map((med, i) => (
                    <div key={i} className="p-3 bg-primary-secondary/20 border border-border/60 rounded-xl space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-text-secondary uppercase">Medication #{i + 1}</span>
                        {medications.length > 1 && <button type="button" onClick={() => setMedications(medications.filter((_, j) => j !== i))} className="text-danger hover:text-danger/80"><Trash className="w-3.5 h-3.5" /></button>}
                      </div>
                      <Input label="Name" placeholder="e.g. Lisinopril" value={med.medication_name} onChange={(e) => handleMedChange(i, 'medication_name', e.target.value)} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input label="Dosage" placeholder="10mg" value={med.dosage} onChange={(e) => handleMedChange(i, 'dosage', e.target.value)} />
                        <Input label="Frequency" placeholder="1x daily" value={med.frequency} onChange={(e) => handleMedChange(i, 'frequency', e.target.value)} />
                        <Input label="Duration" placeholder="30 days" value={med.duration} onChange={(e) => handleMedChange(i, 'duration', e.target.value)} />
                      </div>
                      <Input label="Instructions (optional)" placeholder="Take with food" value={med.instructions || ''} onChange={(e) => handleMedChange(i, 'instructions', e.target.value)} />
                    </div>
                  ))}
                </div>
                <Textarea label="Additional Notes (optional)" placeholder="Rest for 3 days…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setSelectedAppointment(null); }}>Cancel</Button>
                  <Button type="submit">Save Prescription & Complete</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Medical Report Modal ───────────────────────────────── */}
      <Modal
        isOpen={isMedRecordOpen}
        onClose={() => { setIsMedRecordOpen(false); setMedRecordAppt(null); }}
        title="Upload Medical Report"
        size="lg"
      >
        {medRecordAppt && (
          <form onSubmit={handleSaveMedRecord} className="space-y-4">
            {/* Patient info strip */}
            <div className="flex items-center gap-3 p-3 bg-primary-secondary rounded-xl border border-border">
              <div className="w-10 h-10 bg-primary-teal text-white rounded-full flex items-center justify-center font-bold text-sm">
                {(medRecordAppt.patients?.users?.full_name || 'P')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{medRecordAppt.patients?.users?.full_name || 'Patient'}</p>
                <p className="text-xs text-text-secondary capitalize">
                  {medRecordAppt.appointment_type} · {formatDate(medRecordAppt.appointment_date)} at {formatTime(medRecordAppt.appointment_time)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              📋 This report will be saved to the patient's medical records and they will be notified immediately.
            </div>

            <Input
              label="Diagnosis *"
              placeholder="e.g. Type 2 Diabetes, Seasonal Flu"
              value={medDiagnosis}
              onChange={(e) => setMedDiagnosis(e.target.value)}
              required
            />
            <Input
              label="Symptoms"
              placeholder="e.g. Fatigue, high blood sugar, frequent urination"
              value={medSymptoms}
              onChange={(e) => setMedSymptoms(e.target.value)}
            />
            <Input
              label="Treatment"
              placeholder="e.g. Metformin 500mg twice daily, lifestyle changes"
              value={medTreatment}
              onChange={(e) => setMedTreatment(e.target.value)}
            />
            <Textarea
              label="Additional Notes (optional)"
              placeholder="e.g. Follow up in 3 months, avoid sugar-heavy diet…"
              value={medNotes}
              onChange={(e) => setMedNotes(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setIsMedRecordOpen(false); setMedRecordAppt(null); }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <ClipboardList className="w-4 h-4 mr-2" />
                Upload & Notify Patient
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
