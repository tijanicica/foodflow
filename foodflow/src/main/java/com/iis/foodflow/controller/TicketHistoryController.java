package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.TicketSummaryDTO;
import com.iis.foodflow.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ticket-history")
@RequiredArgsConstructor
public class TicketHistoryController {

    private final SupportTicketService ticketService;

    // Endpoint za operatere i administratore da vide istoriju
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<List<TicketSummaryDTO>> getMyHistory(Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(ticketService.getTicketHistory(principal));
    }

// TicketHistoryController.java

    @GetMapping("/operator/{operatorId}")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<List<TicketSummaryDTO>> getOperatorHistory(
            @PathVariable Long operatorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(ticketService.getTicketHistoryForOperator(operatorId, startDate, endDate));
    }
}