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