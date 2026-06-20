import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { axiosInstance } from '../../lib/axios';
import { Stethoscope } from 'lucide-react';

const doctorProfileSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience: z.coerce.number().min(0).max(70),
  consultation_fee: z.coerce.number().min(0),
});

type DoctorProfileFormData = z.infer<typeof doctorProfileSchema>;

export const CompleteDoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorProfileFormData>({
    resolver: zodResolver(doctorProfileSchema) as any,
    defaultValues: {
      specialization: '',
      qualification: '',
      experience: 0,
      consultation_fee: 0,
    },
  });

  const onSubmit = async (data: DoctorProfileFormData) => {
    setIsLoading(true);
    try {
      // Find existing placeholder doctor profile and update it (PATCH),
      // rather than creating a duplicate (POST)
      const docRes = await axiosInstance.get('/doctors/');
      const myProfile = (docRes.data as any[]).find(
        (d) => d.user_id === user?.id || d.users?.id === user?.id
      );
      if (myProfile) {
        await axiosInstance.patch(`/doctors/${myProfile.id}`, data);
      } else {
        await axiosInstance.post('/doctors/', data);
      }
      showToast('success', 'Doctor profile updated! Welcome to MediFlow.');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to update doctor profile.';
      showToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-7 h-7 text-primary-teal" />
            </div>
            <h1 className="text-2xl font-bold text-primary-teal mb-1">Complete Your Profile</h1>
            <p className="text-sm text-text-secondary">
              Welcome, {user?.name || 'Doctor'}! Fill in your professional details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Specialization"
              placeholder="e.g. Cardiology, Neurology"
              error={errors.specialization?.message}
              {...register('specialization')}
            />
            <Input
              label="Qualification"
              placeholder="e.g. MBBS, MD, MS"
              error={errors.qualification?.message}
              {...register('qualification')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Years of Experience"
                type="number"
                min={0}
                placeholder="e.g. 5"
                error={errors.experience?.message}
                {...register('experience')}
              />
              <Input
                label="Consultation Fee ($)"
                type="number"
                min={0}
                placeholder="e.g. 150"
                error={errors.consultation_fee?.message}
                {...register('consultation_fee')}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Save & Go to Dashboard
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
