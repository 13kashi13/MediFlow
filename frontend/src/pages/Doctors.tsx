import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCog } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../contexts/ToastContext';
import { formatDate, formatPhone } from '../utils/format';
import { motion } from 'framer-motion';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience: z.string().min(1, 'Experience is required'),
  consultationFee: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

type Doctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee?: number;
  rating: number;
  createdAt: string;
};

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@mediflow.com',
    phone: '1234567890',
    specialization: 'Cardiologist',
    qualification: 'MD, FACC',
    experience: 15,
    consultationFee: 150,
    rating: 4.8,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@mediflow.com',
    phone: '2345678901',
    specialization: 'Neurologist',
    qualification: 'MD, PhD',
    experience: 12,
    consultationFee: 180,
    rating: 4.9,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    email: 'emily.davis@mediflow.com',
    phone: '3456789012',
    specialization: 'Pediatrician',
    qualification: 'MD, FAAP',
    experience: 10,
    consultationFee: 120,
    rating: 4.7,
    createdAt: '2024-02-01',
  },
];

export const Doctors: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState(mockDoctors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
  });

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDoctors.length / pageSize);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddDoctor = (data: DoctorFormData) => {
    const newDoctor = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      experience: parseInt(data.experience),
      consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
      rating: 0,
      createdAt: new Date().toISOString(),
    };
    setDoctors([...doctors, newDoctor]);
    setIsAddModalOpen(false);
    reset();
    showToast('success', 'Doctor added successfully');
  };

  const handleEditDoctor = (data: DoctorFormData) => {
    if (!selectedDoctor) return;
    setDoctors(
      doctors.map((d) =>
        d.id === selectedDoctor.id
          ? {
              ...d,
              ...data,
              experience: parseInt(data.experience),
              consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
            }
          : d
      )
    );
    setIsEditModalOpen(false);
    setSelectedDoctor(null);
    reset();
    showToast('success', 'Doctor updated successfully');
  };

  const handleDeleteDoctor = () => {
    if (!selectedDoctor) return;
    setDoctors(doctors.filter((d) => d.id !== selectedDoctor.id));
    setIsDeleteDialogOpen(false);
    setSelectedDoctor(null);
    showToast('success', 'Doctor deleted successfully');
  };

  const openEditModal = (doctor: typeof mockDoctors[0]) => {
    setSelectedDoctor(doctor);
    reset({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience.toString(),
      consultationFee: doctor.consultationFee?.toString(),
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Doctors</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage doctor profiles and availability
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      <Card>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, specialization, or email..."
        />
      </Card>

      <Card>
        {paginatedDoctors.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="No doctors found"
            description="Get started by adding your first doctor"
            action={
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Doctor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Specialization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Experience
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Fee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Contact
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedDoctors.map((doctor, index) => (
                  <motion.tr
                    key={doctor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-primary-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={doctor.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{doctor.name}</p>
                          <p className="text-xs text-text-secondary">{doctor.qualification}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{doctor.specialization}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">{doctor.experience} years</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-text-primary">
                        ${doctor.consultationFee}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">{formatPhone(doctor.phone)}</p>
                      <p className="text-xs text-text-secondary">{doctor.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(doctor)}
                          className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-secondary rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setIsDeleteDialogOpen(true);
                          }}
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

        {paginatedDoctors.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredDoctors.length)} of{' '}
              {filteredDoctors.length} doctors
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedDoctor(null);
          reset();
        }}
        title={isAddModalOpen ? 'Add New Doctor' : 'Edit Doctor'}
        size="lg"
      >
        <form
          onSubmit={handleSubmit(isAddModalOpen ? handleAddDoctor : handleEditDoctor)}
          className="space-y-4"
        >
          <Input label="Full Name" error={errors.name?.message} {...register('name')} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Specialization"
              error={errors.specialization?.message}
              {...register('specialization')}
            />
            <Input
              label="Qualification"
              error={errors.qualification?.message}
              {...register('qualification')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Experience (years)"
              type="number"
              error={errors.experience?.message}
              {...register('experience')}
            />
            <Input
              label="Consultation Fee ($)"
              type="number"
              error={errors.consultationFee?.message}
              {...register('consultationFee')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedDoctor(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{isAddModalOpen ? 'Add Doctor' : 'Update Doctor'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDoctor(null);
        }}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={`Are you sure you want to delete ${selectedDoctor?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
