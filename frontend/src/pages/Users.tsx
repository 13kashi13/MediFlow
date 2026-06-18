import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UsersRound } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
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
import { formatDate } from '../utils/format';
import { motion } from 'framer-motion';
import { axiosInstance } from '../lib/axios';

const userSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'doctor', 'receptionist', 'patient']),
});

type UserFormData = z.infer<typeof userSchema>;

type SystemUser = {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  created_at?: string;
};

const roleColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  admin: 'danger',
  doctor: 'success',
  receptionist: 'info',
  patient: 'default',
};

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from all role-based tables
      const [patRes, docRes] = await Promise.all([
        axiosInstance.get('/patients/'),
        axiosInstance.get('/doctors/'),
      ]);

      const patientUsers: SystemUser[] = (patRes.data as any[]).map((p: any) => ({
        id: p.users?.id || p.user_id,
        full_name: p.users?.full_name || '—',
        email: p.users?.email || '—',
        role: 'patient' as const,
        created_at: p.created_at,
      }));

      const doctorUsers: SystemUser[] = (docRes.data as any[]).map((d: any) => ({
        id: d.users?.id || d.user_id,
        full_name: d.users?.full_name || '—',
        email: d.users?.email || '—',
        role: 'doctor' as const,
        created_at: d.created_at,
      }));

      // Add current user (admin) if not already listed
      const allUsers: SystemUser[] = [...doctorUsers, ...patientUsers];
      if (
        currentUser &&
        !allUsers.find((u) => u.id === currentUser.id)
      ) {
        allUsers.unshift({
          id: currentUser.id,
          full_name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role as SystemUser['role'],
          created_at: currentUser.createdAt,
        });
      }

      setUsers(allUsers);
    } catch (err: any) {
      showToast('error', err?.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    // Role changes via admin would need a backend endpoint — show info for now
    showToast('info', 'User role updates require backend admin access. Contact your system administrator.');
    setIsEditModalOpen(false);
    setSelectedUser(null);
    reset();
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    showToast('info', 'User deletion requires admin backend access. Please use Supabase dashboard to remove users.');
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const openEditModal = (user: SystemUser) => {
    setSelectedUser(user);
    reset({ full_name: user.full_name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-secondary mt-1">View and manage system users and roles</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, or role..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'doctor', label: 'Doctors' },
              { id: 'receptionist', label: 'Receptionists' },
              { id: 'patient', label: 'Patients' },
              { id: 'admin', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  roleFilter === tab.id
                    ? 'bg-primary-teal text-white shadow-sm'
                    : 'bg-primary-secondary text-text-secondary hover:text-text-primary hover:bg-border/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-text-secondary">Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No users found"
            description="No users match your current filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-primary-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.full_name} size="sm" />
                        <p className="text-sm font-medium text-text-primary">{user.full_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleColors[user.role]} className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">{user.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">
                        {user.created_at ? formatDate(user.created_at) : '—'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-secondary rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}
                          className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
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
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); reset(); }}
        title="Edit User"
      >
        <form onSubmit={handleSubmit(handleEditUser)} className="space-y-4">
          <Input label="Full Name" error={errors.full_name?.message} {...register('full_name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Select
            label="Role"
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'doctor', label: 'Doctor' },
              { value: 'receptionist', label: 'Receptionist' },
              { value: 'patient', label: 'Patient' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />
          <p className="text-xs text-text-secondary bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            Note: Role changes require admin backend access via the Supabase dashboard.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); reset(); }}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedUser(null); }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Deleting ${selectedUser?.full_name} requires admin access. This will open a note about how to proceed.`}
        confirmText="Understood"
        variant="danger"
      />
    </div>
  );
};
