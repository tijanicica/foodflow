package com.iis.foodflow.model.order;


import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.OrderType;
import com.iis.foodflow.enums.PaymentType;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "orders") // "order" je rezervisana reč u SQL-u
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    private LocalDateTime creationDate;
    private LocalDateTime scheduledFor;
    private BigDecimal cashAmount;
    private BigDecimal cardAmount;
    private BigDecimal deliveryPrice;
    private String noteForRestaurant;
    private String noteForDriver;
    private BigDecimal totalPrice;
    private LocalDateTime eta;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToOne
    @JoinColumn(name = "coupon_id")
    private Coupon usedCoupon;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private Set<OrderItem> orderItems = new HashSet<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private OrderRating orderRating;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private RepeatingOrder repeatingOrder;

    @OneToOne(mappedBy = "order")
    private SupportTicket supportTicket;
}
