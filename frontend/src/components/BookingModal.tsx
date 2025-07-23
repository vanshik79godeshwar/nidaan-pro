'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Define types for our data
interface Slot {
  id: string; // The ID of the slot itself
  slotTime: string; // The ISO string for the date and time
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: {
    userId: string;
    fullName: string;
    consultationFee: number;
  };
}

export default function BookingModal({ isOpen, onClose, doctor }: BookingModalProps) {
  const { user, token } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch the doctor's available slots
    const fetchSlots = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get(`/doctors/${doctor.userId}/slots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableSlots(response.data);
      } catch (err) {
        console.error("Failed to fetch slots", err);
        setError("Could not load doctor's available slots.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, [isOpen, doctor.userId, token]);

  const handleBooking = async () => {
    if (!selectedSlot || !user) {
        setError("Please select a time slot.");
        return;
    }
    setError('');
    setSuccess('');

    try {
        const payload = {
            patientId: user.id,
            doctorId: doctor.userId,
            slotId: selectedSlot.id,
            appointmentTime: selectedSlot.slotTime
        };
        await api.post('/consultations/book', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Appointment booked successfully!');
        // Close the modal after a short delay
        setTimeout(() => {
            onClose();
            setSuccess('');
            setSelectedSlot(null);
        }, 2000);
    } catch (err) {
        setError('Failed to book. This slot may no longer be available.');
        console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book Appointment with ${doctor.fullName}`}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
        <h4 className="font-semibold text-lg mb-2">Select an available slot:</h4>
        {isLoading && <p>Loading slots...</p>}
        {!isLoading && availableSlots.length === 0 && <p>No available slots found for this doctor.</p>}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableSlots.map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              className={`p-3 text-sm rounded-md border text-center ${selectedSlot?.id === slot.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {new Date(slot.slotTime).toLocaleDateString()}
              <br/>
              {new Date(slot.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 border-t pt-4">
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-2">{success}</p>}
        <Button onClick={handleBooking} disabled={!selectedSlot}>
          Confirm Booking for ₹{doctor.consultationFee}
        </Button>
      </div>
    </Modal>
  );
}