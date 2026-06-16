import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/format';
import { motion } from 'framer-motion';

const mockAuditLogs = [
  {
    id: '1',
    userId: '1',
    userName: 'Dr. Sarah Johnson',
    action: 'Created',
    resource: 'Prescription',
    details: 'Created prescription for John Smith',
    timestamp: '2026-06-16T10:30:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Admin User',
    action: 'Updated',
    resource: 'Patient',
    details: 'Updated patient record for Emma Wilson',
    timestamp: '2026-06-16T09:15:00',
    ipAddress: '192.168.1.11',
  },
  {
    id: '3',
    userId: '1',
    userName: 'Dr. Sarah Johnson',
    action: 'Deleted',
    resource: 'Appointment',
    details: 'Cancelled appointment for Michael Brown',
    timestamp: '2026-06-15T16:45:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: '4',
    userId: '3',
    userName: 'Dr. Michael Chen',
    action: 'Created',
    resource: 'Appointment',
    details: 'Scheduled appointment for Lisa Anderson',
    timestamp: '2026-06-15T14:20:00',
    ipAddress: '192.168.1.12',
  },
  {
    id: '5',
    userId: '2',
    userName: 'Admin User',
    action: 'Created',
    resource: 'Doctor',
    details: 'Added new doctor Dr. Emily Davis',
    timestamp: '2026-06-15T11:00:00',
    ipAddress: '192.168.1.11',
  },
];

const actionColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  Created: 'success',
  Updated: 'info',
  Deleted: 'danger',
  Viewed: 'default',
};

export const AuditLogs: React.FC = () => {
  const [logs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === '' || log.action === actionFilter;
    const matchesResource = resourceFilter === '' || log.resource === resourceFilter;
    return matchesSearch && matchesAction && matchesResource;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
        <p className="text-sm text-text-secondary mt-1">
          Track all system activities and changes
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by user, action, resource, or details..."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Filter by Action"
              options={[
                { value: '', label: 'All Actions' },
                { value: 'Created', label: 'Created' },
                { value: 'Updated', label: 'Updated' },
                { value: 'Deleted', label: 'Deleted' },
                { value: 'Viewed', label: 'Viewed' },
              ]}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
            <Select
              label="Filter by Resource"
              options={[
                { value: '', label: 'All Resources' },
                { value: 'Patient', label: 'Patient' },
                { value: 'Doctor', label: 'Doctor' },
                { value: 'Appointment', label: 'Appointment' },
                { value: 'Prescription', label: 'Prescription' },
              ]}
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        {paginatedLogs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No audit logs found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Resource
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Details
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-primary">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-primary-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-text-primary">{log.userName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={actionColors[log.action]}>{log.action}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">{log.resource}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary">{log.details}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-primary">
                        {formatDate(log.timestamp, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatDate(log.timestamp, 'hh:mm a')}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-text-secondary font-mono">{log.ipAddress}</p>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paginatedLogs.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
