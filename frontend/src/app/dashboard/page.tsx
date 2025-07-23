'use client';
// We can now remove the ProtectedRoute from here as it's in the layout
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // The main header can be simpler now
  return user?.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />;
}