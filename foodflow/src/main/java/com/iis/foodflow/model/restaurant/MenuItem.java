package com.iis.foodflow.model.restaurant;

import com.iis.foodflow.enums.MenuItemType;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItemType type;

    @ManyToMany
    @JoinTable(
            name = "menu_item_diet_type",
            joinColumns = @JoinColumn(name = "menu_item_id"),
            inverseJoinColumns = @JoinColumn(name = "diet_type_id")
    )
    @ToString.Exclude
    private Set<DietType> dietTypes = new HashSet<>();
    // NOVO POLJE
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    @ManyToMany
    @JoinTable(
            name = "menu_item_allergen",
            joinColumns = @JoinColumn(name = "menu_item_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )

    @ToString.Exclude
    private Set<Allergen> allergens = new HashSet<>();
}