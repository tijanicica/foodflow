package com.iis.foodflow.model.support;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Operator;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Operator operator;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Order order;

    @OneToMany(mappedBy = "supportTicket", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Message> messages = new HashSet<>();

    @OneToOne(mappedBy = "supportTicket", cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private OperatorRating operatorRating;

    @ManyToOne
    @JoinColumn(name = "problem_category_id", nullable=false)
    private ProblemCategory problemCategory;

    @Column(name = "reassignment_count", nullable = false, columnDefinition = "int default 0")
    private int reassignmentCount = 0;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
}