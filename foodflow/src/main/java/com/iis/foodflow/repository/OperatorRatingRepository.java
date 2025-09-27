package com.iis.foodflow.repository;

import com.iis.foodflow.model.support.OperatorRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OperatorRatingRepository extends JpaRepository<OperatorRating, Long> {
    @Query("SELECT AVG(r.rating) FROM OperatorRating r")
    Double getOverallAverageRating();

//    @Query("SELECT AVG(r.rating) FROM OperatorRating r WHERE r.supportTicket.operator.id = :operatorId")
//    Double getAverageRatingByOperator(@Param("operatorId") Long operatorId);
}

