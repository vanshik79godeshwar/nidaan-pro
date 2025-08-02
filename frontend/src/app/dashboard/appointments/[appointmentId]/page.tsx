'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Image from 'next/image';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { downloadPdf } from '@/lib/pdfGenerator';

// Type for the full report data from our backend
interface PreConsultationReport {
    id: string;
    appointmentId: string;
    chiefComplaint: string;
    staticQuestions: string; // This is a JSON string
    dynamicQuestions: string; // This is a JSON string
    detailedDescription: string;
    currentMedications: string;
    attachmentUrls: string[];
    createdAt: string;
}

// A helper component to render a section of the report
const ReportSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-500 border-b pb-2 mb-3">{title}</h3>
        <div className="text-gray-800 space-y-2">{children}</div>
    </div>
);

function ViewReportPage() {
    const params = useParams();
    const { appointmentId } = params;
    const { token } = useAuth();

    const [report, setReport] = useState<PreConsultationReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!appointmentId || !token) return;
            try {
                const { data } = await api.get(`/consultations/reports/appointment/${appointmentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReport(data);
            } catch (err) {
                setError('Failed to load the pre-consultation report.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [appointmentId, token]);

    const handleDownload = () => {
        downloadPdf('reportContent', `Pre-Consultation_Report_${appointmentId}`);
    };

    if (loading) return <p>Loading report...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!report) return <p>No report found for this appointment.</p>;

    // Safely parse the JSON strings from the report
    const staticData = JSON.parse(report.staticQuestions || '{}');
    const dynamicData = JSON.parse(report.dynamicQuestions || '[]');

    return (
        <div ref={reportRef} className="max-w-4xl mx-auto">
            <div id="reportContent" className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-Consultation Report</h1>
                        <p className="text-gray-500">Submitted on: {new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                    <h2 className="text-2xl font-bold text-blue-600">Nidaan Pro</h2>
                </div>

                <ReportSection title="Chief Complaint">
                    <p className="text-xl font-semibold">{report.chiefComplaint}</p>
                </ReportSection>

                <ReportSection title="Symptom Analysis">
                    <p><strong>Duration:</strong> {staticData.symptomDuration}</p>
                    <p><strong>Severity:</strong> {staticData.symptomSeverity} / 10</p>
                    <p><strong>Makes it better:</strong> {staticData.makesBetter || 'N/A'}</p>
                    <p><strong>Makes it worse:</strong> {staticData.makesWorse || 'N/A'}</p>
                </ReportSection>

                {dynamicData && dynamicData.length > 0 && (
                    <ReportSection title="AI-Generated Follow-up">
                        {dynamicData.map((qa: any, index: number) => (
                            <p key={index}><strong>{qa.question}:</strong> {qa.answer}</p>
                        ))}
                    </ReportSection>
                )}
                
                <ReportSection title="Patient's Detailed Description">
                    <p className="whitespace-pre-wrap">{report.detailedDescription || 'N/A'}</p>
                </ReportSection>

                <ReportSection title="Current Medications">
                    <p className="whitespace-pre-wrap">{report.currentMedications || 'N/A'}</p>
                </ReportSection>

                {report.attachmentUrls && report.attachmentUrls.length > 0 && (
                    <ReportSection title="Attachments">
                        <div className="flex flex-wrap gap-4">
                            {report.attachmentUrls.map(url => (
                                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                    <Image src={url} alt="Attachment" width={150} height={150} className="rounded-lg object-cover border hover:opacity-80" />
                                </a>
                            ))}
                        </div>
                    </ReportSection>
                )}
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

export default function ProtectedViewReportPage() {
    return (
        <ProtectedRoute>
            <ViewReportPage />
        </ProtectedRoute>
    )
}