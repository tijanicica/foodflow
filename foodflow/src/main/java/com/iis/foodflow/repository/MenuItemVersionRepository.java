package com.iis.foodflow.repository;

import com.iis.foodflow.model.restaurant.MenuItemVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemVersionRepository extends JpaRepository<MenuItemVersion, Long> {
    @Query("SELECT miv FROM MenuItemVersion miv " +
            "JOIN FETCH miv.menuItem mi " +
            "LEFT JOIN FETCH mi.allergens " +
            "LEFT JOIN FETCH mi.dietTypes " +
            "WHERE miv.menuVersion.id = :versionId " +
            "AND (:dietTypeIds IS NULL OR EXISTS (SELECT 1 FROM mi.dietTypes dt WHERE dt.id IN :dietTypeIds)) " +
            "AND (:excludeAllergenIds IS NULL OR NOT EXISTS (SELECT 1 FROM mi.allergens al WHERE al.id IN :excludeAllergenIds))")
    List<MenuItemVersion> findFilteredItemsByVersionId(
            @Param("versionId") Long versionId,
            @Param("dietTypeIds") List<Long> dietTypeIds,
            @Param("excludeAllergenIds") List<Long> excludeAllergenIds
    );
}
