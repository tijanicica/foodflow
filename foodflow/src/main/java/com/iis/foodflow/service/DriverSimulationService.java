package com.iis.foodflow.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.iis.foodflow.repository.DriverRepository;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class DriverSimulationService {

    // Dodajemo Logger za bolje praćenje grešaka i informacija
    private static final Logger log = LoggerFactory.getLogger(DriverSimulationService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // URL OSRM servera za dobavljanje kompletne geometrije rute
    private final String OSRM_ROUTE_GEOMETRY_URL = "http://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson";

    /**
     * Asinhrona metoda koja simulira kretanje vozača duž rute.
     * @param driverId ID vozača koji se simulira
     * @param startLat Početna latituda
     * @param startLng Početna longituda
     * @param endLat Krajnja latituda
     * @param endLng Krajnja longituda
     * @param orderId ID porudžbine, koristi se kao WebSocket kanal za praćenje
     */

    @Async
    public CompletableFuture<Long> simulateDriving(Long driverId, double startLat, double startLng, double endLat, double endLng, Long orderId) {

        long startTime = System.currentTimeMillis(); // Zabeleži početno vreme

        String url = String.format(OSRM_ROUTE_GEOMETRY_URL, startLng, startLat, endLng, endLat);
        log.info("Dobavljanje rute za simulaciju sa URL-a: {}", url);

        OsrmGeometryResponse response;
        try {
            response = restTemplate.getForObject(url, OsrmGeometryResponse.class);
        } catch (HttpClientErrorException e) {
            log.error("Greška prilikom poziva OSRM API-ja. Status: {}, Odgovor: {}", e.getStatusCode(), e.getResponseBodyAsString());
            // U slučaju greške, završi "obećanje" sa izuzetkom
            return CompletableFuture.failedFuture(e);
        }

        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty() || response.getRoutes().get(0).getGeometry().getCoordinates().isEmpty()) {
            log.error("Nije moguće dobiti rutu za simulaciju za vozača: {}. OSRM odgovor je prazan ili ne sadrži koordinate.", driverId);
            return CompletableFuture.failedFuture(new RuntimeException("Could not fetch a valid route from OSRM."));
        }

        List<List<Double>> routePoints = response.getRoutes().get(0).getGeometry().getCoordinates();
        log.info("Početak simulacije za vozača ID: {}. Broj tačaka na ruti: {}", driverId, routePoints.size());

        for (int i = 0; i < routePoints.size(); i++) {
            // Provera da li je thread prekinut pre svake iteracije
            if (Thread.currentThread().isInterrupted()) {
                log.warn("Simulacija za vozača ID: {} je prekinuta.", driverId);
                return CompletableFuture.failedFuture(new InterruptedException("Simulation was interrupted."));
            }

            List<Double> point = routePoints.get(i);
            double longitude = point.get(0);
            double latitude = point.get(1);

            driverRepository.updateDriverLocation(driverId, latitude, longitude);

            Map<String, Object> locationUpdate = Map.of(
                    "lat", latitude,
                    "lng", longitude,
                    "isLastPoint", i == routePoints.size() - 1
            );

            messagingTemplate.convertAndSend("/topic/driver-location/" + orderId, locationUpdate);

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Simulacija za vozača ID: {} je prekinuta tokom pauze.", driverId);
                return CompletableFuture.failedFuture(e); // Završi sa izuzetkom
            }
        }

        long endTime = System.currentTimeMillis();
        long durationInSeconds = (endTime - startTime) / 1000;

        log.info("Kraj simulacije za vozača ID: {}. Trajanje: {} sekundi.", driverId, durationInSeconds);

        // Vrati uspešno završeno "obećanje" sa izračunatim trajanjem
        return CompletableFuture.completedFuture(durationInSeconds);
    }
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OsrmGeometryResponse {
        private List<OsrmGeometryRoute> routes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OsrmGeometryRoute {
        private OsrmGeometry geometry;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OsrmGeometry {
        private String type;
        private List<List<Double>> coordinates;
    }
}