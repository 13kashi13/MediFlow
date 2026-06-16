import React, { useState } from 'react';
import { Plus, Download, Eye, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../utils/format';
import { motion } from 'framer-motion';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  notes: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

const mockPrescriptions = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    diagnosis: 'Hypertension',
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning',
      },
    ],
    notes: 'Monitor blood pressure regularly',
    date: '2026-06-15',
    createdAt: '2026-06-15',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Emma Wilson',
    doctorId: '2',
    doctorName: 'Dr. Michael Chen',
    diagnosis: 'Migraine',
    medications: [
      {
        name: 'Sumatriptan',
        dosage: '50mg',
        frequency: 'As needed',
        duration: '30 days',
        instructions: 'Take at onset of symptoms',
      },
    ],
    notes: 'Avoid triggers',
    date: '2026-06-14',
    createdAt: '2026-06-14',
  },
];

export const Prescriptions: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<typeof mockPrescriptions[0] | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPrescription = (data: PrescriptionFormData) => {
    const newPrescription = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      patientName: 'Patient Name',
      doctorName: 'Doctor Name',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPrescriptions([newPrescription, ...prescriptions]);
    setIsAddModalOpen(false);
    reset();
    showToast('success', 'Prescription created successfully');
  };

  const handleDownloadPDF = (prescription: typeof mockPrescriptions[0]) => {
    showToast('info', 'PDF download functionality will be implemented with backend');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Prescriptions</h1>
          <p className="text-sm text-text-secondary mt-1">Manage medical prescriptions</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Prescription
        </Button>
      </div>

      <Card>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by patient, doctor, or diagnosis..."
        />
      </Card>

      {filteredPrescriptions.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No prescriptions found"
            description="Create your first prescription"
            action={
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Prescription
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPrescriptions.map((prescription, index) => (
            <motion.div
              key={prescription.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">
                          {prescription.patientName}
                        </h3>
                        <p className="text-sm text-text-secondary">{prescription.doctorName}</p>
                      </div>
                      <Badge variant="info">{formatDate(prescription.date)}</Badge>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-text-secondary mb-1">Diagnosis:</p>
                      <p className="text-sm font-medium text-text-primary">{prescription.diagnosis}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-text-secondary mb-2">Medications:</p>
                      <div className="space-y-2">
                        {prescription.medications.map((med, idx) => (
                          <div key={idx} className="p-3 bg-primary-secondary rounded-lg">
                            <p className="text-sm font-medium text-text-primary">{med.name}</p>
                            <p className="text-xs text-text-secondary mt-1">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {prescription.notes && (
                      <div>
                        <p className="text-sm text-text-secondary mb-1">Notes:</p>
                        <p className="text-sm text-text-primary">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadPDF(prescription)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Prescription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          reset();
        }}
        title="Create Prescription"
        size="xl"
      >
        <form onSubmit={handleSubmit(handleAddPrescription)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Patient"
              options={[
                { value: '1', label: 'John Smith' },
                { value: '2', label: 'Emma Wilson' },
                { value: '3', label: 'Michael Brown' },
              ]}
              error={errors.patientId?.message}
              {...register('patientId')}
            />
            <Select
              label="Doctor"
              options={[
                { value: '1', label: 'Dr. Sarah Johnson' },
                { value: '2', label: 'Dr. Michael Chen' },
                { value: '3', label: 'Dr. Emily Davis' },
              ]}
              error={errors.doctorId?.message}
              {...register('doctorId')}
            />
          </div>

          <Input
            label="Diagnosis"
            error={errors.diagnosis?.message}
            {...register('diagnosis')}
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">Medications</label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Medication
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-text-primary">
                      Medication {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Input
                      label="Medication Name"
                      error={errors.medications?.[index]?.name?.message}
                      {...register(`medications.${index}.name`)}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Dosage"
                        placeholder="e.g., 10mg"
                        error={errors.medications?.[index]?.dosage?.message}
                        {...register(`medications.${index}.dosage`)}
                      />
                      <Input
                        label="Frequency"
                        placeholder="e.g., Twice daily"
                        error={errors.medications?.[index]?.frequency?.message}
                        {...register(`medications.${index}.frequency`)}
                      />
                      <Input
                        label="Duration"
                        placeholder="e.g., 30 days"
                        error={errors.medications?.[index]?.duration?.message}
                        {...register(`medications.${index}.duration`)}
                      />
                    </div>
                    <Input
                      label="Instructions (Optional)"
                      placeholder="e.g., Take with food"
                      error={errors.medications?.[index]?.instructions?.message}
                      {...register(`medications.${index}.instructions`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="Additional Notes (Optional)"
            error={errors.notes?.message}
            {...register('notes')}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAddModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Prescription</Button>
          </div>
        </form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPrescription(null);
        }}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <div className="space-y-4">
            <div className="p-4 bg-primary-secondary rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Patient</p>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedPrescription.patientName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Doctor</p>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedPrescription.doctorName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Date</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(selectedPrescription.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Diagnosis</p>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedPrescription.diagnosis}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Medications</h4>
              <div className="space-y-3">
                {selectedPrescription.medications.map((med, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg">
                    <p className="text-sm font-semibold text-text-primary mb-2">{med.name}</p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-text-secondary mb-1">Dosage</p>
                        <p className="text-text-primary font-medium">{med.dosage}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary mb-1">Frequency</p>
                        <p className="text-text-primary font-medium">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary mb-1">Duration</p>
                        <p className="text-text-primary font-medium">{med.duration}</p>
                      </div>
                    </div>
                    {med.instructions && (
                      <p className="text-xs text-text-secondary mt-2">{med.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedPrescription.notes && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Additional Notes</h4>
                <p className="text-sm text-text-secondary">{selectedPrescription.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handleDownloadPDF(selectedPrescription)}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
