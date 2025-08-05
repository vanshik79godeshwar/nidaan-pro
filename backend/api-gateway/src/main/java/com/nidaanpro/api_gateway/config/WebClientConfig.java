package com.nidaanpro.api_gateway.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.DefaultUriBuilderFactory;

@Configuration
public class WebClientConfig {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String geminiApiBaseUrl = "[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent)";

    @Bean
    @Qualifier("geminiWebClient")
    public WebClient geminiWebClient(WebClient.Builder builder) {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(geminiApiBaseUrl);
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.URI_COMPONENT);

        return builder
                .uriBuilderFactory(factory)
                .defaultUriVariables(java.util.Collections.singletonMap("key", geminiApiKey))
                .build();
    }
}