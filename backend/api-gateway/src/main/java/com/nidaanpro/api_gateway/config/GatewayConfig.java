package com.nidaanpro.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator myRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("chat-service-websocket", p -> p
                        .path("/ws/**") // Match WebSocket paths
                        .uri("lb:ws://CHAT-SERVICE")) // Use the WebSocket load-balanced URI
                .build();
    }
}