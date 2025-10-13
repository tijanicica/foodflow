// com/iis/foodflow/service/EmailService.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.response.RestaurantProblemAnalyticsDTO;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.repository.RestaurantRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final RestaurantProblemAnalyticsService analyticsService;
    private final RestaurantProblemAnalyticsPdfGenerationService pdfGenerationService; // Dodaj novi servis
    private final RestaurantRepository restaurantRepository; // Treba nam i ovaj repo

    public void sendAnalyticsReport(Long restaurantId) throws Exception { // Dodaj throws Exception
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        RestaurantProblemAnalyticsDTO analytics = analyticsService.getAnalyticsForRestaurant(restaurant);

        if (analytics.getManagerEmail().equals("N/A") || analytics.getManagerEmail().isBlank()) {
            throw new IllegalStateException("Restaurant manager does not have an email address.");
        }

        // Generiši PDF u memoriji
        ByteArrayInputStream pdf = pdfGenerationService.generateAnalyticsPdf(analytics);

        MimeMessage message = mailSender.createMimeMessage();
        // true znači da je poruka multipart (za priloge)
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(analytics.getManagerEmail());
        helper.setFrom("tvoj.gmail@gmail.com"); // Mora biti isti kao u properties
        helper.setSubject("Support Analytics Report for " + analytics.getRestaurantName());

        // Telo emaila
        String emailBody = String.format(
                "Dear %s,\n\nPlease find the latest customer support analytics report for your restaurant, %s, attached to this email.\n\nBest regards,\nFoodFlow Support Team",
                analytics.getManagerName(),
                analytics.getRestaurantName()
        );
        helper.setText(emailBody);

        // Dodaj prilog (attachment)
        String pdfName = "Analytics_Report_" + analytics.getRestaurantName().replace(" ", "_") + ".pdf";
        helper.addAttachment(pdfName, new ByteArrayResource(pdf.readAllBytes()));

        mailSender.send(message);
    }

    // buildEmailBody metoda nam više ne treba
}