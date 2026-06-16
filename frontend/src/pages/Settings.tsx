import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const clinicSchema = z.object({
  name: z.string().min(2, 'Clinic name is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type ClinicFormData = z.infer<typeof clinicSchema>;

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const {
    register: registerClinic,
    handleSubmit: handleSubmitClinic,
    formState: { errors: clinicErrors },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: 'MEDIFLOW Clinic',
      address: '123 Healthcare Ave, Medical District, NY 10001',
      phone: '1234567890',
      email: 'contact@mediflow.com',
    },
  });

  const handleProfileUpdate = (data: ProfileFormData) => {
    showToast('success', 'Profile updated successfully');
  };

  const handlePasswordChange = (data: PasswordFormData) => {
    showToast('success', 'Password changed successfully');
    resetPassword();
  };

  const handleClinicUpdate = (data: ClinicFormData) => {
    showToast('success', 'Clinic information updated successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
    { id: 'password', label: 'Change Password', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
    { id: 'clinic', label: 'Clinic Information', roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(user?.role || ''));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your preferences and settings</p>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex gap-2 border-b border-border pb-4">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-teal text-white'
                  : 'text-text-secondary hover:bg-primary-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h3>
          <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-4">
            <Input
              label="Full Name"
              error={profileErrors.name?.message}
              {...registerProfile('name')}
            />
            <Input
              label="Email"
              type="email"
              error={profileErrors.email?.message}
              {...registerProfile('email')}
            />
            <Input
              label="Phone"
              type="tel"
              error={profileErrors.phone?.message}
              {...registerProfile('phone')}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Change Password */}
      {activeTab === 'password' && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Change Password</h3>
          <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Clinic Information */}
      {activeTab === 'clinic' && user?.role === 'admin' && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Clinic Information</h3>
          <form onSubmit={handleSubmitClinic(handleClinicUpdate)} className="space-y-4">
            <Input
              label="Clinic Name"
              error={clinicErrors.name?.message}
              {...registerClinic('name')}
            />
            <Textarea
              label="Address"
              error={clinicErrors.address?.message}
              {...registerClinic('address')}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                error={clinicErrors.phone?.message}
                {...registerClinic('phone')}
              />
              <Input
                label="Email"
                type="email"
                error={clinicErrors.email?.message}
                {...registerClinic('email')}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-teal border-border rounded focus:ring-2 focus:ring-primary-teal"
            />
            <span className="text-sm text-text-primary">Email notifications for appointments</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-teal border-border rounded focus:ring-2 focus:ring-primary-teal"
            />
            <span className="text-sm text-text-primary">Email notifications for prescriptions</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-teal border-border rounded focus:ring-2 focus:ring-primary-teal"
            />
            <span className="text-sm text-text-primary">SMS notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-primary-teal border-border rounded focus:ring-2 focus:ring-primary-teal"
            />
            <span className="text-sm text-text-primary">System updates and announcements</span>
          </label>
        </div>
        <div className="flex justify-end pt-6">
          <Button onClick={() => showToast('success', 'Notification preferences saved')}>
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};
