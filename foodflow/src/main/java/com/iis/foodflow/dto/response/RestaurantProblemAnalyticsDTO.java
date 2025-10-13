package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class RestaurantProblemAnalyticsDTO {
    private Long restaurantId;
    private String restaurantName;
    private String managerName;
    private String managerEmail;
    private long totalTickets;
    private long openTickets;
    private long closedTickets;
    private String averageResolutionTime; // Formatiran kao string, npr. "1h 15m"
    private List<CategoryAnalytics> categoryBreakdown;

    @Data
    @Builder
    public static class CategoryAnalytics {
        private String categoryName;
        private long ticketCount;
    }
}
