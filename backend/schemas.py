from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, List, Any
from datetime import date, time, datetime
from enum import Enum

class UserRole(str, Enum):
    admin = 'admin'
    doctor = 'doctor'
    receptionist = 'receptionist'
    patient = 'patient'

class GenderType(str, Enum):
    male = 'male'
    female = 'female'
    other = 'other'

class AppointmentStatus(str, Enum):
    scheduled = 'scheduled'
    confirmed = 'confirmed'
    completed = 'completed'
    cancelled = 'cancelled'
    no_show = 'no_show'

class AppointmentType(str, Enum):
    consultation = 'consultation'
    follow_up = 'follow_up'
    emergency = 'emergency'

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str
    role: UserRole = UserRole.patient

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: UUID4
    email: EmailStr
    name: str
    role: UserRole
    created_at: datetime

# --- Patient Schemas ---
class PatientCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderType] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderType] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None

class PatientResponse(PatientCreate):
    id: UUID4
    user_id: Optional[UUID4]
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

# --- Doctor Schemas ---
class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    specialization: str
    qualification: Optional[str] = None
    experience_years: Optional[int] = 0
    consultation_fee: Optional[float] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None

class DoctorResponse(DoctorCreate):
    id: UUID4
    user_id: Optional[UUID4]
    rating: Optional[float] = None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

# --- Appointment Schemas ---
class AppointmentCreate(BaseModel):
    patient_id: UUID4
    doctor_id: UUID4
    appointment_date: date
    appointment_time: time
    duration_minutes: Optional[int] = 30
    type: AppointmentType = AppointmentType.consultation
    reason: Optional[str] = None
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    type: Optional[AppointmentType] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: UUID4
    patient_id: UUID4
    doctor_id: UUID4
    appointment_date: date
    appointment_time: time
    duration_minutes: int
    status: AppointmentStatus
    type: AppointmentType
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# --- Prescription Schemas ---
class MedicineCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: UUID4
    doctor_id: UUID4
    appointment_id: Optional[UUID4] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    medicines: List[MedicineCreate]

class PrescriptionResponse(BaseModel):
    id: UUID4
    patient_id: UUID4
    doctor_id: UUID4
    appointment_id: Optional[UUID4] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# --- Analytics Schemas ---
class AnalyticsDashboardResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    appointments_today: int
