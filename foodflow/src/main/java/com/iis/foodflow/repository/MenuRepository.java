package com.iis.foodflow.repository;
import com.iis.foodflow.model.restaurant.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    @Query("SELECT m FROM Menu m WHERE m.restaurant.manager.id = :managerId")
    List<Menu> findByRestaurantManagerId(Long managerId);
}
