'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppointmentDetailDto } from '@/types';
import { Stethoscope, FileText, Pill, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { downloadPdf } from '@/lib/pdfGenerator';

// A helper component for sections
const SummarySection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-3">
            <Icon className="text-blue-600" size={24} />
            {title}
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {children || <p className="text-gray-500">No information provided.</p>}
        </div>
    </div>
);

function AppointmentSummaryPage() {
    const params = useParams();
    const { appointmentId } = params;
    const { token } = useAuth();

    const [appointment, setAppointment] = useState<AppointmentDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const summaryRef = useRef<HTMLDivElement>(null); // Ref for the PDF wrapper

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            if (!appointmentId || !token) return;
            try {
                const { data } = await api.get(`/consultations/${appointmentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAppointment(data);
            } catch (err) {
                setError('Failed to load appointment summary.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointmentDetails();
    }, [appointmentId, token]);

    const handleDownload = () => {
        if (appointment) {
            downloadPdf('summaryContent', `NidaanPro_Summary_Dr_${appointment.doctorDetails.fullName}`);
        }
    };

    if (loading) return <p className="text-center p-12">Loading summary...</p>;
    if (error) return <p className="text-center p-12 text-red-500">{error}</p>;
    if (!appointment) return <p className="text-center p-12">Could not find appointment details.</p>;

    return (
        <div ref={summaryRef} className="max-w-4xl mx-auto">
            <div id="summaryContent" className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Consultation Summary</h1>
                        <p className="text-gray-600 mt-2">
                            With <strong>Dr. {appointment.doctorDetails.fullName}</strong> on {new Date(appointment.appointment.appointmentTime).toLocaleDateString()}
                        </p>
                    </div>
                    <h2 className="text-2xl font-bold text-blue-600">Nidaan Pro</h2>
                </div>

                <SummarySection title="Doctor's Diagnosis" icon={Stethoscope}>
                    <p>{appointment.appointment.diagnosis}</p>
                </SummarySection>

                <SummarySection title="Doctor's Notes" icon={FileText}>
                    <p>{appointment.appointment.doctorNotes}</p>
                </SummarySection>

                <SummarySection title="Prescription" icon={Pill}>
                    <p>{appointment.appointment.prescription}</p>
                </SummarySection>
            </div>
            
            <div className="mt-6 text-center">
                <Button onClick={handleDownload} className="w-auto inline-flex items-center gap-2">
                    <Download size={18} />
                    Download as PDF
                </Button>
            </div>
        </div>
    );
}

export default function ProtectedSummaryPage() {
    return (
        <ProtectedRoute>
            <AppointmentSummaryPage />
        </ProtectedRoute>
    );
}