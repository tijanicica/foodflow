package com.iis.foodflow.repository;

import com.iis.foodflow.dto.request.CategoryPerformanceDTO;
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
            "WHERE t.status IN (com.iis.foodflow.enums.TicketStatus.RESOLVED, com.iis.foodflow.enums.TicketStatus.CLOSED) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.closingTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.closingTime <= :endDate) " +
            "GROUP BY pc.name ORDER BY COUNT(t.id) DESC")
    List<CategoryTicketsDTO> countTicketsPerCategory(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (closing_time - creation_time))) " +
            "FROM support_ticket t WHERE t.status IN ('RESOLVED', 'CLOSED') " +
            "AND t.closing_time >= COALESCE(:startDate, '1970-01-01'::timestamp) " +
            "AND t.closing_time <= COALESCE(:endDate, '9999-12-31'::timestamp)",
            nativeQuery = true)
    Double getAverageResolutionTimeInSeconds(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);


    @Query("SELECT COUNT(t) FROM SupportTicket t " +
            "WHERE t.operator.id = :operatorId AND t.status IN (com.iis.foodflow.enums.TicketStatus.RESOLVED, com.iis.foodflow.enums.TicketStatus.CLOSED) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.closingTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.closingTime <= :endDate)")
    Long countResolvedTicketsByOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.operator.id = :operatorId AND t.status = 'CLOSED' AND t.closingTime >= :startOfDay")
    Long countResolvedTicketsByOperatorToday(@Param("operatorId") Long operatorId, @Param("startOfDay") LocalDateTime startOfDay);


    // ovde cemo iskoristiti indeks da ubrzamo pretragu, posto ce u realnom sistemu korisnik imati dosta vise resenih tiketa
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (closing_time - creation_time))) " +
            "FROM support_ticket t " +
            "WHERE t.operator_id = :operatorId AND t.status IN ('RESOLVED', 'CLOSED') " +
            "AND t.closing_time >= COALESCE(:startDate, '1970-01-01'::timestamp) " +
            "AND t.closing_time <= COALESCE(:endDate, '9999-12-31'::timestamp)",
            nativeQuery = true)
    Double getAverageResolutionTimeInSecondsByOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(
            value = "SELECT AVG(EXTRACT(EPOCH FROM (closing_time - creation_time))) " +
                    "FROM support_ticket t " +
                    "WHERE t.operator_id = :operatorId AND t.status = 'CLOSED'",
            nativeQuery = true
    )
    Double getAverageResolutionTimeInSecondsByOperatorForPdf(@Param("operatorId") Long operatorId);


    @Query("SELECT new com.iis.foodflow.dto.request.CategoryTicketsDTO(pc.name, COUNT(t.id)) " +
            "FROM SupportTicket t JOIN t.problemCategory pc " +
            "WHERE t.operator.id = :operatorId AND t.status IN (com.iis.foodflow.enums.TicketStatus.RESOLVED, com.iis.foodflow.enums.TicketStatus.CLOSED) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.closingTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.closingTime <= :endDate) " +
            "GROUP BY pc.name ORDER BY COUNT(t.id) DESC")
    List<CategoryTicketsDTO> countTicketsPerCategoryByOperator(@Param("operatorId") Long operatorId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // PLSQL FUNKCIJA SE KORISTI DRUGI ZADATAK!
        @Query(value = "SELECT " +
                "  t.id AS id, " +
                "  t.status AS status, " +
                "  pc.name AS problemCategoryName, " +
                "  c.first_name || ' ' || c.last_name AS customerName, " +
                "  calculate_ticket_priority_score(t.id) AS priorityScore, " + // plsql funkcija
                "    t.creation_time as creationTime, " +
                "  t.assigned_at as assignedAt " +
                "FROM support_ticket t " +
                "JOIN problem_category pc ON t.problem_category_id = pc.id " +
                "JOIN orders o ON t.order_id = o.id " +
                "JOIN customer c ON o.customer_id = c.id " +
                "WHERE t.operator_id = :operatorId AND t.status IN ('OPEN', 'IN_PROGRESS') " +
                "ORDER BY priorityScore DESC, t.creation_time ASC", // sortiraj po prioritetu
                nativeQuery = true)
        List<TicketSummaryProjection> findTicketSummariesForOperatorDashboard(@Param("operatorId") Long operatorId);

        // interfejs za prikaz
        interface TicketSummaryProjection {
            Long getId();
            String getStatus();
            String getProblemCategoryName();
            String getCustomerName();
            Integer getPriorityScore(); // Tip je Integer
            LocalDateTime getCreationTime();
            LocalDateTime getAssignedAt();
        }

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

    boolean existsByOperatorIdAndStatusIn(Long operatorId, List<TicketStatus> statuses);
    List<SupportTicket> findByStatusInAndReassignmentCountLessThan(List<TicketStatus> statuses, int maxReassignments);

    // NOVA METODA: Pronađi sve zatvorene tikete za određenog operatera
    List<SupportTicket> findByOperatorIdAndStatusOrderByClosingTimeDesc(Long operatorId, TicketStatus status);

    // NOVA METODA: Pronađi sve zatvorene tikete za određenog operatera u zadatom vremenskom periodu
    List<SupportTicket> findByOperatorIdAndStatusAndClosingTimeAfterOrderByClosingTimeDesc(Long operatorId, TicketStatus status, LocalDateTime after);

    // NOVA METODA: Pronađi sve zatvorene tikete (za administratora)
    List<SupportTicket> findByStatusOrderByClosingTimeDesc(TicketStatus status);
    @Query("SELECT t FROM SupportTicket t " +
            "JOIN t.order o " +
            "JOIN o.orderItems oi " +
            "JOIN oi.menuItemVersion miv " +
            "JOIN miv.menuVersion mv " +
            "JOIN mv.menu m " +
            "WHERE m.restaurant.id = :restaurantId " +
            "GROUP BY t.id")
    List<SupportTicket> findTicketsByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT new com.iis.foodflow.dto.request.CategoryTicketsDTO(pc.name, COUNT(t.id)) " +
            "FROM SupportTicket t " +
            "JOIN t.problemCategory pc " +
            "JOIN t.order o " +
            "JOIN o.orderItems oi " +
            "JOIN oi.menuItemVersion miv " +
            "JOIN miv.menuVersion mv " +
            "JOIN mv.menu m " +
            "WHERE m.restaurant.id = :restaurantId " +
            "GROUP BY pc.name " +
            "ORDER BY COUNT(t.id) DESC")
    List<CategoryTicketsDTO> countTicketsPerCategoryByRestaurant(@Param("restaurantId") Long restaurantId);

    @Query(value = """
            SELECT pc.name AS category_name, CAST(AVG(EXTRACT(EPOCH FROM (t.closing_time - t.creation_time))) AS TEXT) AS avg_resolution_time
            FROM support_ticket t
            JOIN problem_category pc ON t.problem_category_id = pc.id
            WHERE t.status IN ('RESOLVED', 'CLOSED')
            AND t.closing_time >= COALESCE(:startDate, '1970-01-01'::timestamp)
            AND t.closing_time <= COALESCE(:endDate, '9999-12-31'::timestamp)
            GROUP BY pc.name
            """, nativeQuery = true)
    List<CategoryPerformanceDTO> getAverageTimePerCategory(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status IN (com.iis.foodflow.enums.TicketStatus.RESOLVED, com.iis.foodflow.enums.TicketStatus.CLOSED) " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.closingTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.closingTime <= :endDate)")
    Long countTotalTickets(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // SupportTicketRepository.java - dodaj nove metode

    @Query("SELECT t FROM SupportTicket t " +
            "JOIN t.order o " +
            "JOIN o.orderItems oi " +
            "JOIN oi.menuItemVersion miv " +
            "JOIN miv.menuVersion mv " +
            "JOIN mv.menu m " +
            "WHERE m.restaurant.id = :restaurantId " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.creationTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.creationTime <= :endDate) " +
            "GROUP BY t.id")
    List<SupportTicket> findTicketsByRestaurantIdAndDateRange(
            @Param("restaurantId") Long restaurantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT new com.iis.foodflow.dto.request.CategoryTicketsDTO(pc.name, COUNT(t.id)) " +
            "FROM SupportTicket t " +
            "JOIN t.problemCategory pc " +
            "JOIN t.order o " +
            "JOIN o.orderItems oi " +
            "JOIN oi.menuItemVersion miv " +
            "JOIN miv.menuVersion mv " +
            "JOIN mv.menu m " +
            "WHERE m.restaurant.id = :restaurantId " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.creationTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.creationTime <= :endDate) " +
            "GROUP BY pc.name " +
            "ORDER BY COUNT(t.id) DESC")
    List<CategoryTicketsDTO> countTicketsPerCategoryByRestaurantAndDateRange(
            @Param("restaurantId") Long restaurantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // SupportTicketRepository.java - dodaj novu metodu

    @Query("SELECT t FROM SupportTicket t " +
            "WHERE t.operator.id = :operatorId " +
            "AND t.status = :status " +
            "AND (CAST(:startDate AS timestamp) IS NULL OR t.closingTime >= :startDate) " +
            "AND (CAST(:endDate AS timestamp) IS NULL OR t.closingTime <= :endDate) " +
            "ORDER BY t.closingTime DESC")
    List<SupportTicket> findByOperatorIdAndStatusAndDateRange(
            @Param("operatorId") Long operatorId,
            @Param("status") TicketStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

}
