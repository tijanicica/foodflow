package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.RepeatingOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepeatingOrderRepository extends JpaRepository<RepeatingOrder, Long> {}
