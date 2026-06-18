import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
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

export const Patients: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
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
    </div>
  );
};
