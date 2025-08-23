package com.iis.foodflow.service;

// u paketu com.iis.foodflow.service

import com.iis.foodflow.dto.request.CreateTicketRequestDTO; // Koristimo vaš DTO
import com.iis.foodflow.dto.response.SupportTicketResponseDTO;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.OrderRepository;
import com.iis.foodflow.repository.ProblemCategoryRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final OperatorRepository operatorRepository;
    private final OrderRepository orderRepository;
    private final ProblemCategoryRepository categoryRepository;
    private final NlpService nlpService; // Ubacujemo NlpService

    @Transactional
    public SupportTicketResponseDTO createTicket(CreateTicketRequestDTO request, Customer customer) {
        // 1. Provera porudžbine
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

        // Bezbednosna provera - da li korisnik kreira tiket za svoju porudžbinu
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new SecurityException("Forbidden: You can only create tickets for your own orders.");
        }

        // 2. Dodeljivanje operatera
        Operator assignedOperator = findAvailableOperator();

        // 3. Određivanje kategorije problema
        ProblemCategory category;
        if (request.getPreselectedCategoryId() != null) {
            // Slučaj 1: Korisnik je izabrao predefinisanu kategoriju
            category = categoryRepository.findById(request.getPreselectedCategoryId())
                    .orElseThrow(() -> new RuntimeException("Problem category not found with ID: " + request.getPreselectedCategoryId()));
        } else {
            // Slučaj 2: Korisnik je uneo tekst, pozivamo NLP servis
            if (request.getDescription() == null || request.getDescription().isBlank()) {
                throw new IllegalArgumentException("Description cannot be empty when no category is selected.");
            }
            category = nlpService.categorizeProblem(request.getDescription());
        }

        // 4. Kreiranje novog tiketa
        SupportTicket ticket = new SupportTicket();
        ticket.setOrder(order);
        ticket.setOperator(assignedOperator);
        ticket.setProblemCategory(category);
        ticket.setDescription(request.getDescription());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreationTime(LocalDateTime.now());

        SupportTicket savedTicket = ticketRepository.save(ticket);
        return convertToDto(savedTicket);
    }

    private Operator findAvailableOperator() {
        // 1. Pronađi ID najboljeg kandidata jednim upitom
        Long bestOperatorId = operatorRepository.findOperatorIdWithLeastOpenTickets();

        if (bestOperatorId == null) {
            // Ovo se može desiti samo ako uopšte nema operatera u bazi
            throw new RuntimeException("No operators are available at the moment.");
        }

        // 2. Dohvati samo tog jednog operatera iz baze
        return operatorRepository.findById(bestOperatorId)
                .orElseThrow(() -> new RuntimeException("Could not find operator with ID: " + bestOperatorId));
    }

    private SupportTicketResponseDTO convertToDto(SupportTicket ticket) {
        SupportTicketResponseDTO dto = new SupportTicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setStatus(ticket.getStatus().name());
        if (ticket.getOperator() != null) {
            dto.setOperatorId(ticket.getOperator().getId());
            dto.setOperatorFirstName(ticket.getOperator().getFirstName());
        }
        return dto;
    }

}