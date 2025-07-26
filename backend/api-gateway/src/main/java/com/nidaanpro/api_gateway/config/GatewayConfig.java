package com.nidaanpro.api_gateway.config;

import com.nidaanpro.api_gateway.filter.AuthenticationFilter;
import com.nidaanpro.api_gateway.util.JwtUtil;
import com.nidaanpro.api_gateway.util.RouteValidator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

//    @Bean
//    public AuthenticationFilter authenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
//        return new AuthenticationFilter(validator, jwtUtil);
//    }
}