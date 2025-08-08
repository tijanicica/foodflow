package com.iis.foodflow.model.support;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class ProblemCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    private ProblemCategory parentCategory;

    @OneToMany(mappedBy = "parentCategory")
    private Set<ProblemCategory> subCategories = new HashSet<>();
}