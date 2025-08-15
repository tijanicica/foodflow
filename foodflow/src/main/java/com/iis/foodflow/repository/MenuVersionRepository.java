package com.iis.foodflow.repository;

import com.iis.foodflow.model.restaurant.MenuVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MenuVersionRepository extends JpaRepository<MenuVersion, Long> {
    Optional<MenuVersion> findByMenuRestaurantIdAndActiveTrue(Long restaurantId);
}

