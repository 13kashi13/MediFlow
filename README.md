<div align="center">

# ⚡ MediFlow

### Healthcare Management Platform

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

*A real-time, role-based healthcare management system connecting patients, doctors, receptionists, and admins — from booking appointments to issuing prescriptions.*

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [API](#-api-endpoints) • [Notifications](#-notification-system)

</div>

---

## 📖 About

**MediFlow** is a full-stack healthcare platform built to streamline clinic operations. It brings four distinct roles — **Patient**, **Doctor**, **Receptionist**, and **Admin** — into one unified, real-time system.

A patient books an appointment → the receptionist sees it instantly and accepts or declines → the doctor views their live schedule → conducts the visit, writes a prescription, and uploads the medical report → the patient gets notified at every step. Everything happens in real time with no page refreshes needed.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧑 Patient Portal
- Book appointments with any doctor
- Confirm or cancel upcoming visits
- View all prescriptions with medication details
- Access complete medical records
- Real-time notifications for every update

</td>
<td width="50%">

### 👨‍⚕️ Doctor Dashboard
- Live today's schedule (auto-refreshes)
- Mark visits as done with one click
- Write prescriptions with multi-medication support
- Upload detailed medical reports
- Notified instantly on new bookings

</td>
</tr>
<tr>
<td width="50%">

### 🗂️ Receptionist Dashboard
- Accept or decline appointment requests
- Manage waiting room (check patients in/out)
- View all upcoming arrivals for the day
- Book appointments on behalf of patients
- Register new patient accounts

</td>
<td width="50%">

### 🔑 Admin Dashboard
- Live stats — patients, doctors, appointments
- Today's breakdown: pending / confirmed / completed / cancelled
- Manage all doctors and patients
- Full appointments overview with status filters
- Monthly analytics charts
- Audit logs and user management

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### 1. Clone

```bash
git clone https://github.com/your-username/mediflow.git
cd mediflow
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=any_random_secret_string
JWT_ALGORITHM=HS256
```

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### 4. Run on local network

```bash
# frontend
npm run dev -- --host --port 5173

# update frontend/.env
VITE_API_URL=http://<your-ip>:8000
```

---

## 🔐 Authentication

- Custom JWT auth — **7-day tokens**, bcrypt passwords
- No email confirmation required — login works instantly after signup
- Role-based access control on every route

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| 🔑 Admin | `admin@mediflow.com` | `Admin@123456` |
| 👨‍⚕️ Doctor | `doctor@mediflow.com` | `Doctor@123456` |
| 🗂️ Receptionist | `receptionist@mediflow.com` | `Recep@123456` |
| 🧑 Patient | `chavanvedika111@gmail.com` | `Patient@123456` |

---

## 🛠️ Tech Stack

### Frontend
| | Technology |
|---|---|
| UI Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion 12 |
| Charts | Recharts 3 |
| HTTP | Axios |
| State | React Context + useState |

### Backend
| | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT (python-jose) |
| Passwords | bcrypt |
| Validation | Pydantic |

---

## 🔔 Notification System

Every action sends real-time in-app notifications to all relevant roles. Dashboards auto-refresh every **20 seconds**.

| Event | 🧑 Patient | 👨‍⚕️ Doctor | 🗂️ Receptionist | 🔑 Admin |
|-------|:---:|:---:|:---:|:---:|
| New signup | ✅ welcome | ✅ welcome | ✅ welcome | ✅ |
| Appointment booked | ✅ | ✅ | ✅ needs action | ✅ |
| Appointment confirmed | ✅ | ✅ | — | ✅ |
| Appointment cancelled | ✅ | ✅ | ✅ | ✅ |
| Visit completed | ✅ | — | ✅ | ✅ |
| Prescription issued | ✅ med details | — | — | ✅ |
| Medical report uploaded | ✅ full record | — | — | ✅ |
| Patient no-show | ✅ | ✅ | — | ✅ |

---

## 🚦 Appointment Flow

```
Patient books
      │
  [scheduled] ──────────────────────────────┐
      │                                      │
 Receptionist                           Receptionist
   accepts                               declines
      │                                      │
 [confirmed]                           [cancelled]
   Patient in Waiting Room
      │
  Doctor visits
      │
  ┌───┴────────────────────┐
Done (no Rx)          Prescribe
      │                    │
 [completed]       Save Prescription
                    + Upload Report
                           │
               Patient notified instantly
```

---

## 📁 Project Structure

```
finalMediFlow/
├── backend/
│   ├── main.py           # Routes + notification logic
│   ├── auth.py           # Register / login / profile
│   ├── deps.py           # JWT middleware
│   ├── jwt_handler.py    # Token create / verify
│   ├── database.py       # Supabase clients
│   ├── schemas.py        # Pydantic models
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── dashboard/    # Role dashboards
        │   ├── layout/       # Navbar, Sidebar
        │   └── ui/           # Button, Card, Modal, Input…
        ├── contexts/         # Auth, Toast
        ├── pages/            # All route pages
        ├── lib/axios.ts      # Axios + interceptors
        └── utils/
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login → JWT |
| PATCH | `/auth/profile` | Update name / phone |
| POST | `/auth/change-password` | Change password |
| GET · POST | `/patients/` | List / create patient profiles |
| PATCH · DELETE | `/patients/{id}` | Update / delete |
| GET · POST | `/doctors/` | List / create doctor profiles |
| PATCH · DELETE | `/doctors/{id}` | Update / delete |
| GET · POST | `/appointments/` | List / book |
| PATCH | `/appointments/{id}` | Update status |
| GET · POST | `/prescriptions/` | List / create |
| GET · POST | `/medical-records/` | List / upload |
| GET | `/notifications/` | User notifications |
| PATCH | `/notifications/{id}/read` | Mark read |
| PATCH | `/notifications/read-all` | Mark all read |

Full interactive docs → **http://localhost:8000/docs**

---

## 🗂️ Database Schema

| Table | Purpose |
|-------|---------|
| `users` | All users — email, role, password hash |
| `patients` | Medical profiles linked to users |
| `doctors` | Professional profiles linked to users |
| `appointments` | Bookings with full status lifecycle |
| `prescriptions` | Prescription headers |
| `prescription_medications` | Medications per prescription |
| `medical_records` | Doctor-uploaded visit reports |
| `notifications` | Per-user in-app notifications |

---

## � License

MIT — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ using [FastAPI](https://fastapi.tiangolo.com/) · [React](https://react.dev/) · [Supabase](https://supabase.com/) · [Tailwind CSS](https://tailwindcss.com/)

</div>
