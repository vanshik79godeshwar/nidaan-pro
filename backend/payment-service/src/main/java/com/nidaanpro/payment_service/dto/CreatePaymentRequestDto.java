package com.nidaanpro.payment_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentRequestDto(
        UUID appointmentId,
        BigDecimal amount
) {}