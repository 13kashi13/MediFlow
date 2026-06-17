import React, { useState } from 'react';
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
import { formatDate, formatPhone } from '../utils/format';
import { motion } from 'framer-motion';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(5, 'Address is required'),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  bloodGroup?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt?: string;
};

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '1234567890',
    dateOfBirth: '1985-03-15',
    gender: 'male' as const,
    address: '123 Main St, New York, NY 10001',
    bloodGroup: 'O+',
    emergencyContact: '0987654321',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    phone: '2345678901',
    dateOfBirth: '1990-07-22',
    gender: 'female' as const,
    address: '456 Oak Ave, Los Angeles, CA 90001',
    bloodGroup: 'A+',
    emergencyContact: '1098765432',
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '3456789012',
    dateOfBirth: '1978-11-30',
    gender: 'male' as const,
    address: '789 Pine Rd, Chicago, IL 60601',
    bloodGroup: 'B+',
    emergencyContact: '2109876543',
    createdAt: '2024-03-05',
  },
];

export const Patients: React.FC = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddPatient = (data: PatientFormData) => {
    const newPatient = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPatients([...patients, newPatient]);
    setIsAddModalOpen(false);
    reset();
    showToast('success', 'Patient added successfully');
  };

  const handleEditPatient = (data: PatientFormData) => {
    if (!selectedPatient) return;
    setPatients(
      patients.map((p) =>
        p.id === selectedPatient.id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      )
    );
    setIsEditModalOpen(false);
    setSelectedPatient(null);
    reset();
    showToast('success', 'Patient updated successfully');
  };

  const handleDeletePatient = () => {
    if (!selectedPatient) return;
    setPatients(patients.filter((p) => p.id !== selectedPatient.id));
    setIsDeleteDialogOpen(false);
    setSelectedPatient(null);
    showToast('success', 'Patient deleted successfully');
  };

  const openEditModal = (patient: typeof mockPatients[0]) => {
    setSelectedPatient(patient);
    reset(patient);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (patient: typeof mockPatients[0]) => {
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
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or phone..."
            className="flex-1"
          />
        </div>
      </Card>

      {/* Patients Table */}
      <Card>
        {paginatedPatients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No patients found"
            description="Get started by adding your first patient"
            action={
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Patient
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Gender
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Blood Group
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Registered
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                    Actions
                  </th>
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
                        <Avatar name={patient.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {patient.name}
                          </p>
                          <p className="text-xs text-text-secondary">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">{formatPhone(patient.phone)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" className="capitalize">
                        {patient.gender}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-text-primary">
                        {patient.bloodGroup || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">
                        {formatDate(patient.createdAt)}
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
        onClose={() => {
          setIsAddModalOpen(false);
          reset();
        }}
        title="Add New Patient"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleAddPatient)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" error={errors.name?.message} {...register('name')} />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.gender?.message}
              {...register('gender')}
            />
            <Input
              label="Blood Group"
              placeholder="e.g., O+, A-, B+"
              error={errors.bloodGroup?.message}
              {...register('bloodGroup')}
            />
          </div>
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Input
            label="Emergency Contact"
            type="tel"
            error={errors.emergencyContact?.message}
            {...register('emergencyContact')}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPatient(null);
          reset();
        }}
        title="Edit Patient"
        size="lg"
      >
        <form onSubmit={handleSubmit(handleEditPatient)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" error={errors.name?.message} {...register('name')} />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Gender"
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              error={errors.gender?.message}
              {...register('gender')}
            />
            <Input
              label="Blood Group"
              placeholder="e.g., O+, A-, B+"
              error={errors.bloodGroup?.message}
              {...register('bloodGroup')}
            />
          </div>
          <Input label="Address" error={errors.address?.message} {...register('address')} />
          <Input
            label="Emergency Contact"
            type="tel"
            error={errors.emergencyContact?.message}
            {...register('emergencyContact')}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedPatient(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Update Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPatient(null);
        }}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
