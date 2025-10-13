package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupportAnalyticsDTO {
    private Long totalTickets;
    private Double overallAverageRating;
    private String averageResolutionTime; // Npr. "2h 15m"
    private List<CategoryTicketsDTO> ticketsPerCategory;
    private List<CategoryPerformanceDTO> performancePerCategory;
}
