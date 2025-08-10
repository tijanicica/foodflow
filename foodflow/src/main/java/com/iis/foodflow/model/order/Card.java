package com.iis.foodflow.model.order;

import com.iis.foodflow.model.user.Customer;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String cardNumber;
    private String accountNumber;
    private String cvv;
    private String expiryDate;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}