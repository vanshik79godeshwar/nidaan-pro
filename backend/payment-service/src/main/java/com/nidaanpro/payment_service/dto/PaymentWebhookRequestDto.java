package com.nidaanpro.payment_service.dto;

import java.util.UUID;

public record PaymentWebhookRequestDto(
        UUID paymentId,
        String status // "SUCCESS" or "FAILED"
) {}