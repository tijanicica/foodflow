package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, Long> {}

