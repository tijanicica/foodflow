package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
// @AllArgsConstructor // Možete ga ostaviti ili obrisati
public class RestaurantPerformanceSummaryDTO {
    private String restaurantName;
    private Long totalDeliveries;
    private Long onTimeDeliveries;
    private BigDecimal onTimeRate;
    private BigDecimal avgDeliveryTimeMinutes;

    // --- EKSPLICITNI KONSTRUKTOR ---
    public RestaurantPerformanceSummaryDTO(String restaurantName, Long totalDeliveries, Long onTimeDeliveries, BigDecimal onTimeRate, BigDecimal avgDeliveryTimeMinutes) {
        this.restaurantName = restaurantName;
        this.totalDeliveries = totalDeliveries;
        this.onTimeDeliveries = onTimeDeliveries;
        this.onTimeRate = onTimeRate;
        this.avgDeliveryTimeMinutes = avgDeliveryTimeMinutes;
    }
}