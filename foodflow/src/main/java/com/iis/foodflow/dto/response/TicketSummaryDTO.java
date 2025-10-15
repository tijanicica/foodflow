package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.support.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryDTO {
    private Long id;
    private TicketStatus status;
    private String problemCategoryName;
    private String customerName;
    private Integer priorityScore;
    private LocalDateTime creationTime;
    private LocalDateTime assignedAt;


}
