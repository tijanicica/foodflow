package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Card;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {}
