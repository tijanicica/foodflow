package com.iis.foodflow.service;

import com.iis.foodflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired

    private  CustomerRepository customerRepository;
    @Autowired

    private  DriverRepository driverRepository;
    @Autowired

    private  ManagerRepository managerRepository;
    @Autowired

    private  OperatorRepository operatorRepository;
    @Autowired

    private  AdministratorRepository administratorRepository;
    @Autowired

    private  SupportAdministratorRepository supportAdministratorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Traži redom u svakom repozitorijumu dok ne nađe korisnika
        return customerRepository.findByEmail(email)
                .<UserDetails>map(user -> user)
                .orElseGet(() -> driverRepository.findByEmail(email)
                        .<UserDetails>map(user -> user)
                        .orElseGet(() -> managerRepository.findByEmail(email)
                                .<UserDetails>map(user -> user)
                                .orElseGet(() -> operatorRepository.findByEmail(email)
                                        .<UserDetails>map(user -> user)
                                        .orElseGet(() -> administratorRepository.findByEmail(email)
                                                .<UserDetails>map(user -> user)
                                                .orElseGet(() -> supportAdministratorRepository.findByEmail(email)
                                                        .<UserDetails>map(user -> user)
                                                        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email))
                                                )
                                        )
                                )
                        )
                );
    }
}
