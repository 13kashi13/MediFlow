import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import axiosInstance from '../../lib/axios';
import { storage } from '../../utils/storage';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Invalid phone number'),
    role: z.enum(['patient', 'doctor', 'receptionist']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // 1. Register the user
      await axiosInstance.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.name,
        role: data.role,
      });

      // 2. Auto-login after registration
      const loginRes = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { access_token, user: dbUser } = loginRes.data;
      const userObj = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.full_name,
        role: dbUser.role,
        phone: data.phone,
        createdAt: dbUser.created_at || new Date().toISOString(),
      };
      login(userObj, access_token);

      // 3. Auto-create profile based on role
      if (data.role === 'patient') {
        try {
          await axiosInstance.post('/patients/', {
            date_of_birth: null,
            gender: null,
            address: '',
            blood_group: null,
            emergency_contact: null,
          });
        } catch {
          // Profile may already exist or will be created later
        }
        showToast('success', 'Account created! Complete your profile in Settings.');
        navigate('/dashboard');
      } else if (data.role === 'doctor') {
        // Redirect doctor to complete their profile first
        showToast('success', 'Account created! Please complete your doctor profile.');
        navigate('/complete-doctor-profile');
      } else {
        showToast('success', 'Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Registration failed. Please try again.';
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
            <h1 className="text-2xl font-bold text-primary-teal mb-2">MEDIFLOW</h1>
            <p className="text-sm text-text-secondary">
              Create your healthcare account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="(123) 456-7890"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select
              label="Role"
              options={[
                { value: 'patient', label: 'Patient' },
                { value: 'doctor', label: 'Doctor' },
                { value: 'receptionist', label: 'Receptionist' },
              ]}
              error={errors.role?.message}
              {...register('role')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-teal hover:text-primary-dark-teal font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
