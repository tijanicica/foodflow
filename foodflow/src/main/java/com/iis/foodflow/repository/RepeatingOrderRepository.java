package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.RepeatingOrder;
import com.iis.foodflow.model.user.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RepeatingOrderRepository extends JpaRepository<RepeatingOrder, Long> {

    List<RepeatingOrder> findAllByActiveTrueAndRepeatUntilAfterOrRepeatUntilIsNull(LocalDate date);

    // Nova metoda za Repeating tab
    @Query("SELECT ro FROM RepeatingOrder ro WHERE ro.originalOrder.customer = :customer AND ro.cancelled = false ORDER BY ro.id")
    List<RepeatingOrder> findTemplatesForCustomer(@Param("customer") Customer customer);

}
