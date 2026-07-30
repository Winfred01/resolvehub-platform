package com.resolvehub.backend.tickets;

import com.resolvehub.backend.auth.AuthorizationService;
import com.resolvehub.backend.auth.EndpointPermission;
import com.resolvehub.backend.auth.UserSummaryResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
class TicketController {

    private final AuthorizationService authorizationService;
    private final TicketService ticketService;

    TicketController(AuthorizationService authorizationService, TicketService ticketService) {
        this.authorizationService = authorizationService;
        this.ticketService = ticketService;
    }

    @PostMapping
    ResponseEntity<TicketResponse> create(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @Valid @RequestBody CreateTicketRequest request) {
        UserSummaryResponse requester = authorizationService.requirePermission(
                authorization,
                EndpointPermission.CREATE_TICKET);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.create(request, requester));
    }

    @GetMapping("/{id}")
    TicketResponse detail(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID id) {
        UserSummaryResponse currentUser = authorizationService.requireAuthenticated(authorization);
        return ticketService.detail(id, currentUser);
    }
}
