package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.FilterRequestDTO;
import com.iis.foodflow.dto.response.*;
import com.iis.foodflow.enums.PriceRange;
import com.iis.foodflow.model.restaurant.MenuItem;
import com.iis.foodflow.model.restaurant.MenuItemVersion;
import com.iis.foodflow.model.restaurant.MenuVersion;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.repository.*;
import com.iis.foodflow.specification.RestaurantSpecification;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import com.iis.foodflow.model.restaurant.*; // Importuj sve iz model.restaurant paketa
import org.springframework.util.CollectionUtils;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final AllergenRepository allergenRepository; // Dodaj repozitorijum
    private final DietTypeRepository dietTypeRepository; // Dodaj repozitorijum
    private final MenuVersionRepository menuVersionRepository;

    private final MenuItemVersionRepository menuItemVersionRepository; // DODAJ NOVI REPOZITORIJUM




    public List<RestaurantDTO> getFilteredRestaurants(FilterRequestDTO filters) {
        Specification<Restaurant> spec = RestaurantSpecification.filterBy(filters);
        Sort sort = Sort.by(Sort.Direction.DESC, "averageRating");

        List<Restaurant> restaurants = restaurantRepository.findAll(spec, sort);

        return restaurants.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AllergenDTO> getAllAllergens() {
        return allergenRepository.findAll().stream()
                .map(allergen -> new AllergenDTO(allergen.getId(), allergen.getName()))
                .collect(Collectors.toList());
    }

    public List<DietTypeDTO> getAllDietTypes() {
        return dietTypeRepository.findAll().stream()
                .map(dietType -> new DietTypeDTO(dietType.getId(), dietType.getName()))
                .collect(Collectors.toList());
    }
    private RestaurantDTO convertToDto(Restaurant restaurant) {
        return new RestaurantDTO(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getImageUrl(),
                restaurant.getAverageRating(),
                restaurant.getPriceRange()
        );
    }

    public MenuDTO getActiveMenuForRestaurant(Long restaurantId, List<Long> dietTypeIds, List<Long> excludeAllergenIds) {
        MenuVersion activeVersion = menuVersionRepository
                .findByMenuRestaurantIdAndActiveTrue(restaurantId)
                .orElseThrow(() -> new RuntimeException("No active menu found for restaurant ID: " + restaurantId));

        Restaurant restaurant = activeVersion.getMenu().getRestaurant();

        // Provera da li su liste prazne i postavljanje na null ako jesu, radi JPQL upita
        List<Long> finalDietTypeIds = CollectionUtils.isEmpty(dietTypeIds) ? null : dietTypeIds;
        List<Long> finalExcludeAllergenIds = CollectionUtils.isEmpty(excludeAllergenIds) ? null : excludeAllergenIds;

        // KORISTI NOVI UPIT ZA FILTRIRANJE DIREKTNO U BAZI
        List<MenuItemVersion> filteredMenuItemVersions = menuItemVersionRepository.findFilteredItemsByVersionId(
                activeVersion.getId(),
                finalDietTypeIds,
                finalExcludeAllergenIds
        );

        List<MenuItemDTO> filteredItems = filteredMenuItemVersions.stream()
                .map(this::convertMenuItemVersionToDto)
                .collect(Collectors.toList());

        return new MenuDTO(
                restaurant.getName(),
                restaurant.getAverageRating(),
                restaurant.getImageUrl(),
                restaurant.getOpeningTime(),
                restaurant.getClosingTime(),
                filteredItems
        );
    }

    private MenuItemDTO convertMenuItemVersionToDto(MenuItemVersion miv) {
        MenuItem item = miv.getMenuItem();
        List<String> allergenNames = item.getAllergens().stream().map(Allergen::getName).collect(Collectors.toList());
        List<String> dietTypeNames = item.getDietTypes().stream().map(DietType::getName).collect(Collectors.toList());

        return new MenuItemDTO(
                miv.getId(),
                item.getName(),
                item.getDescription(),
                item.getImageUrl(),
                miv.getPrice(),
                allergenNames,
                dietTypeNames,
                item.getType(),
                miv.isAvailable(),
                miv.isPopular(),
                miv.getTimeFrom(),
                miv.getTimeTo()
        );
    }
    public List<Restaurant> getAllRestaurantsForAdmin() {
        // Jednostavno vraća sve restorane iz baze
        return restaurantRepository.findAll();
    }
}