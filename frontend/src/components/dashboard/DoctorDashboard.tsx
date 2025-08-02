'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DoctorAppointmentDetailDto } from '@/types';
import Link from 'next/link';
import { Calendar, ClipboardList } from 'lucide-react';

export default function DoctorDashboard() {
  const { user, token } = useAuth();
  const [upcomingAppointment, setUpcomingAppointment] = useState<DoctorAppointmentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingAppointment = async () => {
      if (!user || !token) return;
      try {
        const response = await api.get(`/consultations/doctor/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Find the next appointment that isn't completed or cancelled
        const nextAppt = response.data
          .filter((item: DoctorAppointmentDetailDto) => 
            item.appointment.status !== 'COMPLETED' && item.appointment.status !== 'CANCELLED'
          )
          .sort((a: DoctorAppointmentDetailDto, b: DoctorAppointmentDetailDto) => 
            new Date(a.appointment.appointmentTime).getTime() - new Date(b.appointment.appointmentTime).getTime()
          )[0]; // Get the first one after sorting

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
      <h1 className="text-3xl font-bold text-gray-800">Welcome, Dr. {user?.fullName}!</h1>
      <p className="mt-2 text-gray-600 mb-8">Here's a quick overview of your dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Appointment Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Upcoming Appointment</h2>
          {loading ? <p>Loading...</p> : upcomingAppointment ? (
            <div>
              <p className="text-gray-600">With <span className="font-bold text-blue-600">{upcomingAppointment.patientDetails.fullName}</span></p>
              <p className="text-gray-600 text-lg my-2">
                {new Date(upcomingAppointment.appointment.appointmentTime).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <div className="mt-4 flex space-x-2">
                {upcomingAppointment.appointment.status === 'READY' &&
                  <Link href={`/dashboard/appointments/${upcomingAppointment.appointment.id}`}>
                    <button className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                      View Report
                    </button>
                  </Link>
                }
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

        {/* Manage Schedule Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
            <ClipboardList size={48} className="text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Manage Your Schedule</h2>
            <p className="text-gray-500 mb-4">Add new slots to let patients book appointments with you.</p>
            <Link href="/dashboard/schedule">
                 <button className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Update Availability
                  </button>
            </Link>
        </div>
      </div>
    </div>
  );
}