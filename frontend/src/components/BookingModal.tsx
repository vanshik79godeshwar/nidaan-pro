'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DoctorDetailDto, PaymentDto } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// --- DEFINE A TYPE FOR THE RAZORPAY WINDOW OBJECT ---
interface RazorpayWindow extends Window {
    Razorpay: any; 
}
declare const window: RazorpayWindow;


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
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!slot || !user) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setIsLoading(true);

    try {
      // Step 1: Call your backend to book the appointment and create a Razorpay order
      const { data: paymentDetails }: { data: PaymentDto } = await api.post(
        '/consultations/book',
        {
          patientId: user.id,
          doctorId: doctor.doctorProfile.userId,
          slotId: slot.id,
          appointmentTime: slot.slotTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 2: Configure Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Test Key ID from Razorpay Dashboard
        amount: paymentDetails.amount * 100, // Amount in paise
        currency: "INR",
        name: "Nidaan Pro",
        description: `Consultation with Dr. ${doctor.fullName}`,
        order_id: paymentDetails.dummyTransactionId, // This is the Razorpay Order ID from your backend
        handler: async function (response: any) {
            // Step 3: This function runs after a SUCCESSFUL payment in the Razorpay popup
            toast.success("Payment successful! Confirming your appointment...");
            
            // Step 4: Call your own webhook to finalize the booking in your system
            await api.post('/payments/webhook', {
                paymentId: paymentDetails.id,
                status: "SUCCESS",
            }, { headers: { Authorization: `Bearer ${token}` } });

            router.push('/dashboard/appointments');
            onClose();
        },
        prefill: {
            name: user.fullName,
            email: user.email,
        },
        theme: {
            color: "#3399cc"
        },
        modal: {
            ondismiss: function() {
                // This function runs if the user closes the Razorpay popup
                setIsLoading(false);
                toast.error("Payment was cancelled.");
            }
        }
      };

      // Step 5: Open the Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error('Booking failed. This slot may have just been taken.');
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Appointment`}>
      <div className="space-y-4">
        {/* ... (modal content remains the same) ... */}
      </div>
      <div className="mt-6 border-t pt-4">
        <Button onClick={handlePayment} disabled={isLoading}>
          {isLoading ? 'Processing...' : `Proceed to Pay ₹${doctor.doctorProfile.consultationFee}`}
        </Button>
      </div>
    </Modal>
  );
}