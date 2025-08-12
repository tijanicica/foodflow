package com.iis.foodflow.model.order;

import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Customer;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@ToString
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String street;
    private String streetNumber;
    private String city;
    private String country;
    private String nickname; // naziv (opciono)
    private String postalCode;
    private Double longitude;
    private Double latitude;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToOne(mappedBy = "address")
    private Restaurant restaurant;

    // === DODAJTE OVU METODU NA KRAJ KLASE ===
    @Override
    public String toString() {
        // Možete formatirati string kako god želite da se prikazuje
        return String.format("%s %s, %s, %s",
                this.street,
                this.streetNumber,
                this.postalCode,
                this.city
        );
    }
}
