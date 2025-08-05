// frontend/src/app/dashboard/report/[appointmentId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import PreConsultationFlow from '@/components/pre-consultation/PreConsultationFlow';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ReportPage() {
    const params = useParams();
    const appointmentId = params.appointmentId as string;

    return (
        <ProtectedRoute>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold text-center mb-8">Pre-Consultation Form</h1>
                {appointmentId && <PreConsultationFlow appointmentId={appointmentId} />}
            </div>
        </ProtectedRoute>
    );
}