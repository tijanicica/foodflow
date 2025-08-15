package com.iis.foodflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iis.foodflow.dto.request.ChatRequestDTO;
import com.iis.foodflow.dto.response.ChatResponseDTO;
import com.iis.foodflow.dto.response.MenuItemInfoDTO;
import com.iis.foodflow.dto.response.RestaurantInfoDTO;
import com.iis.foodflow.model.restaurant.Allergen;
import com.iis.foodflow.model.restaurant.DietType;
import com.iis.foodflow.model.restaurant.MenuVersion;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final RestaurantRepository restaurantRepository;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.api.key}")
    private String googleApiKey;

    public ChatResponseDTO getAIRecommendation(ChatRequestDTO request) throws IOException {
        log.info("Starting AI recommendation for query: '{}'", request.getMessage());

        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<RestaurantInfoDTO> restaurantInfos = restaurants.stream()
                .map(this::mapToRestaurantInfoDTO)
                .collect(Collectors.toList());

        String restaurantJson = objectMapper.writeValueAsString(restaurantInfos);
        String prompt = buildPrompt(restaurantJson, request.getMessage());

        String jsonBody = String.format("{\"contents\":[{\"parts\":[{\"text\": \"%s\"}]}]}", prompt);
        RequestBody body = RequestBody.create(jsonBody, MediaType.get("application/json; charset=utf-8"));

        Request geminiRequest = new Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + googleApiKey)
                .header("Content-Type", "application/json")
                .post(body)
                .build();

        log.info("Sending request to Google AI API...");
        try (Response response = httpClient.newCall(geminiRequest).execute()) {
            String responseBody = response.body().string();
            log.info("Received response from Google AI. Status: {}, Body: {}", response.code(), responseBody);

            if (!response.isSuccessful()) {
                log.error("Google AI API request failed with code {}: {}", response.code(), responseBody);
                throw new IOException("Unexpected code " + response);
            }

            String reply = objectMapper.readTree(responseBody).get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
            log.info("Successfully extracted reply from Google AI.");
            return new ChatResponseDTO(reply);
        }
    }

    private String buildPrompt(String restaurantJson, String userQuery) {
        String escapedJson = restaurantJson.replace("\"", "\\\"");
        String escapedQuery = userQuery.replace("\"", "\\\"");

        // Novi, detaljniji sistemski prompt
        String systemPrompt = "You are a friendly and highly intelligent AI Food Concierge for an application named FoodFlow. " +
                "Your primary role is to provide personalized restaurant recommendations based on a provided JSON list. " +
                "You MUST adhere to the following rules:\\n" +
                "1.  **Analyze the Full Context:** Carefully consider all details for each restaurant: name, price range, rating, full address (including city), and its complete menu with item types (MAIN_COURSE, DESSERT, DRINK), prices, diet types, and allergens.\\n" +
                "2.  **Location-Awareness:** If a user mentions a city or area (e.g., 'in Belgrade', 'near Knez Mihailova'), use the 'address' field to find relevant matches.\\n" +
                "3.  **Menu-Awareness:** If a user asks for a specific dish (e.g., 'pizza', 'sushi') or a type of meal (e.g., 'a good dessert place', 'somewhere for drinks'), you must check the 'menuItems' list for each restaurant.\\n" +
                "5.  **Make Smart, Related Suggestions:** If there is no direct match for a specific cuisine (e.g., 'Thai food'), but there is a similar, relevant cuisine available in the list (e.g., 'Chinese' from 'Wok Express'), you are encouraged to suggest it as a good alternative. For example, if the user asks for Thai, you can say: 'While we don't have any Thai restaurants at the moment, you might enjoy Wok Express, which offers delicious Asian cuisine!' Use your general knowledge to identify similar cuisines.\\n" +
                "6.  **Understand Price Range:** The 'priceRange' field uses symbols with the following meaning: '$' means cheap/affordable, '$$' means moderate/mid-range, and '$$$' means expensive/premium. Use this to answer queries about price.\\n" +
                "7.  **Be Conversational:** Your tone should be helpful and natural. Never mention that you are an AI or that you are working from a JSON list. Act like a human expert.\\n" +
                "8.  **Handle No Matches:** If no restaurants match the user's specific criteria, politely inform them and perhaps offer a broader suggestion.\\n" +
                "9.  **Be Concise:** Keep your answers short and to the point, recommending one or two best options unless the user asks for more.\\n\\n" +
                "Here is the list of available restaurants:\\n" +
                escapedJson + "\\n\\n" +
                "Based on all the information above, please answer the following user query:\\n" +
                "User Query: '" + escapedQuery + "'";

        return systemPrompt;
    }

    // VAŠA METODA (sa dodatom logikom za alergene)
    private RestaurantInfoDTO mapToRestaurantInfoDTO(Restaurant restaurant) {
        MenuVersion activeMenuVersion = restaurant.getMenus().stream()
                .flatMap(menu -> menu.getVersions().stream())
                .filter(MenuVersion::isActive)
                .findFirst()
                .orElse(null);

        List<MenuItemInfoDTO> menuItems = List.of();

        if (activeMenuVersion != null) {
            menuItems = activeMenuVersion.getMenuItemVersions().stream()
                    // === KLJUČNA IZMENA JE OVDE ===
                    // Proveravamo da li su i verzija stavke I sama stavka aktivne (nisu obrisane)
                    .filter(miv -> !miv.isDeleted() && !miv.getMenuItem().isDeleted())
                    .map(miv -> new MenuItemInfoDTO(
                            miv.getMenuItem().getName(),
                            miv.getMenuItem().getType(),
                            miv.getPrice(),
                            miv.getMenuItem().getDietTypes().stream().map(DietType::getName).collect(Collectors.toSet()),
                            miv.getMenuItem().getAllergens().stream().map(Allergen::getName).collect(Collectors.toSet())
                    ))
                    .collect(Collectors.toList());
        }

        return new RestaurantInfoDTO(
                restaurant.getName(),
                restaurant.getPriceRange(),
                restaurant.getAverageRating(),
                restaurant.getAddress() != null ? restaurant.getAddress().toString() : "N/A",
                restaurant.getAddress() != null ? restaurant.getAddress().getLatitude() : null,
                restaurant.getAddress() != null ? restaurant.getAddress().getLongitude() : null,
                menuItems
        );
    }
}