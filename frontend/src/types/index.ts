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
  };
}

// This interface defines the shape of the full doctor profile object
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
  };
}

// --- ADD THE FOLLOWING NEW INTERFACES ---

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