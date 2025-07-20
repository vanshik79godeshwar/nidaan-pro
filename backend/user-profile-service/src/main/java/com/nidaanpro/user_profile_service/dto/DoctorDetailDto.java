package com.nidaanpro.user_profile_service.dto;

import com.nidaanpro.user_profile_service.model.Doctor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDetailDto {
    private Doctor doctorProfile;
    private String fullName;
    private String email;
}