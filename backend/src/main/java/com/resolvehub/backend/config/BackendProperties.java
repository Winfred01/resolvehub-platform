package com.resolvehub.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "resolvehub.backend")
public record BackendProperties(String serviceName) {

    public BackendProperties {
        if (serviceName == null || serviceName.isBlank()) {
            serviceName = "resolvehub-backend";
        }
    }
}