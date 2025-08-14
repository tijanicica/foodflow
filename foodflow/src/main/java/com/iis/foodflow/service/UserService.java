package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.AddCardRequestDTO;
import com.iis.foodflow.dto.request.ChangePasswordRequestDTO;
import com.iis.foodflow.dto.request.UpdateAddressRequestDTO;
import com.iis.foodflow.dto.response.UserProfileDTO;
import com.iis.foodflow.model.order.Address;
import com.iis.foodflow.model.order.Card;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.AddressRepository;
import com.iis.foodflow.repository.CardRepository;
import com.iis.foodflow.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class UserService {

    private final AddressRepository addressRepository;
    private final CardRepository cardRepository;
    private final CustomerRepository customerRepository; // Dodaj CustomerRepository
    private final PasswordEncoder passwordEncoder; // Dodaj PasswordEncoder

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(Customer customer) {
        // Dohvatamo adrese i odmah ih mapiramo u DTO
        List<UserProfileDTO.AddressDTO> addressDTOs = addressRepository.findByCustomer(customer).stream()
                .map(this::mapToAddressDTO)
                .collect(Collectors.toList());

        // Dohvatamo kartice i odmah ih mapiramo u DTO
        List<UserProfileDTO.CardDTO> cardDTOs = cardRepository.findByCustomer(customer).stream()
                .map(this::mapToCardDTO)
                .collect(Collectors.toList());

        return UserProfileDTO.builder()
                .fullName(customer.getFirstName() + " " + customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .paymentMethods(cardDTOs)
                .savedAddresses(addressDTOs) // Sada DTO sadrži sve što nam treba
                .build();
    }

    // AŽURIRANA METODA ZA MAPIRANJE
    private UserProfileDTO.AddressDTO mapToAddressDTO(Address address) {
        String fullAddress = String.format("%s %s, %s, %s",
                address.getStreet(), address.getStreetNumber(), address.getPostalCode(), address.getCity());

        UserProfileDTO.AddressDTO dto = new UserProfileDTO.AddressDTO();
        dto.setId(address.getId());
        dto.setStreet(address.getStreet());
        dto.setStreetNumber(address.getStreetNumber());
        dto.setCity(address.getCity());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setNickname(address.getNickname());
        dto.setFullAddress(fullAddress);

        return dto;
    }

    @Transactional
    public UserProfileDTO.CardDTO addNewCard(AddCardRequestDTO cardRequest, Customer customer) {
        Card newCard = new Card();
        newCard.setCardNumber(cardRequest.getCardNumber()); // U pravoj aplikaciji, ovo bi se enkriptovalo!
        newCard.setExpiryDate(cardRequest.getExpiryDate());
        newCard.setCvv(cardRequest.getCvc()); // I ovo!
        newCard.setCustomer(customer);

        Card savedCard = cardRepository.save(newCard);
        return mapToCardDTO(savedCard);
    }

    @Transactional
    public void deleteCard(Long cardId, Customer customer) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found."));

        if (!card.getCustomer().getId().equals(customer.getId())) {
            throw new SecurityException("Cannot delete another user's card.");
        }
        if (card.isActive()) {
            throw new IllegalArgumentException("Cannot delete the active payment method. Please set another card as active first.");
        }
        cardRepository.delete(card);
    }

    private UserProfileDTO.CardDTO mapToCardDTO(Card card) {
        String lastFourDigits = card.getCardNumber().substring(card.getCardNumber().length() - 4);
        String maskedNumber = String.format("Visa **** %s", lastFourDigits);
        return new UserProfileDTO.CardDTO(card.getId(), maskedNumber, card.isActive()); // DODAJ 'active'
    }
    @Transactional
    public void updatePhoneNumber(Customer customer, String newPhone) {
        customer.setPhone(newPhone);
        customerRepository.save(customer);
    }

    @Transactional
    public void changePassword(Customer customer, ChangePasswordRequestDTO request) {
        // 1. Proveri da li se stara lozinka poklapa
        if (!passwordEncoder.matches(request.getOldPassword(), customer.getPassword())) {
            throw new IllegalArgumentException("Incorrect old password.");
        }
        // 2. Enkodiraj i postavi novu lozinku
        customer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
    }

    @Transactional
    public UserProfileDTO.AddressDTO updateAddress(Long addressId, UpdateAddressRequestDTO addressData, Customer customer) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found."));

        // Sigurnosna provera da li korisnik menja svoju adresu
        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new SecurityException("You can only edit your own addresses.");
        }

        address.setStreet(addressData.getStreet());
        address.setStreetNumber(addressData.getStreetNumber());
        address.setCity(addressData.getCity());
        address.setCountry(addressData.getCountry());
        address.setPostalCode(addressData.getPostalCode());
        address.setNickname(addressData.getNickname());

        Address savedAddress = addressRepository.save(address);
        return mapToAddressDTO(savedAddress);
    }

    @Transactional
    public void setActiveCard(Long cardId, Customer customer) {
        // 1. Dohvati sve kartice ovog korisnika
        List<Card> allCards = cardRepository.findByCustomer(customer);

        boolean cardFound = false;
        for (Card card : allCards) {
            // 2. Pronađi karticu koju treba aktivirati i postavi joj 'active' na true
            if (card.getId().equals(cardId)) {
                card.setActive(true);
                cardFound = true;
            } else {
                // 3. Svim ostalim karticama postavi 'active' na false
                card.setActive(false);
            }
        }

        if (!cardFound) {
            throw new RuntimeException("Card not found or does not belong to the user.");
        }

        // 4. Sačuvaj sve promene
        cardRepository.saveAll(allCards);
    }

}