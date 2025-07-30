package com.nidaanpro.consultationservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    // This is now the ONLY WebClient.Builder bean.
    // It is correctly configured for all your INTERNAL service-to-service calls.
    @Bean
    @LoadBalanced
    @Primary
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }


    // --- THIS IS THE FIX ---
    // This new bean is specifically for making EXTERNAL calls to the 100ms API.
    // It is named "externalWebClient" and does NOT use the load balancer.
    @Bean("externalWebClient")
    public WebClient externalWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.100ms.live") // Set the base URL for the 100ms API
                .build();
    }
}