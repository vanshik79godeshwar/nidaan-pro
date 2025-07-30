'use client';

import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // We can add a more sophisticated loading skeleton here later
    return <p className="text-center text-gray-500">Loading your dashboard...</p>;
  }

  // Based on the user's role, render the appropriate dashboard component
  return user?.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />;
}