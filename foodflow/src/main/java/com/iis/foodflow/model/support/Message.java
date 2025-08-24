package com.iis.foodflow.model.support;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Operator;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private SupportTicket supportTicket;

    @ManyToOne
    @JoinColumn(name = "sender_customer_id")
    private Customer senderCustomer;

    @ManyToOne
    @JoinColumn(name = "sender_operator_id")
    private Operator senderOperator;
}