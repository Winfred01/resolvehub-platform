package com.resolvehub.backend.activity;

import com.resolvehub.backend.tickets.TicketSearchValidationException;

public record TicketActivityPageRequest(
        int page,
        int size
) {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    public static TicketActivityPageRequest from(Integer page, Integer size) {
        int resolvedPage = page == null ? DEFAULT_PAGE : page;
        int resolvedSize = size == null ? DEFAULT_SIZE : size;

        if (resolvedPage < 0) {
            throw new TicketSearchValidationException("Page must be zero or greater.");
        }
        if (resolvedSize < 1 || resolvedSize > MAX_SIZE) {
            throw new TicketSearchValidationException("Size must be between 1 and 100.");
        }

        return new TicketActivityPageRequest(resolvedPage, resolvedSize);
    }
}
