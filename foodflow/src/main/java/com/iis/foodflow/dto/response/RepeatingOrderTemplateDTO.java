package com.iis.foodflow.dto.response;


import com.iis.foodflow.enums.DayOfWeek;
import com.iis.foodflow.enums.RepeatType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class RepeatingOrderTemplateDTO {
        private Long id;
        private String restaurantName;
        private String restaurantImageUrl; // <-- DODAJEMO NOVO POLJE

        private RepeatType repeatType;
        private DayOfWeek dayOfWeek;
        private LocalTime deliveryTime;
        private boolean active;
        private boolean unlimited;
        private LocalDate repeatUntil;
        private Long originalOrderId;

}