package com.iis.foodflow.repository;

import com.iis.foodflow.dto.request.CategoryTicketsDTO;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.support.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @Query("SELECT t FROM SupportTicket t " +
            "JOIN FETCH t.problemCategory " +
            "JOIN FETCH t.order o " +
            "JOIN FETCH o.customer " +
            "WHERE t.operator.id = :operatorId AND t.status IN :statuses")
    List<SupportTicket> findSummariesByOperatorIdAndStatusIn(@Param("operatorId") Long operatorId, @Param("statuses") List<TicketStatus> statuses);

    @Query("SELECT t FROM SupportTicket t " +
            "LEFT JOIN FETCH t.messages m " +
            "LEFT JOIN FETCH t.order o " +
            "LEFT JOIN FETCH o.customer c " +
            "LEFT JOIN FETCH o.orderItems oi " +
            "LEFT JOIN FETCH oi.menuItemVersion miv " +
            "LEFT JOIN FETCH miv.menuItem mi " +
            "LEFT JOIN FETCH miv.menuVersion mv " +
            "LEFT JOIN FETCH mv.menu mn " +
            "LEFT JOIN FETCH mn.restaurant r " +
            "LEFT JOIN FETCH t.operator op " +
            "WHERE t.id = :ticketId")
    Optional<SupportTicket> findByIdWithAllDetails(@Param("ticketId") Long ticketId);
}
