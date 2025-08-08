package com.iis.foodflow.model.restaurant;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class DietType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
}

