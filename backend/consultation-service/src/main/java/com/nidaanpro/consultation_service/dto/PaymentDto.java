package com.nidaanpro.consultation_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

// DTO to capture the response from the payment-service
public record PaymentDto(
        UUID id,
        UUID appointmentId,
        BigDecimal amount,
        String status,
        String dummyTransactionId // This will hold the Razorpay Order ID
) {}