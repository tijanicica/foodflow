package com.iis.foodflow.service;

// u paketu com.iis.foodflow.service

import com.iis.foodflow.dto.request.ChatMessageDTO;
import com.iis.foodflow.dto.request.CreateTicketRequestDTO;
import com.iis.foodflow.dto.response.SupportTicketResponseDTO;
import com.iis.foodflow.dto.response.TicketDetailsDTO;
import com.iis.foodflow.dto.response.TicketSummaryDTO;
import com.iis.foodflow.enums.OperatorStatus;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.delivery.DriverRating;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.order.OrderRating;
import com.iis.foodflow.model.support.OperatorRating;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
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
    private final SimpMessagingTemplate messagingTemplate;
    private final OrderRatingRepository orderRatingRepository;
    private final DriverRepository driverRepository;
    private final DriverRatingRepository driverRatingRepository;

    @Transactional
    public SupportTicketResponseDTO createTicket(CreateTicketRequestDTO request, Customer customer) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new SecurityException("Forbidden: You can only create tickets for your own orders.");
        }

        //Operator assignedOperator = findAvailableOperator();

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

        Operator assignedOperator = assignBestOperator(category);

        SupportTicket ticket = new SupportTicket();
        ticket.setOrder(order);
        ticket.setOperator(assignedOperator);
        ticket.setProblemCategory(category);
        ticket.setDescription(request.getDescription());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreationTime(LocalDateTime.now());

        SupportTicket savedTicket = ticketRepository.save(ticket);
        assignedOperator.setLastAssignedTicketAt(LocalDateTime.now());
        operatorRepository.save(assignedOperator);
        return convertToDto(savedTicket);
    }

    // algoritam za dodelu operatora
    private Operator assignBestOperator(ProblemCategory ticketCategory, Long operatorIdToExclude) {
        List<Operator> availableOperators = operatorRepository.findByStatus(OperatorStatus.ONLINE);

        if (availableOperators.isEmpty()) {
            return null; // Vrati null ako nema nikoga
        }

        return availableOperators.stream()
                .filter(op -> !op.getId().equals(operatorIdToExclude)) // ISKLJUČI STAROG OPERATERA
                .max(Comparator.comparingDouble(op -> calculateScoreForOperator(op, ticketCategory)))
                .orElse(null); // Vrati null ako nema drugih
    }

    // Overload metoda radi kompatibilnosti
    private Operator assignBestOperator(ProblemCategory ticketCategory) {
        return assignBestOperator(ticketCategory, -1L); // -1L kao ID koji sigurno ne postoji
    }

    @Transactional
    public void reassignTicket(Long ticketId, String reason) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Stale ticket not found for re-assignment: " + ticketId));

        Operator newOperator = assignBestOperator(ticket.getProblemCategory(), ticket.getOperator().getId());

        if (newOperator != null) {
            ticket.setOperator(newOperator);
            ticket.setReassignmentCount(ticket.getReassignmentCount() + 1);
            newOperator.setLastAssignedTicketAt(LocalDateTime.now()); // DODAJEMO I OVO DA RESETUJEMO TAJMER ZA ROUND-ROBIN
            ticketRepository.save(ticket);

            ChatMessageDTO reassignmentMsg = ChatMessageDTO.builder()
                    .type(ChatMessageDTO.MessageType.REASSIGNMENT)
                    .ticketId(ticket.getId())
                    .text(reason)
                    .newOperatorId(newOperator.getId())
                    .newOperatorName(newOperator.getFirstName() + " " + newOperator.getLastName())
                    .build();
            messagingTemplate.convertAndSend("/topic/ticket/" + ticket.getId(), reassignmentMsg);
        } else {
            closeTicketAsUnavailable(ticketId); // Prosledi ID
        }
    }

