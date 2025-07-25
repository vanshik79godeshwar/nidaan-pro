package com.nidaanpro.consultation_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "appointment-exchange";
    public static final String QUEUE_NAME = "appointment-booking-queue";
    public static final String ROUTING_KEY = "appointment.booked";

    @Bean public Queue queue() { return new Queue(QUEUE_NAME); }
    @Bean public TopicExchange exchange() { return new TopicExchange(EXCHANGE_NAME); }
    @Bean public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean public MessageConverter jsonMessageConverter() { return new Jackson2JsonMessageConverter(); }
    @Bean public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}