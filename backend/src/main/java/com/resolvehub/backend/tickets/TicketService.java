package com.resolvehub.backend.tickets;

import com.resolvehub.backend.auth.AccountRole;
import com.resolvehub.backend.auth.EndpointPermission;
import com.resolvehub.backend.auth.ForbiddenException;
import com.resolvehub.backend.auth.UserSummaryResponse;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class TicketService {

    private static final Set<AccountRole> VIEW_ALL_ROLES =
            Set.of(AccountRole.AGENT, AccountRole.TEAM_LEAD, AccountRole.ADMIN);

    private final TicketRepository ticketRepository;

    TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    TicketResponse create(CreateTicketRequest request, UserSummaryResponse requester) {
        Ticket ticket = ticketRepository.save(Ticket.create(request, requester.id()));
        return TicketResponse.from(ticket);
    }

    @Transactional(readOnly = true)
    TicketResponse detail(UUID ticketId, UserSummaryResponse currentUser) {
        Ticket ticket = ticketRepository
                .findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found."));
        if (!canView(ticket, currentUser)) {
            throw new ForbiddenException("Forbidden.");
        }
        return TicketResponse.from(ticket);
    }

    private boolean canView(Ticket ticket, UserSummaryResponse currentUser) {
        return ticket.requesterId().equals(currentUser.id())
                || currentUser.roles().stream().anyMatch(VIEW_ALL_ROLES::contains)
                || EndpointPermission.VIEW_ALL_TICKETS.allows(currentUser.roles());
    }
}
