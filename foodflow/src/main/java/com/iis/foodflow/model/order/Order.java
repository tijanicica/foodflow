// Datoteka: src/main/java/com/iis/foodflow/model/order/Order.java
package com.iis.foodflow.model.order;

import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.OrderType;
import com.iis.foodflow.enums.PaymentType;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "orders")
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
    private LocalDateTime eta; // Procijenjeno vrijeme isporuke



    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "start_delivery_time")
    private LocalDateTime startDeliveryTime;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToOne
    @JoinColumn(name = "coupon_id")
    private Coupon usedCoupon;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private Set<OrderItem> orderItems = new HashSet<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private OrderRating orderRating;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST) // <-- DODAJTE 'cascade = CascadeType.PERSIST'
    @JoinColumn(name = "repeating_order_template_id") // Nova kolona u 'orders' tabeli
    @ToString.Exclude
    private RepeatingOrder repeatingOrderTemplate;

    @OneToOne(mappedBy = "order")
    private SupportTicket supportTicket;


    @Column(name = "cancellation_reason")
    private String cancellationReason;
  
    @ManyToOne
    @JoinColumn(name = "address_id", nullable = false) // Svaka porudžbina MORA imati adresu
    private Address address;

    @Column(name = "driver_reported_delay")
    private Integer driverReportedDelay = 0; // U minutama, početna vrijednost 0
}