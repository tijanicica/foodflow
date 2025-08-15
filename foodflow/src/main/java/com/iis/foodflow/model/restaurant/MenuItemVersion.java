package com.iis.foodflow.model.restaurant;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class MenuItemVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private BigDecimal price;
    private LocalTime timeFrom; // Bilo je dateFrom (LocalDateTime)
    private LocalTime timeTo;   // Bilo je dateTo (LocalDateTime)
    private boolean available;
    private boolean popular;
    // NOVO POLJE
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    @ToString.Exclude
    private MenuItem menuItem;

    @ManyToOne
    @JoinColumn(name = "menu_version_id")
    @ToString.Exclude
    private MenuVersion menuVersion;


}