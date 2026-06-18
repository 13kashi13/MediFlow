import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { CompleteDoctorProfile } from './pages/auth/CompleteDoctorProfile';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Doctors } from './pages/Doctors';
import { Appointments } from './pages/Appointments';
import { Prescriptions } from './pages/Prescriptions';
import { Notifications } from './pages/Notifications';
import { Analytics } from './pages/Analytics';
import { AuditLogs } from './pages/AuditLogs';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/complete-doctor-profile" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <CompleteDoctorProfile />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/patients" element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                  <MainLayout><Patients /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/doctors" element={
                <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                  <MainLayout><Doctors /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <MainLayout><Appointments /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/prescriptions" element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']}>
                  <MainLayout><Prescriptions /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <MainLayout><Notifications /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout><Analytics /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/audit-logs" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout><AuditLogs /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout><Users /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout><Settings /></MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
