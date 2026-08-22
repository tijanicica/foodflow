package com.iis.foodflow.repository;

import com.iis.foodflow.dto.response.CustomerFinancialReportDTO;
import java.time.LocalDate;

public interface CustomReportRepository {
    CustomerFinancialReportDTO generateCustomerFinancialReport(Long customerId, LocalDate startDate, LocalDate endDate);
}