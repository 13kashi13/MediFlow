from pydantic import BaseModel
from typing import Optional, List

# AUTH
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

# PATIENT
class PatientCreate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientUpdate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None

# DOCTOR
class DoctorCreate(BaseModel):
    specialization: str
    qualification: Optional[str] = None
    experience: int
    consultation_fee: float

class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[float] = None

# APPOINTMENT
class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: str
    appointment_time: str
    duration: Optional[int] = 30
    appointment_type: Optional[str] = "consultation"
    reason: Optional[str] = None

# PRESCRIPTION & MEDICATION
class MedicationCreate(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionCreate(BaseModel):
    patient_id: str
    doctor_id: str
    diagnosis: str
    notes: Optional[str] = None
    prescription_date: str
    medications: Optional[List[MedicationCreate]] = None

# APPOINTMENT STATUS UPDATE
class AppointmentStatusUpdate(BaseModel):
    status: str

# MEDICAL RECORD
class MedicalRecordCreate(BaseModel):
    patient_id: str
    doctor_id: str
    diagnosis: str
    symptoms: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None
    visit_date: str
