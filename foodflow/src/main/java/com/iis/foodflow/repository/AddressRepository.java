package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.user.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    Optional<Address> findByIdAndCustomer(Long addressId, Customer customer);
    List<Address> findAllByCustomer(Customer customer);
}

