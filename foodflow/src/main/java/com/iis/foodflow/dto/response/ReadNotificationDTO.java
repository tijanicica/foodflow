package com.iis.foodflow.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadNotificationDTO {
    private MessageType type = MessageType.READ_RECEIPT;
    private Long readerId;

    public ReadNotificationDTO(Long readerId) {
        this.readerId = readerId;
    }

    public enum MessageType {
        READ_RECEIPT
    }
}
