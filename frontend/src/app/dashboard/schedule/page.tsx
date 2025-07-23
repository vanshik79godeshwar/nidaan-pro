'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Define the type for a single slot from the backend
interface Slot {
    id: string;
    doctorId: string;
    slotTime: string; // The backend sends an ISO 8601 string for Instant
}

export default function SchedulePage() {
    const { user, token } = useAuth();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [newSlotTime, setNewSlotTime] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch existing slots when the component mounts
    const fetchSlots = async () => {
        if (!user || !token) return;
        try {
            const response = await api.get(`/doctors/${user.id}/slots`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSlots(response.data);
        } catch (err) {
            console.error('Failed to fetch slots', err);
            setError('Could not load your available slots.');
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [user, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!user || !token || !newSlotTime) {
            setError('Please select a date and time.');
            return;
        }

        try {
            const payload = {
                doctorId: user.id,
                // Convert the local datetime string to a UTC ISO string, which the backend expects
                slotTime: new Date(newSlotTime).toISOString()
            };
            await api.post(`/doctors/${user.id}/slots`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('New slot added successfully!');
            setNewSlotTime(''); // Clear the input
            fetchSlots(); // Refetch the list to show the new slot
        } catch (err) {
            console.error('Failed to add slot', err);
            setError('Error adding slot. Please try again.');
        }
    };

    return (
        <ProtectedRoute>
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Your Availability</h1>
                
                {/* Form to add a new slot */}
                <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-8 max-w-lg">
                    <h2 className="text-2xl font-semibold mb-4">Add a New Time Slot</h2>
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <Input 
                                id="slot-time" 
                                label="Date and Time" 
                                type="datetime-local" 
                                value={newSlotTime} 
                                onChange={e => setNewSlotTime(e.target.value)} 
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <Button type="submit" className="w-full">Add Slot</Button>
                        </div>
                    </div>
                     {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
                     {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                </form>

                {/* Display existing slots */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Your Available Slots</h2>
                    <div className="space-y-2">
                        {slots.length > 0 ? (
                            slots.map(slot => (
                                <div key={slot.id} className="p-3 bg-gray-100 rounded-md flex justify-between">
                                    <span className="font-medium">
                                        {new Date(slot.slotTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span className="font-bold text-blue-600">
                                        {new Date(slot.slotTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p>You have no upcoming available slots.</p>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}