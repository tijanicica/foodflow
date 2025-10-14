package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.CategoryPerformanceDTO;
import com.iis.foodflow.dto.request.SupportAnalyticsDTO;
import com.iis.foodflow.repository.OperatorRatingRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportAnalyticsService {
    private final SupportTicketRepository ticketRepository;
    private final OperatorRatingRepository ratingRepository;

    public SupportAnalyticsDTO getAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Long totalTickets = ticketRepository.countTotalTickets(startDate, endDate);
        Double overallAverageRating = ratingRepository.getOverallAverageRating(); // Ocena je uvek za sve vreme
        Double avgTimeInSeconds = ticketRepository.getAverageResolutionTimeInSeconds(startDate, endDate);

        String formattedAvgTime = formatSeconds(avgTimeInSeconds);
        List<CategoryPerformanceDTO> performancePerCategory = ticketRepository.getAverageTimePerCategory(startDate, endDate);

        performancePerCategory.forEach(p -> p.setAverageResolutionTime(formatSeconds(Double.parseDouble(p.getAverageResolutionTime()))));

        return new SupportAnalyticsDTO(
                totalTickets,
                overallAverageRating,
                formattedAvgTime,
                ticketRepository.countTicketsPerCategory(startDate, endDate),
                performancePerCategory
        );
    }


    private String formatSeconds(Double totalSeconds) {
        if (totalSeconds == null || totalSeconds.isNaN()) {
            return "N/A";
        }
        long seconds = totalSeconds.longValue();
        long days = seconds / (24 * 3600);
        seconds %= (24 * 3600);
        long hours = seconds / 3600;
        seconds %= 3600;
        long minutes = seconds / 60;

        StringBuilder sb = new StringBuilder();
        if (days > 0) sb.append(days).append("d ");
        if (hours > 0) sb.append(hours).append("h ");
        if (minutes > 0) sb.append(minutes).append("m");

        if (sb.length() == 0) return "Less than a minute";

        return sb.toString().trim();
    }
}

