package com.iis.foodflow.model.user;

import com.iis.foodflow.enums.OperatorStatus;
import com.iis.foodflow.enums.Role;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.model.support.SupportTicket;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class Operator implements UserDetails {
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
    @JoinColumn(name = "support_admin_id")
    private SupportAdministrator createdBySupportAdmin;

    @OneToMany(mappedBy = "operator")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<SupportTicket> tickets = new HashSet<>();
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "average_rating")
    private Double averageRating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'OFFLINE'")
    private OperatorStatus status = OperatorStatus.OFFLINE;

    @Column(name = "last_assigned_ticket_at")
    private LocalDateTime lastAssignedTicketAt;

    @ManyToMany(fetch = FetchType.EAGER) // EAGER da bismo lako pristupili specijalizacijama
    @JoinTable(
            name = "operator_specialization",
            joinColumns = @JoinColumn(name = "operator_id"),
            inverseJoinColumns = @JoinColumn(name = "problem_category_id")
    )
    private Set<ProblemCategory> specializations = new HashSet<>();

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