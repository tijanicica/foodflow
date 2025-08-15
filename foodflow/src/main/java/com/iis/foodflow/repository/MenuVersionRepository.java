package com.iis.foodflow.repository;

import com.iis.foodflow.model.restaurant.MenuVersion;
import com.iis.foodflow.model.user.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MenuVersionRepository extends JpaRepository<MenuVersion, Long> {
    @Query("SELECT COUNT(mv) FROM MenuVersion mv WHERE mv.menu.restaurant.id = :restaurantId AND mv.active = true")
    long countActiveByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT mv FROM MenuVersion mv JOIN FETCH mv.menu m JOIN FETCH m.restaurant r WHERE r.manager = :manager")
    List<MenuVersion> findAllByManagerWithDetails(@Param("manager") Manager manager);

    Optional<MenuVersion> findByMenuRestaurantIdAndActiveTrue(Long restaurantId);
}

