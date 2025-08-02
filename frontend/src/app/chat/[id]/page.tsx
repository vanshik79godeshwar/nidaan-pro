'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PatientContextSidebar from '@/components/chat/PatientContextSidebar'; // Import the new sidebar
import { Appointment, DoctorDetailDto } from '@/types'; // Import necessary types
import api from '@/lib/api';

function ChatPage() {
    const params = useParams();
    const recipientId = params.id as string;
    const { user, token } = useAuth();
    const { messages, sendMessage } = useWebSocket(recipientId);
    const [newMessage, setNewMessage] = useState('');

    // --- NEW STATE FOR CONTEXT SIDEBAR ---
    const [patientDetails, setPatientDetails] = useState<DoctorDetailDto | null>(null);
    const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
    const [isLoadingContext, setIsLoadingContext] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- NEW EFFECT TO FETCH CONTEXT DATA ---
    useEffect(() => {
        const fetchContextData = async () => {
            if (!user || !recipientId || !token) return;
            setIsLoadingContext(true);
            try {
                // Fetch both patient details and history in parallel
                const [detailsRes, historyRes] = await Promise.all([
                    api.post('/users/details', [recipientId], { headers: { Authorization: `Bearer ${token}` } }),
                    api.get(`/consultations/history/${user.id}/${recipientId}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                if (detailsRes.data && detailsRes.data.length > 0) {
                    setPatientDetails(detailsRes.data[0]);
                }
                setAppointmentHistory(historyRes.data);

            } catch (error) {
                console.error("Failed to fetch patient context:", error);
            } finally {
                setIsLoadingContext(false);
            }
        };

        fetchContextData();
    }, [user, recipientId, token]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    // --- UPDATED LAYOUT ---
    return (
        <div className="flex h-[calc(100vh-150px)]">
            {/* Left Column: Chat Interface */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Chat with {patientDetails?.fullName || 'User'}</h2>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                        <Input id="message" label="" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="flex-1"/>
                        <Button type="submit" className="w-auto">Send</Button>
                    </form>
                </div>
            </div>

            {/* Right Column: Patient Context Sidebar */}
            <div className="w-80 flex-shrink-0">
                {isLoadingContext ? (
                    <p className="p-4 text-center">Loading patient info...</p>
                ) : patientDetails ? (
                    <PatientContextSidebar patientDetails={patientDetails} appointmentHistory={appointmentHistory} />
                ) : (
                    <p className="p-4 text-center">Could not load patient information.</p>
                )}
            </div>
        </div>
    );
}

export default function ProtectedChatPage() {
    return (
        <ProtectedRoute>
            <ChatPage />
        </ProtectedRoute>
    );
}