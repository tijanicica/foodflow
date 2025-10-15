// com/iis/foodflow/service/TicketMonitoringService.java
package com.iis.foodflow.service;

import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.support.Message;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Lazy;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class TicketMonitoringService {

    private final SupportTicketRepository ticketRepository;
    private final SupportTicketService supportTicketService;
    public TicketMonitoringService(SupportTicketRepository ticketRepository, @Lazy SupportTicketService supportTicketService) {
        this.ticketRepository = ticketRepository;
        this.supportTicketService = supportTicketService;
    }

    private static final int WAIT_TIME_MINUTES = 2;

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void checkForStaleTickets() {
        LocalDateTime cutoffTime = LocalDateTime.now().minus(WAIT_TIME_MINUTES, ChronoUnit.MINUTES);

        List<SupportTicket> candidates = ticketRepository.findByStatusInAndReassignmentCountLessThan(
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS), 2
        );

        for (SupportTicket ticket : candidates) {
            if (isTicketStale(ticket, cutoffTime)) {
                handleStaleTicket(ticket.getId(), ticket.getReassignmentCount());
            }
        }
    }

    @Transactional
    public void checkSingleTicket(Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId).orElse(null);

        if (ticket == null || ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.RESOLVED) {
            return;
        }

        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(WAIT_TIME_MINUTES);

        if (isTicketStale(ticket, cutoffTime)) {
            handleStaleTicket(ticket.getId(), ticket.getReassignmentCount());
        }
    }

    private boolean isTicketStale(SupportTicket ticket, LocalDateTime cutoffTime) {
        Message lastMessage = ticket.getMessages().stream()
                .max(Comparator.comparing(Message::getSentAt))
                .orElse(null);

        if (lastMessage != null && lastMessage.getSenderOperator() != null) {
            return false;
        }

        LocalDateTime referenceTime = ticket.getAssignedAt();
        if (lastMessage != null && lastMessage.getSentAt().isAfter(referenceTime)) {
            referenceTime = lastMessage.getSentAt();
        }
        return referenceTime.isBefore(cutoffTime);
    }

    private void handleStaleTicket(Long ticketId, int currentReassignments) {
        if (currentReassignments == 0) {
            System.out.println("Reassigning stale ticket ID: " + ticketId);
            supportTicketService.reassignTicket(ticketId, "Operator did not respond in time.");
        } else if (currentReassignments == 1) {
            System.out.println("Closing stale ticket ID: " + ticketId + " after second attempt.");
            supportTicketService.closeTicketAsUnavailable(ticketId);
        }
    }
}