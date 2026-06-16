import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Mock authentication - Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Determine mock role based on email prefix
      let role: 'admin' | 'doctor' | 'receptionist' | 'patient' = 'admin';
      let name = 'Dr. Sarah Johnson';

      if (data.email.startsWith('doctor')) {
        role = 'doctor';
        name = 'Dr. Michael Chen';
      } else if (data.email.startsWith('receptionist')) {
        role = 'receptionist';
        name = 'Jane Smith';
      } else if (data.email.startsWith('patient')) {
        role = 'patient';
        name = 'Robert Brown';
      }

      const mockUser = {
        id: '1',
        email: data.email,
        name: name,
        role: role,
        createdAt: new Date().toISOString(),
      };
      
      const mockToken = 'mock-jwt-token';
      
      login(mockUser, mockToken);
      showToast('success', 'Login successful!');
      navigate('/dashboard');
    } catch (error) {
      showToast('error', 'Login failed. Please check your credentials.');
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
              Sign in to your healthcare account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-primary-teal border-border rounded focus:ring-2 focus:ring-primary-teal" />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-teal hover:text-primary-dark-teal"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-teal hover:text-primary-dark-teal font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-primary-secondary rounded-lg">
            <p className="text-xs font-semibold text-text-primary mb-2">Demo Accounts (Password: password123):</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-xs text-text-secondary">• admin@...</p>
              <p className="text-xs text-text-secondary">• doctor@...</p>
              <p className="text-xs text-text-secondary">• receptionist@...</p>
              <p className="text-xs text-text-secondary">• patient@...</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
