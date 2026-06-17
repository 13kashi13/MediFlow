from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
from uuid import UUID
import logging
from io import BytesIO
from reportlab.pdfgen import canvas
from datetime import datetime

from database import supabase, log_audit
from schemas import *
from auth import get_current_user, require_admin, require_staff, require_doctor, require_receptionist

app = FastAPI(title="MediFlow Backend API")

# Setup mock logging for notifications
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mediflow_notifications")

# --- Services ---

def send_email_notification(email: str, subject: str, body: str):
    """Mock background task for sending emails"""
    logger.info(f"Sending Email to {email} | Subject: {subject} | Body: {body}")

def generate_prescription_pdf(prescription_data: PrescriptionCreate, doctor_name: str, patient_name: str) -> BytesIO:
    """Generate PDF using ReportLab"""
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    
    p.setFont("Helvetica-Bold", 20)
    p.drawString(200, 800, "MediFlow Clinic")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 750, f"Doctor: {doctor_name}")
    p.drawString(50, 730, f"Patient: {patient_name}")
    p.drawString(50, 710, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
    
    if prescription_data.diagnosis:
        p.drawString(50, 680, f"Diagnosis: {prescription_data.diagnosis}")
        
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 640, "Prescribed Medications:")
    
    y = 610
    p.setFont("Helvetica", 12)
    for med in prescription_data.medicines:
        p.drawString(60, y, f"- {med.medicine_name} ({med.dosage}) - {med.frequency} for {med.duration}")
        if med.instructions:
            y -= 20
            p.drawString(80, y, f"Note: {med.instructions}")
        y -= 30
        
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

# --- Auth Modules ---

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    try:
        res = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed")
            
        auth_id = res.user.id
        
        user_record = {
            "id": auth_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role.value
        }
        user_res = supabase.table('users').insert(user_record).execute()
        
        # Auto-create patient/doctor profiles based on role
        if user_data.role == UserRole.doctor:
            supabase.table('doctors').insert({
                "user_id": auth_id, "name": user_data.name, "email": user_data.email, "phone": "", "specialization": "General"
            }).execute()
        elif user_data.role == UserRole.patient:
            supabase.table('patients').insert({
                "user_id": auth_id, "name": user_data.name, "email": user_data.email
            }).execute()
            
        log_audit(auth_id, user_data.name, "CREATE", "USER", str(auth_id))
        return user_res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"access_token": res.session.access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# --- Patients Module ---

@app.post("/patients", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: PatientCreate, current_user: dict = Depends(require_staff)):
    res = supabase.table('patients').insert(patient.dict(exclude_none=True)).execute()
    log_audit(current_user['id'], current_user['name'], "CREATE", "PATIENT", str(res.data[0]['id']))
    return res.data[0]

@app.get("/patients", response_model=List[PatientResponse])
async def get_patients(current_user: dict = Depends(require_staff)):
    res = supabase.table('patients').select('*').eq('is_deleted', False).execute()
    return res.data

@app.get("/patients/{id}", response_model=PatientResponse)
async def get_patient(id: UUID, current_user: dict = Depends(get_current_user)):
    # Patients can only view themselves; staff can view all
    if current_user['role'] == 'patient':
        res = supabase.table('patients').select('*').eq('id', str(id)).eq('user_id', current_user['id']).eq('is_deleted', False).execute()
        if not res.data:
            raise HTTPException(status_code=403, detail="Not authorized")
        return res.data[0]
        
    res = supabase.table('patients').select('*').eq('id', str(id)).eq('is_deleted', False).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return res.data[0]

@app.put("/patients/{id}", response_model=PatientResponse)
async def update_patient(id: UUID, patient: PatientUpdate, current_user: dict = Depends(require_staff)):
    res = supabase.table('patients').update(patient.dict(exclude_none=True)).eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    log_audit(current_user['id'], current_user['name'], "UPDATE", "PATIENT", str(id))
    return res.data[0]

