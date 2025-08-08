package com.iis.foodflow.model.user;


import com.iis.foodflow.model.restaurant.Restaurant;
import lombok.Data;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class Manager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String firstName;
    @Column(nullable = false)
    private String lastName;
    @Column(nullable = false)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Administrator createdByAdmin;

    @OneToMany(mappedBy = "manager")
    private Set<Restaurant> managedRestaurants = new HashSet<>();
}