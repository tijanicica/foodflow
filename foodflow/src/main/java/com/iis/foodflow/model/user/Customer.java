package com.iis.foodflow.model.user;

import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.order.Card;
import com.iis.foodflow.model.order.Coupon;
import com.iis.foodflow.model.order.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class Customer {
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

    @OneToMany(mappedBy = "customer")
    private Set<Address> addresses = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Card> cards = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Coupon> coupons = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Order> orders = new HashSet<>();
}