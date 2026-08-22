package com.iis.foodflow.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessageResponseDTO {
    private Long ticketId;
    private String text;
    private Long senderId;
    private String senderRole;
    private String senderName;
    private MessageType type;
    private com.iis.foodflow.enums.TicketStatus newStatus;

    public enum MessageType {
        CHAT,
        STATUS_UPDATE
    }
}
