package com.iis.foodflow.service;


import com.iis.foodflow.dto.request.AddressRequestDTO;
import com.iis.foodflow.dto.response.AddressDTO;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<AddressDTO> getAddressesForCustomer(Customer customer) {
        return addressRepository.findAllByCustomer(customer).stream()
                .map(AddressDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDTO addNewAddress(AddressRequestDTO request, Customer customer) {
        Address newAddress = new Address();
        newAddress.setStreet(request.getStreet());
        newAddress.setStreetNumber(request.getStreetNumber());
        newAddress.setCity(request.getCity());
        newAddress.setCountry(request.getCountry());
        newAddress.setNickname(request.getNickname());
        newAddress.setPostalCode(request.getPostalCode());
        newAddress.setCustomer(customer); // Poveži sa ulogovanim korisnikom

        Address savedAddress = addressRepository.save(newAddress);
        return AddressDTO.fromEntity(savedAddress);
    }
}