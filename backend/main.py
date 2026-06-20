from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import supabase, supabase_admin
from deps import get_current_user
from schemas import (
    PatientCreate, PatientUpdate,
    DoctorCreate, DoctorUpdate,
    AppointmentCreate, AppointmentStatusUpdate,
    PrescriptionCreate, MedicalRecordCreate
)
from auth import router as auth_router

app = FastAPI(title="MediFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════
# NOTIFICATION HELPERS
# ═══════════════════════════════════════════════════════

def notify(user_id: str, title: str, message: str):
    """Fire-and-forget — never raises."""
    try:
        supabase_admin.table("notifications").insert({
            "user_id": user_id,
            "title": title,
            "message": message,
            "is_read": False,
        }).execute()
    except Exception:
        pass


def notify_all_role(role: str, title: str, message: str, exclude_user_id: str = ""):
    """Send a notification to every user with the given role."""
    try:
        users = supabase_admin.table("users").select("id").eq("role", role).execute()
        for u in (users.data or []):
            if u["id"] != exclude_user_id:
                notify(u["id"], title, message)
    except Exception:
        pass


def get_patient_user_id(patient_id: str) -> str | None:
    try:
        res = supabase_admin.table("patients").select("user_id").eq("id", patient_id).execute()
        return res.data[0]["user_id"] if res.data else None
    except Exception:
        return None


def get_patient_name(patient_id: str) -> str:
    try:
        res = supabase_admin.table("patients").select("users(full_name)").eq("id", patient_id).execute()
        return res.data[0]["users"]["full_name"] if res.data else "A patient"
    except Exception:
        return "A patient"


def get_doctor_user_id(doctor_id: str) -> str | None:
    try:
        res = supabase_admin.table("doctors").select("user_id").eq("id", doctor_id).execute()
        return res.data[0]["user_id"] if res.data else None
    except Exception:
        return None


def get_doctor_name(doctor_id: str) -> str:
    try:
        res = supabase_admin.table("doctors").select("users(full_name)").eq("id", doctor_id).execute()
        return res.data[0]["users"]["full_name"] if res.data else "Your doctor"
    except Exception:
        return "Your doctor"


def format_dt(date: str, time: str = "") -> str:
    try:
        from datetime import datetime
        label = datetime.strptime(date, "%Y-%m-%d").strftime("%b %d, %Y")
        if time:
            label += f" at {datetime.strptime(time[:5], '%H:%M').strftime('%I:%M %p')}"
        return label
    except Exception:
        return f"{date} {time}".strip()


# ═══════════════════════════════════════════════════════
# PATIENT ROUTES
# ═══════════════════════════════════════════════════════
patients_router = APIRouter(prefix="/patients", tags=["Patients"])

@patients_router.post("/")
def create_patient(patient: PatientCreate, user=Depends(get_current_user)):
    data = patient.dict()
    data["user_id"] = user["id"]
    res = supabase_admin.table("patients").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create patient profile")
    return res.data[0]

@patients_router.get("/")
def get_patients(user=Depends(get_current_user)):
    if user.get("role") == "patient":
        res = supabase_admin.table("patients").select("*, users(*)").eq("user_id", user["id"]).execute()
    else:
        res = supabase_admin.table("patients").select("*, users(*)").execute()
    return res.data

@patients_router.patch("/{id}")
def update_patient(id: str, patient: PatientUpdate, user=Depends(get_current_user)):
    data = {k: v for k, v in patient.dict().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase_admin.table("patients").update(data).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return res.data[0]

@patients_router.delete("/{id}")
def delete_patient(id: str, user=Depends(get_current_user)):
    res = supabase_admin.table("patients").delete().eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return res.data[0]


# ═══════════════════════════════════════════════════════
# DOCTOR ROUTES
# ═══════════════════════════════════════════════════════
doctors_router = APIRouter(prefix="/doctors", tags=["Doctors"])

@doctors_router.post("/")
def add_doctor(doc: DoctorCreate, user=Depends(get_current_user)):
    data = doc.dict()
    data["user_id"] = user["id"]
    res = supabase_admin.table("doctors").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create doctor profile")

    # Notify admins that a new doctor profile was created
    notify_all_role(
        "admin",
        "👨‍⚕️ New Doctor Profile Created",
        f"Dr. {user.get('full_name', user.get('email', 'Unknown'))} has completed their profile "
        f"({doc.specialization}, {doc.experience} yrs experience)."
    )
    # Welcome the doctor
    notify(
        user["id"],
        "🎉 Welcome to MediFlow!",
        f"Your doctor profile has been set up successfully. "
        f"Specialization: {doc.specialization}. You will now appear in appointment bookings."
    )
    return res.data[0]

@doctors_router.get("/")
def get_doctors(user=Depends(get_current_user)):
    res = supabase_admin.table("doctors").select("*, users(*)").execute()
    return res.data

@doctors_router.patch("/{id}")
def update_doctor(id: str, doc: DoctorUpdate, user=Depends(get_current_user)):
    data = {k: v for k, v in doc.dict().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase_admin.table("doctors").update(data).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return res.data[0]

@doctors_router.delete("/{id}")
def delete_doctor(id: str, user=Depends(get_current_user)):
    res = supabase_admin.table("doctors").delete().eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return res.data[0]


# ═══════════════════════════════════════════════════════
# APPOINTMENT ROUTES
# ═══════════════════════════════════════════════════════
appointments_router = APIRouter(prefix="/appointments", tags=["Appointments"])

@appointments_router.post("/")
def create_appointment(appointment: AppointmentCreate, user=Depends(get_current_user)):
    data = {k: v for k, v in appointment.dict().items() if v is not None}
    data["status"] = "scheduled"

    # ── Server-side duplicate slot guard ─────────────────────────────
    # Reject if the same doctor already has a non-cancelled appointment
    # at the exact same date + time (first 5 chars = HH:MM)
    slot_time = data.get("appointment_time", "")[:5]
    conflict = supabase_admin.table("appointments") \
        .select("id") \
        .eq("doctor_id",        data["doctor_id"]) \
        .eq("appointment_date", data["appointment_date"]) \
        .eq("appointment_time", slot_time) \
        .neq("status",          "cancelled") \
        .execute()
    if conflict.data:
        raise HTTPException(
            status_code=409,
            detail="This time slot is already booked for the selected doctor. Please choose a different slot."
        )

    # Normalise time to HH:MM
    data["appointment_time"] = slot_time

    res = supabase_admin.table("appointments").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create appointment")

    appt = res.data[0]
    patient_user_id = get_patient_user_id(appt["patient_id"])
    patient_name    = get_patient_name(appt["patient_id"])
    doctor_user_id  = get_doctor_user_id(appt["doctor_id"])
    doctor_name     = get_doctor_name(appt["doctor_id"])
    dt = format_dt(appt["appointment_date"], appt.get("appointment_time", ""))
    apt_type = appt.get("appointment_type", "consultation").capitalize()

    # → Patient: confirmation of booking
    if patient_user_id:
        notify(
            patient_user_id,
            "📅 Appointment Requested",
            f"Your {apt_type} appointment with {doctor_name} has been requested for {dt}. "
            f"Please wait for the receptionist to confirm it."
        )

    # → Doctor: new appointment in their schedule
    if doctor_user_id:
        notify(
            doctor_user_id,
            "📋 New Appointment Scheduled",
            f"A new {apt_type} appointment has been booked with you by {patient_name} on {dt}. "
            f"Check your Today's Schedule for details."
        )

    # → All Receptionists: new request needs action
    notify_all_role(
        "receptionist",
        "🔔 New Appointment Request",
        f"{patient_name} has requested a {apt_type} appointment with {doctor_name} on {dt}. "
        f"Please accept or decline from your dashboard."
    )

    # → Admins: awareness
    notify_all_role(
        "admin",
        "📅 Appointment Booked",
        f"{patient_name} booked a {apt_type} with {doctor_name} on {dt}."
    )

    return appt


@appointments_router.get("/")
def get_appointments(user=Depends(get_current_user)):
    query = supabase_admin.table("appointments").select(
        "*, patients(*, users(*)), doctors(*, users(*))"
    )
    if user.get("role") == "patient":
        pat_res = supabase_admin.table("patients").select("id").eq("user_id", user["id"]).execute()
        if pat_res.data:
            query = query.eq("patient_id", pat_res.data[0]["id"])
        else:
            return []
    elif user.get("role") == "doctor":
        doc_res = supabase_admin.table("doctors").select("id").eq("user_id", user["id"]).execute()
        if doc_res.data:
            query = query.eq("doctor_id", doc_res.data[0]["id"])
        else:
            return []
    res = query.execute()
    return res.data


@appointments_router.patch("/{id}")
def update_status(id: str, body: AppointmentStatusUpdate, user=Depends(get_current_user)):
    existing_res = supabase_admin.table("appointments").select(
        "patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status"
    ).eq("id", id).execute()

    res = supabase_admin.table("appointments").update({"status": body.status}).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if existing_res.data:
        appt = existing_res.data[0]
        patient_user_id = get_patient_user_id(appt["patient_id"])
        patient_name    = get_patient_name(appt["patient_id"])
        doctor_user_id  = get_doctor_user_id(appt["doctor_id"])
        doctor_name     = get_doctor_name(appt["doctor_id"])
        dt = format_dt(appt["appointment_date"], appt.get("appointment_time", ""))
        apt_type = (appt.get("appointment_type") or "consultation").capitalize()
        new_status = body.status
        actor = user.get("full_name") or user.get("email", "Staff")
        actor_role = user.get("role", "")

        # ── CONFIRMED (receptionist accepted) ──────────────
        if new_status == "confirmed":
            if patient_user_id:
                notify(patient_user_id, "✅ Appointment Confirmed",
                    f"Great news! Your {apt_type} with {doctor_name} on {dt} has been confirmed. "
                    f"Please arrive 15 minutes early.")
            if doctor_user_id:
                notify(doctor_user_id, "✅ Appointment Confirmed",
                    f"{patient_name}'s {apt_type} on {dt} has been confirmed. "
                    f"They are expected in your schedule.")
            notify_all_role("admin", "✅ Appointment Confirmed",
                f"{patient_name}'s appointment with {doctor_name} on {dt} was confirmed by {actor}.")

        # ── CANCELLED ───────────────────────────────────────
        elif new_status == "cancelled":
            if patient_user_id:
                who = "the clinic" if actor_role in ("receptionist", "admin", "doctor") else "you"
                notify(patient_user_id, "❌ Appointment Cancelled",
                    f"Your {apt_type} with {doctor_name} on {dt} has been cancelled by {who}. "
                    f"Please book a new appointment if needed.")
            if doctor_user_id:
                notify(doctor_user_id, "❌ Appointment Cancelled",
                    f"{patient_name}'s {apt_type} on {dt} has been cancelled. "
                    f"Your schedule has been updated.")
            notify_all_role("receptionist", "❌ Appointment Cancelled",
                f"{patient_name}'s {apt_type} with {doctor_name} on {dt} has been cancelled.")
            notify_all_role("admin", "❌ Appointment Cancelled",
                f"{patient_name}'s {apt_type} with {doctor_name} on {dt} was cancelled by {actor}.")

        # ── COMPLETED ───────────────────────────────────────
        elif new_status == "completed":
            if patient_user_id:
                notify(patient_user_id, "🏁 Visit Completed",
                    f"Your visit with {doctor_name} on {dt} is now complete. "
                    f"Check your Prescriptions & Medical Records for any updates from your doctor.")
            notify_all_role("receptionist", "🏁 Visit Completed",
                f"{patient_name}'s visit with {doctor_name} on {dt} has been completed.")
            notify_all_role("admin", "🏁 Visit Completed",
                f"{patient_name} completed their {apt_type} with {doctor_name} on {dt}.")

        # ── NO-SHOW ─────────────────────────────────────────
        elif new_status == "no-show":
            if patient_user_id:
                notify(patient_user_id, "⚠️ Missed Appointment",
                    f"You missed your {apt_type} with {doctor_name} on {dt}. "
                    f"Please contact us to reschedule.")
            if doctor_user_id:
                notify(doctor_user_id, "⚠️ Patient No-Show",
                    f"{patient_name} did not show up for their {apt_type} on {dt}.")
            notify_all_role("admin", "⚠️ Patient No-Show",
                f"{patient_name} missed their appointment with {doctor_name} on {dt}.")

    return res.data[0]


# ═══════════════════════════════════════════════════════
# PRESCRIPTIONS ROUTES
# ═══════════════════════════════════════════════════════
prescriptions_router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@prescriptions_router.post("/")
def create_prescription(pres: PrescriptionCreate, user=Depends(get_current_user)):
    pres_data = {
        "patient_id": pres.patient_id,
        "doctor_id": pres.doctor_id,
        "diagnosis": pres.diagnosis,
        "notes": pres.notes,
        "prescription_date": pres.prescription_date
    }
    res = supabase_admin.table("prescriptions").insert(pres_data).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create prescription")

    inserted_pres = res.data[0]
    pres_id = inserted_pres["id"]

    med_results = []
    if pres.medications:
        for med in pres.medications:
            med_data = med.dict()
            med_data["prescription_id"] = pres_id
            med_res = supabase_admin.table("prescription_medications").insert(med_data).execute()
            if med_res.data:
                med_results.append(med_res.data[0])
    inserted_pres["prescription_medications"] = med_results

    patient_user_id = get_patient_user_id(pres.patient_id)
    patient_name    = get_patient_name(pres.patient_id)
    doctor_name     = get_doctor_name(pres.doctor_id)
    med_count = len(med_results)
    med_label = f"{med_count} medication{'s' if med_count != 1 else ''}"
    med_names = ", ".join(m["medication_name"] for m in med_results[:3]) if med_results else ""
    if len(med_results) > 3:
        med_names += f" +{len(med_results)-3} more"

    # → Patient
    if patient_user_id:
        notify(patient_user_id, "💊 New Prescription Issued",
            f"Dr. {doctor_name} prescribed '{pres.diagnosis}' — {med_label}"
            + (f": {med_names}." if med_names else ".") +
            f" Open your Prescriptions tab to view full details and dosage instructions.")

    # → Admins
    notify_all_role("admin", "💊 Prescription Issued",
        f"Dr. {doctor_name} issued a prescription for {patient_name} — Diagnosis: {pres.diagnosis}.")

    return inserted_pres


@prescriptions_router.get("/")
def get_prescriptions(user=Depends(get_current_user)):
    query = supabase_admin.table("prescriptions").select(
        "*, prescription_medications(*), patients(*, users(*)), doctors(*, users(*))"
    )
    if user.get("role") == "patient":
        pat_res = supabase_admin.table("patients").select("id").eq("user_id", user["id"]).execute()
        if pat_res.data:
            query = query.eq("patient_id", pat_res.data[0]["id"])
        else:
            return []
    elif user.get("role") == "doctor":
        doc_res = supabase_admin.table("doctors").select("id").eq("user_id", user["id"]).execute()
        if doc_res.data:
            query = query.eq("doctor_id", doc_res.data[0]["id"])
        else:
            return []
    res = query.execute()
    return res.data


# ═══════════════════════════════════════════════════════
# MEDICAL RECORDS ROUTES
# ═══════════════════════════════════════════════════════
medical_records_router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

@medical_records_router.post("/")
def create_medical_record(rec: MedicalRecordCreate, user=Depends(get_current_user)):
    res = supabase_admin.table("medical_records").insert(rec.dict()).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create medical record")
    record = res.data[0]

    patient_user_id = get_patient_user_id(rec.patient_id)
    patient_name    = get_patient_name(rec.patient_id)
    doctor_name     = get_doctor_name(rec.doctor_id)
    visit_date      = format_dt(rec.visit_date)

    parts = []
    if rec.diagnosis: parts.append(f"Diagnosis: {rec.diagnosis}")
    if rec.treatment: parts.append(f"Treatment: {rec.treatment}")
    detail = " | ".join(parts) if parts else ""

    # → Patient
    if patient_user_id:
        notify(patient_user_id, "📋 Medical Record Uploaded",
            f"Dr. {doctor_name} has uploaded your medical report for {visit_date}. "
            + (f"{detail}. " if detail else "") +
            f"View the full record in your Medical Records section.")

    # → Admins
    notify_all_role("admin", "📋 Medical Record Added",
        f"Dr. {doctor_name} added a medical record for {patient_name} (visit: {visit_date}).")

    return record


@medical_records_router.get("/")
def get_medical_records(user=Depends(get_current_user)):
    query = supabase_admin.table("medical_records").select(
        "*, patients(*, users(*)), doctors(*, users(*))"
    )
    if user.get("role") == "patient":
        pat_res = supabase_admin.table("patients").select("id").eq("user_id", user["id"]).execute()
        if pat_res.data:
            query = query.eq("patient_id", pat_res.data[0]["id"])
        else:
            return []
    res = query.execute()
    return res.data


# ═══════════════════════════════════════════════════════
# NOTIFICATIONS ROUTES
# ═══════════════════════════════════════════════════════
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notifications_router.get("/")
def get_notifications(user=Depends(get_current_user)):
    res = supabase_admin.table("notifications") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .order("created_at", desc=True) \
        .execute()
    return res.data

@notifications_router.patch("/{id}/read")
def mark_notification_read(id: str, user=Depends(get_current_user)):
    res = supabase_admin.table("notifications") \
        .update({"is_read": True}) \
        .eq("id", id) \
        .eq("user_id", user["id"]) \
        .execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Notification not found")
    return res.data[0]

@notifications_router.patch("/read-all")
def mark_all_read(user=Depends(get_current_user)):
    supabase_admin.table("notifications") \
        .update({"is_read": True}) \
        .eq("user_id", user["id"]) \
        .eq("is_read", False) \
        .execute()
    return {"message": "All notifications marked as read"}


# ═══════════════════════════════════════════════════════
# REGISTER ROUTERS
# ═══════════════════════════════════════════════════════
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(appointments_router)
app.include_router(prescriptions_router)
app.include_router(medical_records_router)
app.include_router(notifications_router)

@app.get("/")
def root():
    return {"message": "MediFlow API Running"}
