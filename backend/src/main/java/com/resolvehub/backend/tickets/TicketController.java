package com.resolvehub.backend.tickets;

import com.resolvehub.backend.auth.AuthorizationService;
import com.resolvehub.backend.auth.EndpointPermission;
import com.resolvehub.backend.auth.UserSummaryResponse;
import com.resolvehub.backend.comments.CreateTicketCommentRequest;
import com.resolvehub.backend.comments.TicketCommentPageRequest;
import com.resolvehub.backend.comments.TicketCommentPageResponse;
import com.resolvehub.backend.comments.TicketCommentResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping
    TicketPageResponse list(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction) {
        UserSummaryResponse currentUser = authorizationService.requireAuthenticated(authorization);
        TicketSearchRequest request = TicketSearchRequest.from(
                query,
                status,
                priority,
                categoryId,
                assigneeId,
                page,
                size,
                sort,
                direction);
        return ticketService.list(request, currentUser);
    }

    @PostMapping("/{id}/comments")
    ResponseEntity<TicketCommentResponse> createComment(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID id,
            @Valid @RequestBody CreateTicketCommentRequest request) {
        UserSummaryResponse currentUser = authorizationService.requireAuthenticated(authorization);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createComment(id, request, currentUser));
    }

    @GetMapping("/{id}/comments")
    TicketCommentPageResponse comments(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID id,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        UserSummaryResponse currentUser = authorizationService.requireAuthenticated(authorization);
        return ticketService.comments(id, TicketCommentPageRequest.from(page, size), currentUser);
    }

    @PatchMapping("/{id}")
    TicketResponse update(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketRequest request) {
        UserSummaryResponse currentUser = authorizationService.requireAuthenticated(authorization);
        return ticketService.update(id, request, currentUser);
    }

    @PatchMapping("/{id}/assignment")
    TicketResponse assign(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID id,
            @RequestBody TicketAssignmentRequest request) {
        UserSummaryResponse currentUser = authorizationService.requirePermission(
                authorization,
                EndpointPermission.REASSIGN_TICKET);
        return ticketService.assign(id, request, currentUser);
    }
}
