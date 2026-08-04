package com.resolvehub.backend.tickets;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Sort;

record TicketSearchRequest(
        String query,
        TicketStatus status,
        TicketPriority priority,
        String categoryId,
        UUID assigneeId,
        int page,
        int size,
        String sort,
        Sort.Direction direction
) {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;
    private static final Set<String> ALLOWED_SORTS =
            Set.of("createdAt", "updatedAt", "priority", "status", "title");

    static TicketSearchRequest from(
            String query,
            String status,
            String priority,
            String categoryId,
            UUID assigneeId,
            Integer page,
            Integer size,
            String sort,
            String direction) {
        int resolvedPage = page == null ? DEFAULT_PAGE : page;
        int resolvedSize = size == null ? DEFAULT_SIZE : size;
        String resolvedSort = normalizeSort(sort);

        validatePage(resolvedPage);
        validateSize(resolvedSize);

        return new TicketSearchRequest(
                cleanQuery(query),
                parseStatus(status),
                parsePriority(priority),
                cleanCategoryId(categoryId),
                assigneeId,
                resolvedPage,
                resolvedSize,
                resolvedSort,
                parseDirection(direction));
    }

    private static String cleanQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String trimmed = query.trim();
        if (trimmed.length() > 120) {
            throw new TicketSearchValidationException("Search query must be 120 characters or fewer.");
        }
        return trimmed.toLowerCase(Locale.ROOT);
    }

    private static TicketStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return TicketStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new TicketSearchValidationException("Invalid ticket status filter.");
        }
    }

    private static TicketPriority parsePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return null;
        }
        try {
            return TicketPriority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new TicketSearchValidationException("Invalid ticket priority filter.");
        }
    }

    private static String cleanCategoryId(String categoryId) {
        if (categoryId == null || categoryId.isBlank()) {
            return null;
        }
        return categoryId.trim();
    }

    private static String normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "createdAt";
        }
        String trimmed = sort.trim();
        if (!ALLOWED_SORTS.contains(trimmed)) {
            throw new TicketSearchValidationException("Invalid ticket sort field.");
        }
        return trimmed;
    }

    private static Sort.Direction parseDirection(String direction) {
        if (direction == null || direction.isBlank()) {
            return Sort.Direction.DESC;
        }
        try {
            return Sort.Direction.fromString(direction.trim());
        } catch (IllegalArgumentException exception) {
            throw new TicketSearchValidationException("Invalid ticket sort direction.");
        }
    }

    private static void validatePage(int page) {
        if (page < 0) {
            throw new TicketSearchValidationException("Page must be zero or greater.");
        }
    }

    private static void validateSize(int size) {
        if (size < 1 || size > MAX_SIZE) {
            throw new TicketSearchValidationException("Size must be between 1 and 100.");
        }
    }
}
