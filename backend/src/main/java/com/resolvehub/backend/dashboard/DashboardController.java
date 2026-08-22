package com.resolvehub.backend.dashboard;

import com.resolvehub.backend.auth.AuthorizationService;
import com.resolvehub.backend.auth.EndpointPermission;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
class DashboardController {

    private final AuthorizationService authorizationService;
    private final DashboardService dashboardService;

    DashboardController(AuthorizationService authorizationService, DashboardService dashboardService) {
        this.authorizationService = authorizationService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    DashboardSummaryResponse summary(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        authorizationService.requirePermission(authorization, EndpointPermission.VIEW_DASHBOARD);
        return dashboardService.summary(DashboardDateRange.from(from, to));
    }

    @GetMapping("/trends")
    DashboardTrendResponse trends(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String granularity) {
        authorizationService.requirePermission(authorization, EndpointPermission.VIEW_DASHBOARD);
        return dashboardService.trends(
                DashboardDateRange.from(from, to),
                DashboardGranularity.from(granularity));
    }
}
