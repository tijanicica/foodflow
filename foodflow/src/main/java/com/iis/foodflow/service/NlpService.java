package com.iis.foodflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.repository.ProblemCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NlpService {

    private final ProblemCategoryRepository categoryRepository;
    private final RestTemplate restTemplate; // Ubacujemo RestTemplate

    // URL našeg Python NLP mikroservisa
    private final String nlpServiceUrl = "http://localhost:5000/categorize";

    public ProblemCategory categorizeProblem(String description) {
        // 1. Dohvatamo sve moguće sub-kategorije iz baze
        List<ProblemCategory> allSubCategories = categoryRepository.findAllByParentCategoryIsNotNull();
        List<String> categoryNames = allSubCategories.stream()
                .map(ProblemCategory::getName)
                .collect(Collectors.toList());

        // 2. Pripremamo telo (body) zahteva za Python servis
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> requestBody = Map.of(
                "text", description,
                "categories", categoryNames
        );
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 3. Šaljemo POST zahtev Python servisu
            JsonNode response = restTemplate.postForObject(nlpServiceUrl, entity, JsonNode.class);

            if (response != null && response.has("category")) {
                String categorizedName = response.get("category").asText();

                if ("Other".equalsIgnoreCase(categorizedName)) {
                    return getOtherCategory();
                }

                // 4. Pronalazimo kategoriju u bazi na osnovu imena koje je vratio NLP
                return allSubCategories.stream()
                        .filter(cat -> cat.getName().equalsIgnoreCase(categorizedName))
                        .findFirst()
                        .orElse(getOtherCategory()); // Fallback ako se nešto desi
            }
        } catch (Exception e) {
            // Ako Python servis nije dostupan ili dođe do greške, vraćamo "Other"
            System.err.println("Error calling NLP service: " + e.getMessage());
            return getOtherCategory();
        }

        return getOtherCategory();
    }

    private ProblemCategory getOtherCategory() {
        return categoryRepository.findById(4L).orElseThrow(() -> new RuntimeException("Other category not found!"));
    }
}
