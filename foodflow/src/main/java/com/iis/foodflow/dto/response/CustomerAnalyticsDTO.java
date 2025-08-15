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
    // === POČETAK IZMENE ===

    // Kartice na vrhu
    private long totalOrders;
    private int totalOrdersChange; // Procentualna promena
    private BigDecimal totalSpent;
    private int totalSpentChange; // Procentualna promena
    private String favoriteRestaurant;
    private double averageDeliveryTime; // U minutima

    // Podaci za grafikone
    private List<TimePointDTO> spendingOverTime;
    private List<CategorySpendingDTO> topRestaurants; // Preimenovano iz categorySpending

    // Novi "insight" tekst
    private String insightText;

    // Unutrašnje klase
    @Data
    @AllArgsConstructor
    public static class TimePointDTO { // Preimenovano iz SpendingOverTimeDTO
        private String timePoint; // Može biti dan ("Mon"), datum ("15. Aug") ili mesec ("August")
        private BigDecimal amount;
    }

    @Data
    @AllArgsConstructor
    public static class CategorySpendingDTO {
        private String name;  // Ime restorana
        private BigDecimal value; // Potrošen iznos
    }
    // === KRAJ IZMENE ===
}