package com.iis.foodflow.model.restaurant;

import com.iis.foodflow.enums.PriceRange;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.user.Manager;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Getter
@Setter
// Definišite equals i hashCode samo na osnovu jedinstvenog ključa (id)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    private String name;
    private String imageUrl;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Double averageRating;
    @Enumerated(EnumType.STRING)
    private PriceRange priceRange;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager manager;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "id")
    private Address address;

    @OneToMany(mappedBy = "restaurant")
    private Set<Menu> menus = new HashSet<>();
}