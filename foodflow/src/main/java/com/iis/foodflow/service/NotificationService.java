package com.iis.foodflow.service;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.user.Manager;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final PdfGenerationService pdfService;
    private final SimpMessagingTemplate messagingTemplate;


    @Async // Izvršava se u pozadini
    public void sendOrderConfirmation(Order order) {
        try {
            // 1. Generiši PDF
            byte[] pdfInvoice = pdfService.generateInvoice(order);

            // 2. Sastavi i pošalji email sa PDF prilogom
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomer().getEmail());
            helper.setSubject("Your FoodFlow Order Confirmation #" + order.getId());
            helper.setText("Dear " + order.getCustomer().getFirstName() + ",\n\nThank you for your order! Please find your invoice attached.\n\nBest regards,\nThe FoodFlow Team");
            helper.addAttachment("Invoice-" + order.getId() + ".pdf", new ByteArrayResource(pdfInvoice));

            mailSender.send(message);

        } catch (Exception e) {
            // Obavezno logujte grešku da znate ako slanje nije uspelo
            System.err.println("Failed to send email for order " + order.getId() + ": " + e.getMessage());
        }
    }

    @Transactional(readOnly = true) // <-- DODAJ ANOTACIJU
    public void notifyManagerOfOrderStatusUpdate(Order order) {
        // Dobijamo menadžera iz prve stavke porudžbine
        Manager manager = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getManager())
                .orElse(null);

        if (manager != null) {
            // Definišemo "topic" (kanal) koji će menadžer slušati.
            // Važno je da bude jedinstven za svakog menadžera.
            String destination = "/topic/manager/" + manager.getId() + "/orders";

            // Kreiramo poruku
            String message = String.format("Order #%d status has been updated to %s", order.getId(), order.getStatus());

            // Šaljemo poruku
            messagingTemplate.convertAndSend(destination, Map.of("message", message));
        }
    }
}