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
    private UUID referenceId;

    @Column(nullable = false)
    private BigDecimal amount;

    // --- THIS IS THE FIX ---
    // This annotation explicitly tells JPA/Hibernate to map this field
    // to a database column named "order_id".
    @Column(name = "order_id", nullable = false)
    private String orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType type;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED
    }

    public enum PaymentType {
        APPOINTMENT,
        EMERGENCY
    }
}