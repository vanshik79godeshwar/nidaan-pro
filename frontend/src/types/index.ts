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
}

// This matches the final object returned by the new backend endpoint
export interface AppointmentDetailDto {
  appointment: Appointment;
  doctorDetails: {
    userId: string;
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
}