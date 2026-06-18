import React, { useState, useEffect } from 'react';
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
import { axiosInstance } from '../lib/axios';

const doctorSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().optional(),
  experience: z.coerce.number().min(0, 'Experience is required'),
  consultation_fee: z.coerce.number().min(0, 'Consultation fee is required'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

type Doctor = {
  id: string;
  user_id: string;
  specialization: string;
  qualification?: string;
  experience: number;
  consultation_fee?: number;
  created_at?: string;
  users?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
};

export const Doctors: React.FC = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema) as any,
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/doctors/');
      setDoctors(res.data);
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.users?.full_name?.toLowerCase() || '';
    const spec = doctor.specialization?.toLowerCase() || '';
    const email = doctor.users?.email?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || spec.includes(q) || email.includes(q);
  });

  const totalPages = Math.ceil(filteredDoctors.length / pageSize);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddDoctor = async (data: DoctorFormData) => {
    try {
      await axiosInstance.post('/doctors/', data);
      showToast('success', 'Doctor added successfully');
      setIsAddModalOpen(false);
      reset();
      fetchDoctors();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to add doctor');
    }
  };

  const handleEditDoctor = async (data: DoctorFormData) => {
    if (!selectedDoctor) return;
    try {
      await axiosInstance.patch(`/doctors/${selectedDoctor.id}`, data);
      showToast('success', 'Doctor updated successfully');
      setIsEditModalOpen(false);
      setSelectedDoctor(null);
      reset();
      fetchDoctors();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    try {
      await axiosInstance.delete(`/doctors/${selectedDoctor.id}`);
      showToast('success', 'Doctor deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to delete doctor');
    }
  };

  const openEditModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    reset({
      specialization: doctor.specialization,
      qualification: doctor.qualification || '',
      experience: doctor.experience,
      consultation_fee: doctor.consultation_fee ?? 0,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Doctors</h1>
          <p className="text-sm text-text-secondary mt-1">Manage doctor profiles and availability</p>
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
        {loading ? (
          <div className="py-12 text-center text-sm text-text-secondary">Loading doctors…</div>
        ) : paginatedDoctors.length === 0 ? (
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Doctor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Specialization</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Experience</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Fee</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Contact</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">Actions</th>
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
                        <Avatar name={doctor.users?.full_name || 'Doctor'} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {doctor.users?.full_name || '—'}
                          </p>
                          <p className="text-xs text-text-secondary">{doctor.qualification || '—'}</p>
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
                        ${doctor.consultation_fee ?? '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs text-text-secondary">{doctor.users?.email || '—'}</p>
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
                          onClick={() => { setSelectedDoctor(doctor); setIsDeleteDialogOpen(true); }}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedDoctor(null); reset(); }}
        title={isAddModalOpen ? 'Add New Doctor' : 'Edit Doctor'}
        size="lg"
      >
        <form
          onSubmit={handleSubmit(isAddModalOpen ? handleAddDoctor : handleEditDoctor)}
          className="space-y-4"
        >
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
              error={errors.consultation_fee?.message}
              {...register('consultation_fee')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedDoctor(null); reset(); }}
            >
              Cancel
            </Button>
            <Button type="submit">{isAddModalOpen ? 'Add Doctor' : 'Update Doctor'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedDoctor(null); }}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={`Are you sure you want to delete ${selectedDoctor?.users?.full_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
