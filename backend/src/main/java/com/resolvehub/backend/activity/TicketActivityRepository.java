package com.resolvehub.backend.activity;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketActivityRepository extends JpaRepository<TicketActivity, UUID> {
}
