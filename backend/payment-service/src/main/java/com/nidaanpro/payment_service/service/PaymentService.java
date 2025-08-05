package com.nidaanpro.payment_service.service;

import com.nidaanpro.payment_service.dto.CreatePaymentRequestDto;
import com.nidaanpro.payment_service.dto.PaymentWebhookRequestDto;
import com.nidaanpro.payment_service.model.Payment;
import com.nidaanpro.payment_service.repo.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final WebClient.Builder webClientBuilder;
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    public PaymentService(PaymentRepository paymentRepository, RazorpayClient razorpayClient, WebClient.Builder webClientBuilder) {
        this.paymentRepository = paymentRepository;
        this.razorpayClient = razorpayClient;
        this.webClientBuilder = webClientBuilder;
    }

    @Transactional
    public Payment createPaymentOrder(CreatePaymentRequestDto dto) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", dto.amount().multiply(new java.math.BigDecimal(100)));
        orderRequest.put("currency", "INR");

        String shortReceiptId = "rcptid_" + dto.referenceId().toString().replace("-", "");
        orderRequest.put("receipt", shortReceiptId);

        Order order = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = order.get("id");

        Payment payment = new Payment();
        payment.setReferenceId(dto.referenceId());
        payment.setAmount(dto.amount());
        payment.setOrderId(razorpayOrderId);
        payment.setType(Payment.PaymentType.valueOf(dto.type().toUpperCase()));
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(PaymentWebhookRequestDto dto) {
        logger.info("Webhook received for paymentId: {}. Status: {}", dto.paymentId(), dto.status());
        Payment payment = paymentRepository.findById(dto.paymentId())
                .orElseThrow(() -> {
                    logger.error("Payment not found for ID: {}", dto.paymentId());
                    return new RuntimeException("Payment not found");
                });

        Payment.PaymentStatus newStatus = Payment.PaymentStatus.valueOf(dto.status().toUpperCase());

        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            logger.warn("Payment ID: {} has already been marked as SUCCESS. Skipping confirmation.", payment.getId());
            return payment;
        }

        payment.setStatus(newStatus);
        Payment savedPayment = paymentRepository.save(payment);
        logger.info("Payment ID: {} status updated to {}", savedPayment.getId(), savedPayment.getStatus());

        if (savedPayment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            logger.info("Payment successful. Initiating confirmation call for referenceId: {} of type: {}", savedPayment.getReferenceId(), savedPayment.getType());

            String confirmationUrl;
            if (savedPayment.getType() == Payment.PaymentType.APPOINTMENT) {
                confirmationUrl = "http://CONSULTATION-SERVICE/api/consultations/" + savedPayment.getReferenceId() + "/confirm-payment";
            } else {
                confirmationUrl = "http://CONSULTATION-SERVICE/api/consultations/emergency/" + savedPayment.getReferenceId() + "/confirm-payment";
            }

            logger.info("Calling consultation service at URL: {}", confirmationUrl);

            try {
                webClientBuilder.build().post()
                        .uri(confirmationUrl)
                        .retrieve()
                        .toBodilessEntity()
                        .block();
                logger.info("Successfully called consultation service for referenceId: {}", savedPayment.getReferenceId());
            } catch (Exception e) {
                logger.error("CRITICAL: Failed to call consultation service to confirm payment for referenceId: {}. Manual intervention may be required.", savedPayment.getReferenceId(), e);
            }
        }
        return savedPayment;
    }
}