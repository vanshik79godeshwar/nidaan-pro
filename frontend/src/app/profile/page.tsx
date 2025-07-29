// frontend/src/app/dashboard/profile/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import DoctorProfileForm from '@/components/dashboard/DoctorProfileForm';
import PatientProfileForm from '@/components/dashboard/PatientProfileForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {user.role === 'DOCTOR' ? <DoctorProfileForm /> : <PatientProfileForm />}
    </div>
  );
}

export default function ProtectedProfilePage() {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    )
}