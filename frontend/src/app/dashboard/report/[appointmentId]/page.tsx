// frontend/src/app/dashboard/report/[appointmentId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import Image from 'next/image';

// This will hold all the data we collect
interface ReportData {
    chiefComplaint: string;
    symptomDuration: string;
    symptomSeverity: number;
    makesWorse: string;
    makesBetter: string;
    dynamicQuestions?: { question: string, answer: string }[];
    detailedDescription: string;
    currentMedications: string;
    attachmentUrls: string[];
}

function PreConsultationReportPage() {
    const params = useParams();
    const router = useRouter();
    const { appointmentId } = params;
    const { token } = useAuth();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<ReportData>>({
        attachmentUrls: [],
        dynamicQuestions: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDynamicQuestionChange = (index: number, answer: string) => {
        setFormData(prev => {
            const newDynamicQuestions = [...(prev.dynamicQuestions || [])];
            newDynamicQuestions[index] = { ...newDynamicQuestions[index], answer };
            return { ...prev, dynamicQuestions: newDynamicQuestions };
        });
    };
    
    const handleImageUpload = (url: string) => {
        setFormData(prev => ({
            ...prev,
            attachmentUrls: [...(prev.attachmentUrls || []), url]
        }));
    };

    const fetchDynamicQuestions = async () => {
        if (!token || !formData.chiefComplaint) return;
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                chiefComplaint: formData.chiefComplaint,
                symptomDuration: formData.symptomDuration,
                symptomSeverity: formData.symptomSeverity,
            };

            console.log("Fetching dynamic questions with payload:", payload);

            // --- THIS IS THE FIX ---
            // We now call the API Gateway's AI endpoint directly.
            const { data } = await api.post('/ai/dynamic-questions', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // ---------------------

            // The rest of the function remains the same...
            console.log("Received dynamic questions:", data);
            const questions = JSON.parse(data); // Assuming the gateway returns the JSON string directly
            setFormData(prev => ({
                ...prev,
                dynamicQuestions: questions.map((q: string) => ({ question: q, answer: '' }))
            }));
            nextStep();
        } catch (err) {
            console.error("Failed to fetch dynamic questions", err);
            setError("Could not generate AI questions, please proceed.");
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleNext = () => {
        if (step === 2) {
            fetchDynamicQuestions();
        } else {
            nextStep();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                ...formData,
                appointmentId,
                staticQuestions: JSON.stringify({
                    symptomDuration: formData.symptomDuration,
                    symptomSeverity: formData.symptomSeverity,
                    makesWorse: formData.makesWorse,
                    makesBetter: formData.makesBetter,
                }),
                dynamicQuestions: JSON.stringify(formData.dynamicQuestions),
            };
            await api.post('/consultations/reports', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Report submitted successfully!');
            router.push('/dashboard/appointments');
        } catch (err) {
            setError('Failed to submit report. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Chief Complaint</h2>
                        <Input id="chiefComplaint" name="chiefComplaint" label="What is the main reason for your visit?" value={formData.chiefComplaint || ''} onChange={handleInputChange} required />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Symptom Details</h2>
                        <Input id="symptomDuration" name="symptomDuration" label="How long have you had this symptom?" placeholder="e.g., 2 days, 1 week" value={formData.symptomDuration || ''} onChange={handleInputChange} required />
                        <div>
                            <label htmlFor="symptomSeverity">On a scale of 1-10, how severe is it?</label>
                            <select id="symptomSeverity" name="symptomSeverity" value={formData.symptomSeverity || '5'} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md">
                                {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                        </div>
                        <Input id="makesBetter" name="makesBetter" label="Is there anything that makes it better?" value={formData.makesBetter || ''} onChange={handleInputChange} />
                        <Input id="makesWorse" name="makesWorse" label="Is there anything that makes it worse?" value={formData.makesWorse || ''} onChange={handleInputChange} />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">AI Follow-up Questions</h2>
                        {isLoading ? <p>Our AI is preparing some questions for you...</p> : (
                            formData.dynamicQuestions?.map((qa, index) => (
                                <Input key={index} id={`dyn_q_${index}`} name={`dyn_q_${index}`} label={qa.question} value={qa.answer} onChange={(e) => handleDynamicQuestionChange(index, e.target.value)} />
                            ))
                        )}
                    </div>
                );
            case 4:
                return (
                     <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Additional Details & Attachments</h2>
                        <textarea name="detailedDescription" placeholder="Describe your issue in more detail..." rows={6} value={formData.detailedDescription || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md" />
                        <textarea name="currentMedications" placeholder="List any current medications..." rows={3} value={formData.currentMedications || ''} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md" />
                        <ImageUploader onUploadSuccess={handleImageUpload} />
                        <div className="flex flex-wrap gap-4">{formData.attachmentUrls?.map(url => (<Image key={url} src={url} alt="upload" width={100} height={100} className="rounded-md object-cover" />))}</div>
                    </div>
                );
            case 5:
                return (
                     <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Review Your Report</h2>
                        <div className="p-4 border rounded-md bg-gray-50 space-y-2">
                            <p><strong>Complaint:</strong> {formData.chiefComplaint}</p>
                            <p><strong>Duration:</strong> {formData.symptomDuration}, <strong>Severity:</strong> {formData.symptomSeverity}/10</p>
                            {formData.dynamicQuestions?.map((qa, i) => <p key={i}><strong>{qa.question}:</strong> {qa.answer}</p>)}
                            <p><strong>Details:</strong> {formData.detailedDescription}</p>
                            <p><strong>Attachments:</strong> {formData.attachmentUrls?.length || 0} file(s)</p>
                        </div>
                        {error && <p className="text-red-600">{error}</p>}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pre-Consultation Report</h1>
            <p className="text-gray-500 mb-6">Step {step} of 5</p>
            <div className="min-h-[400px]">{renderStep()}</div>
            <div className="mt-8 pt-6 border-t flex justify-between items-center">
                {step > 1 && <Button onClick={prevStep} className="bg-gray-600 hover:bg-gray-700 w-auto">Back</Button>}
                <div /> 
                {step < 5 && <Button onClick={handleNext} disabled={isLoading} className="w-auto">{isLoading ? 'Analyzing...' : 'Next'}</Button>}
                {step === 5 && <Button onClick={handleSubmit} disabled={isLoading} className="w-auto">{isLoading ? 'Submitting...' : 'Submit to Doctor'}</Button>}
            </div>
        </div>
    );
}

export default function ProtectedReportPage() {
    return (<ProtectedRoute><PreConsultationReportPage /></ProtectedRoute>);
}