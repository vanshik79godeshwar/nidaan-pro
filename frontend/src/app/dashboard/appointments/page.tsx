'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppointmentDetailDto, DoctorAppointmentDetailDto } from '@/types'; // Assuming DoctorAppointmentDetailDto is in your types
import Link from 'next/link';

// A single, unified type for display purposes to keep things clean
type DisplayAppointment = {
  id: string;
  status: string;
  appointmentTime: string;
  partnerName: string; // This will be the doctor's name for a patient, or the patient's name for a doctor
};

// A universal card component that works for both roles
function AppointmentCard({ appt }: { appt: DisplayAppointment }) {
  const { user } = useAuth();
  
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
            {user?.role === 'PATIENT' ? 'Dr. ' : 'Patient: '}{appt.partnerName}
          </h3>
          <p className="text-gray-600">
            {new Date(appt.appointmentTime).toLocaleString(undefined, {
              dateStyle: 'long', timeStyle: 'short'
            })}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appt.status)}`}>
          {appt.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        {/* Patient's Action Button */}
        {user?.role === 'PATIENT' && appt.status === 'SCHEDULED' && (
          <Link href={`/dashboard/report/${appt.id}`}>
            <button className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Start Pre-Consultation Report
            </button>
          </Link>
        )}
        
        {/* Doctor's Action Button */}
        {user?.role === 'DOCTOR' && appt.status === 'READY' && (
          <Link href={`/dashboard/appointments/${appt.id}`}>
            <button className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
              View Submitted Report
            </button>
          </Link>
        )}

        {/* Informational Text */}
        {appt.status === 'READY' && user?.role === 'PATIENT' && (
             <p className="text-sm text-green-600">Your report has been submitted.</p>
        )}
         {appt.status === 'SCHEDULED' && user?.role === 'DOCTOR' && (
             <p className="text-sm text-yellow-600">Awaiting report from patient.</p>
        )}
      </div>
    </div>
  );
}


// The main page component that handles all the logic
function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<DisplayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        // Determine the correct API endpoint based on the user's role
        const url = user.role === 'PATIENT'
          ? `/consultations/patient/${user.id}`
          : `/consultations/doctor/${user.id}`;
        
        const response = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });

        // Normalize the data from the backend into our unified DisplayAppointment type
        const normalizedData: DisplayAppointment[] = response.data.map((item: any) => {
          if (user.role === 'PATIENT') {
            // This handles the data structure for a patient's view
            const patientAppt = item as AppointmentDetailDto;
            return {
              id: patientAppt.appointment.id,
              status: patientAppt.appointment.status,
              appointmentTime: patientAppt.appointment.appointmentTime,
              partnerName: patientAppt.doctorDetails.fullName,
            };
          } else { // DOCTOR
            // This handles the data structure for a doctor's view
            const doctorAppt = item as DoctorAppointmentDetailDto;
            return {
              id: doctorAppt.appointment.id,
              status: doctorAppt.appointment.status,
              appointmentTime: doctorAppt.appointment.appointmentTime,
              partnerName: doctorAppt.patientDetails.fullName,
            };
          }
        });
        setAppointments(normalizedData);

      } catch (err) {
        setError('Failed to fetch appointments. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, token]);

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
      <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.map((appt) => <AppointmentCard key={appt.id} appt={appt} />)
        ) : (
          <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You have no appointments scheduled at the moment.</p>
          </div>
        )}
      </div>
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