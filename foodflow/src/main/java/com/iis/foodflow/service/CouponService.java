package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.CouponDTO;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<CouponDTO> getMyCoupons(Customer customer) {
        // Pozivamo novu metodu i prosleđujemo joj današnji datum
        return couponRepository.findValidCouponsForCustomer(customer, LocalDate.now()).stream()
                .map(CouponDTO::fromEntity)
                .collect(Collectors.toList());
    }
}