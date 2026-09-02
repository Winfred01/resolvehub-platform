package com.resolvehub.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "resolvehub.backend")
public record BackendProperties(String serviceName, String analyticsBaseUrl) {

    public BackendProperties {
        if (serviceName == null || serviceName.isBlank()) {
            serviceName = "resolvehub-backend";
        }
        if (analyticsBaseUrl == null || analyticsBaseUrl.isBlank()) {
            analyticsBaseUrl = "http://localhost:8000";
        }
    }
}
