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
import { IMessage } from '@stomp/stompjs';
import { PaymentDto } from '@/types';

// This interface is required for the Razorpay window object
interface RazorpayWindow extends Window {
    Razorpay: any; 
}
declare const window: RazorpayWindow;

// --- Types for clarity ---
interface Speciality {
  id: number;
  name: string;
}

interface EmergencyRequest {
  id: string;
  patientName: string;
  createdAt: string;
}

function EmergencyRoomPage() {
    const { user, token } = useAuth();
    const { client } = useNotifications();
    const router = useRouter();
    
    const [requests, setRequests] = useState<EmergencyRequest[]>([]);
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [selectedSpeciality, setSelectedSpeciality] = useState<string>('');
    const [hasActiveRequest, setHasActiveRequest] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            setIsLoading(true);
            if (user.role === 'DOCTOR') {
                const fetchPendingRequests = async () => {
                    if (!user.profile?.specialityId) {
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
                fetchPendingRequests();
            } else if (user.role === 'PATIENT') {
                const checkActiveRequest = async () => {
                    try {
                        await api.get(`/consultations/emergency/request/patient/${user.id}`, {
                             headers: { Authorization: `Bearer ${token}` }
                        });
                        setHasActiveRequest(true);
                    } catch (error: any) {
                        if (error.response?.status === 404) {
                            setHasActiveRequest(false);
                        } else {
                            toast.error("Could not verify your emergency request status.");
                        }
                    } finally {
                        setIsLoading(false);
                    }
                };
                
                const fetchSpecialities = async () => {
                    try {
                        const res = await api.get('/specialities', { headers: { Authorization: `Bearer ${token}` } });
                        setSpecialities(res.data);
                    } catch (error) {
                        toast.error("Failed to load specialities.");
                    }
                };
                
                checkActiveRequest();
                fetchSpecialities();
            }
        } else if (!token) {
            setIsLoading(false);
        }
    }, [user, token]);

    const handleRequestEmergency = async () => {
        if (!user || !token || !selectedSpeciality) {
            toast.error("Please select a speciality.");
            return;
        }
        setIsLoading(true);

        try {
            const { data: paymentDetails }: { data: PaymentDto } = await api.post(
                '/consultations/emergency/initiate',
                { patientId: user.id, specialityId: parseInt(selectedSpeciality) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: paymentDetails.amount * 100,
                currency: "INR",
                name: "Nidaan Pro - Emergency",
                description: "Emergency Consultation Fee",
                order_id: paymentDetails.orderId,
                handler: async (response: any) => {
                    // --- THIS IS THE FIX ---
                    // We now explicitly call the backend to confirm the payment was successful,
                    // just like in your normal booking flow. This will trigger the status update.
                    try {
                        await api.post('/payments/webhook', {
                            paymentId: paymentDetails.id,
                            status: "SUCCESS",
                        }, { headers: { Authorization: `Bearer ${token}` } });
                        
                        toast.success("Payment successful! Notifying doctors...");
                        setHasActiveRequest(true);

                    } catch (webhookError) {
                        toast.error("Payment was successful, but there was an error confirming it. Please contact support.");
                        console.error("Webhook call failed:", webhookError);
                    }
                },
                prefill: { name: user.fullName, email: user.email },
                theme: { color: "#dc2626" },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        toast.error("Payment was cancelled.");
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            setIsLoading(false);

        } catch (err) {
            console.error(err);
            toast.error('Failed to initiate emergency request. Please try again.');
            setIsLoading(false);
        }
    };

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
            setRequests(prev => prev.filter(req => req.id !== requestId));
        }
    };
    
    useEffect(() => {
        if (client && client.connected && user?.role === 'DOCTOR') {
            const subscription = client.subscribe(`/user/${user.id}/queue/system-updates`, (message: IMessage) => {
                try {
                    const update = JSON.parse(message.body);
                    if (update.type === 'REQUEST_ACCEPTED') {
                        const acceptedRequestId = update.data;
                        setRequests(prev => prev.filter(req => req.id !== acceptedRequestId));
                        toast.info("A pending emergency request was handled by another doctor.");
                    }
                } catch (e) { console.error("Error parsing system update:", e); }
            });
            return () => subscription.unsubscribe();
        }
    }, [client, user]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                <p className="mt-4 text-gray-600">Loading Emergency Connect...</p>
            </div>
        );
    }
    
    if (user?.role === 'PATIENT') {
        if (hasActiveRequest) {
            return (
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Siren className="mx-auto h-20 w-20 text-red-500" />
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Emergency Request Sent
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        We have notified all available doctors. You will be connected as soon as a doctor accepts. Please keep this page open.
                    </p>
                </div>
            );
        } else {
            return (
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Siren className="mx-auto h-20 w-20 text-blue-500" />
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Emergency Connect
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        If you need immediate medical attention, select a speciality and we will connect you to the first available doctor.
                    </p>
                    <div className="mt-8 max-w-sm mx-auto">
                        <select 
                            value={selectedSpeciality} 
                            onChange={(e) => setSelectedSpeciality(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm mb-4 text-lg"
                        >
                            <option value="" disabled>Select a medical speciality...</option>
                            {specialities.map(spec => (
                                <option key={spec.id} value={spec.id}>{spec.name}</option>
                            ))}
                        </select>
                        <Button onClick={handleRequestEmergency} className="w-full bg-red-600 hover:bg-red-700 text-lg py-3">
                            Pay & Request Help
                        </Button>
                    </div>
                </div>
            );
        }
    }
    
    if (user?.role === 'DOCTOR') {
       return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Siren className="h-10 w-10 text-red-500" />
                    <h1 className="text-3xl font-bold text-gray-800">Emergency Room</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4">Pending Patient Requests</h2>
                    {requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="flex flex-wrap justify-between items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div>
                                        <p className="font-bold text-lg text-red-800">{req.patientName}</p>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Clock size={14} /> Waited for {Math.round((Date.now() - new Date(req.createdAt).getTime()) / 60000)} mins
                                        </p>
                                    </div>
                                    <Button onClick={() => handleAccept(req.id)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
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
       );
    }

    return <p>Error: Could not determine user role.</p>;
}

export default function ProtectedEmergencyPage() {
    return (
        <ProtectedRoute>
            <EmergencyRoomPage />
        </ProtectedRoute>
    );
}