package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.OrderRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRatingRepository extends JpaRepository<OrderRating, Long> {

}
