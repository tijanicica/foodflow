package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Coupon;
import com.iis.foodflow.model.user.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeAndCustomerAndUsedFalse(String code, Customer customer);
    @Query("SELECT c FROM Coupon c WHERE c.customer = :customer " +
            "AND c.used = false " +
            "AND c.active = true " +
            "AND c.dateFrom <= :currentDate " +
            "AND c.dateTo >= :currentDate")
    List<Coupon> findValidCouponsForCustomer(@Param("customer") Customer customer, @Param("currentDate") LocalDate currentDate);

}
