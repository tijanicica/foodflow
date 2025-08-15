package com.iis.foodflow.repository;

import com.iis.foodflow.model.user.Operator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OperatorRepository extends JpaRepository<Operator, Long> {
    Optional<Operator> findByEmail(String email);
}
