package com.nidaanpro.api_gateway.util;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                // If the path starts with /ws/, it is NOT secured
                if (request.getURI().getPath().startsWith("/ws/")) {
                    return false;
                }
                // Otherwise, check against the list of open API endpoints
                return openApiEndpoints
                        .stream()
                        .noneMatch(uri -> request.getURI().getPath().startsWith(uri));
            };

}