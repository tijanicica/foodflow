// Datoteka: src/main/java/com/iis/foodflow/service/OrderService.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.OrderRequestDTO;
import com.iis.foodflow.dto.response.OrderDetailDTO;
import com.iis.foodflow.dto.response.OrderSummaryDTO;
import com.iis.foodflow.dto.response.RepeatingOrderTemplateDTO;
import com.iis.foodflow.dto.response.TrackOrderDTO;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.OrderType;
import com.iis.foodflow.enums.PaymentType;
import com.iis.foodflow.model.order.*;
import com.iis.foodflow.model.restaurant.MenuItemVersion;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.model.user.Driver;
import com.iis.foodflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException; // Dodaj import


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemVersionRepository menuItemVersionRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final NotificationService notificationService;

    private final RepeatingOrderRepository repeatingOrderRepository; 

    private final OrderAssignmentService orderAssignmentService;

    @Transactional(readOnly = true)
    public Optional<Order> findActiveOrderByDriver(Driver driver) {
        List<OrderStatus> activeStatuses = List.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP);
        return orderRepository.findActiveOrderByDriver(driver, activeStatuses);
    }

    private final DriverRatingRepository driverRatingRepository;

    @Transactional
    public Order confirmOrder(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));


        // Postavljamo status porudžbine na CONFIRMED.
        // Ovo je signal da restoran treba da počne sa pripremom.
        order.setStatus(OrderStatus.CONFIRMED);

        // Nakon potvrde, odmah pokrećemo algoritam za pronalaženje najboljeg vozača.
        orderAssignmentService.findAndAssignBestDriver(order);

        // Vraćamo ažuriranu porudžbinu.
        return orderRepository.save(order);
    }

    /**
     * Mijenja status porudžbine na DELIVERED i bilježi tačno vrijeme isporuke.
     * @param orderId ID porudžbine koja se označava kao isporučena.
     */
    @Transactional
    public void markOrderAsDelivered(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Postavljamo status na DELIVERED (ili koji god je vaš finalni status)
        order.setStatus(OrderStatus.DELIVERED);

        // Bilježimo tačan trenutak isporuke
        order.setDeliveredAt(LocalDateTime.now());

        orderRepository.save(order);
    }


    @Transactional
    public Order markOrderAsReadyForPickup(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Provjera: Možemo označiti kao spremno samo ako se porudžbina trenutno priprema (ili je potvrđena)
        if (order.getStatus() != OrderStatus.CONFIRMED ) {
            throw new IllegalStateException("Order cannot be marked as ready. Current status: " + order.getStatus());
        }

        // Postavljamo novi status
        order.setStatus(OrderStatus.READY_FOR_PICKUP);

        // TODO: Ovdje dodati logku za slanje notifikacije vozaču.

        return orderRepository.save(order);
    }
  
    // Fiksna cena dostave
    private static final BigDecimal DELIVERY_PRICE = new BigDecimal("150.00");

    @Transactional
    public void createOrder(OrderRequestDTO request, Customer customer) {
        // === KORAK 1: VALIDACIJA UNOSA ===
        Address deliveryAddress = addressRepository.findByIdAndCustomer(request.getAddressId(), customer)
                .orElseThrow(() -> new RuntimeException("Address not found or does not belong to user."));
        validateRequest(request);

        // === KORAK 2: PRIPREMA ZAJEDNIČKIH PODATAKA ===
        Order newOrder = new Order();
        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal subtotal = calculateSubtotalAndCreateItems(request.getItems(), newOrder, orderItems);

        CouponHolder couponHolder = processCoupon(request.getCouponCode(), customer);
        Coupon coupon = couponHolder.getCoupon();
        BigDecimal finalTotalPrice = subtotal.add(couponHolder.getEffectiveDeliveryPrice());

        // === KORAK 3: POPUNJAVANJE ZAJEDNIČKIH POLJA PORUDŽBINE ===
        newOrder.setCustomer(customer);
        newOrder.setAddress(deliveryAddress);
        newOrder.setCreationDate(LocalDateTime.now());
        newOrder.setNoteForRestaurant(request.getNoteForRestaurant());
        newOrder.setNoteForDriver(request.getNoteForDriver());
        newOrder.setOrderItems(orderItems);
        newOrder.setDeliveryPrice(couponHolder.getEffectiveDeliveryPrice());
        newOrder.setTotalPrice(finalTotalPrice);
        populatePaymentAmounts(newOrder, request, finalTotalPrice);


        // === KORAK 4: NOVA, CENTRALIZOVANA LOGIKA PO TIPU PORUDŽBINE ===
        if (request.getOrderType() == OrderType.REPEATING) {
            handleRepeatingOrder(newOrder, request.getRepeatInfo(), coupon);
        } else {
            // Logika za REGULAR i SCHEDULED
            if (request.getOrderType() == OrderType.SCHEDULED) {
                handleScheduledOrder(newOrder, request.getScheduleInfo(), coupon);
            } else { // REGULAR
                newOrder.setOrderType(OrderType.REGULAR);
                handleRegularOrder(newOrder, coupon);
            }
            orderRepository.save(newOrder);
        }

      //  notificationService.sendOrderConfirmation(newOrder);
    }

    // === POMOĆNE (HELPER) METODE ===

    private void handleRegularOrder(Order order, Coupon coupon) {
        order.setStatus(OrderStatus.CREATED);
        if (coupon != null) {
            markCouponAsUsed(coupon, order);
        }
    }

    private void handleScheduledOrder(Order order, OrderRequestDTO.ScheduleDTO scheduleInfo, Coupon coupon) {
        if (scheduleInfo == null || scheduleInfo.getScheduledDate() == null || scheduleInfo.getScheduledTime() == null) {
            throw new IllegalArgumentException("Schedule date and time are required for scheduled orders.");
        }
        LocalDateTime scheduledFor = LocalDateTime.of(scheduleInfo.getScheduledDate(), scheduleInfo.getScheduledTime());

        if (scheduledFor.isBefore(LocalDateTime.now()) || scheduledFor.isAfter(LocalDateTime.now().plusDays(7))) {
            throw new IllegalArgumentException("Invalid schedule date. Must be within the next 7 days.");
        }

        order.setOrderType(OrderType.SCHEDULED);
        order.setStatus(OrderStatus.SCHEDULED_PENDING);
        order.setScheduledFor(scheduledFor);
        if (coupon != null) {
            order.setUsedCoupon(coupon); // Kupon se samo povezuje, scheduler ga aktivira
        }
    }

    private void handleRepeatingOrder(Order firstInstance, OrderRequestDTO.RepeatDTO repeatInfo, Coupon coupon) {
        if (repeatInfo == null) {
            throw new IllegalArgumentException("Repeat info is required for repeating orders.");
        }

        // 1. Kreiramo šablon u memoriji, ali bez originalne porudžbine za sada.
        RepeatingOrder template = createRepeatingOrderTemplate(repeatInfo, firstInstance);

        // 2. Popunjavamo podatke za prvu instancu.
        firstInstance.setOrderType(OrderType.REPEATING);
        firstInstance.setStatus(OrderStatus.CREATED);

        // Povezujemo ih međusobno pre čuvanja.
        firstInstance.setRepeatingOrderTemplate(template);
        template.setOriginalOrder(firstInstance);

        // Kupon važi samo za prvu instancu.
        if (coupon != null) {
            markCouponAsUsed(coupon, firstInstance);
        }

        // 3. Čuvamo prvu instancu. Hibernate/JPA će se pobrinuti da sačuva
        // i povezani 'template' objekat u ispravnom redosledu.
        orderRepository.save(firstInstance);
    }

    private RepeatingOrder createRepeatingOrderTemplate(OrderRequestDTO.RepeatDTO repeatInfo, Order originalOrder) {
        RepeatingOrder template = new RepeatingOrder();
        if (originalOrder != null) {
            template.setOriginalOrder(originalOrder);
        }
        template.setRepeatType(repeatInfo.getRepeatType());
        template.setDayOfWeek(repeatInfo.getDayOfWeek());
        template.setDayOfMonth(repeatInfo.getDayOfMonth());
        template.setDeliveryTime(repeatInfo.getDeliveryTime());
        template.setRepeatUntil(repeatInfo.getRepeatUntil());
        template.setActive(true);
        template.setUnlimited(repeatInfo.getRepeatUntil() == null);
        return template;
    }

    // ... (ostale pomoćne metode: validateRequest, CouponHolder, processCoupon, itd. ostaju iste)

    private void validateRequest(OrderRequestDTO request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }
        if (request.getOrderType() == OrderType.SCHEDULED || request.getOrderType() == OrderType.REPEATING) {
            validateRestaurantOperatingHours(request);
        }
    }

    @RequiredArgsConstructor
    @lombok.Getter
    private static class CouponHolder {
        private final Coupon coupon;
        private final BigDecimal effectiveDeliveryPrice;
    }

    private CouponHolder processCoupon(String couponCode, Customer customer) {
        if (couponCode == null || couponCode.isEmpty()) {
            return new CouponHolder(null, DELIVERY_PRICE);
        }
        Coupon coupon = couponRepository.findByCodeAndCustomerAndUsedFalse(couponCode, customer)
                .orElseThrow(() -> new RuntimeException("Invalid or already used coupon."));

        // Pretpostavka: Samo FREEDELIVERY kupon utiče na cenu dostave
        BigDecimal effectiveDeliveryPrice = "FREEDELIVERY".equalsIgnoreCase(coupon.getCode()) ? BigDecimal.ZERO : DELIVERY_PRICE;
        return new CouponHolder(coupon, effectiveDeliveryPrice);
    }

    private void validateRestaurantOperatingHours(OrderRequestDTO request) {
        MenuItemVersion sampleItem = menuItemVersionRepository.findById(request.getItems().get(0).getMenuItemVersionId())
                .orElseThrow(() -> new RuntimeException("Menu item not found!"));
        Restaurant restaurant = sampleItem.getMenuVersion().getMenu().getRestaurant();

        LocalTime deliveryTime = null;
        if (request.getOrderType() == OrderType.SCHEDULED && request.getScheduleInfo() != null) {
            deliveryTime = request.getScheduleInfo().getScheduledTime();
        } else if (request.getOrderType() == OrderType.REPEATING && request.getRepeatInfo() != null) {
            deliveryTime = request.getRepeatInfo().getDeliveryTime();
        }

        if (deliveryTime != null) {
            if (restaurant.getOpeningTime() == null || restaurant.getClosingTime() == null) {
                throw new IllegalStateException("Restaurant's operating hours are not defined.");
            }
            if (deliveryTime.isBefore(restaurant.getOpeningTime()) || deliveryTime.isAfter(restaurant.getClosingTime())) {
                throw new IllegalStateException("Restaurant is closed at the selected time: " + deliveryTime);
            }
        }
    }

    private BigDecimal calculateSubtotalAndCreateItems(List<OrderRequestDTO.OrderItemDTO> itemDtos, Order order, Set<OrderItem> orderItems) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderRequestDTO.OrderItemDTO itemDto : itemDtos) {
            MenuItemVersion miv = menuItemVersionRepository.findById(itemDto.getMenuItemVersionId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found!"));
            subtotal = subtotal.add(miv.getPrice().multiply(new BigDecimal(itemDto.getQuantity())));
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItemVersion(miv);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setOrder(order);
            orderItems.add(orderItem);
        }
        return subtotal;
    }

    private void populatePaymentAmounts(Order order, OrderRequestDTO request, BigDecimal finalTotalPrice) {
        order.setPaymentType(request.getPaymentType());
        if (request.getPaymentType() == PaymentType.CARD) {
            order.setCardAmount(finalTotalPrice);
            order.setCashAmount(BigDecimal.ZERO);
        } else if (request.getPaymentType() == PaymentType.CASH) {
            order.setCardAmount(BigDecimal.ZERO);
            order.setCashAmount(finalTotalPrice);
        } else if (request.getPaymentType() == PaymentType.COMBINED) {
            BigDecimal cardAmount = request.getCardAmount();
            if (cardAmount == null || cardAmount.compareTo(BigDecimal.ZERO) <= 0 || cardAmount.compareTo(finalTotalPrice) >= 0) {
                throw new IllegalArgumentException("For combined payment, card amount must be greater than 0 and less than total price.");
            }
            order.setCardAmount(cardAmount);
            order.setCashAmount(finalTotalPrice.subtract(cardAmount));
        }
    }

    private void markCouponAsUsed(Coupon coupon, Order order) {
        coupon.setUsed(true);
        coupon.setUsageDate(LocalDateTime.now());
        order.setUsedCoupon(coupon);
    }


    public List<OrderSummaryDTO> getOrdersForTab(String tab, Customer customer) {
        List<Order> orders;
        switch (tab.toUpperCase()) {
            case "ACTIVE":
                orders = orderRepository.findOrdersByCustomerAndStatusIn(customer,
                        Set.of(OrderStatus.CREATED, OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP)
                );
                break;
            case "PAST":
                orders = orderRepository.findOrdersByCustomerAndStatusIn(customer,
                        Set.of(OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REJECTED)
                );
                break;
            case "SCHEDULED":
                orders = orderRepository.findScheduledOrdersForCustomer(customer);
                break;
            default:
                orders = List.of();
        }
        return orders.stream().map(this::mapToOrderSummaryDTO).collect(Collectors.toList());
    }

    public List<RepeatingOrderTemplateDTO> getRepeatingOrderTemplates(Customer customer) {
        return repeatingOrderRepository.findTemplatesForCustomer(customer)
                .stream().map(this::mapToRepeatingOrderTemplateDTO).collect(Collectors.toList());
    }

    // Pomoćne metode za mapiranje
    private OrderSummaryDTO mapToOrderSummaryDTO(Order order) {
        String restaurantName = order.getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getName())
                .orElse("Unknown Restaurant");

        boolean hasOrderRating = order.getOrderRating() != null;
        boolean hasDriverRatingByCustomer = driverRatingRepository.existsByOrder_IdAndRatedByCustomerIsNotNull(order.getId());

        boolean isRated = hasOrderRating || hasDriverRatingByCustomer;

        return new OrderSummaryDTO(
                order.getId(),
                restaurantName,
                order.getCreationDate(),
                order.getScheduledFor(),
                order.getTotalPrice(),
                order.getStatus(),
                isRated
        );
    }

    private RepeatingOrderTemplateDTO mapToRepeatingOrderTemplateDTO(RepeatingOrder template) {
        String restaurantName = template.getOriginalOrder().getOrderItems().stream()
                .findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getName())
                .orElse("Unknown Restaurant");

        return new RepeatingOrderTemplateDTO(
                template.getId(),
                restaurantName,
                template.getRepeatType(),
                template.getDayOfWeek(),
                template.getDeliveryTime(),
                template.isActive(),
                template.isUnlimited(),
                template.getRepeatUntil(),
                template.getOriginalOrder().getId() // Dodajemo ID originalne porudžbine

        );
    }

    @Transactional(readOnly = true) // Dobra praksa za metode koje samo čitaju podatke
    public OrderDetailDTO getOrderDetails(Long orderId, Customer customer) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // SIGURNOSNA PROVERA: Da li je ulogovani korisnik vlasnik porudžbine?
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to view this order.");
        }

        // Mapiraj stavke
        List<OrderDetailDTO.OrderItemDetailDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> OrderDetailDTO.OrderItemDetailDTO.builder()
                        .name(item.getMenuItemVersion().getMenuItem().getName())
                        .imageUrl(item.getMenuItemVersion().getMenuItem().getImageUrl())
                        .quantity(item.getQuantity())
                        .price(item.getMenuItemVersion().getPrice())
                        .build())
                .collect(Collectors.toList());

        // Izračunaj subtotal ponovo radi sigurnosti
        BigDecimal subtotal = itemDTOs.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Formatiraj adresu
        Address adr = order.getAddress();
        String formattedAddress = String.format("%s %s, %s", adr.getStreet(), adr.getStreetNumber(), adr.getCity());

        // Kreiraj i vrati glavni DTO
        return OrderDetailDTO.builder()
                .id(order.getId())
                .restaurantName( // Dohvatamo ime restorana iz prve stavke
                        order.getOrderItems().stream().findFirst()
                                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getName())
                                .orElse("Unknown")
                )
                .items(itemDTOs)
                .subtotal(subtotal)
                .deliveryPrice(order.getDeliveryPrice())
                .total(order.getTotalPrice())
                .status(order.getStatus())
                .deliveryAddress(formattedAddress)
                .paymentMethod(order.getPaymentType())
                .creationDate(order.getCreationDate())
                .couponCode(order.getUsedCoupon() != null ? order.getUsedCoupon().getCode() : null)
                .build();

    }

    @Transactional
    public RepeatingOrderTemplateDTO toggleRepeatingOrderStatus(Long templateId, Customer customer) {
        RepeatingOrder template = repeatingOrderRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Repeating order template not found."));

        // Sigurnosna provera da li je korisnik vlasnik šablona
        if (!template.getOriginalOrder().getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to modify this template.");
        }

        // Promeni status
        template.setActive(!template.isActive());

        RepeatingOrder updatedTemplate = repeatingOrderRepository.save(template);
        return mapToRepeatingOrderTemplateDTO(updatedTemplate); // Vrati ažurirani DTO
    }

    @Transactional
    public void cancelRepeatingOrder(Long templateId, Customer customer) {
        RepeatingOrder template = repeatingOrderRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Repeating order template not found."));

        // Sigurnosna provera
        if (!template.getOriginalOrder().getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to cancel this template.");
        }

        // --- LOGIKA LOGIČKOG BRISANJA ---
        // 1. Postavi flag da je otkazano
        template.setCancelled(true);

        // 2. Dobra je praksa i deaktivirati ga
        template.setActive(false);

        // 3. Sačuvaj promene
        repeatingOrderRepository.save(template);
    }


    @Transactional(readOnly = true)
    public TrackOrderDTO getTrackingInfo(Long orderId, Customer customer) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Sigurnosna provera vlasništva
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You are not authorized to track this order.");
        }
        // Provera statusa
        if (order.getStatus() != OrderStatus.PICKED_UP) {
            throw new IllegalStateException("Order can only be tracked when status is PICKED_UP.");
        }

        Driver driver = order.getDriver();
        Address customerAddress = order.getAddress();
        // Dohvatamo adresu restorana preko prve stavke
        Address restaurantAddress = order.getOrderItems().stream().findFirst()
                .map(item -> item.getMenuItemVersion().getMenuVersion().getMenu().getRestaurant().getAddress())
                .orElseThrow(() -> new IllegalStateException("Restaurant address not found."));

        return TrackOrderDTO.builder()
                .orderId(order.getId())
                .driverName(driver.getFirstName() + " " + driver.getLastName().charAt(0) + ".")
                .customerName(customer.getFirstName() + " " + customer.getLastName())
                .customerAddress(customerAddress.toString())
                .eta(order.getEta())
                .restaurantLocation(new TrackOrderDTO.Point(restaurantAddress.getLatitude(), restaurantAddress.getLongitude()))
                .driverLocation(new TrackOrderDTO.Point(driver.getLatitude(), driver.getLongitude()))
                .customerLocation(new TrackOrderDTO.Point(customerAddress.getLatitude(), customerAddress.getLongitude()))
                .build();
    }
}