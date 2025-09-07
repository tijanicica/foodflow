package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.support.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketSummaryDTO {
    private Long id;
    private TicketStatus status;
    private String problemCategoryName;
    private String customerName;
    private Integer priorityScore;

//    public TicketSummaryDTO(SupportTicket ticket) {
//        this.id = ticket.getId();
//        this.status = ticket.getStatus();
//        this.problemCategoryName = ticket.getProblemCategory().getName();
//        this.customerName = ticket.getOrder().getCustomer().getFirstName() + " " + ticket.getOrder().getCustomer().getLastName();
//
//    }
}
