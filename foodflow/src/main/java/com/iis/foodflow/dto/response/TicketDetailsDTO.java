package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Data
@AllArgsConstructor
@NoArgsConstructor

public class TicketDetailsDTO {
    private Long id;
    private TicketStatus status;
    private String problemCategoryName;
    private String initialDescription;
    private LocalDateTime creationTime;

    private Long orderId;
    private String restaurantName;
    private List<String> orderItems;

    private Long customerId;
    private String customerName;

    private Long operatorId;
    private String operatorName;

    private List<MessageDTO> messages;

    public TicketDetailsDTO(SupportTicket ticket) {
        this.id = ticket.getId();
        this.status = ticket.getStatus();
        this.problemCategoryName = ticket.getProblemCategory().getName();
        this.initialDescription = ticket.getDescription();
        this.creationTime = ticket.getCreationTime();

        this.orderId = ticket.getOrder().getId();
        this.restaurantName = ticket.getOrder().getOrderItems().stream().findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getName())
                .orElse("N/A");
        this.orderItems = ticket.getOrder().getOrderItems().stream()
                .map(item -> item.getQuantity() + "x " + item.getMenuItemVersion().getMenuItem().getName())
                .collect(Collectors.toList());

        Customer customer = ticket.getOrder().getCustomer();
        this.customerId = customer.getId();
        this.customerName = customer.getFirstName() + " " + customer.getLastName();

        if (ticket.getOperator() != null) {
            this.operatorId = ticket.getOperator().getId();
            this.operatorName = ticket.getOperator().getFirstName() + " " + ticket.getOperator().getLastName();
        }

        this.messages = ticket.getMessages().stream()
                .map(MessageDTO::new)
                .sorted(Comparator.comparing(MessageDTO::getSentAt))
                .collect(Collectors.toList());
    }


}
