package com.iis.foodflow.model.restaurant;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String imageUrl;

    @ManyToMany
    @JoinTable(
            name = "menu_item_diet_type",
            joinColumns = @JoinColumn(name = "menu_item_id"),
            inverseJoinColumns = @JoinColumn(name = "diet_type_id")
    )
    private Set<DietType> dietTypes = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "menu_item_allergen",
            joinColumns = @JoinColumn(name = "menu_item_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private Set<Allergen> allergens = new HashSet<>();
}