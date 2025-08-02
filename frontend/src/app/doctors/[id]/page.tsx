'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DoctorDetailDto, DoctorReviewDto, AppointmentDetailDto } from '@/types';
import BookingModal from '@/components/BookingModal';
import ReviewModal from '@/components/ReviewModal';
import ReviewCard from '@/components/ReviewCard';
import Image from 'next/image';
import { Star, Briefcase, Calendar, Clock, Edit } from 'lucide-react';
import Button from '@/components/ui/Button';

// Define the type for a single slot from the backend
interface Slot {
  id: string;
  slotTime: string; // ISO 8601 string
}

interface Speciality {
  id: number;
  name: string;
}

// Helper component for displaying star ratings
const StarRatingDisplay = ({ rating, count }: { rating: number, count: number }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
        <span className="font-bold text-lg text-gray-800">{rating.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({count} reviews)</span>
    </div>
);

function DoctorProfilePage() {
  const params = useParams();
  const { id } = params;
  const { user, token } = useAuth();

  const [doctor, setDoctor] = useState<DoctorDetailDto | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reviews, setReviews] = useState<DoctorReviewDto[]>([]);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [canLeaveReview, setCanLeaveReview] = useState(false);
  const [completedAppointment, setCompletedAppointment] = useState<AppointmentDetailDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchAllData = async () => {
      if (!id || !token) return;
      try {
        setLoading(true);
        const [profileRes, slotsRes, reviewsRes, specialitiesRes] = await Promise.all([
          api.get(`/profiles/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/doctors/${id}/slots`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/reviews/doctor/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/specialities', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setDoctor(profileRes.data);
        setSlots(slotsRes.data);
        setReviews(reviewsRes.data);
        setSpecialities(specialitiesRes.data);

        // Logic to check if the patient can leave a review
        if (user?.role === 'PATIENT') {
            const appointmentsRes = await api.get(`/consultations/patient/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
            const completedAppt = appointmentsRes.data.find(
                (appt: AppointmentDetailDto) => appt.doctorDetails.id === id && appt.appointment.status === 'COMPLETED'
            );
            if (completedAppt) {
                setCanLeaveReview(true);
                setCompletedAppointment(completedAppt);
            }
        }
      } catch (err) {
        setError('Failed to fetch doctor details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAllData();
  }, [id, token, user]);
  
  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center p-12">Loading profile...</div>;
  if (error) return <p className="text-center p-12 text-red-500">{error}</p>;
  if (!doctor) return <p className="text-center p-12">Doctor not found.</p>;

  const specialityName = specialities.find(s => s.id === doctor.doctorProfile.specialityId)?.name || 'Specialist';
  
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = new Date(slot.slotTime).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  console.log('profile picture', doctor.doctorProfile.profilePictureUrl);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
                <Image
                    src={doctor.doctorProfile.profilePictureUrl || '/default-avatar.png'}
                    alt={`Dr. ${doctor.fullName}`}
                    width={150} height={150}
                    className="rounded-full object-cover border-4 border-gray-100 shadow-md"
                />
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900">Dr. {doctor.fullName}</h1>
                    <p className="text-lg text-blue-600 font-semibold mt-1">{specialityName}</p>
                    <div className="mt-4">
                        <StarRatingDisplay rating={doctor.doctorProfile.averageRating} count={doctor.doctorProfile.ratingCount} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-gray-600">
                        <div className="flex items-center gap-2"><Briefcase size={18} /> {doctor.doctorProfile.yearsOfExperience} years of experience</div>
                        <div className="flex items-center gap-2 font-semibold">Consultation Fee: ₹{doctor.doctorProfile.consultationFee}</div>
                    </div>
                </div>
                {canLeaveReview && (
                    <Button onClick={() => setReviewModalOpen(true)} className="w-full md:w-auto bg-green-600 hover:bg-green-700 flex items-center gap-2">
                        <Edit size={16} /> Leave a Review
                    </Button>
                )}
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">About Dr. {doctor.fullName}</h3>
                <p className="text-gray-700 leading-relaxed">{doctor.doctorProfile.bio}</p>
            </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
           <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Calendar size={28} /> Available Slots</h2>
           {Object.keys(groupedSlots).length > 0 ? (
             <div className="space-y-6">
               {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                 <div key={date}>
                    <h4 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-3">{date}</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {dateSlots.map((slot) => (
                            <button key={slot.id} onClick={() => handleSlotClick(slot)} className="p-3 border rounded-lg text-center bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-500 transition-colors">
                                <p className="font-bold text-blue-700 flex items-center justify-center gap-1.5">
                                    <Clock size={16} />
                                    {new Date(slot.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            </button>
                        ))}
                    </div>
                 </div>
               ))}
             </div>
           ) : ( <p className="text-gray-600">No available slots for this doctor at the moment.</p> )}
        </div>

      <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient Feedback</h2>
        {reviews.length > 0 ? (
            <div className="space-y-4">
                {reviews.map((reviewDto) => <ReviewCard key={reviewDto.review.id} reviewDto={reviewDto} />)}
            </div>
        ) : ( <p className="text-gray-600">This doctor does not have any reviews yet.</p> )}
      </div>

      {selectedSlot && (<BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} doctor={doctor} slot={selectedSlot}/>)}
      {completedAppointment && (
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            appointment={completedAppointment}
            onReviewSubmitted={fetchAllData}
        />
      )}
    </>
  );
}

export default function ProtectedDoctorProfilePage() {
    return (
        <ProtectedRoute>
            <DoctorProfilePage />
        </ProtectedRoute>
    );
}