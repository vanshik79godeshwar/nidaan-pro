// frontend/src/app/doctors/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DoctorDetailDto } from '@/types';
import BookingModal from '@/components/BookingModal';


// Define the type for a single slot from the backend
interface Slot {
  id: string;
  slotTime: string; // ISO 8601 string
}

function DoctorProfilePage() {
  const params = useParams();
  const { id } = params;
  const { token } = useAuth();
  const [doctor, setDoctor] = useState<DoctorDetailDto | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!id || !token) return;
      try {
        setLoading(true);
        // Fetch profile and slots in parallel
        const [profileRes, slotsRes] = await Promise.all([
          api.get(`/profiles/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/doctors/${id}/slots`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDoctor(profileRes.data);
        setSlots(slotsRes.data);
      } catch (err) {
        setError('Failed to fetch doctor details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorData();
  }, [id, token]);
  
  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!doctor) return <p>Doctor not found.</p>;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Doctor Details */}
        <div className="lg:col-span-1 bg-white p-8 rounded-lg shadow-md self-start">
          <h1 className="text-4xl font-bold text-gray-800">{doctor.fullName}</h1>
          <p className="text-lg text-blue-500 mb-4">{doctor.email}</p>
          <p className="text-gray-700 mb-6">{doctor.doctorProfile.bio}</p>

          <div className="border-t pt-6">
            <p><strong>Experience:</strong> {doctor.doctorProfile.yearsOfExperience} years</p>
            <p><strong>Consultation Fee:</strong> ₹{doctor.doctorProfile.consultationFee}</p>
            <p><strong>Rating:</strong> {doctor.doctorProfile.averageRating} / 5.00</p>
          </div>
        </div>

        {/* Right Side: Available Slots */}
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
           <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Slots</h2>
           {slots.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {slots.map((slot) => (
                 <button
                   key={slot.id}
                   onClick={() => handleSlotClick(slot)}
                   className="p-4 border rounded-lg text-center bg-gray-50 hover:bg-blue-100 hover:border-blue-500 transition-colors"
                 >
                   <p className="font-semibold">{new Date(slot.slotTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                   <p className="text-lg font-bold">{new Date(slot.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                 </button>
               ))}
             </div>
           ) : (
             <p>No available slots for this doctor at the moment.</p>
           )}
        </div>
      </div>

      {/* Booking Modal - THIS IS THE CORRECTED PART */}
      {selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          doctor={doctor} // Now we pass the full doctor object, which matches the updated props
          slot={selectedSlot}
        />
      )}
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