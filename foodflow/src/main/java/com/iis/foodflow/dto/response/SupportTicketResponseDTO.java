package com.iis.foodflow.dto.response;

import lombok.Data;

@Data
public class SupportTicketResponseDTO {
    private Long id;
    private String status;
    private Long operatorId;
    private String operatorFirstName;

}
