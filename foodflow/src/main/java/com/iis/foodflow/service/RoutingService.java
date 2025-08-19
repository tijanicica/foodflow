package com.iis.foodflow.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class RoutingService {

    @Autowired
    private RestTemplate restTemplate;

    // Podrazumevani OSRM demo server URL
    // Novi kod (ispravan):
    private final String OSRM_API_URL = "http://localhost:5000/route/v1/driving/%s,%s;%s,%s?overview=false";
    /**
     * Dobavlja detalje rute (distancu i vreme) između dve tačke.
     * @param startLat Početna latituda
     * @param startLng Početna longituda
     * @param endLat Krajnja latituda
     * @param endLng Krajnja longituda
     * @return RouteDetailsDTO koji sadrži distancu u metrima i vreme u sekundama.
     */
    public RouteDetailsDTO getRouteDetails(double startLat, double startLng, double endLat, double endLng) {
        // Formiramo URL sa koordinatama. PAŽNJA: OSRM koristi format {lon},{lat}
        String url = String.format(OSRM_API_URL, startLng, startLat, endLng, endLat);

        try {
            // Pošalji GET zahtev i mapiraj JSON odgovor u naše DTO klase
            OsrmResponse response = restTemplate.getForObject(url, OsrmResponse.class);

            if (response != null && response.getRoutes() != null && !response.getRoutes().isEmpty()) {
                OsrmRoute route = response.getRoutes().get(0);
                return new RouteDetailsDTO(route.getDistance(), route.getDuration());
            }
        } catch (Exception e) {
            System.err.println("Greška prilikom poziva OSRM API-ja: " + e.getMessage());
            // U slučaju greške, vraćamo -1 ili bacamo izuzetak
        }

        return new RouteDetailsDTO(-1.0, -1.0);
    }

    // Unutrašnje klase (DTOs) za mapiranje JSON odgovora od OSRM-a
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OsrmResponse {
        private List<OsrmRoute> routes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OsrmRoute {
        private double distance; // Udaljenost u metrima
        private double duration; // Vreme u sekundama
    }

    // Naš DTO koji vraćamo ostatku aplikacije
    @Data
    public static class RouteDetailsDTO {
        private final double distanceInMeters;
        private final double durationInSeconds;
    }
}