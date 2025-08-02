'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AddNotesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.appointmentId as string;

    const [diagnosis, setDiagnosis] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [prescription, setPrescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            diagnosis,
            doctorNotes,
            prescription,
        };

        const promise = () => new Promise(async (resolve, reject) => {
            try {
                await api.post(`/consultations/${appointmentId}/notes`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                router.push('/dashboard/appointments');
                resolve("Consultation notes have been saved successfully.");
            } catch (err) {
                console.error("Failed to submit notes", err);
                reject("Failed to save notes. Please try again.");
            } finally {
                setIsLoading(false);
            }
        });

        toast.promise(promise(), {
            loading: 'Saving notes...',
            success: (message) => `${message}`,
            error: (message) => `${message}`,
        });
    };

    return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Post-Consultation Notes</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="diagnosis" className="block text-sm font-bold text-gray-700 mb-1">Diagnosis</label>
                        <textarea
                            id="diagnosis"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            required
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., Viral Infection, Minor Sprain"
                        />
                    </div>
                    <div>
                        <label htmlFor="doctorNotes" className="block text-sm font-bold text-gray-700 mb-1">Doctor's Notes (for patient)</label>
                        <textarea
                            id="doctorNotes"
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            rows={6}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., Recommended bed rest for 3 days, drink plenty of fluids..."
                        />
                    </div>
                     <div>
                        <label htmlFor="prescription" className="block text-sm font-bold text-gray-700 mb-1">Prescription</label>
                        <textarea
                            id="prescription"
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., Paracetamol 500mg - 1 tablet twice a day after meals for 3 days."
                        />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Consultation Notes'}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}