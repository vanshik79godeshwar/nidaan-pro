package com.nidaanpro.api_gateway.util;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/register", // Wildcard will cover /request-otp and /verify
            "/api/auth/login",
            "/api/auth/forgot-password", // <-- ADD THIS
            "/api/auth/reset-password",  // <-- AND ADD THIS
            "/ws"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));

}