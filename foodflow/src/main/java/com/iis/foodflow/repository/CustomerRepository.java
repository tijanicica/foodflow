package com.iis.foodflow.repository;

import com.iis.foodflow.model.user.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    // Ako Customer ima lazy veze (npr. addresses, cards), dodaj sličan upit

}