package com.resolvehub.backend.health;

import com.resolvehub.backend.config.BackendProperties;
import java.time.Instant;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final BackendProperties backendProperties;

    public HealthController(BackendProperties backendProperties) {
        this.backendProperties = backendProperties;
    }

    @GetMapping
    public HealthResponse health() {
        return new HealthResponse("UP", backendProperties.serviceName(), Instant.now());
    }

    public record HealthResponse(String status, String service, Instant checkedAt) {
    }
}