// Datoteka: src/main/java/com/iis/foodflow/model/delivery/OrderOffer.java
package com.iis.foodflow.model.delivery;

import com.iis.foodflow.enums.OfferStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Driver;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderOffer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(optional = false)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status;

    private LocalDateTime createdAt;
    private String reasonForRejection;
}