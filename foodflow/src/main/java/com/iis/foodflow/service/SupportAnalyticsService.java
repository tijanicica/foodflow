package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.SupportAnalyticsDTO;
import com.iis.foodflow.repository.OperatorRatingRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupportAnalyticsService {
    private final SupportTicketRepository ticketRepository;
    private final OperatorRatingRepository ratingRepository;

    public SupportAnalyticsDTO getAnalytics() {
        Long totalTickets = ticketRepository.count();
        Double overallAverageRating = ratingRepository.getOverallAverageRating();
        Double avgTimeInSeconds = ticketRepository.getAverageResolutionTimeInSeconds();

        String formattedAvgTime = formatSeconds(avgTimeInSeconds);

        return new SupportAnalyticsDTO(
                totalTickets,
                overallAverageRating,
                formattedAvgTime,
                ticketRepository.countTicketsPerCategory()
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

