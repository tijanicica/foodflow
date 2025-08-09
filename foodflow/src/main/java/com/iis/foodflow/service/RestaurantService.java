package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.FilterRequestDTO;
import com.iis.foodflow.dto.response.AllergenDTO;
import com.iis.foodflow.dto.response.DietTypeDTO;
import com.iis.foodflow.dto.response.RestaurantDTO;
import com.iis.foodflow.enums.PriceRange;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.repository.AllergenRepository;
import com.iis.foodflow.repository.DietTypeRepository;
import com.iis.foodflow.repository.RestaurantRepository;
import com.iis.foodflow.specification.RestaurantSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final AllergenRepository allergenRepository; // Dodaj repozitorijum
    private final DietTypeRepository dietTypeRepository; // Dodaj repozitorijum

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
}