package com.iis.foodflow.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class DriverPerformanceReportDTO {

    private Long driverId;
    private String driverFullName;
    private String analysisPeriod;
    private BigDecimal overallOnTimeRate;
    private Long totalRejectedOffers;

    // Parsirana polja koja će se videti u JSON-u
    private List<RestaurantPerformanceSummaryDTO> performanceByRestaurant;
    private List<DelayedOrderAnalysisDTO> delayedOrdersDetails;

    // Sirovi stringovi iz baze (sakriveni iz JSON-a)
    @JsonIgnore
    private String performanceByRestaurantRaw;
    @JsonIgnore
    private String delayedOrdersDetailsRaw;

    // Konstruktor koji JPA poziva. Redosled je ključan!
    public DriverPerformanceReportDTO(
            Long driverId,
            String driverFullName,
            String analysisPeriod,
            BigDecimal overallOnTimeRate,
            Long totalRejectedOffers,
            String performanceByRestaurantRaw,
            String delayedOrdersDetailsRaw
    ) {
        this.driverId = driverId;
        this.driverFullName = driverFullName;
        this.analysisPeriod = analysisPeriod;
        this.overallOnTimeRate = overallOnTimeRate;
        this.totalRejectedOffers = totalRejectedOffers;
        this.performanceByRestaurantRaw = performanceByRestaurantRaw;
        this.delayedOrdersDetailsRaw = delayedOrdersDetailsRaw;
    }
}