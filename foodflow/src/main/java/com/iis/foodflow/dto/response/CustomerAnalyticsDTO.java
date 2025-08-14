package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAnalyticsDTO {
    // Kartice na vrhu
    private long totalOrders;
    private BigDecimal totalSpent;
    private String favoriteRestaurant;
    private double averageDeliveryTime; // U minutima

    // Podaci za grafikone
    private List<SpendingOverTimeDTO> spendingOverTime; // Za linijski grafikon
    private List<CategorySpendingDTO> categorySpending; // Za "pie" chart

    @Data
    @AllArgsConstructor
    public static class SpendingOverTimeDTO {
        private String month;
        private BigDecimal amount;
    }

    @Data
    @AllArgsConstructor
    public static class CategorySpendingDTO {
        private String name; // Ime restorana
        private BigDecimal value; // Potrošen iznos
    }
}