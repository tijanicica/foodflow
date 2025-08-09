package com.iis.foodflow.specification;

// u novom paketu "specification"

import com.iis.foodflow.dto.request.FilterRequestDTO;
import com.iis.foodflow.model.restaurant.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;


public class RestaurantSpecification {

    public static Specification<Restaurant> filterBy(FilterRequestDTO filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Search Term Filter
            if (filters.getSearchTerm() != null && !filters.getSearchTerm().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + filters.getSearchTerm().toLowerCase() + "%"));
            }

            // 2. Price Range Filter
            if (filters.getPriceRanges() != null && !filters.getPriceRanges().isEmpty()) {
                predicates.add(root.get("priceRange").in(filters.getPriceRanges()));
            }

            // 3. Dietary Filter
            if (filters.getDietTypeIds() != null && !filters.getDietTypeIds().isEmpty()) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Join<Restaurant, Menu> menuJoin = subquery.from(Restaurant.class).join("menus");
                Join<Menu, MenuVersion> versionJoin = menuJoin.join("versions");
                Join<MenuVersion, MenuItemVersion> itemVersionJoin = versionJoin.join("menuItemVersions");
                Join<MenuItemVersion, MenuItem> itemJoin = itemVersionJoin.join("menuItem");
                Join<MenuItem, DietType> dietTypeJoin = itemJoin.join("dietTypes");

                subquery.select(menuJoin.get("restaurant").get("id"))
                        .where(
                                cb.and(
                                        // ISPRAVLJENA LINIJA: Koristi cb.isTrue()
                                        cb.isTrue(versionJoin.get("active")),
                                        dietTypeJoin.get("id").in(filters.getDietTypeIds())
                                )
                        );
                predicates.add(root.get("id").in(subquery));
            }

            // 4. Exclude Allergens Filter
            if (filters.getExcludeAllergenIds() != null && !filters.getExcludeAllergenIds().isEmpty()) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Join<Restaurant, Menu> menuJoin = subquery.from(Restaurant.class).join("menus");
                Join<Menu, MenuVersion> versionJoin = menuJoin.join("versions");
                Join<MenuVersion, MenuItemVersion> itemVersionJoin = versionJoin.join("menuItemVersions");
                Join<MenuItemVersion, MenuItem> itemJoin = itemVersionJoin.join("menuItem");
                Join<MenuItem, Allergen> allergenJoin = itemJoin.join("allergens");

                subquery.select(menuJoin.get("restaurant").get("id"))
                        .where(
                                cb.and(
                                        // ISPRAVLJENA LINIJA: Koristi cb.isTrue()
                                        cb.isTrue(versionJoin.get("active")),
                                        allergenJoin.get("id").in(filters.getExcludeAllergenIds())
                                )
                        );
                predicates.add(cb.not(root.get("id").in(subquery)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}