package com.iis.foodflow.model.support;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

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
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ProblemCategory parentCategory;

    @OneToMany(mappedBy = "parentCategory")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ProblemCategory> subCategories = new HashSet<>();
}