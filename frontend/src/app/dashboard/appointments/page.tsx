'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppointmentDetailDto, DoctorAppointmentDetailDto } from '@/types';
import Link from 'next/link';
import ReviewModal from '@/components/ReviewModal';
import Button from '@/components/ui/Button'; // Import the Button component

// Define the full appointment type for our card props
type AppointmentCardProps = {
  appointmentData: AppointmentDetailDto | DoctorAppointmentDetailDto;
  onOpenReviewModal: (appointment: AppointmentDetailDto) => void;
};

// A universal card component that now accepts the full appointment object
function AppointmentCard({ appointmentData, onOpenReviewModal }: AppointmentCardProps) {
  const { user } = useAuth();
  const { appointment } = appointmentData;

  // Determine the partner's name based on the role and the type of DTO
  const partnerName = user?.role === 'PATIENT'
    ? (appointmentData as AppointmentDetailDto).doctorDetails.fullName
    : (appointmentData as DoctorAppointmentDetailDto).patientDetails.fullName;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'READY': return 'bg-indigo-100 text-indigo-800';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {user?.role === 'PATIENT' ? 'Dr. ' : 'Patient: '}{partnerName}
          </h3>
          <p className="text-gray-600">
            {new Date(appointment.appointmentTime).toLocaleString(undefined, {
              dateStyle: 'long', timeStyle: 'short'
            })}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
            {appointment.status === 'READY' && user?.role === 'PATIENT' && (
                <p className="text-sm text-green-600">Your report has been submitted.</p>
            )}
            {appointment.status === 'SCHEDULED' && user?.role === 'DOCTOR' && (
                <p className="text-sm text-yellow-600">Awaiting report from patient.</p>
            )}
        </div>
        
        <div className="flex items-center space-x-2">
            {user?.role === 'PATIENT' && appointment.status === 'SCHEDULED' && (
              <Link href={`/dashboard/report/${appointment.id}`}>
                <button className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Start Report
                </button>
              </Link>
            )}
            
            {user?.role === 'DOCTOR' && appointment.status === 'READY' && (
              <Link href={`/dashboard/appointments/${appointment.id}`}>
                <button className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                  View Report
                </button>
              </Link>
            )}

            {( (user?.role === 'PATIENT' && appointment.status === 'SCHEDULED') || appointment.status === 'READY' ) && (
                <Link href={`/call/${appointment.id}`}>
                    <button className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                      Join Call
                    </button>
                </Link>
            )}

            {/* --- INTEGRATED "LEAVE A REVIEW" BUTTON --- */}
            {user?.role === 'PATIENT' && appointment.status === 'COMPLETED' && (
                <Button onClick={() => onOpenReviewModal(appointmentData as AppointmentDetailDto)} className="w-auto bg-green-600 hover:bg-green-700">
                    Leave a Review
                </Button>
            )}

            {user?.role === 'DOCTOR' && appointment.status === 'COMPLETED' && !appointment.diagnosis && (
                <Link href={`/dashboard/notes/${appointment.id}`}>
                    <button className="px-4 py-2 font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600">
                        Add Notes
                    </button>
                </Link>
            )}

            {/* --- OPTIONAL: Add a button to view existing notes --- */}
            {appointment.status === 'COMPLETED' && appointment.diagnosis && (
                <Link href={`/dashboard/summary/${appointment.id}`}>
                    <button className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        View Summary
                    </button>
                </Link>
            )}
        </div>
      </div>
    </div>
  );
}

// The main page component
function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<(AppointmentDetailDto | DoctorAppointmentDetailDto)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetailDto | null>(null);

  const fetchAppointments = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const url = user.role === 'PATIENT'
        ? `/consultations/patient/${user.id}`
        : `/consultations/doctor/${user.id}`;
      
      const response = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const validAppointments = response.data.filter((item: any) => 
        user.role === 'PATIENT' ? item?.appointment && item?.doctorDetails : item?.appointment && item?.patientDetails
      );
      setAppointments(validAppointments);

    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, token]);

  const handleOpenReviewModal = (appointment: AppointmentDetailDto) => {
    setSelectedAppointment(appointment);
    setReviewModalOpen(true);
  };
  
  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
      <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.map((appt) => 
            <AppointmentCard 
              key={appt.appointment.id} 
              appointmentData={appt} 
              onOpenReviewModal={handleOpenReviewModal} 
            />
          )
        ) : (
          <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You have no appointments scheduled at the moment.</p>
          </div>
        )}
      </div>

      {selectedAppointment && (
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            appointment={selectedAppointment}
            onReviewSubmitted={fetchAppointments}
        />
      )}
    </div>
  );
}

export default function ProtectedAppointmentsPage() {
  return (
    <ProtectedRoute>
      <MyAppointmentsPage />
    </ProtectedRoute>
  );
}