@app.delete("/patients/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(id: UUID, current_user: dict = Depends(require_admin)):
    # Soft delete
    res = supabase.table('patients').update({"is_deleted": True}).eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    log_audit(current_user['id'], current_user['name'], "DELETE", "PATIENT", str(id))

# --- Doctors Module ---

@app.post("/doctors", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_doctor(doctor: DoctorCreate, current_user: dict = Depends(require_admin)):
    res = supabase.table('doctors').insert(doctor.dict(exclude_none=True)).execute()
    log_audit(current_user['id'], current_user['name'], "CREATE", "DOCTOR", str(res.data[0]['id']))
    return res.data[0]

@app.get("/doctors", response_model=List[DoctorResponse])
async def get_doctors(current_user: dict = Depends(get_current_user)):
    res = supabase.table('doctors').select('*').eq('is_deleted', False).execute()
    return res.data

@app.get("/doctors/{id}", response_model=DoctorResponse)
async def get_doctor(id: UUID, current_user: dict = Depends(get_current_user)):
    res = supabase.table('doctors').select('*').eq('id', str(id)).eq('is_deleted', False).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return res.data[0]

@app.put("/doctors/{id}", response_model=DoctorResponse)
async def update_doctor(id: UUID, doctor: DoctorUpdate, current_user: dict = Depends(require_admin)):
    res = supabase.table('doctors').update(doctor.dict(exclude_none=True)).eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    log_audit(current_user['id'], current_user['name'], "UPDATE", "DOCTOR", str(id))
    return res.data[0]

@app.delete("/doctors/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_doctor(id: UUID, current_user: dict = Depends(require_admin)):
    res = supabase.table('doctors').update({"is_deleted": True}).eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    log_audit(current_user['id'], current_user['name'], "DELETE", "DOCTOR", str(id))

# --- Appointments Module ---

@app.post("/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(appointment: AppointmentCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    # 1. Check if slot is already booked (Conflict Detection)
    conflict = supabase.table('appointments').select('id').eq('doctor_id', str(appointment.doctor_id))\
        .eq('appointment_date', str(appointment.appointment_date))\
        .eq('appointment_time', str(appointment.appointment_time))\
        .neq('status', 'cancelled').execute()
    
    if conflict.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Appointment slot already booked")

    # 2. Insert Appointment
    res = supabase.table('appointments').insert(appointment.dict(exclude_none=True)).execute()
    new_apt = res.data[0]
    
    log_audit(current_user['id'], current_user['name'], "CREATE", "APPOINTMENT", str(new_apt['id']))
    
    # 3. Fetch details for notification
    patient = supabase.table('patients').select('email').eq('id', str(appointment.patient_id)).execute()
    doctor = supabase.table('doctors').select('name').eq('id', str(appointment.doctor_id)).execute()
    
    # 4. Background notification
    if patient.data and doctor.data and patient.data[0].get('email'):
        msg = f"Your appointment with {doctor.data[0]['name']} is confirmed for {appointment.appointment_date} at {appointment.appointment_time}."
        background_tasks.add_task(send_email_notification, patient.data[0]['email'], "Appointment Confirmed", msg)
        
    return new_apt

@app.get("/appointments", response_model=List[AppointmentResponse])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'patient':
        # Get patient UUID mapping
        patient = supabase.table('patients').select('id').eq('user_id', current_user['id']).execute()
        if not patient.data:
            return []
        res = supabase.table('appointments').select('*').eq('patient_id', patient.data[0]['id']).execute()
    elif current_user['role'] == 'doctor':
        # Get doctor UUID mapping
        doctor = supabase.table('doctors').select('id').eq('user_id', current_user['id']).execute()
        if not doctor.data:
            return []
        res = supabase.table('appointments').select('*').eq('doctor_id', doctor.data[0]['id']).execute()
    else:
        # Admin / Receptionist can view all
        res = supabase.table('appointments').select('*').execute()
        
    return res.data

@app.get("/appointments/{id}", response_model=AppointmentResponse)
async def get_appointment(id: UUID, current_user: dict = Depends(get_current_user)):
    res = supabase.table('appointments').select('*').eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return res.data[0]

@app.put("/appointments/{id}", response_model=AppointmentResponse)
async def update_appointment(id: UUID, appointment: AppointmentUpdate, current_user: dict = Depends(require_staff)):
    res = supabase.table('appointments').update(appointment.dict(exclude_none=True)).eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    log_audit(current_user['id'], current_user['name'], "UPDATE", "APPOINTMENT", str(id))
    return res.data[0]

@app.delete("/appointments/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(id: UUID, current_user: dict = Depends(require_admin)):
    res = supabase.table('appointments').delete().eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    log_audit(current_user['id'], current_user['name'], "DELETE", "APPOINTMENT", str(id))

# --- Prescription Module ---

@app.post("/prescriptions", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(prescription: PrescriptionCreate, current_user: dict = Depends(require_doctor)):
    # 1. Fetch relations for PDF
    patient = supabase.table('patients').select('name').eq('id', str(prescription.patient_id)).execute()
    doctor = supabase.table('doctors').select('name').eq('id', str(prescription.doctor_id)).execute()
    
    if not patient.data or not doctor.data:
        raise HTTPException(status_code=400, detail="Invalid patient or doctor ID")
        
    # 2. Generate PDF
    pdf_buffer = generate_prescription_pdf(prescription, doctor.data[0]['name'], patient.data[0]['name'])
    
    # 3. Upload to Supabase Storage
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    file_name = f"{prescription.patient_id}_{timestamp}.pdf"
    
    try:
        supabase.storage.from_("prescriptions").upload(file_name, pdf_buffer.read(), {"content-type": "application/pdf"})
        public_url = supabase.storage.from_("prescriptions").get_public_url(file_name)
    except Exception as e:
        logger.error(f"Failed to upload PDF: {e}")
        public_url = None

    # 4. Save Prescription
    presc_data = {
        "patient_id": str(prescription.patient_id),
        "doctor_id": str(prescription.doctor_id),
        "appointment_id": str(prescription.appointment_id) if prescription.appointment_id else None,
        "diagnosis": prescription.diagnosis,
        "notes": prescription.notes,
        "pdf_url": public_url
    }
    
    res = supabase.table('prescriptions').insert(presc_data).execute()
    new_presc = res.data[0]
    
    # 5. Save Medications
    for med in prescription.medicines:
        supabase.table('medications').insert({
            "prescription_id": new_presc['id'],
            "medicine_name": med.medicine_name,
            "dosage": med.dosage,
            "frequency": med.frequency,
            "duration": med.duration,
            "instructions": med.instructions
        }).execute()

    log_audit(current_user['id'], current_user['name'], "CREATE", "PRESCRIPTION", str(new_presc['id']))
    return new_presc

@app.get("/prescriptions/{id}", response_model=PrescriptionResponse)
async def get_prescription(id: UUID, current_user: dict = Depends(get_current_user)):
    res = supabase.table('prescriptions').select('*').eq('id', str(id)).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return res.data[0]

# --- Analytics Module ---

@app.get("/analytics/dashboard", response_model=AnalyticsDashboardResponse)
async def get_analytics_dashboard(current_user: dict = Depends(require_staff)):
    # Assuming `dashboard_stats` view is created
    res = supabase.table('dashboard_stats').select('*').execute()
    if res.data:
        return res.data[0]
        
    # Fallback if view doesn't exist or returns empty
    return {
        "total_patients": 0,
        "total_doctors": 0,
        "total_appointments": 0,
        "appointments_today": 0
    }
