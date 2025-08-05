'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import { ArrowLeft, CheckCircle, FileText, Pill, Plus, Type, Upload, X } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

interface PreConsultationFlowProps {
  appointmentId: string;
}

// --- Data Structure for the Form ---
interface ReportData {
  chiefComplaint: string;
  staticQuestions: { question: string; answer: string }[];
  currentMedications: string[];
  attachmentUrls: string[];
}

// --- Pre-defined questions for a structured consultation ---
const STATIC_QUESTIONS = [
  "When did your symptoms first start?",
  "Have you experienced these symptoms before?",
  "Is there anything that makes your symptoms better or worse?",
  "Are you allergic to any medications?",
  "Have you had any recent surgeries or hospitalizations?",
];

export default function PreConsultationFlow({ appointmentId }: PreConsultationFlowProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { token } = useAuth();
  
  const [reportData, setReportData] = useState<ReportData>({
    chiefComplaint: '',
    staticQuestions: STATIC_QUESTIONS.map(q => ({ question: q, answer: '' })),
    currentMedications: [''],
    attachmentUrls: [],
  });

  const handleStaticQuestionChange = (index: number, answer: string) => {
    const updatedQuestions = [...reportData.staticQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], answer };
    setReportData({ ...reportData, staticQuestions: updatedQuestions });
  };

  const handleMedicationChange = (index: number, value: string) => {
    const updatedMeds = [...reportData.currentMedications];
    updatedMeds[index] = value;
    setReportData({ ...reportData, currentMedications: updatedMeds });
  };

  const addMedicationField = () => {
    setReportData({ ...reportData, currentMedications: [...reportData.currentMedications, ''] });
  };

  const removeMedicationField = (index: number) => {
    const updatedMeds = reportData.currentMedications.filter((_, i) => i !== index);
    setReportData({ ...reportData, currentMedications: updatedMeds });
  };

  const handleUploadComplete = (urls: string[]) => {
    setReportData(prev => ({ ...prev, attachmentUrls: [...prev.attachmentUrls, ...urls] }));
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    toast.info("Submitting your report, please wait...");

    const finalReport = {
      appointmentId,
      chiefComplaint: reportData.chiefComplaint,
      // For simplicity, we are sending static and dynamic questions in the same field.
      // Your backend can handle this as it already accepts a Map.
      staticQuestions: reportData.staticQuestions.reduce((acc, q) => {
        acc[q.question] = q.answer;
        return acc;
      }, {} as Record<string, string>),
      dynamicQuestions: {}, // Sending empty as we removed AI
      detailedDescription: '', // This can be added back if needed
      currentMedications: reportData.currentMedications.filter(med => med.trim() !== ''),
      attachmentUrls: reportData.attachmentUrls,
    };

    try {
      await api.post('/consultations/reports', finalReport, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Pre-consultation report submitted successfully!");
      router.push(`/dashboard/appointments/${appointmentId}`);
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Chief Complaint</h2>
            <p className="text-gray-600 mb-6">Please describe the main reason for this consultation in your own words.</p>
            <textarea
              className="w-full p-3 border rounded-md h-40"
              placeholder="e.g., I've had a persistent headache for the last 3 days..."
              value={reportData.chiefComplaint}
              onChange={(e) => setReportData({ ...reportData, chiefComplaint: e.target.value })}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Background Information</h2>
            <p className="text-gray-600 mb-6">Please answer these questions to help the doctor understand your condition better.</p>
            <div className="space-y-6">
              {reportData.staticQuestions.map((q, index) => (
                <div key={index}>
                  <label className="font-semibold text-gray-700">{q.question}</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md mt-2"
                    value={q.answer}
                    onChange={(e) => handleStaticQuestionChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Medications & Attachments</h2>
            <div className="mb-8">
                <label className="font-semibold text-gray-700">List any medications you are currently taking (if any).</label>
                {reportData.currentMedications.map((med, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                        <Pill className="text-gray-400" />
                        <input
                            type="text"
                            className="flex-grow p-3 border rounded-md"
                            placeholder="e.g., Paracetamol 500mg"
                            value={med}
                            onChange={(e) => handleMedicationChange(index, e.target.value)}
                        />
                        {reportData.currentMedications.length > 1 && (
                            <Button variant="danger" size="icon" onClick={() => removeMedicationField(index)}><X size={16} /></Button>
                        )}
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addMedicationField} className="mt-2"><Plus size={16}/> Add Medication</Button>
            </div>
            <div>
                <label className="font-semibold text-gray-700">Upload any relevant files (e.g., lab reports, photos).</label>
                <div className="mt-2 p-4 border-2 border-dashed rounded-md">
                    <ImageUploader onUploadComplete={handleUploadComplete} />
                </div>
            </div>
          </div>
        );
      case 4:
        return (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Review Your Report</h2>
              <p className="text-gray-600 mb-6">Please review the information below before submitting.</p>
              <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
                <div>
                  <h3 className="font-bold flex items-center gap-2"><Type />Chief Complaint</h3>
                  <p className="mt-1 pl-6">{reportData.chiefComplaint || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2"><FileText />Background Information</h3>
                  <ul className="list-disc pl-10 mt-1 space-y-1">
                    {reportData.staticQuestions.filter(q => q.answer).map(q => <li key={q.question}><strong>{q.question}</strong> {q.answer}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2"><Pill />Current Medications</h3>
                  <ul className="list-disc pl-10 mt-1 space-y-1">
                    {reportData.currentMedications.filter(m => m).map((med, i) => <li key={i}>{med}</li>)}
                    {reportData.currentMedications.filter(m => m).length === 0 && <li>None</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2"><Upload />Attachments</h3>
                  <ul className="list-disc pl-10 mt-1 space-y-1">
                    {reportData.attachmentUrls.map((url, i) => <li key={i}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Attachment {i + 1}</a></li>)}
                    {reportData.attachmentUrls.length === 0 && <li>None</li>}
                  </ul>
                </div>
              </div>
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
      <div className="mb-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>
      
      {renderStep()}

      <div className="mt-8 pt-4 border-t flex justify-between">
        <Button onClick={prevStep} disabled={step === 1 || isLoading}>
            <ArrowLeft className="mr-2"/> Back
        </Button>
        {step < 4 && (
          <Button onClick={nextStep}>
            Next
          </Button>
        )}
        {step === 4 && (
          <Button onClick={handleSubmit} disabled={isLoading}>
            <CheckCircle className="mr-2"/> Submit Report
          </Button>
        )}
      </div>
    </div>
  );
}