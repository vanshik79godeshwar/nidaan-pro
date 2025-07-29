// frontend/src/components/BookingModal.tsx
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DoctorDetailDto, PaymentDto } from '@/types';
import { useRouter } from 'next/navigation';

interface Slot {
  id: string;
  slotTime: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorDetailDto;
  slot: Slot;
}

export default function BookingModal({ isOpen, onClose, doctor, slot }: BookingModalProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDummyPaymentBooking = async () => {
    if (!slot || !user) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Book the appointment to create the initial payment record
      const bookingPayload = {
        patientId: user.id,
        doctorId: doctor.doctorProfile.userId,
        slotId: slot.id,
        appointmentTime: slot.slotTime,
      };

      const { data: paymentDetails }: { data: PaymentDto } = await api.post(
        '/consultations/book',
        bookingPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 2: Simulate a successful payment by calling our own webhook
      const webhookPayload = {
        paymentId: paymentDetails.id,
        status: "SUCCESS",
      };

      await api.post('/payments/webhook', webhookPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Step 3: Show success and redirect
      alert("Payment Successful! Your appointment is confirmed.");
      router.push('/dashboard/appointments');
      onClose();

    } catch (err) {
      setError('Failed to book. This slot may have just been taken.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Appointment`}>
      <div className="space-y-4">
        <p>You are booking an appointment with <strong>{doctor.fullName}</strong>.</p>
        <div>
            <p className="font-semibold">Date:</p>
            <p>{new Date(slot.slotTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div>
            <p className="font-semibold">Time:</p>
            <p>{new Date(slot.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
        </div>
      </div>
      <div className="mt-6 border-t pt-4">
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <Button onClick={handleDummyPaymentBooking} disabled={isLoading}>
          {isLoading ? 'Booking...' : `Confirm Booking (Dummy Payment)`}
        </Button>
      </div>
    </Modal>
  );
}