package com.iis.foodflow.model.support;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Operator;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    private String description;
    private LocalDateTime creationTime;
    private LocalDateTime closingTime;

    @ManyToOne
    @JoinColumn(name = "operator_id")
    private Operator operator;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @OneToMany(mappedBy = "supportTicket", cascade = CascadeType.ALL)
    private Set<Message> messages = new HashSet<>();

    @OneToOne(mappedBy = "supportTicket", cascade = CascadeType.ALL)
    private OperatorRating operatorRating;

    @ManyToOne
    @JoinColumn(name = "problem_category_id", nullable=false)
    private ProblemCategory problemCategory;
}