package com.iis.foodflow.repository;

import com.iis.foodflow.model.restaurant.Restaurant;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long>, JpaSpecificationExecutor<Restaurant> {


    @Query("SELECT r FROM Restaurant r LEFT JOIN FETCH r.menus m LEFT JOIN FETCH m.versions WHERE r.id = :id")
    Optional<Restaurant> findByIdWithMenusAndVersions(Long id);
}