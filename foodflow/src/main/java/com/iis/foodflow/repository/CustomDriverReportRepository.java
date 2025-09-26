package com.iis.foodflow.repository;

import com.iis.foodflow.dto.response.DriverPerformanceReportDTO;
import com.iis.foodflow.enums.DriverStatus;
import java.time.LocalDate;
import java.util.List;

public interface CustomDriverReportRepository {
    List<DriverPerformanceReportDTO> getDriverPerformanceReports(
            LocalDate startDate,
            LocalDate endDate,
            DriverStatus status // Može biti ONLINE, OFFLINE ili null
    );
}