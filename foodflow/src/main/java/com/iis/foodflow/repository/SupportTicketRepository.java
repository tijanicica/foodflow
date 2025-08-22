package com.iis.foodflow.repository;

import com.iis.foodflow.dto.request.CategoryTicketsDTO;
import com.iis.foodflow.model.support.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    @Query("SELECT new com.iis.foodflow.dto.request.CategoryTicketsDTO(pc.name, COUNT(t.id)) " +
            "FROM SupportTicket t JOIN t.problemCategory pc " +
            "GROUP BY pc.name ORDER BY COUNT(t.id) DESC")
    List<CategoryTicketsDTO> countTicketsPerCategory();

    @Query(
            value = "SELECT AVG(EXTRACT(EPOCH FROM (closing_time - creation_time))) " +
                    "FROM support_ticket t WHERE t.status = 'CLOSED'",
            nativeQuery = true
    )
    Double getAverageResolutionTimeInSeconds();


    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.operator.id = :operatorId AND t.status = 'CLOSED'")
    Long countTotalResolvedTicketsByOperator(@Param("operatorId") Long operatorId);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.operator.id = :operatorId AND t.status = 'CLOSED' AND t.closingTime >= :startOfDay")
    Long countResolvedTicketsByOperatorToday(@Param("operatorId") Long operatorId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query(
            value = "SELECT AVG(EXTRACT(EPOCH FROM (closing_time - creation_time))) " +
                    "FROM support_ticket t " +
                    "WHERE t.operator_id = :operatorId AND t.status = 'CLOSED'",
            nativeQuery = true
    )
    Double getAverageResolutionTimeInSecondsByOperator(@Param("operatorId") Long operatorId);

    @Query("SELECT new com.iis.foodflow.dto.request.CategoryTicketsDTO(pc.name, COUNT(t.id)) " +
            "FROM SupportTicket t JOIN t.problemCategory pc " +
            "WHERE t.operator.id = :operatorId AND t.status = 'CLOSED' " +
            "GROUP BY pc.name ORDER BY COUNT(t.id) DESC")
    List<CategoryTicketsDTO> countTicketsPerCategoryByOperator(@Param("operatorId") Long operatorId);
}
