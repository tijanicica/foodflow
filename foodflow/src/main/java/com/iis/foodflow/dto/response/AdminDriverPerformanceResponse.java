// Datoteka: src/main/java/com/iis/foodflow/dto/response/AdminDriverPerformanceResponse.java
package com.iis.foodflow.dto.response;

import com.iis.foodflow.enums.VehicleType;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO koji proširuje standardni prikaz performansi vozača
 * sa dodatnim ID-jem, specifično za potrebe administratorskog panela.
 */
@Getter
@Setter
public class AdminDriverPerformanceResponse extends DriverPerformanceResponse {

    private Long driverId; // <-- DODATNO POLJE KOJE NAM TREBA ZA ADMINA

    /**
     * Konstruktor koji postavlja sve podatke, uključujući i one iz nasleđene klase.
     */
    public AdminDriverPerformanceResponse(Long driverId, String firstName, String lastName, VehicleType vehicleType, int totalDeliveries, double onTimeRate, int rejections, double averageRating) {
        // Pozivamo konstruktor nadređene klase (DriverPerformanceResponse) da postavi osnovne podatke
        super(firstName, lastName, vehicleType, totalDeliveries, onTimeRate, rejections, averageRating);
        // Postavljamo dodatni podatak specifičan za ovaj DTO
        this.driverId = driverId;
    }
}