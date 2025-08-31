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
public class CustomerFinancialReportDTO {
    private String customer_full_name;
    private String analysis_period;
    private BigDecimal total_spent;
    private BigDecimal total_coupon_savings;
    private BigDecimal total_paid_by_card;
    private BigDecimal total_paid_by_cash;
    private List<TimeOfDaySpendingDTO> spending_by_time_of_day;
    private List<PriceRangeSpendingDTO> spending_by_price_range;
    private List<MostExpensiveOrderDTO> top_5_most_expensive_orders;
}