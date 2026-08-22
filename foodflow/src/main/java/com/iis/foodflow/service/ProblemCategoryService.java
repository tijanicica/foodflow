package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.ProblemCategoryDTO;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.repository.ProblemCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemCategoryService {
    private final ProblemCategoryRepository categoryRepository;

    public List<ProblemCategoryDTO> getAllCategoriesAsDto() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProblemCategoryDTO convertToDto(ProblemCategory category) {
        ProblemCategoryDTO dto = new ProblemCategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());

        if (category.getParentCategory() != null) {
            dto.setParentCategoryId(category.getParentCategory().getId());
        } else {
            dto.setParentCategoryId(null);
        }

        return dto;
    }
}
