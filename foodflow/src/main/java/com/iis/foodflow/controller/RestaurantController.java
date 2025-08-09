package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.FilterRequestDTO;
import com.iis.foodflow.dto.response.AllergenDTO;
import com.iis.foodflow.dto.response.DietTypeDTO;
import com.iis.foodflow.dto.response.RestaurantDTO;
import com.iis.foodflow.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping("/filter")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RestaurantDTO>> getFilteredRestaurants(@RequestBody FilterRequestDTO filters) {
        List<RestaurantDTO> restaurants = restaurantService.getFilteredRestaurants(filters);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/allergens")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AllergenDTO>> getAllAllergens() {
        return ResponseEntity.ok(restaurantService.getAllAllergens());
    }

    @GetMapping("/diet-types")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<DietTypeDTO>> getAllDietTypes() {
        return ResponseEntity.ok(restaurantService.getAllDietTypes());
    }
}