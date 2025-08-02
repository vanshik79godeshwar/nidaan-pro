'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Star } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AppointmentDetailDto } from '@/types';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentDetailDto;
  onReviewSubmitted: () => void;
}

// A reusable StarRating component
const StarRating = ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`cursor-pointer transition-colors ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => setRating(star)}
          size={32}
        />
      ))}
    </div>
  );
};


export default function ReviewModal({ isOpen, onClose, appointment, onReviewSubmitted }: ReviewModalProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setError('');

    const payload = {
      appointmentId: appointment.appointment.id,
      // --- THIS IS THE CORRECT FIX ---
      // We use `.id` which is the correct property name from your `types.ts` file.
      doctorId: appointment.doctorDetails.id,
      rating,
      comment,
    };
    
    const promise = () => new Promise(async (resolve, reject) => {
        try {
            await api.post('/reviews', payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'X-User-Id': appointment.appointment.patientId
                }
            });
            onReviewSubmitted();
            onClose();
            resolve("Your review has been submitted. Thank you!");
        } catch (err) {
            console.error(err);
            reject("Failed to submit review. You may have already reviewed this appointment.");
        }
    });

    toast.promise(promise(), {
        loading: 'Submitting your review...',
        success: (message) => `${message}`,
        error: (message) => `${message}`,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review your appointment`}>
      <div className="space-y-4">
        <p>You had an appointment with <strong>Dr. {appointment.doctorDetails.fullName}</strong> on {new Date(appointment.appointment.appointmentTime).toLocaleDateString()}.</p>
        
        <div>
            <p className="font-semibold mb-2">Your Rating:</p>
            <StarRating rating={rating} setRating={setRating} />
        </div>

        <div>
            <label htmlFor="comment" className="font-semibold">Comment (optional):</label>
            <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Share your experience..."
            />
        </div>
      </div>
      <div className="mt-6 border-t pt-4">
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <Button onClick={handleSubmit}>
          Submit Review
        </Button>
      </div>
    </Modal>
  );
}