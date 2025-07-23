'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppointmentDetailDto } from '@/types'; // Import our new type

// A component to display a single appointment
function AppointmentCard({ item }: { item: AppointmentDetailDto }) {
  const { appointment, doctorDetails } = item;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
      case 'READY':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Dr. {doctorDetails?.fullName || 'N/A'}
          </h3>
          <p className="text-gray-600">
            {new Date(appointment.appointmentTime).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
             {' at '} 
            {new Date(appointment.appointmentTime).toLocaleTimeString([], {
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        {/* We can add action buttons here later, like "Join Call" or "View Report" */}
        <button className="text-blue-600 hover:underline">View Details</button>
      </div>
    </div>
  );
}


function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !token) return;

      try {
        const response = await api.get(`/consultations/patient/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(response.data);
      } catch (err) {
        setError('Failed to fetch your appointments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, token]);

  if (loading) return <p>Loading your appointments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
      <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.map((item) => (
            <AppointmentCard key={item.appointment.id} item={item} />
          ))
        ) : (
          <p>You have no appointments scheduled.</p>
        )}
      </div>
    </div>
  );
}

// Wrap the page in the ProtectedRoute
export default function ProtectedAppointmentsPage() {
  return (
    <ProtectedRoute>
      <MyAppointmentsPage />
    </ProtectedRoute>
  );
}