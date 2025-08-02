// frontend/src/components/DoctorCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { DoctorDetailDto } from '@/types';
import { Star } from 'lucide-react';

// A helper function to render star ratings
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="text-yellow-400 fill-current" size={16} />)}
      {halfStar && <Star key="half" className="text-yellow-400 fill-current" size={16} />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="text-gray-300" size={16} />)}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(2)}</span>
    </div>
  );
};


export default function DoctorCard({ doctor, specialityName }: { doctor: DoctorDetailDto, specialityName?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-200 h-full flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-start space-x-4">
          <Image
            src={doctor.doctorProfile.profilePictureUrl || '/default-avatar.png'} // Add a default avatar in your public folder
            alt={`Dr. ${doctor.fullName}`}
            width={80}
            height={80}
            className="rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Dr. {doctor.fullName}</h3>
            {specialityName && <p className="text-blue-600 font-semibold mb-1">{specialityName}</p>}
            <p className="text-sm text-gray-500">{doctor.doctorProfile.yearsOfExperience} years of experience</p>
            {renderStars(doctor.doctorProfile.averageRating)}
          </div>
        </div>
        <p className="text-gray-600 mt-4 text-sm line-clamp-3">
          {doctor.doctorProfile.bio}
        </p>
      </div>
      <div className="mt-auto p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
        <span className="text-lg font-bold text-gray-800">
          ₹{doctor.doctorProfile.consultationFee}
        </span>
        <Link href={`/doctors/${doctor.doctorProfile.userId}`}>
           <button className="px-5 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Book Appointment
          </button>
        </Link>
      </div>
    </div>
  );
}