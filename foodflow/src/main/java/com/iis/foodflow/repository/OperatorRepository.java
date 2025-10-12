package com.iis.foodflow.repository;

import com.iis.foodflow.dto.request.OperatorRatingDTO;
import com.iis.foodflow.enums.OperatorStatus;
import com.iis.foodflow.model.user.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OperatorRepository extends JpaRepository<Operator, Long> {
    Optional<Operator> findByEmail(String email);

    @Query("SELECT new com.iis.foodflow.dto.request.OperatorRatingDTO(" +
            "o.id, " +
            "o.firstName, " +
            "o.lastName, " +
            "AVG(r.rating), " +
            "COUNT(t.id)) " +
            "FROM Operator o " +
            "JOIN o.tickets t " +
            "LEFT JOIN t.operatorRating r " +
            "WHERE t.status = 'CLOSED' AND r.rating IS NOT NULL " +
            "GROUP BY o.id, o.firstName, o.lastName " +
            "ORDER BY AVG(r.rating) DESC, COUNT(t.id) DESC")
    List<OperatorRatingDTO> getOperatorRankings();

    @Query(value = "SELECT o.id " +
            "FROM operator o " +
            "LEFT JOIN support_ticket st ON o.id = st.operator_id AND (st.status = 'OPEN' OR st.status = 'IN_PROGRESS') " +
            "GROUP BY o.id " +
            "ORDER BY COUNT(st.id) ASC, RANDOM() " +
            "LIMIT 1", nativeQuery = true)
    Long findOperatorIdWithLeastOpenTickets();

    List<Operator> findByStatus(OperatorStatus status);
}
