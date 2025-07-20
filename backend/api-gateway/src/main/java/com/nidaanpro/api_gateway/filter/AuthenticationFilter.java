package com.nidaanpro.api_gateway.filter;

import com.nidaanpro.api_gateway.util.JwtUtil;
import com.nidaanpro.api_gateway.util.RouteValidator;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

// REMOVED @Component from here
public class AuthenticationFilter implements GlobalFilter {

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    // ADDED a constructor to receive dependencies
    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        System.out.println("Authentication filter is triggered for " + exchange.getRequest().getURI().getPath());

        if (validator.isSecured.test(exchange.getRequest())) {
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                System.out.println("Missing authorization header");
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }
            try {
                jwtUtil.validateToken(authHeader);
            } catch (Exception e) {
                System.out.println("Invalid token... " + e.getMessage());
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }
        return chain.filter(exchange);
    }
}