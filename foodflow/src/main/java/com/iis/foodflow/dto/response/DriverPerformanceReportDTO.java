package com.iis.foodflow.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor // Ostavljamo prazan konstruktor za svaki slučaj
public class DriverPerformanceReportDTO {

    private Long driverId;
    private String driverFullName;
    private String analysisPeriod;
    private BigDecimal overallOnTimeRate;
    private Long totalRejectedOffers;
    private String performanceByVehicle;
    private String delayedOrdersDetails;

    // ==========================================================
    // KLJUČNA ISPRAVKA: Dodajemo konstruktor koji JPA može da pozove
    // Parametri MORAJU biti istim redosledom kao u @ColumnResult
    // ==========================================================
    public DriverPerformanceReportDTO(
            Long driverId,
            String driverFullName,
            String analysisPeriod,
            BigDecimal overallOnTimeRate,
            Long totalRejectedOffers,
            String performanceByVehicle,
            String delayedOrdersDetails
    ) {
        this.driverId = driverId;
        this.driverFullName = driverFullName;
        this.analysisPeriod = analysisPeriod;
        this.overallOnTimeRate = overallOnTimeRate;
        this.totalRejectedOffers = totalRejectedOffers;
        this.performanceByVehicle = performanceByVehicle;
        this.delayedOrdersDetails = delayedOrdersDetails;
    }
}