package com.resolvehub.backend.comments;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_comments")
public class TicketComment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false, length = 4000)
    private String body;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected TicketComment() {
    }

    private TicketComment(UUID ticketId, UUID authorId, String body) {
        this.ticketId = ticketId;
        this.authorId = authorId;
        this.body = body;
    }

    public static TicketComment create(UUID ticketId, UUID authorId, String body) {
        return new TicketComment(ticketId, authorId, body);
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

    public UUID id() {
        return id;
    }

    public UUID ticketId() {
        return ticketId;
    }

    public UUID authorId() {
        return authorId;
    }

    public String body() {
        return body;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant updatedAt() {
        return updatedAt;
    }
}
