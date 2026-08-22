package com.iis.foodflow.dto.response;

import com.iis.foodflow.model.support.Message;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private String text;
    private LocalDateTime sentAt;
    private Long senderId;
    private String senderRole;
    private String senderName;

    public MessageDTO(Message message) {
        this.text = message.getText();
        this.sentAt = message.getSentAt();
        if (message.getSenderCustomer() != null) {
            this.senderId = message.getSenderCustomer().getId();
            this.senderRole = "CUSTOMER";
            this.senderName = message.getSenderCustomer().getFirstName();
        } else if (message.getSenderOperator() != null) {
            this.senderId = message.getSenderOperator().getId();
            this.senderRole = "OPERATOR";
            this.senderName = message.getSenderOperator().getFirstName();
        }
    }
}
