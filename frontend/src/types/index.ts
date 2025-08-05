// frontend/src/types/index.ts

// This interface defines the shape of the full doctor profile object
// that we expect from our backend API
export interface DoctorDetailDto {
  fullName: string;
  email: string;
  doctorProfile: {
    userId: string;
    specialityId: number;
    medicalLicenseNumber: string;
    bio: string;
    yearsOfExperience: number;
    consultationFee: number;
    averageRating: number;
    ratingCount: number;
    profilePictureUrl?: string; // Optional profile picture
  };
}

// This interface defines the shape of the patient profile data
export interface PatientProfile {
  userId: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  address: string | null;
  profilePictureUrl?: string; // Optional profile picture
}

// This matches the Appointment model from the consultation-service
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentTime: string; // ISO 8601 string
  status: 'SCHEDULED' | 'AWAITING_REPORT' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT';
  consultationType: 'SCHEDULED' | 'EMERGENCY';
  consultationUrl: string | null;
  createdAt: string;

  diagnosis: string | null;
  doctorNotes: string | null;
  prescription: string | null;
}

export interface AppointmentDetailDto {
    // The core appointment details are in a nested object
    appointment: Appointment;
    patientDetails: {
        id: string;
        fullName: string;
        email: string;
    };
    doctorDetails: {
        id: string;
        fullName: string;
        email: string;
    };
}

export interface DoctorAppointmentDetailDto {
  appointment: Appointment;
  patientDetails: {
    userId: string;
    fullName: string;
    email: string;
  };
}

// This interface is for the payment DTO response from the backend
export interface PaymentDto {
  id: string; // payment record UUID
  appointmentId: string;
  amount: number;
  status: string;
  dummyTransactionId: string; // This holds the Razorpay Order ID
  orderId: string;
}

export interface DoctorReview {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  rating: number;
  comment: string;
  reviewDate: string; // ISO 8601 string
}

// This matches the DoctorReviewDto which includes patient details
export interface DoctorReviewDto {
  review: DoctorReview;
  patientDetails: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PreConsultationReport {
    id: string;
    appointmentId: string;
    chiefComplaint: string;
    // These fields are now correctly typed as objects and arrays
    staticQuestions: Record<string, string>; // Represents a map or object
    dynamicQuestions: Record<string, string>;
    currentMedications: string[];
    attachmentUrls: string[];
    // Include other fields from your backend model if necessary
    createdAt: string;
    updatedAt: string;
}