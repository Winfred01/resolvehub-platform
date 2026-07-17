package com.resolvehub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ResolveHubBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResolveHubBackendApplication.class, args);
    }
}