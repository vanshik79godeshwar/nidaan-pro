'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { AppointmentDetailDto, PreConsultationReport } from '@/types';
import { Calendar, Stethoscope, User, FileText, Pill, Upload, MessageSquare, Video, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

function ViewAppointmentPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const appointmentId = params.appointmentId as string;

    const [appointment, setAppointment] = useState<AppointmentDetailDto | null>(null);
    const [report, setReport] = useState<PreConsultationReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!appointmentId || !token) return;
            try {
                // --- THIS IS THE FIX ---
                // Use Promise.allSettled to ensure both API calls complete, even if one fails.
                const results = await Promise.allSettled([
                    api.get(`/consultations/${appointmentId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    api.get(`/consultations/reports/appointment/${appointmentId}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const appointmentResult = results[0];
                const reportResult = results[1];

                // Check the result of the first API call (appointment details)
                if (appointmentResult.status === 'fulfilled') {
                    setAppointment(appointmentResult.value.data);
                } else {
                    toast.error("Failed to fetch appointment details.");
                    console.error(appointmentResult.reason);
                }

                // Check the result of the second API call (report details)
                if (reportResult.status === 'fulfilled') {
                    setReport(reportResult.value.data);
                } else {
                    // This is not an error; it just means the report hasn't been submitted.
                    // We set the report to null, and the UI will handle it gracefully.
                    setReport(null);
                    console.log("Pre-consultation report not found for this appointment.");
                }

            } catch (error) {
                toast.error("An unexpected error occurred while fetching data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [appointmentId, token]);

    if (loading) return <LoadingSpinner />;
    
    // This safety check now works correctly because `appointment` will be set
    // even if the report is missing.
    if (!appointment || !appointment.appointment || !appointment.patientDetails || !appointment.doctorDetails) {
        return <p className="text-center text-red-500">Could not load complete consultation details. Please try again later.</p>;
    }

    const { appointment: appointmentDetails, patientDetails, doctorDetails } = appointment;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
                <ArrowLeft size={16} className="mr-2"/> Back to Appointments
            </Button>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="bg-gray-800 text-white p-6">
                    <h1 className="text-3xl font-bold">Consultation Details</h1>
                    <p className="text-gray-300">Appointment ID: {appointmentDetails.id}</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b">
                    <div className="flex items-center gap-4">
                        <User className="w-8 h-8 text-blue-500"/>
                        <div>
                            <p className="text-sm text-gray-500">Patient</p>
                            <p className="font-semibold text-lg">{patientDetails.fullName}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Stethoscope className="w-8 h-8 text-green-500"/>
                        <div>
                            <p className="text-sm text-gray-500">Doctor</p>
                            <p className="font-semibold text-lg">{doctorDetails.fullName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 col-span-1 md:col-span-2">
                        <Calendar className="w-8 h-8 text-red-500"/>
                        <div>
                            <p className="text-sm text-gray-500">Date & Time</p>
                            <p className="font-semibold text-lg">{new Date(appointmentDetails.appointmentTime).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                {report ? (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText /> Pre-Consultation Report</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-700">Chief Complaint</h3>
                                <p className="mt-1 text-gray-600 pl-4 border-l-4">{report.chiefComplaint}</p>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-gray-700">Background Information</h3>
                                <ul className="list-disc pl-8 mt-2 space-y-2 text-gray-600">
                                    {Object.entries(report.staticQuestions).map(([question, answer]) => (
                                        <li key={question}>
                                            <span className="font-semibold">{question}</span>: {answer || <span className="italic text-gray-400">Not answered</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-700">Current Medications</h3>
                                <ul className="list-disc pl-8 mt-2 space-y-1 text-gray-600">
                                    {report.currentMedications.length > 0 ? report.currentMedications.map((med, i) => (
                                        <li key={i}>{med}</li>
                                    )) : <li className="italic text-gray-400">None provided</li>}
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-gray-700">Attachments</h3>
                                <ul className="list-disc pl-8 mt-2 space-y-1">
                                    {report.attachmentUrls.length > 0 ? report.attachmentUrls.map((url, i) => (
                                        <li key={i}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                View Attachment {i + 1}
                                            </a>
                                        </li>
                                    )) : <li className="italic text-gray-400">None provided</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <p>The pre-consultation report has not been submitted for this appointment yet.</p>
                    </div>
                )}


                <div className="p-6 bg-gray-50 flex flex-wrap gap-4 justify-center">
                    <Button onClick={() => router.push(`/chat/${user?.role === 'PATIENT' ? doctorDetails.id : patientDetails.id}`)} size="lg">
                        <MessageSquare className="mr-2"/> Chat
                    </Button>
                    <Button onClick={() => router.push(`/call/${appointmentDetails.id}`)} size="lg">
                        <Video className="mr-2"/> Join Video Call
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default function ProtectedViewAppointmentPage() {
    return (
        <ProtectedRoute>
            <ViewAppointmentPage />
        </ProtectedRoute>
    )
}