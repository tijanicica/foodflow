package com.iis.foodflow.model.support;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
    private SupportTicket supportTicket;
}