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

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketMonitoringService {

    private final SupportTicketRepository ticketRepository;
    private final SupportTicketService supportTicketService; // Koristimo logiku iz postojećeg servisa

    private static final int WAIT_TIME_MINUTES = 2;

    @Scheduled(fixedRate = 30000) // Provera na svakih 30 sekundi
    @Transactional
    public void checkForStaleTickets() {
        LocalDateTime cutoffTime = LocalDateTime.now().minus(WAIT_TIME_MINUTES, ChronoUnit.MINUTES);

        List<SupportTicket> candidates = ticketRepository.findByStatusInAndReassignmentCountLessThan(
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS), 2
        );

        for (SupportTicket ticket : candidates) {
            if (isTicketStale(ticket, cutoffTime)) {
                // NE PROSLEĐUJEMO CEO OBJEKAT, VEĆ SAMO ID
                handleStaleTicket(ticket.getId(), ticket.getReassignmentCount());
            }
        }
    }

    private boolean isTicketStale(SupportTicket ticket, LocalDateTime cutoffTime) {
        // Nađi poslednju poruku, ako postoji
        Message lastMessage = ticket.getMessages().stream()
                .max(Comparator.comparing(Message::getSentAt))
                .orElse(null);

        // Ako je poslednja poruka od operatera, tiket NIJE ustajao. Izlazimo odmah.
        if (lastMessage != null && lastMessage.getSenderOperator() != null) {
            return false;
        }

        // Od ovog trenutka, znamo da operater nije poslednji odgovorio.
        // Referentno vreme je vreme poslednjeg relevantnog događaja.
        // Početna pretpostavka je vreme dodele.
        LocalDateTime referenceTime = ticket.getAssignedAt();

        // Ako postoji poslednja poruka (koja je sigurno od korisnika),
        // i ako je ona poslata NAKON dodele tiketa, ona postaje novo referentno vreme.
        if (lastMessage != null && lastMessage.getSentAt().isAfter(referenceTime)) {
            referenceTime = lastMessage.getSentAt();
        }

        // Sada je provera jednostavna i tačna:
        // Da li je referentno vreme (najnoviji događaj) starije od 2 minuta?
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