package com.iis.foodflow.model.order;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class OrderRating {
    @Id
    private Long id;

    @Column(name = "quality") // Eksplicitno ime kolone
    private Integer quality;

    @Column(name = "taste")   // Eksplicitno ime kolone
    private Integer taste;

    @Column(name = "portion_size") // Eksplicitno ime kolone
    private Integer portionSize;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Order order;
}