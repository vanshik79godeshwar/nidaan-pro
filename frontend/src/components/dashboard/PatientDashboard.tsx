// frontend/src/components/dashboard/PatientDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AppointmentDetailDto } from '@/types';
import Link from 'next/link';
import { Calendar, Stethoscope } from 'lucide-react';

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [upcomingAppointment, setUpcomingAppointment] = useState<AppointmentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingAppointment = async () => {
      if (!user || !token) return;
      try {
        const response = await api.get(`/consultations/patient/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Find the next non-completed appointment
        const nextAppt = response.data.find(
          (item: AppointmentDetailDto) => item.appointment.status !== 'COMPLETED' && item.appointment.status !== 'CANCELLED'
        );
        setUpcomingAppointment(nextAppt || null);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingAppointment();
  }, [user, token]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.fullName}!</h1>
      <p className="mt-2 text-gray-600 mb-8">Here's a quick overview of your health dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Appointment Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Upcoming Appointment</h2>
          {loading ? <p>Loading...</p> : upcomingAppointment ? (
            <div>
              <p className="text-gray-600">With <span className="font-bold text-blue-600">Dr. {upcomingAppointment.doctorDetails.fullName}</span></p>
              <p className="text-gray-600 text-lg my-2">
                {new Date(upcomingAppointment.appointment.appointmentTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <div className="mt-4 flex space-x-2">
                <Link href={`/dashboard/call/${upcomingAppointment.appointment.id}`}>
                  <button className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                    Join Call
                  </button>
                </Link>
                 <Link href="/dashboard/appointments">
                  <button className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                    View All
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">You have no upcoming appointments.</p>
          )}
        </div>

        {/* Find a Doctor Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
            <Stethoscope size={48} className="text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Need a Consultation?</h2>
            <p className="text-gray-500 mb-4">Browse specialists and book your next appointment.</p>
            <Link href="/doctors"> {/* Assuming you have a top-level doctors page */}
                 <button className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Find a Doctor
                  </button>
            </Link>
        </div>
      </div>
    </div>
  );
}