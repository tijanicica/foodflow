package com.iis.foodflow.model.user;

import com.iis.foodflow.enums.DriverStatus;
import com.iis.foodflow.enums.Role;
import com.iis.foodflow.enums.VehicleType;
import com.iis.foodflow.model.order.Order;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Driver implements UserDetails {
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

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type")
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status;

    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;

    // --- ISPRAVKA OVDJE ---
    @Column(name = "rejection_count")
    private Integer rejectionCount = 0; // Postavljena početna vrijednost na 0
    // -----------------------

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Administrator createdByAdmin;

    @OneToMany(mappedBy = "driver")
    private Set<Order> deliveries = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- UserDetails METODE ---
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return Collections.singletonList(role); }
    @Override
    public String getUsername() { return email; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}