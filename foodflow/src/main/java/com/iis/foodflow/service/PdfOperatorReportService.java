package com.iis.foodflow.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.property.UnitValue;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;

@Service
public class PdfOperatorReportService {
    public ByteArrayInputStream generateOperatorReport(JsonNode reportData) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        DecimalFormat df = new DecimalFormat("#.##");

        // Header
        JsonNode operatorInfo = reportData.get("operatorInfo");
        document.add(new Paragraph("Performance Report for Operator: " + operatorInfo.get("firstName").asText() + " " + operatorInfo.get("lastName").asText())
                .setBold().setFontSize(20));
        document.add(new Paragraph("Email: " + operatorInfo.get("email").asText()));
        document.add(new Paragraph("Report generated on: " + java.time.LocalDate.now()));

        document.add(new Paragraph("\n"));

        // Overall Metrics
        JsonNode metrics = reportData.get("overallMetrics");
        document.add(new Paragraph("Overall Summary").setBold().setFontSize(16));
        document.add(new Paragraph("Total Resolved Tickets: " + metrics.get("totalResolvedTickets").asInt()));
        document.add(new Paragraph("Overall Average Rating: " + df.format(metrics.get("overallAverageRating").asDouble())));

        long totalSeconds = metrics.get("averageResolutionSeconds").asLong();
        String avgTime = String.format("%d:%02d:%02d", totalSeconds / 3600, (totalSeconds % 3600) / 60, totalSeconds % 60);
        document.add(new Paragraph("Average Resolution Time: " + avgTime + " (HH:MM:SS)"));

        document.add(new Paragraph("\n"));

        // Performance by Category Table
        JsonNode categoryPerformance = reportData.get("performanceByCategory");
        if (categoryPerformance != null && categoryPerformance.isArray()) {
            document.add(new Paragraph("Performance by Category").setBold().setFontSize(16));

            Table table = new Table(UnitValue.createPercentArray(new float[]{4, 2, 2}));
            table.setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell("Category");
            table.addHeaderCell("Resolved Tickets");
            table.addHeaderCell("Average Rating");

            for (JsonNode category : categoryPerformance) {
                table.addCell(category.get("categoryName").asText());
                table.addCell(String.valueOf(category.get("ticketCount").asInt()));
                table.addCell(df.format(category.get("avgRating").asDouble()));
            }
            document.add(table);
        }

        document.close();
        return new ByteArrayInputStream(out.toByteArray());
    }
}
