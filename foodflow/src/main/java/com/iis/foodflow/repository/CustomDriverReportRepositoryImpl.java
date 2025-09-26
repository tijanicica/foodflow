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
    public List<DriverPerformanceReportDTO> getDriverPerformanceReports(LocalDate startDate, LocalDate endDate, DriverStatus status) {
        // Osnovni upit koji poziva funkciju za svakog vozača
        String baseQuery = """
            SELECT
                d.id AS driverId,
                (report).*
            FROM
                driver d
            CROSS JOIN LATERAL generate_driver_performance_report(d.id, :startDate, :endDate) AS report
            """;

        // Dinamički dodajemo WHERE klauzulu ako je status definisan
        if (status != null) {
            baseQuery += " WHERE d.status = :status";
        }

        Query query = entityManager.createNativeQuery(baseQuery, "DriverPerformanceReportMapping");

        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        if (status != null) {
            query.setParameter("status", status.name());
        }

        return query.getResultList();
    }
}