package com.iis.foodflow.controller;

import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.OperatorRegistrationDTO;
import com.iis.foodflow.dto.request.UpdatePhoneRequestDTO;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.model.user.SupportAdministrator;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.SupportAdministratorRepository;
import com.iis.foodflow.service.OperatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support-admin")
@RequiredArgsConstructor
public class SupportAdminController {
    private final OperatorService operatorService;

    private final OperatorRepository operatorRepository;
    private final SupportAdministratorRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

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
    public ResponseEntity<List<Operator>> getAllOperators() {
        List<Operator> operators = operatorRepository.findAll();
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

}
