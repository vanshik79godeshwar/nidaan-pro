//package com.nidaanpro.chat_service.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.core.annotation.Order;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    /**
//     * Filter chain for WebSocket handshake requests.
//     * This chain is ordered first and specifically targets /ws/** endpoints.
//     * It disables CSRF and sets session management to STATELESS, which is crucial for WebSockets.
//     * It permits all requests to these paths to allow the SockJS handshake to succeed.
//     */
//    @Bean
//    @Order(1)
//    public SecurityFilterChain webSocketSecurityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .securityMatcher("/ws/**") // Apply this filter chain ONLY to /ws/**
//                .csrf(AbstractHttpConfigurer::disable)
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/ws/**").permitAll()
//                );
//        return http.build();
//    }
//
//    /**
//     * Default security filter chain for all other requests.
//     * This secures any other potential REST endpoints in the service.
//     */
//    @Bean
//    @Order(2)
//    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests(auth -> auth
//                        .anyRequest().authenticated()
//                );
//        return http.build();
//    }
//}


package com.nidaanpro.chat_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // This will temporarily permit ALL requests to the service
                        .requestMatchers("/**").permitAll()
                );
        return http.build();
    }
}