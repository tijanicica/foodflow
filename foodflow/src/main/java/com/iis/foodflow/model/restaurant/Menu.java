package com.iis.foodflow.model.restaurant;


import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // NOVO POLJE
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    @ToString.Exclude // Isključi toString da sprečiš rekurziju
    private Restaurant restaurant;


    // ===== KLJUČNA IZMENA JE OVDE =====
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL) // Dodajemo cascade = CascadeType.ALL
    @ToString.Exclude // NAJVAŽNIJE: Isključi kolekciju iz toString
    private Set<MenuVersion> versions = new HashSet<>();
}