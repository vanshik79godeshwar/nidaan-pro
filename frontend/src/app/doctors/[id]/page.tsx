'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DoctorDetailDto } from '@/types';
import BookingModal from '@/components/BookingModal'; // <-- 1. IMPORT THE NEW MODAL

function DoctorProfilePage() {
  const params = useParams();
  const { id } = params;
  const { token } = useAuth();
  const [doctor, setDoctor] = useState<DoctorDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- 2. State to control the modal

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!id || !token) return;
      try {
        const response = await api.get(`/profiles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(response.data);
      } catch (err) {
        setError('Failed to fetch doctor profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorProfile();
  }, [id, token]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!doctor) return <p>Doctor not found.</p>;

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800">{doctor.fullName}</h1>
        <p className="text-lg text-blue-500 mb-4">{doctor.email}</p>
        <p className="text-gray-700 mb-6">{doctor.doctorProfile.bio}</p>

        <div className="border-t pt-6">
          <p><strong>Experience:</strong> {doctor.doctorProfile.yearsOfExperience} years</p>
          <p><strong>Consultation Fee:</strong> ₹{doctor.doctorProfile.consultationFee}</p>
          <p><strong>Rating:</strong> {doctor.doctorProfile.averageRating} / 5.00</p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setIsModalOpen(true)} // <-- 3. Open the modal on click
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* 4. RENDER THE BOOKING MODAL */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={{
          userId: doctor.doctorProfile.userId,
          fullName: doctor.fullName,
          consultationFee: doctor.doctorProfile.consultationFee
        }}
      />
    </>
  );
}

// Wrap it in the ProtectedRoute
export default function ProtectedDoctorProfilePage() {
    return (
        <ProtectedRoute>
            <DoctorProfilePage />
        </ProtectedRoute>
    );
}