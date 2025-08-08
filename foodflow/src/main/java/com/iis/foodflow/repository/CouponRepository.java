package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Long> {}
