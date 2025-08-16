// src/main/java/com/iis/foodflow/service/LocationSimulator.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.TrackOrderManagerDTO;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Instant;

@Component
public class LocationSimulator {

    public TrackOrderManagerDTO.Point simulateDriverLocation(
            TrackOrderManagerDTO.Point startPoint,
            TrackOrderManagerDTO.Point endPoint,
            Instant startTime,
            Instant eta
    ) {
        Instant now = Instant.now();

        // ======================= "PRISLUŠKIVANJE" POČINJE OVDE =======================
        System.out.println("\n################### SIMULATOR CHECK ###################");
        System.out.println("VREME SADA (UTC):      " + now);
        System.out.println("VREME STARTA (iz baze):  " + startTime);
        System.out.println("VREME ETA (iz baze):     " + eta);
        // ===========================================================================

        if (now.isAfter(eta)) {
            System.out.println("REZULTAT: Vreme je isteklo. Vozač je na cilju.");
            System.out.println("#####################################################\n");
            return endPoint;
        }

        if (now.isBefore(startTime)) {
            System.out.println("REZULTAT: Vreme još nije počelo. Vozač je na startu.");
            System.out.println("#####################################################\n");
            return startPoint;
        }

        long totalDurationSeconds = Duration.between(startTime, eta).getSeconds();
        long elapsedSeconds = Duration.between(startTime, now).getSeconds();

        if (totalDurationSeconds <= 0) {
            System.out.println("REZULTAT: Ukupno trajanje je 0 ili manje. Greška u podacima.");
            System.out.println("#####################################################\n");
            return startPoint;
        }

        double progress = (double) elapsedSeconds / totalDurationSeconds;

        // ======================= "PRISLUŠKIVANJE" SE NASTAVLJA =======================
        System.out.println("Ukupno trajanje (s):    " + totalDurationSeconds);
        System.out.println("Proteklo vreme (s):     " + elapsedSeconds);
        System.out.println("NAPREDAK:                " + String.format("%.2f%%", progress * 100));
        System.out.println("#####################################################\n");
        // ===========================================================================

        double currentLat = startPoint.getLatitude() + (endPoint.getLatitude() - startPoint.getLatitude()) * progress;
        double currentLng = startPoint.getLongitude() + (endPoint.getLongitude() - startPoint.getLongitude()) * progress;

        return new TrackOrderManagerDTO.Point(currentLat, currentLng);
    }
}