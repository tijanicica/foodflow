package com.iis.foodflow.model.order;

import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Customer;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String street;
    private String streetNumber;
    private String city;
    private String country;
    private String nickname; // naziv (opciono)
    private Double longitude;
    private Double latitude;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToOne(mappedBy = "address")
    private Restaurant restaurant;
}
