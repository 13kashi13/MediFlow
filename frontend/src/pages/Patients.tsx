import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon, Eye, Calendar, FileText, ClipboardList, Heart, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatPhone } from '../utils/format';
import { motion } from 'framer-motion';
import { axiosInstance } from '../lib/axios';

// Schema for creating a NEW patient (requires account details)
const addPatientSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  blood_group: z.string().optional(),
  emergency_contact: z.string().optional(),
});

// Schema for editing existing patient profile fields only
const editPatientSchema = z.object({
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(2, 'Address is required'),
  blood_group: z.string().optional(),
  emergency_contact: z.string().optional(),
});

type AddPatientFormData = z.infer<typeof addPatientSchema>;
type EditPatientFormData = z.infer<typeof editPatientSchema>;

type Patient = {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  blood_group?: string;
  emergency_contact?: string;
  created_at?: string;
  users?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
};

type PatientHistory = {
  appointments: any[];
  prescriptions: any[];
  medicalRecords: any[];
  loading: boolean;
};

export const Patients: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<PatientHistory>({ appointments: [], prescriptions: [], medicalRecords: [], loading: false });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/patients/');
      setPatients(res.data);
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const name = patient.users?.full_name?.toLowerCase() || '';
    const email = patient.users?.email?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddPatient = async (data: AddPatientFormData) => {
    try {
      // Step 1: Register the user account (auto-creates patient profile row)
      await axiosInstance.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: 'patient',
      });

      // Step 2: Find the new patient profile and update with medical details if provided
      if (data.date_of_birth || data.gender || data.address) {
        // Short wait for DB to settle, then fetch and update
        await new Promise((r) => setTimeout(r, 500));
        const res = await axiosInstance.get('/patients/');
        const newPat = (res.data as any[]).find(
          (p) => p.users?.email === data.email
        );
        if (newPat) {
          const updateData: Record<string, string> = {};
          if (data.date_of_birth) updateData.date_of_birth = data.date_of_birth;
          if (data.gender) updateData.gender = data.gender;
          if (data.address) updateData.address = data.address;
          if (data.blood_group) updateData.blood_group = data.blood_group;
          if (data.emergency_contact) updateData.emergency_contact = data.emergency_contact;
          if (Object.keys(updateData).length > 0) {
            await axiosInstance.patch(`/patients/${newPat.id}`, updateData);
          }
        }
      }

      showToast('success', `Patient account created for ${data.full_name}`);
      setIsAddModalOpen(false);
      resetAdd();
      fetchPatients();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to add patient');
    }
  };

  const handleEditPatient = async (data: EditPatientFormData) => {
    if (!selectedPatient) return;
    try {
      await axiosInstance.patch(`/patients/${selectedPatient.id}`, data);
      showToast('success', 'Patient updated successfully');
      setIsEditModalOpen(false);
      setSelectedPatient(null);
      resetEdit();
      fetchPatients();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update patient');
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    try {
      await axiosInstance.delete(`/patients/${selectedPatient.id}`);
      showToast('success', 'Patient deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to delete patient');
    }
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    resetEdit({
      date_of_birth: patient.date_of_birth || '',
      gender: (patient.gender as 'male' | 'female' | 'other') || 'other',
      address: patient.address || '',
      blood_group: patient.blood_group || '',
      emergency_contact: patient.emergency_contact || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const openHistoryModal = async (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientHistory({ appointments: [], prescriptions: [], medicalRecords: [], loading: true });
    setIsHistoryModalOpen(true);
    try {
      // Fetch all data in parallel — backend filters by patient_id via admin token
      const [apptRes, presRes, medRes] = await Promise.all([
        axiosInstance.get('/appointments/'),
        axiosInstance.get('/prescriptions/'),
        axiosInstance.get('/medical-records/'),
      ]);
      // Filter by this patient's profile id
      const appts = (apptRes.data as any[]).filter((a: any) => a.patient_id === patient.id);
      const pres  = (presRes.data as any[]).filter((p: any) => p.patient_id === patient.id);
      const med   = (medRes.data as any[]).filter((m: any) => m.patient_id === patient.id);
      setPatientHistory({ appointments: appts, prescriptions: pres, medicalRecords: med, loading: false });
    } catch {
      setPatientHistory(h => ({ ...h, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Patients</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage patient records and information
          </p>
        </div>
        {user?.role !== 'doctor' && (
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or email..."
            className="flex-1"
          />
        </div>
      </Card>

      {/* Patients Table */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-text-secondary">Loading patients…</div>
        ) : paginatedPatients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No patients found"
            description="Get started by adding your first patient"
            action={
              user?.role !== 'doctor' ? (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Patient</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Gender</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Blood Group</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Emergency Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Registered</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient, index) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-primary-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient.users?.full_name || 'Patient'} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {patient.users?.full_name || '—'}
                          </p>
                          <p className="text-xs text-text-secondary">{patient.users?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" className="capitalize">
                        {patient.gender || 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-text-primary">
                        {patient.blood_group || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">
                        {patient.emergency_contact ? formatPhone(patient.emergency_contact) : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">
                        {patient.created_at ? formatDate(patient.created_at) : '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View History — available to all roles */}
                        <button
                          onClick={() => openHistoryModal(patient)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-teal bg-primary-teal/5 border border-primary-teal/20 rounded-lg hover:bg-primary-teal/10 transition-colors"
                          title="View patient history"
                        >
                          <Eye className="w-3.5 h-3.5" /> History
                        </button>
                        {/* Edit/Delete — not for doctors */}
                        {user?.role !== 'doctor' && (
                          <>
                            <button
                              onClick={() => openEditModal(patient)}
                              className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-secondary rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(patient)}
                              className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paginatedPatients.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredPatients.length)} of{' '}
              {filteredPatients.length} patients
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetAdd(); }}
        title="Add New Patient"
        size="lg"
      >
        <form onSubmit={handleSubmitAdd(handleAddPatient)} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            This creates a full patient account. The patient can log in with the email and password you set.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. John Smith"
              error={addErrors.full_name?.message}
              {...registerAdd('full_name')}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="patient@email.com"
              error={addErrors.email?.message}
              {...registerAdd('email')}
            />
          </div>
          <Input
            label="Password *"
            type="password"
            placeholder="Min 6 characters"
            error={addErrors.password?.message}
            {...registerAdd('password')}
          />

          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Medical Details (optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                error={addErrors.date_of_birth?.message}
                {...registerAdd('date_of_birth')}
              />
              <Select
                label="Gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                error={addErrors.gender?.message}
                {...registerAdd('gender')}
              />
            </div>
            <div className="mt-3">
              <Input label="Address" placeholder="123 Main St, City" error={addErrors.address?.message} {...registerAdd('address')} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Input
                label="Blood Group"
                placeholder="e.g., O+, A-, B+"
                error={addErrors.blood_group?.message}
                {...registerAdd('blood_group')}
              />
              <Input
                label="Emergency Contact"
                type="tel"
                placeholder="Phone number"
                error={addErrors.emergency_contact?.message}
                {...registerAdd('emergency_contact')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setIsAddModalOpen(false); resetAdd(); }}>
              Cancel
            </Button>
            <Button type="submit">Create Patient Account</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedPatient(null); resetEdit(); }}
        title="Edit Patient"
        size="lg"
      >
        <form onSubmit={handleSubmitEdit(handleEditPatient)} className="space-y-4">
          {selectedPatient && (
            <div className="p-3 bg-primary-secondary rounded-lg text-sm">
              <p className="font-semibold text-text-primary">{selectedPatient.users?.full_name}</p>
              <p className="text-text-secondary text-xs">{selectedPatient.users?.email}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              error={editErrors.date_of_birth?.message}
              {...registerEdit('date_of_birth')}
            />
            <Select
              label="Gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              error={editErrors.gender?.message}
              {...registerEdit('gender')}
            />
          </div>
          <Input label="Address" error={editErrors.address?.message} {...registerEdit('address')} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Blood Group"
              placeholder="e.g., O+, A-, B+"
              error={editErrors.blood_group?.message}
              {...registerEdit('blood_group')}
            />
            <Input
              label="Emergency Contact"
              type="tel"
              error={editErrors.emergency_contact?.message}
              {...registerEdit('emergency_contact')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => { setIsEditModalOpen(false); setSelectedPatient(null); resetEdit(); }}>
              Cancel
            </Button>
            <Button type="submit">Update Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedPatient(null); }}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.users?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* ── Patient History Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => { setIsHistoryModalOpen(false); setSelectedPatient(null); }}
        title="Patient History"
        size="xl"
      >
        {selectedPatient && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">

            {/* Patient profile header */}
            <div className="flex items-center gap-4 p-4 bg-primary-secondary rounded-2xl border border-border">
              <div className="w-14 h-14 bg-primary-teal text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                {(selectedPatient.users?.full_name || 'P')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-text-primary">{selectedPatient.users?.full_name || '—'}</h3>
                <p className="text-sm text-text-secondary">{selectedPatient.users?.email || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {selectedPatient.blood_group && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-semibold">{selectedPatient.blood_group}</span>
                  </div>
                )}
                {selectedPatient.gender && (
                  <div className="flex items-center gap-1.5 text-text-secondary capitalize">
                    <span className="font-semibold">{selectedPatient.gender}</span>
                  </div>
                )}
                {selectedPatient.date_of_birth && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-primary-teal" />
                    <span>{formatDate(selectedPatient.date_of_birth)}</span>
                  </div>
                )}
                {selectedPatient.emergency_contact && selectedPatient.emergency_contact !== '0000000000' && (
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Phone className="w-3.5 h-3.5 text-primary-teal" />
                    <span>{selectedPatient.emergency_contact}</span>
                  </div>
                )}
              </div>
            </div>

            {patientHistory.loading ? (
              <div className="py-12 text-center text-sm text-text-secondary">Loading patient history…</div>
            ) : (
              <>
                {/* ── Past Visits ─────────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-primary-teal" />
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Past Visits</h4>
                    <span className="text-xs bg-primary-teal/10 text-primary-teal px-2 py-0.5 rounded-full font-semibold">{patientHistory.appointments.length}</span>
                  </div>
                  {patientHistory.appointments.length === 0 ? (
                    <p className="text-sm text-text-secondary p-4 bg-primary-secondary rounded-xl text-center">No visit records found</p>
                  ) : (
                    <div className="space-y-2">
                      {patientHistory.appointments
                        .sort((a: any, b: any) => b.appointment_date.localeCompare(a.appointment_date))
                        .map((apt: any) => (
                          <motion.div key={apt.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3.5 bg-white border-2 border-border rounded-xl hover:border-primary-teal/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary-teal/10 rounded-lg">
                                <Calendar className="w-4 h-4 text-primary-teal" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-primary capitalize">{apt.appointment_type}</p>
                                <p className="text-xs text-text-secondary">
                                  {formatDate(apt.appointment_date)}
                                  {apt.doctors?.users?.full_name && ` · ${apt.doctors.users.full_name}`}
                                </p>
                                {apt.reason && <p className="text-xs text-text-secondary italic mt-0.5">"{apt.reason}"</p>}
                              </div>
                            </div>
                            <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'info'}>
                              {apt.status}
                            </Badge>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>

                {/* ── Prescriptions ─────────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary-teal" />
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Prescriptions</h4>
                    <span className="text-xs bg-primary-teal/10 text-primary-teal px-2 py-0.5 rounded-full font-semibold">{patientHistory.prescriptions.length}</span>
                  </div>
                  {patientHistory.prescriptions.length === 0 ? (
                    <p className="text-sm text-text-secondary p-4 bg-primary-secondary rounded-xl text-center">No prescriptions found</p>
                  ) : (
                    <div className="space-y-2">
                      {patientHistory.prescriptions
                        .sort((a: any, b: any) => b.prescription_date.localeCompare(a.prescription_date))
                        .map((rx: any) => (
                          <motion.div key={rx.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 bg-white border-2 border-border rounded-xl hover:border-primary-teal/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                                  <FileText className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-text-primary">{rx.diagnosis}</p>
                                  <p className="text-xs text-text-secondary">
                                    {formatDate(rx.prescription_date)}
                                    {rx.doctors?.users?.full_name && ` · ${rx.doctors.users.full_name}`}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="info">{formatDate(rx.prescription_date)}</Badge>
                            </div>
                            {rx.prescription_medications?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border">
                                {rx.prescription_medications.map((m: any, i: number) => (
                                  <span key={i} className="text-[11px] bg-primary-teal/5 text-primary-teal border border-primary-teal/15 px-2 py-0.5 rounded-full font-medium">
                                    {m.medication_name} {m.dosage}
                                  </span>
                                ))}
                              </div>
                            )}
                            {rx.notes && <p className="text-xs text-text-secondary mt-2 italic">{rx.notes}</p>}
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>

                {/* ── Medical Records ───────────────────────── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-primary-teal" />
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Medical Records</h4>
                    <span className="text-xs bg-primary-teal/10 text-primary-teal px-2 py-0.5 rounded-full font-semibold">{patientHistory.medicalRecords.length}</span>
                  </div>
                  {patientHistory.medicalRecords.length === 0 ? (
                    <p className="text-sm text-text-secondary p-4 bg-primary-secondary rounded-xl text-center">No medical records found</p>
                  ) : (
                    <div className="space-y-2">
                      {patientHistory.medicalRecords
                        .sort((a: any, b: any) => b.visit_date.localeCompare(a.visit_date))
                        .map((rec: any) => (
                          <motion.div key={rec.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            className="p-3.5 bg-white border-2 border-border rounded-xl hover:border-primary-teal/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                  <ClipboardList className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-text-primary">{rec.diagnosis}</p>
                                  <p className="text-xs text-text-secondary">
                                    {formatDate(rec.visit_date)}
                                    {rec.doctors?.users?.full_name && ` · ${rec.doctors.users.full_name}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border text-xs">
                              {rec.symptoms && (
                                <div><span className="font-semibold text-text-secondary">Symptoms: </span><span className="text-text-primary">{rec.symptoms}</span></div>
                              )}
                              {rec.treatment && (
                                <div><span className="font-semibold text-text-secondary">Treatment: </span><span className="text-text-primary">{rec.treatment}</span></div>
                              )}
                              {rec.notes && (
                                <div className="col-span-full"><span className="font-semibold text-text-secondary">Notes: </span><span className="text-text-primary italic">{rec.notes}</span></div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => { setIsHistoryModalOpen(false); setSelectedPatient(null); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
