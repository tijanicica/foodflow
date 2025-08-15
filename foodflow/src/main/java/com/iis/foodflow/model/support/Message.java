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
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "TEXT")
    private String text;
    private LocalDateTime sentAt;
    private boolean read;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket supportTicket;
}