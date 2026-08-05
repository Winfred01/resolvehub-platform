package com.resolvehub.backend.tickets;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tickets")
class Ticket {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(name = "category_id", nullable = false, length = 80)
    private String categoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "requester_id", nullable = false)
    private UUID requesterId;

    @Column(name = "current_assignee_id")
    private UUID currentAssigneeId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private Long version;

    protected Ticket() {
    }

    private Ticket(String title, String description, String categoryId, TicketPriority priority, UUID requesterId) {
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.priority = priority;
        this.requesterId = requesterId;
    }

    static Ticket create(CreateTicketRequest request, UUID requesterId) {
        return new Ticket(request.title(), request.description(), request.categoryId(), request.priority(), requesterId);
    }

    @PrePersist
    void markCreated() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void markUpdated() {
        updatedAt = Instant.now();
    }

    UUID id() {
        return id;
    }

    String title() {
        return title;
    }

    String description() {
        return description;
    }

    String categoryId() {
        return categoryId;
    }

    TicketPriority priority() {
        return priority;
    }

    TicketStatus status() {
        return status;
    }

    UUID requesterId() {
        return requesterId;
    }

    UUID currentAssigneeId() {
        return currentAssigneeId;
    }

    boolean assignTo(UUID assigneeId) {
        if (java.util.Objects.equals(currentAssigneeId, assigneeId)) {
            return false;
        }
        currentAssigneeId = assigneeId;
        return true;
    }

    Instant createdAt() {
        return createdAt;
    }

    Instant updatedAt() {
        return updatedAt;
    }

    Long version() {
        return version;
    }

    Set<String> apply(UpdateTicketRequest request) {
        Set<String> changedFields = new LinkedHashSet<>();
        if (request.title() != null && !request.title().equals(title)) {
            title = request.title();
            changedFields.add("title");
        }
        if (request.description() != null && !request.description().equals(description)) {
            description = request.description();
            changedFields.add("description");
        }
        if (request.categoryId() != null && !request.categoryId().equals(categoryId)) {
            categoryId = request.categoryId();
            changedFields.add("categoryId");
        }
        if (request.priority() != null && request.priority() != priority) {
            priority = request.priority();
            changedFields.add("priority");
        }
        if (request.status() != null && request.status() != status) {
            status = request.status();
            changedFields.add("status");
        }
        return changedFields;
    }
}
