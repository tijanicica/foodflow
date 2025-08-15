package com.iis.foodflow.repository;

import com.iis.foodflow.model.restaurant.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {}
