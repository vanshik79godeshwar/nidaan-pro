package com.nidaanpro.payment_service.controller;

import com.nidaanpro.payment_service.dto.CreatePaymentRequestDto;
import com.nidaanpro.payment_service.dto.PaymentWebhookRequestDto;
import com.nidaanpro.payment_service.model.Payment;
import com.nidaanpro.payment_service.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Payment> createPaymentOrder(@RequestBody CreatePaymentRequestDto dto) throws RazorpayException {
        Payment payment = paymentService.createPaymentOrder(dto);
        return new ResponseEntity<>(payment, HttpStatus.CREATED);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Payment> handleWebhook(@RequestBody PaymentWebhookRequestDto dto) {
        Payment updatedPayment = paymentService.updatePaymentStatus(dto);
        return ResponseEntity.ok(updatedPayment);
    }
}