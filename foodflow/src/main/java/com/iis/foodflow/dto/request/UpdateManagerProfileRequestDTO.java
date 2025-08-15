// src/main/java/com/iis/foodflow/dto/request/UpdateManagerProfileRequestDTO.java
package com.iis.foodflow.dto.request;

import lombok.Data;

@Data
public class UpdateManagerProfileRequestDTO {
    // Frontend će slati samo polja koja se mogu menjati
    private String phone;
}