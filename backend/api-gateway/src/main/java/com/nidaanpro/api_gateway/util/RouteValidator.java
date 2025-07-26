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
            "/api/auth/reset-password",
            "/ws/" // CHANGE THIS TO A WILDCARD
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    // UPDATE THE LOGIC TO USE startsWith for the /ws endpoint
                    .noneMatch(uri -> request.getURI().getPath().startsWith(uri));

}