package com.iis.foodflow.controller;

import com.iis.foodflow.dto.response.ProblemCategoryDTO;
import com.iis.foodflow.dto.request.CreateTicketRequestDTO;
import com.iis.foodflow.dto.response.SupportTicketResponseDTO;
import com.iis.foodflow.dto.response.TicketDetailsDTO;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.service.ProblemCategoryService;
import com.iis.foodflow.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService ticketService;
    private final ProblemCategoryService categoryService;

    @PostMapping("/tickets")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<SupportTicketResponseDTO> createTicket(@RequestBody CreateTicketRequestDTO request, Authentication authentication) {
        Customer customer = (Customer) authentication.getPrincipal();
        SupportTicketResponseDTO createdTicketDto = ticketService.createTicket(request, customer);
        return ResponseEntity.ok(createdTicketDto);
    }

    @GetMapping("/problem-categories")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProblemCategoryDTO>> getProblemCategories() {
        List<ProblemCategoryDTO> categoriesDto = categoryService.getAllCategoriesAsDto();
        return ResponseEntity.ok(categoriesDto);
    }

    @GetMapping("/tickets/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketDetailsDTO> getTicketDetails(@PathVariable Long ticketId, Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        TicketDetailsDTO details = ticketService.getTicketDetails(ticketId, principal);
        return ResponseEntity.ok(details);
    }


}
