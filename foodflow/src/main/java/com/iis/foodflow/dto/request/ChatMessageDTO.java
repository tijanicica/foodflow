package com.iis.foodflow.dto.request;

import com.iis.foodflow.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long ticketId;
    private String text;
    private Long senderId;
    private String senderRole;
    private String senderName;
    private MessageType type;
    private TicketStatus newStatus;

    public enum MessageType {
        CHAT,
        STATUS_UPDATE
    }
}
