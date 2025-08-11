package com.iis.foodflow.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.iis.foodflow.model.order.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PdfGenerationService {

    private final TemplateEngine templateEngine;
    private static final BigDecimal DELIVERY_PRICE = new BigDecimal("150.00");

    public byte[] generateInvoice(Order order) throws Exception {
        Context context = new Context();

        // 1. Prosledi ceo Order objekat
        // On sada sadrži sve: customer-a, adresu, stavke, cene...
        context.setVariable("order", order);

        // 2. Izračunaj i prosledi subtotal
        BigDecimal subtotal = order.getOrderItems().stream()
                .map(item -> item.getMenuItemVersion().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        context.setVariable("subtotal", subtotal);

        // 3. Prosledi početnu cenu dostave (za prikaz popusta)
        context.setVariable("initialDeliveryPrice", DELIVERY_PRICE);

        String htmlContent = templateEngine.process("invoice_template", context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        }
    }
}