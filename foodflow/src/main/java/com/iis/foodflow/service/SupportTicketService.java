package com.iis.foodflow.service;

// u paketu com.iis.foodflow.service

import com.iis.foodflow.dto.request.CreateTicketRequestDTO;
import com.iis.foodflow.dto.response.SupportTicketResponseDTO;
import com.iis.foodflow.dto.response.TicketDetailsDTO;
import com.iis.foodflow.dto.response.TicketSummaryDTO;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.support.OperatorRating;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.OrderRepository;
import com.iis.foodflow.repository.ProblemCategoryRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final OperatorRepository operatorRepository;
    private final OrderRepository orderRepository;
    private final ProblemCategoryRepository categoryRepository;
    private final NlpService nlpService;
    private final ChatService chatService;

    @Transactional
    public SupportTicketResponseDTO createTicket(CreateTicketRequestDTO request, Customer customer) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new SecurityException("Forbidden: You can only create tickets for your own orders.");
        }

        Operator assignedOperator = findAvailableOperator();

        ProblemCategory category;
        if (request.getPreselectedCategoryId() != null) {

            category = categoryRepository.findById(request.getPreselectedCategoryId())
                    .orElseThrow(() -> new RuntimeException("Problem category not found with ID: " + request.getPreselectedCategoryId()));
        } else {

            if (request.getDescription() == null || request.getDescription().isBlank()) {
                throw new IllegalArgumentException("Description cannot be empty when no category is selected.");
            }
            category = nlpService.categorizeProblem(request.getDescription());
        }


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

        Long bestOperatorId = operatorRepository.findOperatorIdWithLeastOpenTickets();

        if (bestOperatorId == null) {

            throw new RuntimeException("No operators are available at the moment.");
        }


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

    public List<TicketSummaryDTO> getTicketsForOperatorDashboard(Long operatorId) {
        List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

        return ticketRepository.findSummariesByOperatorIdAndStatusIn(operatorId, activeStatuses)
                .stream()
                .map(TicketSummaryDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketDetailsDTO getTicketDetails(Long ticketId, UserDetails principal) {
        SupportTicket ticket = ticketRepository.findByIdWithAllDetails(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (principal instanceof Customer customer) {
            if (!ticket.getOrder().getCustomer().getId().equals(customer.getId())) {
                throw new SecurityException("Customer can only view their own tickets.");
            }
        } else if (principal instanceof Operator operator) {
            if (!ticket.getOperator().getId().equals(operator.getId())) {
                throw new SecurityException("Operator can only view their assigned tickets.");
            }
        } else {
            throw new SecurityException("User does not have permission to view this ticket.");
        }

        return new TicketDetailsDTO(ticket);
    }


    @Transactional
    public void resolveTicket(Long ticketId, Operator operator) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getOperator().getId().equals(operator.getId())) {
            throw new SecurityException("Operator can only resolve their assigned tickets.");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setClosingTime(LocalDateTime.now());
        ticketRepository.save(ticket);

        chatService.sendStatusUpdate(ticketId, TicketStatus.RESOLVED);

    }

    @Transactional
    public void rateAndCloseTicket(Long ticketId, int rating, String comment, Customer customer) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getOrder().getCustomer().getId().equals(customer.getId())) {
            throw new SecurityException("Cannot rate another user's ticket.");
        }
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new IllegalStateException("Can only rate a resolved ticket.");
        }

        OperatorRating operatorRating = new OperatorRating();
        operatorRating.setSupportTicket(ticket);
        operatorRating.setRating(rating);
        operatorRating.setComment(comment);
        operatorRating.setRatingDate(LocalDateTime.now());

        ticket.setOperatorRating(operatorRating);
        ticket.setStatus(TicketStatus.CLOSED);

        ticketRepository.save(ticket);
    }



}