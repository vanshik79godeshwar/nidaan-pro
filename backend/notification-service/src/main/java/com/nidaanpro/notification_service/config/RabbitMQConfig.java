package com.nidaanpro.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Constants for User Registration
    public static final String QUEUE_NAME = "user-registration-queue";
    public static final String EXCHANGE_NAME = "user-registration-exchange";
    public static final String ROUTING_KEY = "user.registered";

    // Constants for Password Reset
    public static final String PW_RESET_QUEUE_NAME = "password-reset-queue";
    public static final String PW_RESET_EXCHANGE_NAME = "password-reset-exchange";
    public static final String PW_RESET_ROUTING_KEY = "password.reset.request";

    // --- ADD CONSTANTS FOR APPOINTMENT BOOKING ---
    public static final String APPOINTMENT_EXCHANGE_NAME = "appointment-exchange";
    public static final String APPOINTMENT_QUEUE_NAME = "appointment-booking-queue";
    public static final String APPOINTMENT_ROUTING_KEY = "appointment.booked";

    // --- BEANS FOR REGISTRATION ---
    @Bean public Queue registrationQueue() { return new Queue(QUEUE_NAME); }
    @Bean public TopicExchange registrationExchange() { return new TopicExchange(EXCHANGE_NAME); }
    @Bean public Binding registrationBinding() {
        return BindingBuilder.bind(registrationQueue()).to(registrationExchange()).with(ROUTING_KEY);
    }

    // --- BEANS FOR PASSWORD RESET ---
    @Bean public Queue passwordResetQueue() { return new Queue(PW_RESET_QUEUE_NAME); }
    @Bean public TopicExchange passwordResetExchange() { return new TopicExchange(PW_RESET_EXCHANGE_NAME); }
    @Bean public Binding passwordResetBinding() {
        return BindingBuilder.bind(passwordResetQueue()).to(passwordResetExchange()).with(PW_RESET_ROUTING_KEY);
    }

    // --- ADD BEANS FOR APPOINTMENT BOOKING ---
    @Bean public Queue appointmentQueue() { return new Queue(APPOINTMENT_QUEUE_NAME); }
    @Bean public TopicExchange appointmentExchange() { return new TopicExchange(APPOINTMENT_EXCHANGE_NAME); }
    @Bean public Binding appointmentBinding() {
        return BindingBuilder.bind(appointmentQueue()).to(appointmentExchange()).with(APPOINTMENT_ROUTING_KEY);
    }

    // --- MESSAGE CONVERTER ---
    @Bean public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}