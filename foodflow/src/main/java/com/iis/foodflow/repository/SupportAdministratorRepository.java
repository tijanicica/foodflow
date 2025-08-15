package com.iis.foodflow.repository;

import com.iis.foodflow.model.user.SupportAdministrator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupportAdministratorRepository extends JpaRepository<SupportAdministrator, Long> {
    Optional<SupportAdministrator> findByEmail(String email);
}