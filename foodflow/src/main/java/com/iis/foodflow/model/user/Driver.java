package com.iis.foodflow.model.user;

import com.iis.foodflow.model.delivery.Delivery;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String firstName;
    @Column(nullable = false)
    private String lastName;
    @Column(nullable = false)
    private String phone;

    private String vehicleType;
    private Integer rejectionCount;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Administrator createdByAdmin;

    @OneToMany(mappedBy = "driver")
    private Set<Delivery> deliveries = new HashSet<>();
}