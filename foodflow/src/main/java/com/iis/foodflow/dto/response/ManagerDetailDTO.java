package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ManagerDetailDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private List<Long> managedRestaurantIds; // Lista ID-jeva restorana kojima upravlja
}