package com.iis.foodflow.service;


import com.iis.foodflow.dto.request.OperatorDTO;
import com.iis.foodflow.dto.request.OperatorRatingDTO;
import com.iis.foodflow.dto.request.OperatorRegistrationDTO;
import com.iis.foodflow.enums.Role;
import com.iis.foodflow.model.user.Operator;
import com.iis.foodflow.model.user.SupportAdministrator;
import com.iis.foodflow.repository.OperatorRepository;
import com.iis.foodflow.repository.SupportAdministratorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperatorService {

    private final OperatorRepository operatorRepository;
    private final SupportAdministratorRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public Operator registerOperator(OperatorRegistrationDTO registrationDto, String adminEmail) {

        if (operatorRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
            throw new IllegalStateException("Operator with email " + registrationDto.getEmail() + " already exists.");
        }

        SupportAdministrator admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Support Administrator not found with email: " + adminEmail));

        Operator newOperator = new Operator();
        newOperator.setEmail(registrationDto.getEmail());
        newOperator.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        newOperator.setFirstName(registrationDto.getFirstName());
        newOperator.setLastName(registrationDto.getLastName());
        newOperator.setPhone(registrationDto.getPhone());
        newOperator.setRole(Role.OPERATOR);
        newOperator.setCreatedBySupportAdmin(admin);
        newOperator.setSpecializations(registrationDto.getSpecializations());

        return operatorRepository.save(newOperator);
    }

    public List<OperatorRatingDTO> getRankedOperators() {
        return operatorRepository.getOperatorRankings();
    }

    public List<OperatorDTO> getAllOperatorsAsDto() {
        return operatorRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private OperatorDTO convertToDto(Operator operator) {
        OperatorDTO dto = new OperatorDTO();
        dto.setId(operator.getId());
        dto.setEmail(operator.getEmail());
        dto.setFirstName(operator.getFirstName());
        dto.setLastName(operator.getLastName());
        dto.setPhone(operator.getPhone());
        return dto;
    }

}

