package com.iis.foodflow.repository;

import com.iis.foodflow.dto.response.CustomerFinancialReportDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
public class CustomReportRepositoryImpl implements CustomReportRepository {

    @PersistenceContext
    private EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Override
    public CustomerFinancialReportDTO generateCustomerFinancialReport(Long customerId, LocalDate startDate, LocalDate endDate) {
        // Користимо native query да позовемо нашу PL/pgSQL функцију
        Query query = entityManager.createNativeQuery(
                "SELECT CAST(row_to_json(t) AS TEXT) FROM generate_customer_financial_report(:customerId, :startDate, :endDate) t"
        );
        query.setParameter("customerId", customerId);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);

        // Функција враћа један ред, који је JSON стринг
        String jsonResult = (String) query.getSingleResult();

        try {
            // Користимо Jackson ObjectMapper да претворимо JSON стринг у наш DTO
            return objectMapper.readValue(jsonResult, CustomerFinancialReportDTO.class);
        } catch (Exception e) {
            // У случају грешке, баци изузетак
            throw new RuntimeException("Error mapping report result to DTO", e);
        }
    }
}