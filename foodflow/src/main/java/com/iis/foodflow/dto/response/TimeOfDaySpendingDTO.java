package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeOfDaySpendingDTO {
    private String period_name;
    private Long orders_in_period;
    private BigDecimal spent_in_period;
}