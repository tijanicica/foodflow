package com.iis.foodflow.repository;

import com.iis.foodflow.dto.response.DriverPerformanceReportDTO;
import com.iis.foodflow.enums.DriverStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public class CustomDriverReportRepositoryImpl implements CustomDriverReportRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public List<DriverPerformanceReportDTO> getDriverPerformanceReports(LocalDate startDate, LocalDate endDate, DriverStatus status) {

        String sqlQuery = """
            SELECT
                d.id AS driverId,
                report.driver_full_name,
                report.analysis_period,
                report.overall_on_time_rate,
                report.total_rejected_offers,
                report.performance_by_restaurant,
                report.delayed_orders_details
            FROM
                driver d,
                LATERAL generate_driver_performance_report(d.id, :startDate, :endDate) AS report
            """;

        if (status != null) {
            sqlQuery += " WHERE d.status = :status";
        }

        Query query = entityManager.createNativeQuery(sqlQuery, "DriverPerformanceReportMapping");

        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);

        if (status != null) {
            query.setParameter("status", status.name());
        }

        return (List<DriverPerformanceReportDTO>) query.getResultList();
    }
}