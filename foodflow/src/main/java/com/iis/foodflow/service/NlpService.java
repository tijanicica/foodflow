package com.iis.foodflow.service;// ... imports
import com.fasterxml.jackson.databind.JsonNode;
import com.iis.foodflow.model.support.ProblemCategory;
import com.iis.foodflow.repository.ProblemCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class NlpService {

    private final ProblemCategoryRepository categoryRepository;
    private final RestTemplate restTemplate;

    private final String nlpServiceUrl = "http://localhost:5000/categorize";

    public ProblemCategory categorizeProblem(String description) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = Collections.singletonMap("text", description);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            JsonNode response = restTemplate.postForObject(nlpServiceUrl, entity, JsonNode.class);

            if (response != null && response.has("category")) {
                String categorizedName = response.get("category").asText();

                Optional<ProblemCategory> foundCategory = categoryRepository.findByName(categorizedName);

                return foundCategory.orElse(getOtherCategory());
            }
        } catch (Exception e) {
            System.err.println("Error calling NLP service: " + e.getMessage());
            return getOtherCategory();
        }

        return getOtherCategory();
    }

    private ProblemCategory getOtherCategory() {
        return categoryRepository.findByName("Other")
                .orElseThrow(() -> new RuntimeException("Default 'Other' category not found in the database!"));
    }
}