package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.ReadReceiptDTO;
import com.iis.foodflow.dto.response.ChatMessageResponseDTO;
import com.iis.foodflow.dto.response.ReadNotificationDTO;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.iis.foodflow.dto.request.ChatMessageDTO;
import com.iis.foodflow.model.support.Message;
import com.iis.foodflow.model.support.SupportTicket;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.repository.CustomerRepository;
import com.iis.foodflow.repository.MessageRepository;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;
    private final SupportTicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final OperatorRepository operatorRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void processAndSendMessage(ChatMessageDTO chatMessage) {
        SupportTicket ticket = ticketRepository.findById(chatMessage.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        validateSender(chatMessage, ticket);

        if ("OPERATOR".equalsIgnoreCase(chatMessage.getSenderRole()) && ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            ticketRepository.save(ticket);
            sendStatusUpdate(ticket.getId(), TicketStatus.IN_PROGRESS);
        }

        Message message = new Message();
        message.setSupportTicket(ticket);
        message.setText(chatMessage.getText());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        if ("CUSTOMER".equalsIgnoreCase(chatMessage.getSenderRole())) {
            message.setSenderCustomer(ticket.getOrder().getCustomer());
        } else if ("OPERATOR".equalsIgnoreCase(chatMessage.getSenderRole())) {
            message.setSenderOperator(ticket.getOperator());
        }

        messageRepository.save(message);
        chatMessage.setType(ChatMessageDTO.MessageType.CHAT);
        messagingTemplate.convertAndSend("/topic/ticket/" + chatMessage.getTicketId(), chatMessage);
    }

    private void validateSender(ChatMessageDTO chatMessage, SupportTicket ticket) {
        Long senderId = chatMessage.getSenderId();
        String senderRole = chatMessage.getSenderRole();

        if (senderId == null || senderRole == null) {
            throw new SecurityException("Sender ID and Role must not be null.");
        }

        boolean isValid = false;
        if ("CUSTOMER".equalsIgnoreCase(senderRole)) {
            isValid = ticket.getOrder().getCustomer().getId().equals(senderId);
        } else if ("OPERATOR".equalsIgnoreCase(senderRole)) {
            isValid = ticket.getOperator().getId().equals(senderId);
        }

        if (!isValid) {
            throw new SecurityException("Sender is not authorized to send messages to this ticket.");
        }
    }

    public void sendStatusUpdate(Long ticketId, TicketStatus newStatus) {
        ChatMessageDTO statusUpdateMessage = ChatMessageDTO.builder()
                .ticketId(ticketId)
                .type(ChatMessageDTO.MessageType.STATUS_UPDATE)
                .newStatus(newStatus)
                .build();
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, statusUpdateMessage);
    }

    @Transactional
    public void markMessagesAsRead(ReadReceiptDTO readReceipt) {
        SupportTicket ticket = ticketRepository.findById(readReceipt.getTicketId()).orElseThrow();
        Long readerId = readReceipt.getReaderId();

        if (ticket.getOrder().getCustomer().getId().equals(readerId)) {

            messageRepository.markMessagesAsReadByOperator(ticket.getId());
        } else if (ticket.getOperator().getId().equals(readerId)) {
            messageRepository.markMessagesAsReadByCustomer(ticket.getId());
        }

        ReadNotificationDTO notification = new ReadNotificationDTO(readerId);
        messagingTemplate.convertAndSend("/topic/ticket/" + ticket.getId(), notification);
    }
}
