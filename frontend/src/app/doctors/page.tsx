'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

// Define an interface for the shape of our doctor data
interface DoctorProfile {
  fullName: string;
  email: string;
  doctorProfile: {
    userId: string;
    specialityId: number;
    medicalLicenseNumber: string;
    bio: string;
    yearsOfExperience: number;
    consultationFee: number;
  };
}

function DoctorCard({ doctor }: { doctor: DoctorProfile }) {
  return (
    <Link href={`/doctors/${doctor.doctorProfile.userId}`}>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-200 cursor-pointer">
        <h3 className="text-2xl font-bold text-gray-800">{doctor.fullName}</h3>
        <p className="text-blue-500 mb-2">{doctor.email}</p>
        <p className="text-gray-600 truncate">{doctor.doctorProfile.bio}</p>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            ₹{doctor.doctorProfile.consultationFee}
          </span>
          <span className="text-sm text-white bg-blue-500 px-3 py-1 rounded-full">
            View Profile
          </span>
        </div>
      </div>
    </Link>
  );
}

// The main page component
function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return; // Don't fetch if there's no token

      try {
        const response = await api.get('/doctors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctors(response.data);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [token]);

  if (loading) return <p>Loading doctors...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Find a Doctor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.doctorProfile.userId} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}

// Wrap the main page component with the ProtectedRoute
export default function ProtectedDoctorsPage() {
  return (
    <ProtectedRoute>
      <DoctorsPage />
    </ProtectedRoute>
  );
}