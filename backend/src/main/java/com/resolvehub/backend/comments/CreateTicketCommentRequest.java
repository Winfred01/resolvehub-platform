package com.resolvehub.backend.comments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTicketCommentRequest(
        @NotBlank(message = "Comment body must not be blank.")
        @Size(max = 4000, message = "Comment body must be 4000 characters or fewer.")
        String body
) {

    public CreateTicketCommentRequest {
        body = body == null ? null : body.trim();
    }
}
