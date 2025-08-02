'use client';

import { Star, CheckCircle } from 'lucide-react';
import { DoctorReviewDto } from '@/types';

// A helper to render read-only star ratings
const StarRatingDisplay = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

export default function ReviewCard({ reviewDto }: { reviewDto: DoctorReviewDto }) {
  const { review, patientDetails } = reviewDto;

  return (
    <div className="border-t py-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
          {patientDetails.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          {/* --- THIS IS THE FIX for alignment --- */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">{patientDetails.fullName}</p>
              <p className="text-xs text-gray-500">
                {new Date(review.reviewDate).toLocaleDateString()}
              </p>
            </div>
            <StarRatingDisplay rating={review.rating} />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-semibold">
              <CheckCircle size={14} />
              <span>Verified Appointment</span>
          </div>
          {review.comment && (
            <p className="mt-3 text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md border">
                {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}