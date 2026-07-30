package com.resolvehub.backend.tickets;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface TicketRepository extends JpaRepository<Ticket, UUID> {
}
