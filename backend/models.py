"""
This module represents the database models.
Since we are using Supabase's REST API client, we do not use an ORM like SQLAlchemy.
The actual tables are managed directly in PostgreSQL via the provided SQL script.

Table References for Supabase Client:
"""

TABLE_USERS = "users"
TABLE_DOCTORS = "doctors"
TABLE_PATIENTS = "patients"
TABLE_MEDICAL_HISTORY = "medical_history"
TABLE_DOCTOR_AVAILABILITY = "doctor_availability"
TABLE_APPOINTMENTS = "appointments"
TABLE_PRESCRIPTIONS = "prescriptions"
TABLE_MEDICATIONS = "medications"
TABLE_MEDICAL_REPORTS = "medical_reports"
TABLE_NOTIFICATIONS = "notifications"
TABLE_NOTIFICATION_QUEUE = "notification_queue"
TABLE_AUDIT_LOGS = "audit_logs"
TABLE_CLINIC_SETTINGS = "clinic_settings"

# Dashboard view
VIEW_DASHBOARD_STATS = "dashboard_stats"
