package com.iis.foodflow.dto.response; // Ili gde god želite da stoji

import com.iis.foodflow.model.user.Driver;
import jakarta.persistence.ConstructorResult;
import jakarta.persistence.SqlResultSetMapping;
import jakarta.persistence.ColumnResult;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.math.BigDecimal;

// Ova klasa služi samo kao nosač za SqlResultSetMapping
@SqlResultSetMapping(
        name = "DriverPerformanceReportMapping",
        classes = @ConstructorResult(
                targetClass = DriverPerformanceReportDTO.class,
                columns = {
                        // REDOSLED I IMENA MORAJU ODGOVARATI ONOME ŠTO FUNKCIJA VRAĆA
                        @ColumnResult(name = "driverId", type = Long.class),
                        @ColumnResult(name = "driver_full_name", type = String.class),
                        @ColumnResult(name = "analysis_period", type = String.class),
                        @ColumnResult(name = "overall_on_time_rate", type = BigDecimal.class),
                        @ColumnResult(name = "total_rejected_offers", type = Long.class),
                        @ColumnResult(name = "performance_by_restaurant", type = String.class),
                        @ColumnResult(name = "delayed_orders_details", type = String.class)
                }
        )
)
@Entity // Mora biti @Entity da bi Hibernate prepoznao anotaciju
public class DriverPerformanceReportMapping {
    @Id
    private Long id; // Mora imati @Id polje
}