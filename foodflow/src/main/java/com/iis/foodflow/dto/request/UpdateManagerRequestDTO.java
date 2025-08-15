package com.iis.foodflow.dto.request;

import lombok.Data;
import java.util.Set;

@Data
public class UpdateManagerRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Set<Long> restaurantIds; // Novi set ID-jeva restorana
}