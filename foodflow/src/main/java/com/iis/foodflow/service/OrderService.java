// Datoteka: src/main/java/com/iis/foodflow/service/OrderService.java
package com.iis.foodflow.service;

import com.iis.foodflow.dto.request.OrderRequestDTO;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.OrderType;
import com.iis.foodflow.enums.PaymentType;
import com.iis.foodflow.model.order.*;
import com.iis.foodflow.model.restaurant.MenuItemVersion;
import com.iis.foodflow.model.restaurant.Restaurant;
import com.iis.foodflow.model.user.Customer;
import com.iis.foodflow.repository.AddressRepository;
import com.iis.foodflow.repository.CouponRepository;
import com.iis.foodflow.repository.MenuItemVersionRepository;
import com.iis.foodflow.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemVersionRepository menuItemVersionRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final NotificationService notificationService;

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

    // Fiksna cena dostave
    private static final BigDecimal DELIVERY_PRICE = new BigDecimal("150.00");

    @Transactional
    public void createOrder(OrderRequestDTO request, Customer customer) {
        // === KORAK 1: VALIDACIJA UNOSA ===
        Address deliveryAddress = addressRepository.findByIdAndCustomer(request.getAddressId(), customer)
                .orElseThrow(() -> new RuntimeException("Address not found or does not belong to user."));

        validateRequest(request);

        // === KORAK 2: PRIPREMA PODATAKA ===
        Order newOrder = new Order();
        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal subtotal = calculateSubtotalAndCreateItems(request.getItems(), newOrder, orderItems);

        // Odredi cenu dostave na osnovu kupona
        CouponHolder couponHolder = processCoupon(request.getCouponCode(), customer);
        BigDecimal finalTotalPrice = subtotal.add(couponHolder.getEffectiveDeliveryPrice());

        // === KORAK 3: POPUNJAVANJE ZAJEDNIČKIH POLJA PORUDŽBINE ===
        newOrder.setCustomer(customer);
        newOrder.setAddress(deliveryAddress);
        newOrder.setCreationDate(LocalDateTime.now());
        newOrder.setOrderType(request.getOrderType());
        newOrder.setNoteForRestaurant(request.getNoteForRestaurant());
        newOrder.setNoteForDriver(request.getNoteForDriver());
        newOrder.setOrderItems(orderItems);
        newOrder.setDeliveryPrice(couponHolder.getEffectiveDeliveryPrice());
        newOrder.setTotalPrice(finalTotalPrice);
        populatePaymentAmounts(newOrder, request, finalTotalPrice);

        // === KORAK 4: SPECIFIČNA LOGIKA PO TIPU PORUDŽBINE ===
        if (request.getOrderType() == OrderType.SCHEDULED) {
            handleScheduledOrder(newOrder, request.getScheduleInfo(), couponHolder.getCoupon());
        }
        else if (request.getOrderType() == OrderType.REPEATING) {
            handleRepeatingOrder(newOrder, request.getRepeatInfo(), couponHolder.getCoupon());
        }
        else { // REGULAR
            handleRegularOrder(newOrder, couponHolder.getCoupon());
        }

        Order savedOrder = orderRepository.save(newOrder);


        notificationService.sendOrderConfirmation(savedOrder);
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

        // === KLJUČNA IZMENA JE OVDE ===
        // Spajamo odvojeni datum i vreme u jedan LocalDateTime objekat.
        LocalDateTime scheduledFor = LocalDateTime.of(scheduleInfo.getScheduledDate(), scheduleInfo.getScheduledTime());

        // Validacija (da nije u prošlosti i da nije >7 dana)
        if (scheduledFor.isBefore(LocalDateTime.now()) || scheduledFor.isAfter(LocalDateTime.now().plusDays(7))) {
            throw new IllegalArgumentException("Invalid schedule date. Must be within the next 7 days.");
        }

        order.setStatus(OrderStatus.SCHEDULED_PENDING);
        order.setScheduledFor(scheduledFor); // Sada koristimo ispravno kreiran objekat

        // Kupon se samo povezuje, ali ne označava kao iskorišćen. To radi scheduler.
        if (coupon != null) {
            order.setUsedCoupon(coupon);
        }
    }

    private void handleRepeatingOrder(Order order, OrderRequestDTO.RepeatDTO repeatInfo, Coupon coupon) {
        if (repeatInfo == null) {
            throw new IllegalArgumentException("Repeat info is required for repeating orders.");
        }
        // Prva porudžbina se kreira odmah
        order.setStatus(OrderStatus.CREATED);
        // Kupon se primenjuje samo na prvu porudžbinu
        if (coupon != null) {
            markCouponAsUsed(coupon, order);
        }
        // Kreiraj i poveži šablon za ponavljanje
        RepeatingOrder repeatingOrderTemplate = createRepeatingOrderTemplate(repeatInfo, order);
        order.setRepeatingOrder(repeatingOrderTemplate);
    }

    private void validateRequest(OrderRequestDTO request) { // Menjamo potpis metode
        // Provera adrese je već obavljena u `createOrder`
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

        BigDecimal effectiveDeliveryPrice = "FREEDELIVERY".equalsIgnoreCase(coupon.getCode()) ? BigDecimal.ZERO : DELIVERY_PRICE;
        return new CouponHolder(coupon, effectiveDeliveryPrice);
    }

    // ... ostatak vaših pomoćnih metoda (calculateSubtotal, populatePayment, createRepeating, markCoupon, validateHours) ostaje isti ...


    private void validateRestaurantOperatingHours(OrderRequestDTO request) {
        MenuItemVersion sampleItem = menuItemVersionRepository.findById(request.getItems().get(0).getMenuItemVersionId())
                .orElseThrow(() -> new RuntimeException("Menu item not found!"));
        Restaurant restaurant = sampleItem.getMenuVersion().getMenu().getRestaurant();

        LocalTime deliveryTime = null;
        if (request.getOrderType() == OrderType.SCHEDULED) {
            deliveryTime = request.getScheduleInfo().getScheduledTime();
        } else if (request.getOrderType() == OrderType.REPEATING) {
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

    private RepeatingOrder createRepeatingOrderTemplate(OrderRequestDTO.RepeatDTO repeatInfo, Order templateOrder) {
        RepeatingOrder repeatingOrder = new RepeatingOrder();
        repeatingOrder.setOrder(templateOrder);
        repeatingOrder.setRepeatType(repeatInfo.getRepeatType());
        repeatingOrder.setDayOfWeek(repeatInfo.getDayOfWeek());
        repeatingOrder.setDayOfMonth(repeatInfo.getDayOfMonth());
        repeatingOrder.setDeliveryTime(repeatInfo.getDeliveryTime());
        repeatingOrder.setRepeatUntil(repeatInfo.getRepeatUntil());
        repeatingOrder.setActive(true);
        return repeatingOrder;
    }

    private void markCouponAsUsed(Coupon coupon, Order order) {
        coupon.setUsed(true);
        coupon.setUsageDate(LocalDateTime.now());
        order.setUsedCoupon(coupon);
    }
}