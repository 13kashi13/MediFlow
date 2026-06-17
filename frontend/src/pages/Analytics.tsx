import React from 'react';
import { Card } from '../components/ui/Card';
import { TrendingUp, TrendingDown, Users, UserCog, Calendar, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const patientGrowthData = [
  { month: 'Jan', patients: 340, growth: 12 },
  { month: 'Feb', patients: 398, growth: 17 },
  { month: 'Mar', patients: 456, growth: 15 },
  { month: 'Apr', patients: 502, growth: 10 },
  { month: 'May', patients: 578, growth: 15 },
  { month: 'Jun', patients: 634, growth: 10 },
];

const appointmentTypeData = [
  { name: 'Consultation', value: 145 },
  { name: 'Follow-up', value: 89 },
  { name: 'Emergency', value: 23 },
];

const doctorWorkloadData = [
  { doctor: 'Dr. Johnson', appointments: 42 },
  { doctor: 'Dr. Chen', appointments: 38 },
  { doctor: 'Dr. Davis', appointments: 35 },
  { doctor: 'Dr. Wilson', appointments: 29 },
  { doctor: 'Dr. Brown', appointments: 25 },
];

const revenueData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 14200 },
  { month: 'Mar', revenue: 15800 },
  { month: 'Apr', revenue: 16500 },
  { month: 'May', revenue: 18900 },
  { month: 'Jun', revenue: 21300 },
];

const COLORS = ['#2FA084', '#6FCF97', '#F59E0B'];

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
}> = ({ icon, title, value, trend, trendLabel }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-text-secondary mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mb-2">{value}</h3>
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-danger" />
          )}
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-text-secondary">{trendLabel}</span>
        </div>
      </div>
      <div className="p-3 bg-primary-teal/10 rounded-lg">{icon}</div>
    </div>
  </Card>
);

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">
          Comprehensive analytics and insights
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-primary-teal" />}
          title="Total Patients"
          value="634"
          trend={10}
          trendLabel="vs last month"
        />
        <StatCard
          icon={<UserCog className="w-6 h-6 text-primary-teal" />}
          title="Active Doctors"
          value="24"
          trend={8}
          trendLabel="vs last month"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-primary-teal" />}
          title="Appointments"
          value="257"
          trend={15}
          trendLabel="this month"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-primary-teal" />}
          title="Revenue"
          value="$21,300"
          trend={12}
          trendLabel="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Growth */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Patient Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="patients"
                stroke="#2FA084"
                strokeWidth={3}
                dot={{ fill: '#2FA084', r: 4 }}
                name="Total Patients"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Appointment Types */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Appointments by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appointmentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {appointmentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Doctor Workload */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Doctor Workload (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doctorWorkloadData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis
                type="category"
                dataKey="doctor"
                tick={{ fontSize: 12 }}
                stroke="#64748B"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="appointments" fill="#6FCF97" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748B" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="revenue" fill="#2FA084" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Average Wait Time</h4>
          <p className="text-3xl font-bold text-text-primary">18 min</p>
          <p className="text-sm text-success mt-2">-5 min from last month</p>
        </Card>
        <Card>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Patient Satisfaction</h4>
          <p className="text-3xl font-bold text-text-primary">4.8/5.0</p>
          <p className="text-sm text-success mt-2">+0.2 from last month</p>
        </Card>
        <Card>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Appointment Show Rate</h4>
          <p className="text-3xl font-bold text-text-primary">94%</p>
          <p className="text-sm text-success mt-2">+3% from last month</p>
        </Card>
      </div>
    </div>
  );
};
