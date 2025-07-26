package com.nidaanpro.api_gateway.filter;

import com.nidaanpro.api_gateway.util.JwtUtil;
import com.nidaanpro.api_gateway.util.RouteValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Order(-1) // This ensures our filter runs before any others
public class AuthenticationFilter implements GlobalFilter {

    // Add a logger to see detailed output
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        var request = exchange.getRequest();
        logger.info("**************************************************************************");
        logger.info(">>> INCOMING REQUEST: {} {}", request.getMethod(), request.getURI().getPath());
        request.getHeaders().forEach((name, values) -> values.forEach(value -> logger.info("Header: {}={}", name, value)));

        // This is the pre-flight check for CORS
        if (request.getMethod() == HttpMethod.OPTIONS) {
            logger.info(">>> OPTIONS request detected. Responding with OK status for CORS pre-flight.");
            exchange.getResponse().setStatusCode(HttpStatus.OK);
            logger.info("**************************************************************************");
            return Mono.empty();
        }

        boolean isSecured = validator.isSecured.test(request);
        logger.info(">>> Is route secured? {}", isSecured);

        if (isSecured) {
            logger.warn(">>> Route is SECURED. Checking for Authorization header...");
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                logger.error(">>> UNAUTHORIZED: Authorization header is missing. Rejecting request.");
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                logger.info("**************************************************************************");
                return exchange.getResponse().setComplete();
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }
            try {
                jwtUtil.validateToken(authHeader);
                logger.info(">>> AUTHORIZED: Token is valid.");
            } catch (Exception e) {
                logger.error(">>> UNAUTHORIZED: Token validation failed.", e);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                logger.info("**************************************************************************");
                return exchange.getResponse().setComplete();
            }
        } else {
            logger.info(">>> Route is NOT SECURED. Passing request through.");
        }

        logger.info("**************************************************************************");
        return chain.filter(exchange);
    }
}