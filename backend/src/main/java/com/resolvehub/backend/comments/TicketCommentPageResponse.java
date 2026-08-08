package com.resolvehub.backend.comments;

import java.util.List;
import org.springframework.data.domain.Page;

public record TicketCommentPageResponse(
        List<TicketCommentResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean empty
) {

    public static TicketCommentPageResponse from(Page<TicketComment> page) {
        return new TicketCommentPageResponse(
                page.getContent().stream().map(TicketCommentResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isEmpty());
    }
}
