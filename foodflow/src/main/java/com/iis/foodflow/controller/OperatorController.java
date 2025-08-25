package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.OperatorDTO;
import com.iis.foodflow.dto.request.UpdateNameDTO;
import com.iis.foodflow.dto.request.UpdatePhoneRequestDTO;
import com.iis.foodflow.dto.response.OperatorAnalyticsDTO;
import com.iis.foodflow.dto.response.OperatorProfileDTO;
import com.iis.foodflow.dto.response.TicketSummaryDTO;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.model.user.SupportAdministrator;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.service.OperatorAnalyticsService;
import com.iis.foodflow.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operator")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorAnalyticsService analyticsService;
    private final OperatorRepository operatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupportTicketService supportTicketService;

    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<OperatorAnalyticsDTO> getMyAnalytics(Authentication authentication) {
        Operator operator = (Operator) authentication.getPrincipal();
        return ResponseEntity.ok(analyticsService.getAnalyticsForOperator(operator.getId()));
    }


    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<OperatorProfileDTO> getOperatorProfile(Authentication authentication) {
        String operatorEmail = authentication.getName();
        Operator operator = operatorRepository.findByEmail(operatorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Operator not found with email: " + operatorEmail));
        OperatorProfileDTO profileDTO = convertToProfileDto(operator);
        return ResponseEntity.ok(profileDTO);
    }
    @PatchMapping("/profile/phone")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<OperatorProfileDTO> updateOperatorPhone(
            @Valid @RequestBody UpdatePhoneRequestDTO phoneDto,
            Authentication authentication
    ) {
        String operatorEmail = authentication.getName();
        Operator operator = operatorRepository.findByEmail(operatorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Operator not found with email: " + operatorEmail));

        operator.setPhone(phoneDto.getPhone());
        Operator updatedOperator = operatorRepository.save(operator);

        return ResponseEntity.ok(convertToProfileDto(updatedOperator));
    }

    @PatchMapping("/profile/name")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<OperatorProfileDTO> updateOperatorName(
            @Valid @RequestBody UpdateNameDTO nameDto,
            Authentication authentication
    ) {
        String operatorEmail = authentication.getName();
        Operator operator = operatorRepository.findByEmail(operatorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Operator not found with email: " + operatorEmail));

        operator.setFirstName(nameDto.getFirstName());
        operator.setLastName(nameDto.getLastName());
        Operator updatedOperator = operatorRepository.save(operator);

        return ResponseEntity.ok(convertToProfileDto(updatedOperator));
    }

    @PostMapping("/profile/change-password")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<?> changeAdminPassword(
            @Valid @RequestBody ChangePasswordRequestDTO passwordDto,
            Authentication authentication
    ) {
        String operatorEmail = authentication.getName();
        Operator operator = operatorRepository.findByEmail(operatorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Operator not found with email: " + operatorEmail));

        if (!passwordEncoder.matches(passwordDto.getOldPassword(), operator.getPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Incorrect old password."));
        }
        if (!passwordDto.getNewPassword().equals(passwordDto.getConfirmPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "New passwords do not match."));
        }

        operator.setPassword(passwordEncoder.encode(passwordDto.getNewPassword()));
        operatorRepository.save(operator);

        return ResponseEntity.ok().build();
    }

    private OperatorProfileDTO convertToProfileDto(Operator operator) {
        OperatorProfileDTO dto = new OperatorProfileDTO();
        dto.setId(operator.getId());
        dto.setEmail(operator.getEmail());
        dto.setFirstName(operator.getFirstName());
        dto.setLastName(operator.getLastName());
        dto.setPhone(operator.getPhone());
        return dto;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<List<TicketSummaryDTO>> getDashboard(Authentication authentication) {
        Operator operator = (Operator) authentication.getPrincipal();
        List<TicketSummaryDTO> tickets = supportTicketService.getTicketsForOperatorDashboard(operator.getId());
        return ResponseEntity.ok(tickets);
    }


    @PostMapping("/tickets/{ticketId}/resolve")
    @PreAuthorize("hasAuthority('ROLE_OPERATOR')")
    public ResponseEntity<Void> resolveTicket(@PathVariable Long ticketId, Authentication authentication) {
        Operator operator = (Operator) authentication.getPrincipal();
        supportTicketService.resolveTicket(ticketId, operator);
        return ResponseEntity.ok().build();
    }

}