// u SupportTicketService.java

    @Transactional
    public void closeTicketAsUnavailable(Long ticketId) {
        // try-catch više nije neophodan jer smo locirali problem, ali može ostati za svaki slučaj
        try {
            SupportTicket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Stale ticket not found for closing: " + ticketId));

            Order order = ticket.getOrder();
            Operator operator = ticket.getOperator();

            // 1. Pošalji poruku korisniku
            ChatMessageDTO unavailableMsg = ChatMessageDTO.builder()
                    .type(ChatMessageDTO.MessageType.NO_OPERATORS_AVAILABLE)
                    .ticketId(ticketId)
                    .text("Unfortunately, no operators are currently available. The chat session will be closed, and you can try again later.")
                    .build();
            messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, unavailableMsg);

            // 2. Bezbedno obriši OrderRating
            OrderRating orderRating = order.getOrderRating();
            if (orderRating != null) {
                order.setOrderRating(null); // Raskini vezu sa strane Order-a
                orderRatingRepository.delete(orderRating);
                System.out.println("Deleted OrderRating for order ID: " + order.getId());
            }

            // 3. Bezbedno obriši DriverRating
            Optional<DriverRating> driverRatingOpt = driverRatingRepository.findByOrder_Id(order.getId());
            driverRatingOpt.ifPresent(driverRating -> {
                driverRatingRepository.delete(driverRating);
                System.out.println("Deleted DriverRating for order ID: " + order.getId());
            });

            // ======================================================================
            // ===== KLJUČNI DEO: RASKIDANJE SVIH REFERENCI KA TIKETU =====
            // ======================================================================

            // 4. Raskini vezu iz Order entiteta
            if (order.getSupportTicket() != null && order.getSupportTicket().getId().equals(ticketId)) {
                order.setSupportTicket(null);
            }

            // 5. Raskini vezu iz Operator entiteta
            if (operator != null && operator.getTickets() != null) {
                // Ukloni tiket iz kolekcije unutar Operator objekta
                operator.getTickets().remove(ticket);
            }

            // 6. Sada kada su sve veze raskinute, obriši tiket
            ticketRepository.delete(ticket);
            System.out.println("Deleted SupportTicket with ID: " + ticketId);

            // Nije potrebno eksplicitno čuvati order i operator,
            // jer će @Transactional na kraju metode sačuvati sve promene na "managed" entitetima.

        } catch (Exception e) {
            System.err.println("!!! CRITICAL ERROR DURING closeTicketAsUnavailable !!!");
            e.printStackTrace();
        }
    }

    private double calculateScoreForOperator(Operator operator, ProblemCategory ticketCategory) {
        // Definišemo težinske faktore. Ovi brojevi se mogu eksterno konfigurisati!
        // (Vidi predlog za diplomski rad dole)
        double specializationWeight = 40.0;
        double ratingWeight = 25.0;
        double resolutionTimeWeight = 20.0;
        double workloadWeight = 15.0;

        // --- 1. Bodovi za specijalizaciju (0 do 40 poena) ---
        double specializationScore = 0;
        if (operator.getSpecializations().contains(ticketCategory)) {
            specializationScore = specializationWeight;
        } else if (ticketCategory.getParentCategory() != null && operator.getSpecializations().contains(ticketCategory.getParentCategory())) {
            // Ako je specijalizovan za nadkategoriju (npr. "Problem sa dostavom")
            specializationScore = specializationWeight / 2.0; // Dobija pola poena
        }

        // --- 2. Bodovi za prosečnu ocenu (0 do 25 poena) ---
        // Normalizujemo ocenu sa skale (1-5) na skalu (0-1) i množimo težinom
        double rating = operator.getAverageRating() != null ? operator.getAverageRating() : 3.0; // Default ocena 3 ako nema ocena
        double normalizedRating = (rating - 1) / 4.0;
        double ratingScore = normalizedRating * ratingWeight;

        // --- 3. Bodovi za prosečno vreme rešavanja (0 do 20 poena) ---
        // Što je vreme manje, to je skor veći.
        Double avgTimeSeconds = ticketRepository.getAverageResolutionTimeInSecondsByOperator(operator.getId());
        if (avgTimeSeconds == null) {
            avgTimeSeconds = 3600.0; // Default 1h ako nema rešenih tiketa
        }
        // Primer inverzne logike: Postavimo cilj od 5 minuta kao idealno (100% poena)
        // a 2 sata kao najgore (0% poena).
        double maxTimeThreshold = 7200.0; // 2 sata
        double idealTime = 300.0; // 5 minuta
        double timePenalty = Math.max(0, (avgTimeSeconds - idealTime) / (maxTimeThreshold - idealTime));
        double resolutionTimeScore = (1 - Math.min(1, timePenalty)) * resolutionTimeWeight;

        // --- 4. Bodovi za opterećenje (0 do 15 poena) ---
        // Što je manje tiketa, to je veći skor
        long openTickets = operator.getTickets().stream()
                .filter(t -> t.getStatus() == TicketStatus.OPEN || t.getStatus() == TicketStatus.IN_PROGRESS)
                .count();
        // Primer: 0 tiketa = 15 poena, 5+ tiketa = 0 poena
        double workloadScore = Math.max(0, 1 - (double)openTickets / 5.0) * workloadWeight;

        // --- Bonus poeni za "Round Robin" (tie-breaker) ---
        // Dajemo mali bonus onome ko je najduže čekao
        double fairnessBonus = 0.0;
        if (operator.getLastAssignedTicketAt() != null) {
            long secondsSinceLastAssignment = Duration.between(operator.getLastAssignedTicketAt(), LocalDateTime.now()).getSeconds();
            fairnessBonus = Math.min(1.0, secondsSinceLastAssignment / 3600.0) * 0.1; // mali bonus, do 0.1 poena
        } else {
            fairnessBonus = 0.1; // max bonus ako nikad nije dobio tiket
        }

        // Sabiranje svih poena
        return specializationScore + ratingScore + resolutionTimeScore + workloadScore + fairnessBonus;
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

    // plsql sort po hitnosti
    public List<TicketSummaryDTO> getTicketsForOperatorDashboard(Long operatorId) {
        List<SupportTicketRepository.TicketSummaryProjection> projections =
                ticketRepository.findTicketSummariesForOperatorDashboard(operatorId);

        return projections.stream()
                .map(p -> new TicketSummaryDTO(
                        p.getId(),
                        TicketStatus.valueOf(p.getStatus()),
                        p.getProblemCategoryName(),
                        p.getCustomerName(),
                        p.getPriorityScore()
                ))
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
        //dodala triger za plsql
        //ticket.setClosingTime(LocalDateTime.now());
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
    @Transactional
    public void closeTicket(Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(TicketStatus.CLOSED);

        ticketRepository.save(ticket);

    }



}