package com.iis.foodflow.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class VehiclePerformanceSummaryDTO {
    private String vehicleType;
    private Long totalDeliveries;
    private Long onTimeDeliveries;
    private BigDecimal onTimeRate;
    private BigDecimal avgDeliveryTimeMinutes;
}