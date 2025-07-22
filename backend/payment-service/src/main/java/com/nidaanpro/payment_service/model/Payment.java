package com.nidaanpro.payment_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID appointmentId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    private String dummyTransactionId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED
    }
}