package com.iis.foodflow.specification;

import com.iis.foodflow.dto.request.FilterRequestDTO;
import com.iis.foodflow.model.restaurant.*;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class RestaurantSpecification {

    public static Specification<Restaurant> filterBy(FilterRequestDTO filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Search Term
            if (StringUtils.hasText(filters.getSearchTerm())) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + filters.getSearchTerm().toLowerCase() + "%"));
            }

            // 2. Price Range
            if (!CollectionUtils.isEmpty(filters.getPriceRanges())) {
                predicates.add(root.get("priceRange").in(filters.getPriceRanges()));
            }

            // 3. Dietary Filter - Pokaži restorane koji IMAJU bar jednu stavku sa ovim tipom ishrane
            if (!CollectionUtils.isEmpty(filters.getDietTypeIds())) {
                // Kreiramo podupit koji proverava postojanje
                Subquery<Long> subquery = query.subquery(Long.class);
                // POČINJEMO OD RESTORANA U PODUPITU
                Root<Restaurant> subRoot = subquery.from(Restaurant.class);
                Join<Restaurant, Menu> menuJoin = subRoot.join("menus");
                Join<Menu, MenuVersion> menuVersionJoin = menuJoin.join("versions");
                Join<MenuVersion, MenuItemVersion> itemVersionJoin = menuVersionJoin.join("menuItemVersions");
                Join<MenuItemVersion, MenuItem> menuItemJoin = itemVersionJoin.join("menuItem");
                Join<MenuItem, DietType> dietTypeJoin = menuItemJoin.join("dietTypes");

                subquery.select(subRoot.get("id"))
                        .where(
                                cb.equal(subRoot.get("id"), root.get("id")), // Povezujemo sa glavnim upitom
                                cb.isTrue(menuVersionJoin.get("active")), // Samo aktivne verzije menija
                                dietTypeJoin.get("id").in(filters.getDietTypeIds())
                        );

                // Glavni uslov je da restoran sa takvom stavkom POSTOJI
                predicates.add(cb.exists(subquery));
            }

            // 4. Exclude Allergens Filter - Pokaži restorane koji NEMAJU nijednu stavku sa ovim alergenom
            if (!CollectionUtils.isEmpty(filters.getExcludeAllergenIds())) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<Restaurant> subRoot = subquery.from(Restaurant.class);
                Join<Restaurant, Menu> menuJoin = subRoot.join("menus");
                Join<Menu, MenuVersion> menuVersionJoin = menuJoin.join("versions");
                Join<MenuVersion, MenuItemVersion> itemVersionJoin = menuVersionJoin.join("menuItemVersions");
                Join<MenuItemVersion, MenuItem> menuItemJoin = itemVersionJoin.join("menuItem");
                Join<MenuItem, Allergen> allergenJoin = menuItemJoin.join("allergens");

                subquery.select(subRoot.get("id"))
                        .where(
                                cb.equal(subRoot.get("id"), root.get("id")),
                                cb.isTrue(menuVersionJoin.get("active")),
                                allergenJoin.get("id").in(filters.getExcludeAllergenIds())
                        );

                // Glavni uslov je da restoran sa takvom stavkom NE POSTOJI
                predicates.add(cb.not(cb.exists(subquery)));
            }

            // Važno: Sprečavamo duplikate restorana ako zadovoljavaju više uslova
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}