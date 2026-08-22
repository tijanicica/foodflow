// Kreirajte novi fajl: src/main/java/com/iis/foodflow/dto/response/MenuVersionDetailDTO.java
package com.iis.foodflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuVersionDetailDTO {
    private Long id;
    private String menuName;
    private List<MenuItemDetailDTO> items;
}