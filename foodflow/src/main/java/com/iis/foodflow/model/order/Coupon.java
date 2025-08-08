package com.iis.foodflow.model.order;

import com.iis.foodflow.model.user.Customer;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@Entity
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private boolean active;
    private boolean used;
    private LocalDateTime usageDate;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
}