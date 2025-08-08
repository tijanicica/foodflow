package com.iis.foodflow.model.delivery;

import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Driver;
import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    // Ocenjivanje od strane menadžera
    private Integer managerProfessionalism;
    private Integer managerHygiene;
    private Integer managerCommunication;

    // Ocenjivanje od strane korisnika
    private Integer customerRating;
    private Integer customerCommunication;
    private Integer customerHygiene;
}