package com.iis.foodflow.model.order;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
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