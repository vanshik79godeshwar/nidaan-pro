'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DoctorCard from '@/components/DoctorCard';
import DoctorSearchFilters from '@/components/DoctorSearchFilters'; // Import the new filters component
import { DoctorDetailDto } from '@/types';

interface Speciality {
  id: number;
  name: string;
}

function DoctorsPage() {
  const [allDoctors, setAllDoctors] = useState<DoctorDetailDto[]>([]);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const [doctorsRes, specialitiesRes] = await Promise.all([
          api.get('/doctors', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/specialities', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setAllDoctors(doctorsRes.data);
        setSpecialities(specialitiesRes.data);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Client-side filtering logic
  const filteredDoctors = useMemo(() => {
    return allDoctors
      .filter(doctor => 
        selectedSpeciality ? doctor.doctorProfile.specialityId === parseInt(selectedSpeciality, 10) : true
      )
      .filter(doctor => 
        doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [allDoctors, selectedSpeciality, searchQuery]);

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Find a Doctor</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <div className="lg:col-span-1">
          <DoctorSearchFilters
            specialities={specialities}
            selectedSpeciality={selectedSpeciality}
            setSelectedSpeciality={setSelectedSpeciality}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Right Column: Doctor Listings */}
        <div className="lg:col-span-3">
          {loading ? (
             <p>Loading doctors...</p>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => {
                const specialityName = specialities.find(s => s.id === doctor.doctorProfile.specialityId)?.name;
                return <DoctorCard key={doctor.doctorProfile.userId} doctor={doctor} specialityName={specialityName} />;
              })}
            </div>
          ) : (
            <div className="text-center bg-white p-12 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700">No Doctors Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProtectedDoctorsPage() {
  return (
    <ProtectedRoute>
      <DoctorsPage />
    </ProtectedRoute>
  );
}