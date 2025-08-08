package com.iis.foodflow.model.user;

import com.iis.foodflow.enums.Role;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.order.Card;
import com.iis.foodflow.model.order.Coupon;
import com.iis.foodflow.model.order.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class Customer implements UserDetails {
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

    @OneToMany(mappedBy = "customer")
    private Set<Address> addresses = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Card> cards = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Coupon> coupons = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    private Set<Order> orders = new HashSet<>();
    @Enumerated(EnumType.STRING) // <-- JAKO VAŽNO!
    @Column(nullable = false)
    private Role role; // <-- NOVO POLJE!


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(role);
    }

    @Override
    public String getUsername() {
        return email;
    }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}