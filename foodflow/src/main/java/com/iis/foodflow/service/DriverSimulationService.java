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

@Service
public class DriverSimulationService {

    private static final Logger log = LoggerFactory.getLogger(DriverSimulationService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final String OSRM_ROUTE_GEOMETRY_URL = "http://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson";

    /**
     * Asinhrona metoda koja simulira kretanje vozača duž rute.
     * Brzina simulacije (pauza između tačaka) zavisi od prosleđenog 'totalDurationInSeconds'.
     */
    @Async
    public void simulateDriving(Long driverId, double startLat, double startLng, double endLat, double endLng, Long orderId, double totalDurationInSeconds) {
        String url = String.format(OSRM_ROUTE_GEOMETRY_URL, startLng, startLat, endLng, endLat);
        log.info("Dobavljanje rute za simulaciju sa URL-a: {}", url);

        OsrmGeometryResponse response;
        try {
            response = restTemplate.getForObject(url, OsrmGeometryResponse.class);
        } catch (HttpClientErrorException e) {
            log.error("Greška prilikom poziva OSRM API-ja. Status: {}, Odgovor: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return;
        }

        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty() || response.getRoutes().get(0).getGeometry().getCoordinates().isEmpty()) {
            log.error("Nije moguće dobiti rutu za simulaciju za vozača: {}. OSRM odgovor je prazan.", driverId);
            return;
        }

        List<List<Double>> routePoints = response.getRoutes().get(0).getGeometry().getCoordinates();
        log.info("Početak simulacije za vozača ID: {}. Broj tačaka: {}. Predviđeno trajanje: {:.2f}s", driverId, routePoints.size(), totalDurationInSeconds);

        long sleepIntervalMs = (totalDurationInSeconds > 0 && !routePoints.isEmpty())
                ? (long) ((totalDurationInSeconds * 1000) / routePoints.size())
                : 1000;

        log.info("Pauza između tačaka simulacije: {} ms", sleepIntervalMs);

        for (int i = 0; i < routePoints.size(); i++) {
            if (Thread.currentThread().isInterrupted()) {
                log.warn("Simulacija za vozača ID: {} je prekinuta.", driverId);
                break;
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
                Thread.sleep(sleepIntervalMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Simulacija za vozača ID: {} je prekinuta tokom pauze.", driverId);
                break;
            }
        }
        log.info("Kraj simulacije kretanja za vozača ID: {}", driverId);
    }

    // --- ISPRAVKA: VRAĆENA @Data ANOTACIJA ---
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