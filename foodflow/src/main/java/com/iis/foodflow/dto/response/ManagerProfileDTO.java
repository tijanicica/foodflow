// src/main/java/com/iis/foodflow/dto/response/ManagerProfileDTO.java
package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerProfileDTO {
    private String fullName;
    private String phone;
    private String address; // Formatirana adresa
    private String email;
}