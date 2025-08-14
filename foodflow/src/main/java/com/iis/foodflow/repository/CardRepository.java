package com.iis.foodflow.repository;

import com.iis.foodflow.model.order.Card;
import com.iis.foodflow.model.user.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByCustomer(Customer customer);


}
