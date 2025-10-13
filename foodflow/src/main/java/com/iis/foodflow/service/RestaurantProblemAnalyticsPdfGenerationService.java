package com.iis.foodflow.service;
import com.iis.foodflow.dto.response.RestaurantProblemAnalyticsDTO;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class RestaurantProblemAnalyticsPdfGenerationService {
    public ByteArrayInputStream generateAnalyticsPdf(RestaurantProblemAnalyticsDTO analytics) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Naslov
        document.add(new Paragraph("Customer Support Analytics Report")
                .setBold().setFontSize(20).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("for " + analytics.getRestaurantName())
                .setFontSize(16).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
                .setTextAlignment(TextAlignment.CENTER).setFontColor(ColorConstants.GRAY));

        document.add(new Paragraph("\n"));

        // Opšti podaci
        document.add(new Paragraph("Overall Summary").setBold().setFontSize(14));
        document.add(createSummaryTable(analytics));

        document.add(new Paragraph("\n"));

        // Podaci po kategorijama
        document.add(new Paragraph("Breakdown by Problem Category").setBold().setFontSize(14));
        if (analytics.getCategoryBreakdown().isEmpty()) {
            document.add(new Paragraph("No tickets recorded for this restaurant yet."));
        } else {
            document.add(createCategoryTable(analytics));
        }

        document.close();
        return new ByteArrayInputStream(out.toByteArray());
    }

    private Table createSummaryTable(RestaurantProblemAnalyticsDTO analytics) {
        Table table = new Table(UnitValue.createPercentArray(4)).useAllAvailableWidth();
        table.addCell(createHeaderCell("Total Tickets"));
        table.addCell(createHeaderCell("Open/In Progress"));
        table.addCell(createHeaderCell("Closed Tickets"));
        table.addCell(createHeaderCell("Avg. Resolution Time"));

        table.addCell(createDataCell(String.valueOf(analytics.getTotalTickets())));
        table.addCell(createDataCell(String.valueOf(analytics.getOpenTickets())));
        table.addCell(createDataCell(String.valueOf(analytics.getClosedTickets())));
        table.addCell(createDataCell(analytics.getAverageResolutionTime()));
        return table;
    }

    private Table createCategoryTable(RestaurantProblemAnalyticsDTO analytics) {
        Table table = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
        table.addCell(createHeaderCell("Category Name"));
        table.addCell(createHeaderCell("Number of Tickets"));

        for (RestaurantProblemAnalyticsDTO.CategoryAnalytics category : analytics.getCategoryBreakdown()) {
            table.addCell(createDataCell(category.getCategoryName()));
            table.addCell(createDataCell(String.valueOf(category.getTicketCount())));
        }
        return table;
    }

    private Cell createHeaderCell(String text) {
        return new Cell().add(new Paragraph(text).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createDataCell(String text) {
        return new Cell().add(new Paragraph(text))
                .setTextAlignment(TextAlignment.CENTER);
    }
}
