'use client';

import { Appointment, DoctorDetailDto, AppointmentDetailDto } from '@/types';
import { Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';

interface PatientContextSidebarProps {
  patientDetails: DoctorDetailDto; // We can reuse this DTO for patient details
  appointmentHistory: Appointment[];
}

// A small component for a single history item
const HistoryItem = ({ appointment }: { appointment: Appointment }) => (
  <div className="p-3 bg-gray-50 rounded-md border">
    <p className="font-semibold text-sm text-gray-800">
      {new Date(appointment.appointmentTime).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      })}
    </p>
    <p className="text-xs text-gray-500 capitalize">
      Status: {appointment.status.toLowerCase().replace(/_/g, ' ')}
    </p>
    <div className="mt-2 flex space-x-2">
      {appointment.status === 'READY' && (
        <Link href={`/dashboard/appointments/${appointment.id}`}>
           <button className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">View Report</button>
        </Link>
      )}
      {appointment.diagnosis && (
         <Link href={`/dashboard/summary/${appointment.id}`}>
           <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">View Summary</button>
        </Link>
      )}
    </div>
  </div>
);

export default function PatientContextSidebar({ patientDetails, appointmentHistory }: PatientContextSidebarProps) {
  return (
    <div className="w-full h-full bg-white border-l p-4 overflow-y-auto">
      <div className="flex flex-col items-center border-b pb-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center font-bold text-3xl text-gray-500 mb-3">
          {patientDetails.fullName.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{patientDetails.fullName}</h2>
        <p className="text-sm text-gray-500">{patientDetails.email}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Appointment History
        </h3>
        <div className="space-y-3">
            {appointmentHistory.length > 0 ? (
                appointmentHistory.slice(0, 5).map(appt => <HistoryItem key={appt.id} appointment={appt} />) // Show last 5
            ) : (
                <p className="text-sm text-gray-500">No appointment history found.</p>
            )}
        </div>
      </div>
    </div>
  );
}