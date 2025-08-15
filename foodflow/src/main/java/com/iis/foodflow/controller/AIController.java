package com.iis.foodflow.controller;


import com.iis.foodflow.dto.request.ChatRequestDTO;
import com.iis.foodflow.dto.response.ChatResponseDTO;
import com.iis.foodflow.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    public ResponseEntity<ChatResponseDTO> getChatReply(@RequestBody ChatRequestDTO request) {
        try {
            return ResponseEntity.ok(aiService.getAIRecommendation(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ChatResponseDTO("Sorry, I'm having trouble thinking right now. Please try again later."));
        }
    }
}
