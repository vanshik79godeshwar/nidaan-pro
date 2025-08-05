package com.nidaanpro.payment_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentRequestDto(
        UUID referenceId,
        BigDecimal amount,
        String type
) {}