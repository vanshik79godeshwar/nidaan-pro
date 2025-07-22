'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import { useAuth } from '@/context/AuthContext';

function Dashboard() {
  const { user, isLoading } = useAuth();

  // Show a loading state while the user's role is being determined
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome back, {user?.role === 'DOCTOR' ? 'Doctor!' : 'Patient!'}
      </h1>

      {user?.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />}
    </div>
  );
}

// Wrap the main page component with the ProtectedRoute
export default function ProtectedDashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}