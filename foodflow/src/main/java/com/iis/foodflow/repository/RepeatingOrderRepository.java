package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.RepeatingOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RepeatingOrderRepository extends JpaRepository<RepeatingOrder, Long> {

    List<RepeatingOrder> findAllByActiveTrueAndRepeatUntilAfterOrRepeatUntilIsNull(LocalDate date);


}
