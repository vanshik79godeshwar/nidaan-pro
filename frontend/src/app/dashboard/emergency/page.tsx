'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { Siren, Loader2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { IMessage } from '@stomp/stompjs'; // Import the message type

interface EmergencyRequest {
  id: string;
  patientName: string;
  createdAt: string;
}

export default function EmergencyRoomPage() {
    const { user, token } = useAuth();
    const { client } = useNotifications(); // Get the connected STOMP client from our context
    const router = useRouter();
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingRequests = async () => {
        if (!user || user.role !== 'DOCTOR' || !user.profile?.specialityId || !token) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await api.get(`/consultations/emergency/pending`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { specialityId: user.profile.specialityId }
            });
            setRequests(res.data);
        } catch (error) {
            toast.error("Failed to fetch emergency requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPendingRequests();
            const interval = setInterval(fetchPendingRequests, 10000);
            return () => clearInterval(interval);
        }
    }, [user, token]);

    const handleAccept = async (requestId: string) => {
        if (!user || !token) return;
        try {
            const res = await api.post(`/consultations/emergency/${requestId}/accept`, 
                { doctorId: user.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const newAppointment = res.data;
            toast.success("Request accepted! Connecting you to the patient...");
            router.push(`/call/${newAppointment.id}`);
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error("Another doctor has already accepted this request.");
            } else {
                toast.error("Failed to accept the request.");
            }
            fetchPendingRequests();
        }
    };

    // --- THIS IS THE FIX ---
    useEffect(() => {
        // Ensure the client is connected before trying to subscribe
        if (client && client.connected && user) {
            // Subscribe to the dedicated channel for system updates
            const subscription = client.subscribe(`/user/${user.id}/queue/system-updates`, (message: IMessage) => {
                const update = JSON.parse(message.body);
                if (update.type === 'REQUEST_ACCEPTED') {
                    const acceptedRequestId = update.data;
                    // Remove the accepted request from the list in real-time
                    setRequests(prev => prev.filter(req => req.id !== acceptedRequestId));
                    toast.info("A pending emergency request was accepted by another doctor.");
                }
            });
            // Clean up the subscription when the component unmounts
            return () => subscription.unsubscribe();
        }
    }, [client, user]); // Re-run this effect if the client or user changes

    if (user?.role === 'PATIENT') {
        return (
             <div className="max-w-2xl mx-auto text-center">
                 <Siren className="mx-auto h-20 w-20 text-red-500" />
                 <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                     Emergency Request Sent
                 </h1>
                 <p className="mt-6 text-lg leading-8 text-gray-600">
                    We have notified all available doctors. You will receive an in-app notification and an email once a doctor accepts your request and starts the call.
                 </p>
             </div>
        )
    }

    return (
        <ProtectedRoute>
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Siren className="h-10 w-10 text-red-500" />
                    <h1 className="text-3xl font-bold text-gray-800">Emergency Room</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4">Pending Patient Requests</h2>
                    {isLoading ? (
                        <p>Loading requests...</p>
                    ) : requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div>
                                        <p className="font-bold text-lg text-red-800">{req.patientName}</p>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Clock size={14} /> Waited for {Math.round((Date.now() - new Date(req.createdAt).getTime()) / 60000)} mins
                                        </p>
                                    </div>
                                    <Button onClick={() => handleAccept(req.id)} className="w-auto bg-red-600 hover:bg-red-700">
                                        Accept & Join Call
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">There are no pending emergency requests for your speciality at the moment.</p>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}