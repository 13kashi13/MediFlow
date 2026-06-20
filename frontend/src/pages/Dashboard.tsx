import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';
import { ReceptionistDashboard } from '../components/dashboard/ReceptionistDashboard';
import { PatientDashboard } from '../components/dashboard/PatientDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-semibold text-text-primary">Role not recognized</p>
          <p className="text-sm text-text-secondary mt-2">Your account role is invalid. Please contact your administrator.</p>
        </div>
      );
  }
};
