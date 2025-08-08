package com.iis.foodflow.model.user;

import com.iis.foodflow.model.support.SupportTicket;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
public class Operator {
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
    private Set<SupportTicket> tickets = new HashSet<>();
}