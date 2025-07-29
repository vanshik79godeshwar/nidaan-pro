// frontend/src/components/dashboard/PatientDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DoctorDetailDto } from '@/types';
import DoctorCard from '@/components/DoctorCard';

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState<DoctorDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!token) return;

      try {
        const response = await api.get('/doctors', {
          headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Find a Doctor</h2>
      <p className="mt-2 text-gray-600 mb-8">Browse available specialists and book your appointment.</p>
      
      {loading && <p>Loading doctors...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorCard key={doctor.doctorProfile.userId} doctor={doctor} />
            ))
          ) : (
            <p>No doctors found.</p>
          )}
        </div>
      )}
    </div>
  );
}