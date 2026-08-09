package com.resolvehub.backend.activity;

import java.util.List;
import org.springframework.data.domain.Page;

public record TicketActivityPageResponse(
        List<TicketActivityResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean empty
) {

    public static TicketActivityPageResponse from(Page<TicketActivity> page) {
        return new TicketActivityPageResponse(
                page.getContent().stream().map(TicketActivityResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isEmpty());
    }
}
