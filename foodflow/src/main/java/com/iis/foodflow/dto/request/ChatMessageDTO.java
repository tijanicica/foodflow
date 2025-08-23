package com.iis.foodflow.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long ticketId;
    private String text;
    private Long senderId;
    private String senderRole;
}
