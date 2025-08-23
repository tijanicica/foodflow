package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.ChatMessageDTO;
import com.iis.foodflow.dto.request.ReadReceiptDTO;
import com.iis.foodflow.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessage) {
        chatService.processAndSendMessage(chatMessage);
    }


    @MessageMapping("/chat.markAsRead")
    public void markMessagesAsRead(@Payload ReadReceiptDTO readReceipt) {
        chatService.markMessagesAsRead(readReceipt);
    }
}
