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
    public void simulateDriving(Long driverId, double startLat, double startLng, double endLat, double endLng, Long orderId) {
        // Formiramo URL za OSRM API
        String url = String.format(OSRM_ROUTE_GEOMETRY_URL, startLng, startLat, endLng, endLat);
        log.info("Dobavljanje rute za simulaciju sa URL-a: {}", url);

        OsrmGeometryResponse response;
        try {
            // Pokušavamo da dobavimo podatke sa OSRM servera
            response = restTemplate.getForObject(url, OsrmGeometryResponse.class);
        } catch (HttpClientErrorException e) {
            log.error("Greška prilikom poziva OSRM API-ja. Status: {}, Odgovor: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return; // Prekini izvršavanje ako je došlo do greške
        }

        // Proveravamo da li je odgovor validan
        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty()) {
            log.error("Nije moguće dobiti rutu za simulaciju za vozača: {}. OSRM odgovor je prazan.", driverId);
            return;
        }

        // Izvlačimo listu tačaka [longituda, latituda] sa rute
        List<List<Double>> routePoints = response.getRoutes().get(0).getGeometry().getCoordinates();
        log.info("Početak simulacije za vozača ID: {}. Broj tačaka na ruti: {}", driverId, routePoints.size());

        // Prolazimo kroz svaku tačku na ruti
        for (int i = 0; i < routePoints.size(); i++) {
            List<Double> point = routePoints.get(i);
            double longitude = point.get(0);
            double latitude = point.get(1);

            // 1. Ažuriramo lokaciju vozača u bazi podataka
            driverRepository.updateDriverLocation(driverId, latitude, longitude);

            // 2. Kreiramo mapu sa podacima za slanje preko WebSocket-a
            Map<String, Object> locationUpdate = Map.of(
                    "lat", latitude,
                    "lng", longitude,
                    "isLastPoint", i == routePoints.size() - 1 // Dodajemo flag da li je ovo poslednja tačka
            );

            // 3. Šaljemo novu lokaciju na specifičan WebSocket kanal
            // Klijenti koji slušaju na "/topic/driver-location/{orderId}" će primiti ovu poruku
            messagingTemplate.convertAndSend("/topic/driver-location/" + orderId, locationUpdate);

            // Logujemo napredak
            log.info("Vozač ID: {} | Tačka {}/{} | Lokacija: {}, {}", driverId, i + 1, routePoints.size(), latitude, longitude);

            // 4. Pravimo pauzu da bi simulacija izgledala realno
            try {
                Thread.sleep(2000); // Pauza od 2 sekunde između svake tačke
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt(); // Dobra praksa za rukovanje prekidom
                log.warn("Simulacija za vozača ID: {} je prekinuta.", driverId);
                break; // Prekini petlju
            }
        }
        log.info("Kraj simulacije za vozača ID: {}", driverId);
    }

    // Unutrašnje DTO klase za mapiranje JSON odgovora od OSRM-a.
    // @Data anotacija iz Lomboka automatski generiše getere, setere, toString, itd.
    // @JsonIgnoreProperties(ignoreUnknown = true) sprečava greške ako OSRM doda nova polja koja mi ne koristimo.

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