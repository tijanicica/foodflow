package com.iis.foodflow.model.order;

import com.iis.foodflow.enums.DayOfMonth;
import com.iis.foodflow.enums.DayOfWeek;
import com.iis.foodflow.enums.RepeatType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;
// <-- VAŽNO: Importujte ugrađeni Java enum

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class RepeatingOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Svoj, automatski generisan ID
    private Long id;

    @Enumerated(EnumType.STRING)
    private RepeatType repeatType;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Enumerated(EnumType.STRING)
    private DayOfMonth dayOfMonth;

    private LocalTime deliveryTime;
    private boolean active;
    private LocalDate repeatUntil;
    private boolean unlimited;

    // Veza ka ORIGINALNOJ porudžbini koja služi kao osnova za ovaj šablon
    @OneToOne
    @JoinColumn(name = "original_order_id", referencedColumnName = "id", nullable = false)
    private Order originalOrder;

    // Veza ka svim NOVIM porudžbinama koje su kreirane na osnovu ovog šablona
    // mappedBy pokazuje na polje 'repeatingOrderTemplate' u klasi Order
    @OneToMany(mappedBy = "repeatingOrderTemplate")
    @ToString.Exclude
    private Set<Order> createdInstances = new HashSet<>();

    @Column(name = "is_cancelled", nullable = false, columnDefinition = "boolean default false")
    private boolean cancelled = false;
}