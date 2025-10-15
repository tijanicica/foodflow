package com.iis.foodflow.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;

@Repository
@RequiredArgsConstructor
public class OperatorReportRepository {
    @PersistenceContext
    private EntityManager entityManager;
    private final ObjectMapper objectMapper;

    public JsonNode getOperatorReportData(Long operatorId, LocalDateTime startDate, LocalDateTime endDate) {
        String query = "SELECT get_operator_performance_report(?1, ?2, ?3)";

        Object result = entityManager
                .createNativeQuery(query)
                .setParameter(1, operatorId)
                .setParameter(2, startDate)
                .setParameter(3, endDate)
                .getSingleResult();

        if (result == null) {
            return null;
        }

        try {
            return objectMapper.readTree(result.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON report data from database", e);
        }
    }
}
