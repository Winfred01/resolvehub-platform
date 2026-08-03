package com.resolvehub.backend.tickets;

public class TicketConflictException extends RuntimeException {

    public TicketConflictException(String message) {
        super(message);
    }
}
