package com.nidaanpro.payment_service.service;

import com.nidaanpro.payment_service.dto.CreatePaymentRequestDto;
import com.nidaanpro.payment_service.dto.PaymentWebhookRequestDto;
import com.nidaanpro.payment_service.model.Payment;
import com.nidaanpro.payment_service.repo.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final WebClient.Builder webClientBuilder;

    public PaymentService(PaymentRepository paymentRepository, RazorpayClient razorpayClient, WebClient.Builder webClientBuilder) {
        this.paymentRepository = paymentRepository;
        this.razorpayClient = razorpayClient;
        this.webClientBuilder = webClientBuilder;
    }

    public Payment createPaymentOrder(CreatePaymentRequestDto dto) throws RazorpayException {
        // 1. Create a Razorpay Order
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", dto.amount().multiply(new java.math.BigDecimal(100))); // Amount in paise
        orderRequest.put("currency", "INR");

        // --- THIS IS THE FIX ---
        // Create a shorter receipt ID that is under 40 characters
        String shortReceiptId = "rcptid_" + dto.appointmentId().toString().replace("-", "");
        orderRequest.put("receipt", shortReceiptId);

        Order order = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = order.get("id");

        // 2. Save the payment details to our database
        Payment payment = new Payment();
        payment.setAppointmentId(dto.appointmentId());
        payment.setAmount(dto.amount());
        payment.setDummyTransactionId(razorpayOrderId); // Store the Razorpay Order ID
        return paymentRepository.save(payment);
    }

    public Payment updatePaymentStatus(PaymentWebhookRequestDto dto) {
        Payment payment = paymentRepository.findById(dto.paymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Payment.PaymentStatus newStatus = Payment.PaymentStatus.valueOf(dto.status().toUpperCase());
        payment.setStatus(newStatus);

        Payment savedPayment = paymentRepository.save(payment);

        if (savedPayment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            webClientBuilder.build().post()
                    .uri("http://CONSULTATION-SERVICE/api/consultations/{appointmentId}/confirm-payment", payment.getAppointmentId())
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block(); // .block() makes the call synchronous
        }

        return savedPayment;
    }
}