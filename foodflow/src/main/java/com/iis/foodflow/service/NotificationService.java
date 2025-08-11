package com.iis.foodflow.service;
import com.iis.foodflow.model.order.Order;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final PdfGenerationService pdfService;

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
}