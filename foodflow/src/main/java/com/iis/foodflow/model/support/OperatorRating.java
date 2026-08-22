package com.iis.foodflow.model.support;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class OperatorRating {
    @Id
    private Long id;
    private int rating;
    private String comment;
    private LocalDateTime ratingDate;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SupportTicket supportTicket;
}