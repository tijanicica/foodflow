package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor // <-- Potreban za Builder
@AllArgsConstructor
public class ManagerAnalyticsDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long confirmedOrders;
    private long canceledOrders;
    private double avgResponseTimeMinutes;
    private List<ItemPerformanceDTO> itemPerformance;
    // Podaci za procentualnu promenu
    private Double totalRevenueChange;
    private Double totalOrdersChange;

    // Podaci za Pie Chart (Prihod po restoranu)
    private List<RestaurantPerformanceDTO> restaurantPerformance;

    @Data
    @Builder
    @NoArgsConstructor // <-- Potreban za Builder
    @AllArgsConstructor
    public static class ItemPerformanceDTO {
        private String itemName;
        private long orderCount;
    }
}