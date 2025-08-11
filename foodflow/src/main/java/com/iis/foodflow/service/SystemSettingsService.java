// FAJL: src/main/java/com/iis/foodflow/service/SystemSettingsService.java

package com.iis.foodflow.service;

import com.iis.foodflow.enums.WeatherCondition;
import org.springframework.stereotype.Service; // <-- 1. OBAVEZNO DODAJTE OVAJ IMPORT

@Service // <-- 2. DODAJTE OVU ANOTACIJU
public class SystemSettingsService {

    private WeatherCondition currentWeather = WeatherCondition.NORMAL;

    public void setCurrentWeather(WeatherCondition newWeather) {
        System.out.println("Admin has updated weather conditions to: " + newWeather);
        this.currentWeather = newWeather;
    }

    public WeatherCondition getCurrentWeather() {
        return this.currentWeather;
    }
}