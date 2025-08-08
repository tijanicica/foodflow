package com.iis.foodflow.model.restaurant;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class MenuVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int versionNumber;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private LocalDateTime creationDate;
    private boolean active;

    @ManyToOne
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @OneToMany(mappedBy = "menuVersion")
    private Set<MenuItemVersion> menuItemVersions = new HashSet<>();
}