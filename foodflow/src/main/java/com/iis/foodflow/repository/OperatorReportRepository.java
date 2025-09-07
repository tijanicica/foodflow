package com.iis.foodflow.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Repository
@RequiredArgsConstructor
public class OperatorReportRepository {
    @PersistenceContext
    private EntityManager entityManager;
    private final ObjectMapper objectMapper;

    public JsonNode getOperatorReportData(Long operatorId) {
        Object result =  entityManager
                .createNativeQuery("SELECT get_operator_performance_report(?1)")
                .setParameter(1, operatorId)
                .getSingleResult();
        if (result == null) {
            return null; // ili baciti izuzetak
        }

        try {
            // 2. Parsiramo String u JsonNode
            return objectMapper.readTree(result.toString());
        } catch (Exception e) {
            // U slučaju greške pri parsiranju
            throw new RuntimeException("Failed to parse JSON report data from database", e);
        }
    }
}
