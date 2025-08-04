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

    // --- All your existing constants and queue/exchange/binding beans are correct ---
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
    public static final String EMERGENCY_QUEUE_NAME = "emergency-request-notification-queue";
    public static final String EMERGENCY_ROUTING_KEY = "emergency.request.new";
    public static final String EMERGENCY_ROUTING_KEY_ACCEPTED = "emergency.request.accepted";

    @Bean public Queue registrationQueue() { return new Queue(QUEUE_NAME); }
    @Bean public TopicExchange registrationExchange() { return new TopicExchange(EXCHANGE_NAME); }
    @Bean public Binding registrationBinding() { return BindingBuilder.bind(registrationQueue()).to(registrationExchange()).with(ROUTING_KEY); }
    @Bean public Queue passwordResetQueue() { return new Queue(PW_RESET_QUEUE_NAME); }
    @Bean public TopicExchange passwordResetExchange() { return new TopicExchange(PW_RESET_EXCHANGE_NAME); }
    @Bean public Binding passwordResetBinding() { return BindingBuilder.bind(passwordResetQueue()).to(passwordResetExchange()).with(PW_RESET_ROUTING_KEY); }
    @Bean public Queue appointmentQueue() { return new Queue(APPOINTMENT_QUEUE_NAME); }
    @Bean public TopicExchange appointmentExchange() { return new TopicExchange(APPOINTMENT_EXCHANGE_NAME); }
    @Bean public Binding appointmentBinding() { return BindingBuilder.bind(appointmentQueue()).to(appointmentExchange()).with(APPOINTMENT_ROUTING_KEY); }
    @Bean public Queue emergencyQueue() { return new Queue(EMERGENCY_QUEUE_NAME); }
    @Bean public TopicExchange emergencyExchange() { return new TopicExchange(EMERGENCY_EXCHANGE_NAME); }
    @Bean public Binding emergencyBinding() {
        return BindingBuilder.bind(emergencyQueue()).to(emergencyExchange()).with(EMERGENCY_ROUTING_KEY);
    }
    @Bean public Binding emergencyAcceptedBinding() {
        // We bind the same queue to a new routing key
        return BindingBuilder.bind(emergencyQueue()).to(emergencyExchange()).with(EMERGENCY_ROUTING_KEY_ACCEPTED);
    }
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // 2. We create a factory for our RabbitMQ listeners.
    @Bean
    public SimpleRabbitListenerContainerFactory jsaFactory(ConnectionFactory connectionFactory, SimpleRabbitListenerContainerFactoryConfigurer configurer) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        // Crucially, we tell this factory to use our JSON converter.
        // It will now read the "__TypeId__" header and deserialize the message into the correct Java object.
        factory.setMessageConverter(jsonMessageConverter());
        return factory;
    }
}