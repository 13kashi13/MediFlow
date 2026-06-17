import React, { useState } from 'react';
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
import { formatDate } from '../utils/format';
import { motion } from 'framer-motion';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  role: z.enum(['admin', 'doctor', 'receptionist', 'patient']),
});

type UserFormData = z.infer<typeof userSchema>;

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  createdAt: string;
};

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@mediflow.com',
    phone: '1234567890',
    role: 'doctor' as const,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@mediflow.com',
    phone: '2345678901',
    role: 'admin' as const,
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@mediflow.com',
    phone: '3456789012',
    role: 'receptionist' as const,
    createdAt: '2024-02-15',
  },
];

const roleColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  admin: 'danger',
  doctor: 'success',
  receptionist: 'info',
  patient: 'default',
};

export const Users: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (data: UserFormData) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    reset();
    showToast('success', 'User added successfully');
  };

  const handleEditUser = (data: UserFormData) => {
    if (!selectedUser) return;
    setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...data } : u)));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    reset();
    showToast('success', 'User updated successfully');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    showToast('success', 'User deleted successfully');
  };

  const openEditModal = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    reset(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-sm text-text-secondary mt-1">Manage system users and roles</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, or role..."
        />
      </Card>

      <Card>
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No users found"
            description="Add your first user to get started"
            action={
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Joined
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-primary-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{user.name}</p>
                          <p className="text-xs text-text-secondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleColors[user.role]} className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">{user.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-text-secondary hover:text-primary-teal hover:bg-primary-secondary rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
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
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedUser(null);
          reset();
        }}
        title={isAddModalOpen ? 'Add New User' : 'Edit User'}
      >
        <form
          onSubmit={handleSubmit(isAddModalOpen ? handleAddUser : handleEditUser)}
          className="space-y-4"
        >
          <Input label="Full Name" error={errors.name?.message} {...register('name')} />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedUser(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{isAddModalOpen ? 'Add User' : 'Update User'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
