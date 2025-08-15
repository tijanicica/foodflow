package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.AddressRequest;
import com.iis.foodflow.dto.request.RegisterRequest;
import com.iis.foodflow.enums.Role;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.AddressRepository;
import com.iis.foodflow.repository.CustomerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class AuthService {


    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    // Inject-uj i ostale user repozitorijume ako želiš globalnu proveru email-a

    @Transactional // Osigurava da se sve sačuva ili ništa ako dođe do greške
    public Customer register(RegisterRequest request) {
        // 1. Provera da li se lozinke poklapaju
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalStateException("Passwords do not match.");
        }

        // 2. Provera da li email već postoji
        if (customerRepository.findByEmail(request.getEmail()).isPresent()) {
            // OVDE BI TREBALO PROVERITI I OSTALE USER TABELE DA BUDE SIGURNO
            throw new IllegalStateException("Email is already in use.");
        }

        // 3. Kreiranje novog Customer objekta
        Customer customer = new Customer();
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setRole(Role.CUSTOMER); // Fiksiramo ulogu na CUSTOMER

        Customer savedCustomer = customerRepository.save(customer);

        AddressRequest addressDto = request.getAddress();
        if (addressDto != null) { // Dobra praksa je proveriti da li je adresa poslata
            Address address = new Address();
            address.setNickname(addressDto.getNickname());
            address.setCountry(addressDto.getCountry());
            address.setCity(addressDto.getCity());
            address.setStreet(addressDto.getStreet());
            address.setStreetNumber(addressDto.getStreetNumber());
            address.setPostalCode(addressDto.getPostalCode());

            // --- KLJUČNA IZMENA JE OVDE ---
            // Postavljamo koordinate koje su stigle sa frontenda
            address.setLatitude(addressDto.getLatitude());
            address.setLongitude(addressDto.getLongitude());

            address.setCustomer(savedCustomer);

            addressRepository.save(address);
        }

        return savedCustomer;
    }
}