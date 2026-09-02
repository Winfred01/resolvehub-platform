package com.resolvehub.backend.tickets;

import com.resolvehub.backend.activity.TicketActivity;
import com.resolvehub.backend.activity.TicketActivityPageRequest;
import com.resolvehub.backend.activity.TicketActivityPageResponse;
import com.resolvehub.backend.activity.TicketActivityRepository;
import com.resolvehub.backend.auth.AccountRole;
import com.resolvehub.backend.auth.EndpointPermission;
import com.resolvehub.backend.auth.ForbiddenException;
import com.resolvehub.backend.auth.UserDirectoryService;
import com.resolvehub.backend.auth.UserSummaryResponse;
import com.resolvehub.backend.comments.CreateTicketCommentRequest;
import com.resolvehub.backend.comments.TicketComment;
import com.resolvehub.backend.comments.TicketCommentPageRequest;
import com.resolvehub.backend.comments.TicketCommentPageResponse;
import com.resolvehub.backend.comments.TicketCommentRepository;
import com.resolvehub.backend.comments.TicketCommentResponse;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class TicketService {

    private static final Set<AccountRole> VIEW_ALL_ROLES =
            Set.of(AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN);
    private static final Set<AccountRole> FULL_ASSIGNMENT_ROLES =
            EnumSet.of(AccountRole.TEAM_LEAD, AccountRole.ADMIN);
    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED_STATUS_TRANSITIONS = Map.of(
            TicketStatus.OPEN, Set.of(TicketStatus.TRIAGED, TicketStatus.IN_PROGRESS, TicketStatus.CLOSED),
            TicketStatus.TRIAGED, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.WAITING_ON_REQUESTER, TicketStatus.CLOSED),
            TicketStatus.IN_PROGRESS, Set.of(TicketStatus.WAITING_ON_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CLOSED),
            TicketStatus.WAITING_ON_REQUESTER, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED),
            TicketStatus.RESOLVED, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.CLOSED),
            TicketStatus.CLOSED, Set.of());

    private final TicketRepository ticketRepository;
    private final TicketActivityRepository ticketActivityRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAnalyticsClient ticketAnalyticsClient;
    private final UserDirectoryService userDirectoryService;

    TicketService(
            TicketRepository ticketRepository,
            TicketActivityRepository ticketActivityRepository,
            TicketCommentRepository ticketCommentRepository,
            TicketAnalyticsClient ticketAnalyticsClient,
            UserDirectoryService userDirectoryService) {
        this.ticketRepository = ticketRepository;
        this.ticketActivityRepository = ticketActivityRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketAnalyticsClient = ticketAnalyticsClient;
        this.userDirectoryService = userDirectoryService;
    }

    @Transactional
    TicketResponse create(CreateTicketRequest request, UserSummaryResponse requester) {
        validateCategory(request.categoryId());
        Ticket ticket = ticketRepository.saveAndFlush(Ticket.create(request, requester.id()));
        ticketActivityRepository.save(TicketActivity.ticketCreated(ticket.id(), requester.id()));
        return TicketResponse.from(ticket);
    }

    @Transactional(readOnly = true)
    TicketResponse detail(UUID ticketId, UserSummaryResponse currentUser) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found."));
        if (!canView(ticket, currentUser)) {
            throw new ForbiddenException("Forbidden.");
        }
        return TicketResponse.from(ticket);
    }

    @Transactional(readOnly = true)
    TicketPageResponse list(TicketSearchRequest request, UserSummaryResponse currentUser) {
        PageRequest pageRequest = PageRequest.of(
                request.page(),
                request.size(),
                request.direction(),
                request.sort());
        Page<Ticket> tickets = ticketRepository.findAll(searchSpecification(request, currentUser), pageRequest);
        return TicketPageResponse.from(tickets);
    }

    @Transactional
    TicketCommentResponse createComment(
            UUID ticketId,
            CreateTicketCommentRequest request,
            UserSummaryResponse currentUser) {
        Ticket ticket = requireVisibleTicket(ticketId, currentUser);
        TicketComment comment = ticketCommentRepository.saveAndFlush(TicketComment.create(
                ticket.id(),
                currentUser.id(),
                request.body()));
        ticketActivityRepository.save(TicketActivity.ticketCommented(ticket.id(), currentUser.id()));
        return TicketCommentResponse.from(comment);
    }

    @Transactional(readOnly = true)
    TicketCommentPageResponse comments(
            UUID ticketId,
            TicketCommentPageRequest request,
            UserSummaryResponse currentUser) {
        Ticket ticket = requireVisibleTicket(ticketId, currentUser);
        PageRequest pageRequest = PageRequest.of(
                request.page(),
                request.size(),
                Sort.by("createdAt").ascending().and(Sort.by("id").ascending()));
        return TicketCommentPageResponse.from(ticketCommentRepository.findByTicketId(ticket.id(), pageRequest));
    }

    @Transactional(readOnly = true)
    TicketActivityPageResponse activities(
            UUID ticketId,
            TicketActivityPageRequest request,
            UserSummaryResponse currentUser) {
        Ticket ticket = requireVisibleTicket(ticketId, currentUser);
        PageRequest pageRequest = PageRequest.of(
                request.page(),
                request.size(),
                Sort.by("createdAt").ascending().and(Sort.by("id").ascending()));
        return TicketActivityPageResponse.from(ticketActivityRepository.findByTicketId(ticket.id(), pageRequest));
    }

    @Transactional(readOnly = true)
    TicketAnalyticsSuggestionResponse analyticsSuggestions(UUID ticketId, UserSummaryResponse currentUser) {
        Ticket ticket = requireVisibleTicket(ticketId, currentUser);
        List<Ticket> candidates = ticketRepository.findAll(analyticsCandidateSpecification(ticket, currentUser),
                PageRequest.of(0, 25, Sort.by("updatedAt").descending().and(Sort.by("id").ascending())))
                .getContent();
        return ticketAnalyticsClient.suggest(ticket, candidates);
    }

    @Transactional
    TicketSuggestionReviewResponse reviewAnalyticsSuggestion(
            UUID ticketId,
            TicketSuggestionReviewRequest request,
            UserSummaryResponse currentUser) {
        Ticket ticket = requireVisibleTicket(ticketId, currentUser);
        Set<String> recordedFields = validateSuggestionReview(ticket, request, currentUser);
        TicketActivity activity = ticketActivityRepository.saveAndFlush(TicketActivity.analyticsSuggestionReviewed(
                ticket.id(),
                currentUser.id(),
                String.join(",", recordedFields)));

        return new TicketSuggestionReviewResponse(
                ticket.id(),
                request.suggestionType(),
                request.decision(),
                List.copyOf(recordedFields),
                activity.createdAt(),
                true);
    }

    @Transactional
    TicketResponse update(UUID ticketId, UpdateTicketRequest request, UserSummaryResponse currentUser) {
        validateUpdatePayload(request);
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found."));
        validateVersion(ticket, request);

        boolean canUpdateWorkflow = EndpointPermission.UPDATE_TICKET_WORKFLOW.allows(currentUser.roles());
        boolean isOwner = ticket.requesterId().equals(currentUser.id());
        if (!canUpdateWorkflow && !isOwner) {
            throw new ForbiddenException("Forbidden.");
        }
        if (!canUpdateWorkflow) {
            validateRequesterLimitedUpdate(ticket, request);
        }
        validateStatusTransition(ticket.status(), request.status());

        Set<String> changedFields = ticket.apply(request);
        Ticket saved = ticketRepository.saveAndFlush(ticket);
        if (!changedFields.isEmpty()) {
            ticketActivityRepository.save(TicketActivity.ticketUpdated(
                    saved.id(),
                    currentUser.id(),
                    String.join(",", changedFields)));
        }
        return TicketResponse.from(saved);
    }

    @Transactional
    TicketResponse assign(UUID ticketId, TicketAssignmentRequest request, UserSummaryResponse currentUser) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found."));
        if (!canView(ticket, currentUser)) {
            throw new ForbiddenException("Forbidden.");
        }
        validateAssignmentVersion(ticket, request);
        validateAssignmentPermission(request.assigneeId(), currentUser);
        validateAssignee(request.assigneeId());

        boolean changed = ticket.assignTo(request.assigneeId());
        Ticket saved = ticketRepository.saveAndFlush(ticket);
        if (changed) {
            ticketActivityRepository.save(TicketActivity.ticketAssigned(saved.id(), currentUser.id()));
        }
        return TicketResponse.from(saved);
    }

    private Ticket requireVisibleTicket(UUID ticketId, UserSummaryResponse currentUser) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found."));
        if (!canView(ticket, currentUser)) {
            throw new ForbiddenException("Forbidden.");
        }
        return ticket;
    }

    private boolean canView(Ticket ticket, UserSummaryResponse currentUser) {
        return ticket.requesterId().equals(currentUser.id())
                || currentUser.roles().stream().anyMatch(VIEW_ALL_ROLES::contains)
                || EndpointPermission.VIEW_ALL_TICKETS.allows(currentUser.roles());
    }

    private Specification<Ticket> searchSpecification(TicketSearchRequest request, UserSummaryResponse currentUser) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();
            if (!EndpointPermission.VIEW_ALL_TICKETS.allows(currentUser.roles())) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("requesterId"), currentUser.id()));
            }
            if (request.query() != null) {
                String pattern = "%" + request.query() + "%";
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern)));
            }
            if (request.status() != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("status"), request.status()));
            }
            if (request.priority() != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("priority"), request.priority()));
            }
            if (request.categoryId() != null) {
                validateCategory(request.categoryId());
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("categoryId"), request.categoryId()));
            }
            if (request.assigneeId() != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("currentAssigneeId"), request.assigneeId()));
            }
            return predicate;
        };
    }

    private Specification<Ticket> analyticsCandidateSpecification(Ticket source, UserSummaryResponse currentUser) {
        return (root, query, criteriaBuilder) -> {
            var predicate = criteriaBuilder.notEqual(root.get("id"), source.id());
            if (!EndpointPermission.VIEW_ALL_TICKETS.allows(currentUser.roles())) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("requesterId"), currentUser.id()));
            }
            return predicate;
        };
    }

    private Set<String> validateSuggestionReview(
            Ticket ticket,
            TicketSuggestionReviewRequest request,
            UserSummaryResponse currentUser) {
        if (request.suggestionType() == TicketSuggestionType.TRIAGE) {
            return validateTriageSuggestionReview(request);
        }
        if (request.suggestionType() == TicketSuggestionType.DUPLICATE) {
            return validateDuplicateSuggestionReview(ticket, request, currentUser);
        }
        throw new TicketUpdateValidationException("Invalid analytics suggestion type.");
    }

    private Set<String> validateTriageSuggestionReview(TicketSuggestionReviewRequest request) {
        Set<String> recordedFields = new LinkedHashSet<>();
        recordedFields.add("analyticsSuggestionReview");
        recordedFields.add("suggestionType");
        recordedFields.add("decision");

        if (request.categoryId() != null) {
            validateCategory(request.categoryId());
            recordedFields.add("categoryId");
        }
        if (request.priority() != null) {
            recordedFields.add("priority");
        }
        if (request.duplicateTicketId() != null) {
            throw new TicketUpdateValidationException("Duplicate ticket id is only valid for duplicate reviews.");
        }
        if (request.decision() != TicketSuggestionDecision.IGNORE
                && request.categoryId() == null
                && request.priority() == null) {
            throw new TicketUpdateValidationException("Accepted or overridden triage reviews require category or priority.");
        }

        return recordedFields;
    }

    private Set<String> validateDuplicateSuggestionReview(
            Ticket ticket,
            TicketSuggestionReviewRequest request,
            UserSummaryResponse currentUser) {
        Set<String> recordedFields = new LinkedHashSet<>();
        recordedFields.add("analyticsSuggestionReview");
        recordedFields.add("suggestionType");
        recordedFields.add("decision");

        if (request.categoryId() != null || request.priority() != null) {
            throw new TicketUpdateValidationException("Category and priority are only valid for triage reviews.");
        }
        if (request.decision() != TicketSuggestionDecision.IGNORE) {
            if (request.duplicateTicketId() == null) {
                throw new TicketUpdateValidationException("Accepted or overridden duplicate reviews require a duplicate ticket id.");
            }
            if (ticket.id().equals(request.duplicateTicketId())) {
                throw new TicketUpdateValidationException("A ticket cannot be reviewed as a duplicate of itself.");
            }
            requireVisibleTicket(request.duplicateTicketId(), currentUser);
            recordedFields.add("duplicateTicketId");
        }

        return recordedFields;
    }

    private void validateUpdatePayload(UpdateTicketRequest request) {
        if (request.title() == null
                && request.description() == null
                && request.categoryId() == null
                && request.priority() == null
                && request.status() == null) {
            throw new TicketUpdateValidationException("At least one ticket field must be supplied.");
        }
        if (request.title() != null && request.title().isBlank()) {
            throw new TicketUpdateValidationException("Title must not be blank.");
        }
        if (request.description() != null && request.description().isBlank()) {
            throw new TicketUpdateValidationException("Description must not be blank.");
        }
        if (request.categoryId() != null && request.categoryId().isBlank()) {
            throw new TicketUpdateValidationException("Category id must not be blank.");
        }
        if (request.categoryId() != null) {
            validateCategory(request.categoryId());
        }
    }

    private void validateVersion(Ticket ticket, UpdateTicketRequest request) {
        if (request.version() != null && !request.version().equals(ticket.version())) {
            throw new TicketConflictException("Ticket version conflict.");
        }
    }

    private void validateAssignmentVersion(Ticket ticket, TicketAssignmentRequest request) {
        if (request.version() != null && !request.version().equals(ticket.version())) {
            throw new TicketConflictException("Ticket version conflict.");
        }
    }

    private void validateRequesterLimitedUpdate(Ticket ticket, UpdateTicketRequest request) {
        if (request.priority() != null || request.status() != null) {
            throw new ForbiddenException("Forbidden.");
        }
        if (ticket.status() != TicketStatus.OPEN) {
            throw new ForbiddenException("Forbidden.");
        }
    }

    private void validateStatusTransition(TicketStatus currentStatus, TicketStatus requestedStatus) {
        if (requestedStatus == null || requestedStatus == currentStatus) {
            return;
        }
        if (!ALLOWED_STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(requestedStatus)) {
            throw new TicketUpdateValidationException("Invalid status transition.");
        }
    }

    private void validateAssignmentPermission(UUID assigneeId, UserSummaryResponse currentUser) {
        boolean canAssignAny = currentUser.roles().stream().anyMatch(FULL_ASSIGNMENT_ROLES::contains);
        if (!canAssignAny && !currentUser.id().equals(assigneeId)) {
            throw new ForbiddenException("Forbidden.");
        }
    }

    private void validateAssignee(UUID assigneeId) {
        if (assigneeId == null) {
            return;
        }
        UserSummaryResponse assignee = userDirectoryService.requireAssignableUser(assigneeId);
        if (!userDirectoryService.canBeAssigned(assignee)) {
            throw new TicketAssignmentValidationException("Assignee must be an active support user.");
        }
    }

    private void validateCategory(String categoryId) {
        if (!TicketCategory.exists(categoryId)) {
            throw new TicketUpdateValidationException("Invalid ticket category.");
        }
    }
}
