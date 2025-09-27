package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.OperatorAnalyticsDTO;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.repository.OperatorRatingRepository;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OperatorAnalyticsService {

    private final SupportTicketRepository ticketRepository;
    //private final OperatorRatingRepository ratingRepository;
    private final OperatorRepository operatorRepository;

    public OperatorAnalyticsDTO getAnalyticsForOperator(Long operatorId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Operator not found with ID: " + operatorId));

        Double avgTimeInSeconds = ticketRepository.getAverageResolutionTimeInSecondsByOperator(operatorId);

        return OperatorAnalyticsDTO.builder()
                .totalTicketsToday(ticketRepository.countResolvedTicketsByOperatorToday(operatorId, startOfDay))
                .totalTicketsAllTime(ticketRepository.countTotalResolvedTicketsByOperator(operatorId))
                .averageRating(operator.getAverageRating())
                .averageResolutionTime(formatSeconds(avgTimeInSeconds))
                .ticketsPerCategory(ticketRepository.countTicketsPerCategoryByOperator(operatorId))
                .build();
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

        if (sb.length() == 0 && totalSeconds > 0) return "Less than 1m";
        if (sb.length() == 0) return "0m";

        return sb.toString().trim();
    }
}
