package com.iis.foodflow.service;

import com.iis.foodflow.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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

        Message message = new Message();
        message.setSupportTicket(ticket);
        message.setText(chatMessage.getText());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        if ("CUSTOMER".equalsIgnoreCase(chatMessage.getSenderRole())) {
            Customer sender = customerRepository.findById(chatMessage.getSenderId())
                    .orElseThrow(() -> new RuntimeException("Sender customer not found"));
            message.setSenderCustomer(sender);
        } else if ("OPERATOR".equalsIgnoreCase(chatMessage.getSenderRole())) {
            Operator sender = operatorRepository.findById(chatMessage.getSenderId())
                    .orElseThrow(() -> new RuntimeException("Sender operator not found"));
            message.setSenderOperator(sender);
        } else {
            throw new IllegalArgumentException("Invalid sender role: " + chatMessage.getSenderRole());
        }

        messageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/ticket/" + chatMessage.getTicketId(), chatMessage);
    }
}
