package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.TicketSummaryDTO;
import com.iis.foodflow.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/operator/{operatorId}")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<List<TicketSummaryDTO>> getOperatorHistory(@PathVariable Long operatorId) {
        return ResponseEntity.ok(ticketService.getTicketHistoryForOperator(operatorId));
    }
}