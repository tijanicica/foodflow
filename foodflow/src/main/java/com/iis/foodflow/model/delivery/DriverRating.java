// Datoteka: src/main/java/com/iis/foodflow/model/delivery/DriverRating.java
package com.iis.foodflow.model.delivery;

import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.model.user.Manager;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriverRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id", unique = true)
    private Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    // --- Ocjena od strane KUPCA ---
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer ratedByCustomer;

    // Parametri ocjenjivanja od strane kupca
    private Integer onTimeArrivalRating; // Ocjena za dolazak na vrijeme (1-5)
    private Integer hygieneRatingCustomer; // Ocjena za higijenu (1-5)
    private Integer kindnessRating; // Ocjena za ljubaznost (1-5)

    // --- Ocjena od strane RESTORANA (Menadžera) ---
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Manager ratedByManager;

    // Parametri ocjenjivanja od strane restorana
    private Integer professionalismRating; // Ocjena za profesionalnost (1-5)
    private Integer hygieneRatingRestaurant; // Ocjena za higijenu (1-5)
    private Integer communicationRating; // Ocjena za komunikaciju (1-5)

}