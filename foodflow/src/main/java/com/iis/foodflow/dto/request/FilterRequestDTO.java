package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.PriceRange;
import lombok.Data;
import java.util.List;

@Data
public class FilterRequestDTO {
    private String searchTerm;
    private List<Long> dietTypeIds;
    private List<Long> excludeAllergenIds;
    private List<PriceRange> priceRanges;
}