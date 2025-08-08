package com.iis.foodflow.repository;

import com.iis.foodflow.model.restaurant.Allergen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AllergenRepository extends JpaRepository<Allergen, Long> {}
