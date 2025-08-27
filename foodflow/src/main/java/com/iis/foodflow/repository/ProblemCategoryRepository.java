package com.iis.foodflow.repository;

import com.iis.foodflow.model.support.ProblemCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProblemCategoryRepository extends JpaRepository<ProblemCategory, Long> {
    List<ProblemCategory> findAllByParentCategoryIsNotNull();
    Optional<ProblemCategory> findByName(String name);
}
