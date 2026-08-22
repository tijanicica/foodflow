package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MostExpensiveOrderDTO {
    private Long order_id;
    private LocalDate order_date;
    private BigDecimal total_price;
    private String restaurant_name;
}