package com.iis.foodflow.repository;

import com.iis.foodflow.model.user.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
public interface ManagerRepository extends JpaRepository<Manager, Long> {
    Optional<Manager> findByEmail(String email);
    // Ovaj upit koristi JOIN FETCH da odmah učita i restorane
    @Query("SELECT m FROM Manager m LEFT JOIN FETCH m.managedRestaurants WHERE m.email = :email")
    Optional<Manager> findByEmailWithRestaurants(@Param("email") String email);

}