package com.iis.foodflow.model.order;

import com.iis.foodflow.model.restaurant.MenuItemVersion;
import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int quantity;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "menu_item_version_id", nullable = false)
    private MenuItemVersion menuItemVersion;
}