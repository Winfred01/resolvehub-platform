package com.resolvehub.backend.tickets;

import com.resolvehub.backend.auth.AuthorizationService;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ticket-categories")
class TicketCategoryController {

    private final AuthorizationService authorizationService;

    TicketCategoryController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @GetMapping
    List<TicketCategoryResponse> list(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        authorizationService.requireAuthenticated(authorization);
        return TicketCategory.all().stream()
                .map(TicketCategoryResponse::from)
                .toList();
    }
}
