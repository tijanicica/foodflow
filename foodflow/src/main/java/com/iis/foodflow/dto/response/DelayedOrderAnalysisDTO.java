package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DelayedOrderAnalysisDTO {
    private Long orderId;
    private String restaurantName;
    private Integer reportedDelayMinutes;
    private BigDecimal actualDeliveryMinutes;
    private boolean wasOnTime;
    private BigDecimal managerRatingAvg;
}