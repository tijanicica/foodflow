package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ManagerAnalyticsDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long confirmedOrders;
    private long canceledOrders;
    private double avgResponseTimeMinutes;
    private List<ItemPerformanceDTO> itemPerformance;

    @Data
    @Builder
    public static class ItemPerformanceDTO {
        private String itemName;
        private long orderCount;
    }
}