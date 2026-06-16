import React from 'react';
import { Users, Calendar, FileText, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const todaySchedule = [
  { id: 1, patient: 'Sarah Miller', time: '10:00 AM', status: 'Waiting', type: 'Consultation' },
  { id: 2, patient: 'James Davis', time: '11:30 AM', status: 'Confirmed', type: 'Follow-up' },
  { id: 3, patient: 'Maria Garcia', time: '02:00 PM', status: 'Confirmed', type: 'Emergency' },
  { id: 4, patient: 'David Wilson', time: '03:30 PM', status: 'Pending', type: 'Consultation' },
];

const recentPatients = [
  { id: 1, name: 'John Smith', lastVisit: '2 days ago', condition: 'Hypertension' },
  { id: 2, name: 'Emma Wilson', lastVisit: '1 week ago', condition: 'Type 2 Diabetes' },
  { id: 3, name: 'Robert Brown', lastVisit: '2 weeks ago', condition: 'Asthma' },
];

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  delay: number;
}> = ({ icon, title, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary">{value}</h3>
        </div>
        <div className="p-3 bg-primary-teal/10 rounded-lg">{icon}</div>
      </div>
    </Card>
  </motion.div>
);

export const DoctorDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Your daily schedule and patient overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-6 h-6 text-primary-teal" />}
          title="Today's Appointments"
          value="8"
          delay={0}
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-primary-teal" />}
          title="New Patients"
          value="3"
          delay={0.1}
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-primary-teal" />}
          title="Pending Prescriptions"
          value="5"
          delay={0.2}
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-primary-teal" />}
          title="Next Appointment In"
          value="15m"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/appointments" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Calendar className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">View Schedule</span>
        </Link>
        <Link to="/patients" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <Users className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Patient Records</span>
        </Link>
        <Link to="/prescriptions" className="p-4 bg-white rounded-xl border border-border hover:border-primary-teal hover:shadow-sm transition-all text-center">
          <FileText className="w-6 h-6 text-primary-teal mx-auto mb-2" />
          <span className="text-sm font-medium text-text-primary">Prescriptions</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Today's Schedule
              </h3>
              <Link to="/appointments" className="text-sm text-primary-teal hover:text-primary-dark-teal">
                View full schedule
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-sm font-medium text-text-secondary">Time</th>
                    <th className="pb-3 text-sm font-medium text-text-secondary">Patient</th>
                    <th className="pb-3 text-sm font-medium text-text-secondary">Type</th>
                    <th className="pb-3 text-sm font-medium text-text-secondary">Status</th>
                    <th className="pb-3 text-sm font-medium text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((apt) => (
                    <tr key={apt.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-sm font-medium text-text-primary">{apt.time}</td>
                      <td className="py-3 text-sm text-text-primary">{apt.patient}</td>
                      <td className="py-3 text-sm text-text-secondary">{apt.type}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                          apt.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                          apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-sm text-primary-teal hover:text-primary-dark-teal font-medium">
                          Start Visit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Recently Viewed Patients
            </h3>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="p-3 bg-primary-secondary rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-text-primary">{patient.name}</p>
                    <span className="text-xs text-text-secondary">{patient.lastVisit}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{patient.condition}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
