package com.iis.foodflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.iis.foodflow.dto.request.*;
import com.iis.foodflow.enums.TicketStatus;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.model.user.SupportAdministrator;
import com.iis.foodflow.repository.OperatorReportRepository;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.SupportAdministratorRepository;
import com.iis.foodflow.repository.SupportTicketRepository;
import com.iis.foodflow.service.OperatorService;
import com.iis.foodflow.service.PdfOperatorReportService;
import com.iis.foodflow.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support-admin")
@RequiredArgsConstructor
public class SupportAdminController {
    private final OperatorService operatorService;
    private final SupportAdministratorRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final OperatorRepository operatorRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final PdfOperatorReportService pdfOperatorReportService;
    private final OperatorReportRepository reportRepository;

    @PostMapping("/register-operator")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<Operator> registerOperator(
            @Valid @RequestBody OperatorRegistrationDTO registrationDto,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();

        Operator newOperator = operatorService.registerOperator(registrationDto, adminEmail);

        return new ResponseEntity<>(newOperator, HttpStatus.CREATED);
    }

    @GetMapping("/operators")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<List<OperatorDTO>> getAllOperators() {
        List<OperatorDTO> operators = operatorService.getAllOperatorsAsDto();
        return ResponseEntity.ok(operators);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<SupportAdministrator> getAdminProfile(Authentication authentication) {
        String adminEmail = authentication.getName();
        SupportAdministrator admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with email: " + adminEmail));
        return ResponseEntity.ok(admin);
    }
    @PatchMapping("/profile/phone")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<SupportAdministrator> updateAdminPhone(
             @Valid @RequestBody UpdatePhoneRequestDTO phoneDto,
            Authentication authentication
    ) {

        String adminEmail = authentication.getName();
        SupportAdministrator admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with email: " + adminEmail));

        admin.setPhone(phoneDto.getPhone());
        SupportAdministrator updatedAdmin = adminRepository.save(admin);

        return ResponseEntity.ok(updatedAdmin);
    }

    @PostMapping("/profile/change-password")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<?> changeAdminPassword(
            @Valid @RequestBody ChangePasswordRequestDTO passwordDto,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        SupportAdministrator admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with email: " + adminEmail));

        if (!passwordEncoder.matches(passwordDto.getOldPassword(), admin.getPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Incorrect old password."));
        }
        if (!passwordDto.getNewPassword().equals(passwordDto.getConfirmPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "New passwords do not match."));
        }

        admin.setPassword(passwordEncoder.encode(passwordDto.getNewPassword()));
        adminRepository.save(admin);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/operators/rankings")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<List<OperatorRatingDTO>> getOperatorRankings() {
        List<OperatorRatingDTO> rankings = operatorService.getRankedOperators();
        return ResponseEntity.ok(rankings);
    }

    @PatchMapping("/profile/name")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<SupportAdministrator> updateAdminName(
            @Valid @RequestBody UpdateNameDTO nameDto,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        SupportAdministrator admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found with email: " + adminEmail));

        admin.setFirstName(nameDto.getFirstName());
        admin.setLastName(nameDto.getLastName());
        SupportAdministrator updatedAdmin = adminRepository.save(admin);

        return ResponseEntity.ok(updatedAdmin);
    }

    @DeleteMapping("/operators/{operatorId}")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<?> deleteOperator(@PathVariable Long operatorId) {

        if (!operatorRepository.existsById(operatorId)) {
            return ResponseEntity.notFound().build();
        }

        List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
        if (supportTicketRepository.existsByOperatorIdAndStatusIn(operatorId, activeStatuses)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cannot delete operator. Please resolve or reassign their active tickets first."));
        }

        operatorRepository.deleteById(operatorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/operators/{operatorId}/report")
    @PreAuthorize("hasAuthority('ROLE_SUPPORT_ADMINISTRATOR')")
    public ResponseEntity<InputStreamResource> downloadOperatorReport(
            @PathVariable Long operatorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        JsonNode reportData = reportRepository.getOperatorReportData(operatorId, startDate, endDate);

        if (reportData.has("error")) {
            return ResponseEntity.notFound().build();
        }

        ByteArrayInputStream pdf = pdfOperatorReportService.generateOperatorReport(reportData);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=operator_report_" + operatorId + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdf));
    }

}
