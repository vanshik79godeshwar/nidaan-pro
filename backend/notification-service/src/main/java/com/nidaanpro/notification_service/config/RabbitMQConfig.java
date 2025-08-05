// backend/notification-service/src/main/java/com/nidaanpro/notification_service/config/RabbitMQConfig.java

package com.nidaanpro.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- All your existing constants are here for reference ---
    public static final String QUEUE_NAME = "user-registration-queue";
    public static final String EXCHANGE_NAME = "user-registration-exchange";
    public static final String ROUTING_KEY = "user.registered";
    public static final String PW_RESET_QUEUE_NAME = "password-reset-queue";
    public static final String PW_RESET_EXCHANGE_NAME = "password-reset-exchange";
    public static final String PW_RESET_ROUTING_KEY = "password.reset.request";
    public static final String APPOINTMENT_EXCHANGE_NAME = "appointment-exchange";
    public static final String APPOINTMENT_QUEUE_NAME = "appointment-booking-queue";
    public static final String APPOINTMENT_ROUTING_KEY = "appointment.booked";
    public static final String EMERGENCY_EXCHANGE_NAME = "emergency-request-exchange";

    // --- THIS IS THE FIX ---
    // 1. Define constants for each queue and routing key
    public static final String EMERGENCY_NEW_QUEUE_NAME = "emergency-request-new-queue";
    public static final String EMERGENCY_ACCEPTED_QUEUE_NAME = "emergency-request-accepted-queue";
    public static final String EMERGENCY_ROUTING_KEY_NEW = "emergency.request.new";
    public static final String EMERGENCY_ROUTING_KEY_ACCEPTED = "emergency.request.accepted";

    // ... (Your other bean definitions for registration, password reset, etc. remain the same)
    @Bean public Queue registrationQueue() { return new Queue(QUEUE_NAME); }
    @Bean public TopicExchange registrationExchange() { return new TopicExchange(EXCHANGE_NAME); }
    @Bean public Binding registrationBinding() { return BindingBuilder.bind(registrationQueue()).to(registrationExchange()).with(ROUTING_KEY); }
    @Bean public Queue passwordResetQueue() { return new Queue(PW_RESET_QUEUE_NAME); }
    @Bean public TopicExchange passwordResetExchange() { return new TopicExchange(PW_RESET_EXCHANGE_NAME); }
    @Bean public Binding passwordResetBinding() { return BindingBuilder.bind(passwordResetQueue()).to(passwordResetExchange()).with(PW_RESET_ROUTING_KEY); }
    @Bean public Queue appointmentQueue() { return new Queue(APPOINTMENT_QUEUE_NAME); }
    @Bean public TopicExchange appointmentExchange() { return new TopicExchange(APPOINTMENT_EXCHANGE_NAME); }
    @Bean public Binding appointmentBinding() { return BindingBuilder.bind(appointmentQueue()).to(appointmentExchange()).with(APPOINTMENT_ROUTING_KEY); }


    // --- THIS IS THE FIX ---
    // 2. Define a bean for the shared exchange
    @Bean public TopicExchange emergencyExchange() { return new TopicExchange(EMERGENCY_EXCHANGE_NAME); }

    // 3. Create a queue and binding for NEW emergency requests
    @Bean public Queue emergencyNewQueue() { return new Queue(EMERGENCY_NEW_QUEUE_NAME); }
    @Bean public Binding emergencyNewBinding() {
        return BindingBuilder.bind(emergencyNewQueue()).to(emergencyExchange()).with(EMERGENCY_ROUTING_KEY_NEW);
    }

    // 4. Create a SEPARATE queue and binding for ACCEPTED emergency requests
    @Bean public Queue emergencyAcceptedQueue() { return new Queue(EMERGENCY_ACCEPTED_QUEUE_NAME); }
    @Bean public Binding emergencyAcceptedBinding() {
        return BindingBuilder.bind(emergencyAcceptedQueue()).to(emergencyExchange()).with(EMERGENCY_ROUTING_KEY_ACCEPTED);
    }

    // This part is correct and necessary for deserializing the event objects
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory jsaFactory(ConnectionFactory connectionFactory, SimpleRabbitListenerContainerFactoryConfigurer configurer) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }
}