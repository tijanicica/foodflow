package com.iis.foodflow.repository;
import com.iis.foodflow.model.restaurant.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {}
