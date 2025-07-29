// frontend/src/components/DoctorCard.tsx
import Link from 'next/link';
import { DoctorDetailDto } from '@/types';

export default function DoctorCard({ doctor }: { doctor: DoctorDetailDto }) {
  return (
    <Link href={`/doctors/${doctor.doctorProfile.userId}`}>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl hover:border-blue-500 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <h3 className="text-2xl font-bold text-gray-800">{doctor.fullName}</h3>
        <p className="text-blue-500 mb-2">{doctor.email}</p>
        <p className="text-gray-600 truncate flex-grow">{doctor.doctorProfile.bio}</p>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            ₹{doctor.doctorProfile.consultationFee}
          </span>
          <span className="text-sm text-white bg-blue-500 px-3 py-1 rounded-full">
            View Profile & Slots
          </span>
        </div>
      </div>
    </Link>
  );
}