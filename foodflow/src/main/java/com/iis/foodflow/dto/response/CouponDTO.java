package com.iis.foodflow.dto.response;

import com.iis.foodflow.model.order.Coupon;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponDTO {
    private Long id;
    private String code;
    private LocalDate dateTo;

    public static CouponDTO fromEntity(Coupon coupon) {
        return new CouponDTO(coupon.getId(), coupon.getCode(), coupon.getDateTo());
    }
}