package com.iis.foodflow.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor // Važno za mapiranje iz baze
public class DelayedOrderAnalysisDTO {
    private Long orderId;
    private String restaurantName;
    private Integer reportedDelayMinutes;
    private BigDecimal actualDeliveryMinutes;
    private Boolean wasOnTime;
    private BigDecimal managerRatingAvg;
}