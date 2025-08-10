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
    private int quality;
    private int taste;
    private int portionSize;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Order order;
}