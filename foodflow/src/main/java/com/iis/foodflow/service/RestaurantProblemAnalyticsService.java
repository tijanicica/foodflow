package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.RestaurantProblemAnalyticsDTO;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.repository.RestaurantRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantProblemAnalyticsService {
    private final RestaurantRepository restaurantRepository;
    private final SupportTicketRepository ticketRepository;

    public List<RestaurantProblemAnalyticsDTO> getAllRestaurantsAnalytics() {
        return restaurantRepository.findAll().stream()
                .map(this::getAnalyticsForRestaurant)
                .collect(Collectors.toList());
    }

    public RestaurantProblemAnalyticsDTO getAnalyticsForRestaurant(Restaurant restaurant) {
        List<SupportTicket> tickets = ticketRepository.findTicketsByRestaurantId(restaurant.getId());

        long totalTickets = tickets.size();
        long closedTickets = tickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count();
        long openTickets = totalTickets - closedTickets;

        double avgSeconds = tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.CLOSED && t.getClosingTime() != null)
                .mapToLong(t -> Duration.between(t.getCreationTime(), t.getClosingTime()).getSeconds())
                .average()
                .orElse(0.0);

        List<RestaurantProblemAnalyticsDTO.CategoryAnalytics> categoryBreakdown = ticketRepository
                .countTicketsPerCategoryByRestaurant(restaurant.getId())
                .stream()
                .map(dto -> RestaurantProblemAnalyticsDTO.CategoryAnalytics.builder()
                        .categoryName(dto.getCategoryName())
                        .ticketCount(dto.getTicketCount())
                        .build())
                .collect(Collectors.toList());

        return RestaurantProblemAnalyticsDTO.builder()
                .restaurantId(restaurant.getId())
                .restaurantName(restaurant.getName())
                .managerName(restaurant.getManager() != null ? restaurant.getManager().getFirstName() + " " + restaurant.getManager().getLastName() : "N/A")
                .managerEmail(restaurant.getManager() != null ? restaurant.getManager().getEmail() : "N/A")
                .totalTickets(totalTickets)
                .openTickets(openTickets)
                .closedTickets(closedTickets)
                .averageResolutionTime(formatDuration(avgSeconds))
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    private String formatDuration(double totalSeconds) {
        if (totalSeconds == 0) return "N/A";
        long seconds = (long) totalSeconds;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }
}
