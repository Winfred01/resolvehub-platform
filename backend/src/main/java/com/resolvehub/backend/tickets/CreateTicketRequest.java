package com.resolvehub.backend.tickets;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
        @NotBlank
        @Size(max = 120)
        String title,

        @NotBlank
        @Size(max = 4000)
        String description,

        @NotBlank
        @Size(max = 80)
        String categoryId,

        @NotNull
        TicketPriority priority
) {
    public CreateTicketRequest {
        title = title == null ? null : title.trim();
        description = description == null ? null : description.trim();
        categoryId = categoryId == null ? null : categoryId.trim();
    }
}
