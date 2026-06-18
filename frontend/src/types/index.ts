// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  phone?: string;
  avatar?: string;
  createdAt: string;
  qualification?: string;
}

// Patient Types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  bloodGroup?: string;
  emergencyContact?: string;
  avatar?: string;
  medicalHistory?: MedicalHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  diagnosis: string;
  treatment: string;
  date: string;
  doctorId: string;
  notes?: string;
}

// Doctor Types
export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  avatar?: string;
  availability?: DoctorAvailability[];
  consultationFee?: number;
  rating?: number;
  createdAt: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'emergency';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentConflict {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
  alternativeSlots?: { date: string; time: string }[];
}

// Prescription Types
export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'prescription' | 'system' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Analytics Types
export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  upcomingAppointments: number;
  patientGrowth: number;
  doctorGrowth: number;
  appointmentGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
  label?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

// Settings Types
export interface ClinicSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  workingHours: WorkingHours;
  timezone: string;
}

export interface WorkingHours {
  monday: { start: string; end: string; isOpen: boolean };
  tuesday: { start: string; end: string; isOpen: boolean };
  wednesday: { start: string; end: string; isOpen: boolean };
  thursday: { start: string; end: string; isOpen: boolean };
  friday: { start: string; end: string; isOpen: boolean };
  saturday: { start: string; end: string; isOpen: boolean };
  sunday: { start: string; end: string; isOpen: boolean };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'doctor' | 'receptionist';
  phone: string;
}

export interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  reason?: string;
}

export interface PrescriptionFormData {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
}
