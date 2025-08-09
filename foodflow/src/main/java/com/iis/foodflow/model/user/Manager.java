package com.iis.foodflow.model.user;


import com.iis.foodflow.enums.Role;
import com.iis.foodflow.model.restaurant.Restaurant;
import lombok.*;

import jakarta.persistence.*;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Manager implements UserDetails {
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

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Administrator createdByAdmin;

    @OneToMany(mappedBy = "manager")
    @ToString.Exclude
    private Set<Restaurant> managedRestaurants = new HashSet<>();
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