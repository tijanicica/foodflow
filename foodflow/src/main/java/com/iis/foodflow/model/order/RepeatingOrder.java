package com.iis.foodflow.model.order;

import com.iis.foodflow.enums.DayOfMonth;
import com.iis.foodflow.enums.DayOfWeek;
import com.iis.foodflow.enums.RepeatType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class RepeatingOrder {
    @Id
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

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Order order;
}