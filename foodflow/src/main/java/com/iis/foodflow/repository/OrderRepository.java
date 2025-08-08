package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {}
