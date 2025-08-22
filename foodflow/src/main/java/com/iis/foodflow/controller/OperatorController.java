package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.UpdatePhoneRequestDTO;
import com.iis.foodflow.dto.response.OperatorAnalyticsDTO;
import com.iis.foodflow.dto.response.OperatorProfileDTO;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.model.user.SupportAdministrator;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.service.OperatorAnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/operator")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorAnalyticsService analyticsService;
    private final OperatorRepository operatorRepository;
    private final PasswordEncoder passwordEncoder;

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
}
