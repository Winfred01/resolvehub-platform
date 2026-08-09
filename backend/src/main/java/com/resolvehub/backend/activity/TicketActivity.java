package com.resolvehub.backend.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_activities")
public class TicketActivity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(name = "changed_fields", nullable = false, length = 500)
    private String changedFields;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected TicketActivity() {
    }

    private TicketActivity(UUID ticketId, UUID actorId, String action, String changedFields) {
        this.ticketId = ticketId;
        this.actorId = actorId;
        this.action = action;
        this.changedFields = changedFields;
    }

    public static TicketActivity ticketUpdated(UUID ticketId, UUID actorId, String changedFields) {
        return new TicketActivity(ticketId, actorId, "TICKET_UPDATED", changedFields);
    }

    public static TicketActivity ticketCreated(UUID ticketId, UUID actorId) {
        return new TicketActivity(ticketId, actorId, "TICKET_CREATED", "title,description,categoryId,priority,status");
    }

    public static TicketActivity ticketAssigned(UUID ticketId, UUID actorId) {
        return new TicketActivity(ticketId, actorId, "TICKET_ASSIGNED", "currentAssigneeId");
    }

    public static TicketActivity ticketCommented(UUID ticketId, UUID actorId) {
        return new TicketActivity(ticketId, actorId, "TICKET_COMMENTED", "comment");
    }

    @PrePersist
    void markCreated() {
        createdAt = Instant.now();
    }

    public UUID id() {
        return id;
    }

    public UUID ticketId() {
        return ticketId;
    }

    public UUID actorId() {
        return actorId;
    }

    public String action() {
        return action;
    }

    public String changedFields() {
        return changedFields;
    }

    public Instant createdAt() {
        return createdAt;
    }
}
