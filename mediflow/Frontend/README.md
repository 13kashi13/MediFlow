# MEDIFLOW - Healthcare Management Platform

A professional healthcare management platform built with React, TypeScript, and modern web technologies.

## Features

- **Authentication**: Secure JWT-based authentication with role-based access control
- **Dashboard**: Real-time analytics and insights
- **Patient Management**: Complete CRUD operations for patient records
- **Doctor Management**: Manage doctor profiles and availability
- **Appointment System**: Book, manage, and track appointments with conflict detection
- **Prescription Management**: Create, view, and download prescriptions
- **Notifications**: Real-time notification center
- **Analytics**: Comprehensive charts and performance metrics
- **Audit Logs**: Track all system activities (Admin only)
- **User Management**: Manage users and roles (Admin only)
- **Settings**: Profile and system configuration

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Backend Integration**: FastAPI + Supabase

## Project Structure

```
mediflow/
├── src/
│   ├── components/
│   │   ├── layout/           # Layout components (Sidebar, Navbar, MainLayout)
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React contexts (Auth, Toast)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Third-party library configurations
│   ├── pages/                # Page components
│   ├── routes/               # Route configuration and guards
│   ├── services/             # API service layer
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main app component
│   └── main.tsx              # App entry point
├── public/                   # Static assets
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (FastAPI)
- Supabase account (optional)

### Installation

1. Clone the repository
```bash
cd mediflow
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your API and Supabase credentials:
```
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## User Roles

### Admin
- Full access to all features
- User management
- Analytics and reporting
- Audit logs
- System settings

### Doctor
- View/manage assigned patients
- Manage appointments
- Create/view prescriptions
- Personal dashboard

### Receptionist
- Patient management
- Appointment scheduling
- Doctor management (view only)

### Patient
- View personal appointments
- View prescriptions
- Update profile

## Default Credentials

For testing purposes, use these credentials:

```
Email: admin@mediflow.com
Password: password123
```

## Color Palette

- Primary Background: #FFFFFF
- Secondary Background: #EEEEEE
- Primary Green: #6FCF97
- Primary Teal: #2FA084
- Dark Teal: #1F6F5F
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border: #E5E7EB
- Success: #6FCF97
- Warning: #F59E0B
- Danger: #EF4444

## Key Features Implementation

### Authentication
- JWT-based authentication
- Protected routes with role-based access
- Persistent sessions with localStorage
- Automatic token refresh

### Patient Management
- Add, edit, delete patients
- Search and filter functionality
- Pagination support
- Patient profile with medical history

### Appointments
- Calendar view (day/week/month)
- Conflict detection with alternative slots
- Status management (scheduled, confirmed, completed, cancelled)
- Real-time updates

### Prescriptions
- Multi-medication support
- PDF download capability
- Prescription history
- Doctor and patient association

### Analytics
- Patient growth trends
- Appointment statistics
- Doctor workload analysis
- Revenue tracking

## Contributing

This is a production-ready template. Feel free to customize it according to your needs.

## License

MIT License

## Support

For support, email support@mediflow.com
