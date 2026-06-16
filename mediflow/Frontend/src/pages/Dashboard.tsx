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
      // Fallback for unknown roles or if user is somehow null
      return <AdminDashboard />;
  }
};
