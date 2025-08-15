// Fajl: src/main/java/com/iis/foodflow/service/OrderSchedulerService.java
package com.iis.foodflow.service;

import com.iis.foodflow.enums.DayOfMonth;
import com.iis.foodflow.enums.DayOfWeek;
import com.iis.foodflow.enums.OrderStatus;
import com.iis.foodflow.enums.OrderType;
import com.iis.foodflow.model.order.Coupon;
import com.iis.foodflow.model.order.Order;
import com.iis.foodflow.model.order.OrderItem;
import com.iis.foodflow.model.order.RepeatingOrder;
import com.iis.foodflow.repository.OrderRepository;
import com.iis.foodflow.repository.RepeatingOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderSchedulerService {

    private final OrderRepository orderRepository;
    private final RepeatingOrderRepository repeatingOrderRepository;

    @Scheduled(cron = "0 * * * * *") // Svakog minuta
    @Transactional
    public void processPendingOrders() {
        processScheduledOrders();
        processRepeatingOrders();
    }

    /**
     * Aktivira zakazane porudžbine sat vremena pre termina.
     * Ova metoda ostaje ista jer ne zavisi od logike ponavljajućih porudžbina.
     */
    private void processScheduledOrders() {
        LocalDateTime activationTime = LocalDateTime.now().plusHours(1);
        List<Order> ordersToActivate = orderRepository.findByStatusAndScheduledForBefore(
                OrderStatus.SCHEDULED_PENDING, activationTime
        );

        for (Order order : ordersToActivate) {
            order.setStatus(OrderStatus.CREATED);
            Coupon coupon = order.getUsedCoupon();
            if (coupon != null && !coupon.isUsed()) {
                coupon.setUsed(true);
                coupon.setUsageDate(LocalDateTime.now());
            }
            orderRepository.save(order);
        }
    }

    /**
     * Pronalazi aktivne šablone i kreira nove porudžbine ako je danas dan za isporuku.
     */
    private void processRepeatingOrders() {
        LocalDate today = LocalDate.now();
        List<RepeatingOrder> activeTemplates = repeatingOrderRepository.findAllByActiveTrueAndRepeatUntilAfterOrRepeatUntilIsNull(today);

        for (RepeatingOrder template : activeTemplates) {
            // VAŽNO: Osigurajte da u OrderRepository imate metodu 'existsByRepeatingOrderTemplateAndCreationDateBetween'
            if (isDeliveryDay(template, today) && !orderRepository.existsByRepeatingOrderTemplateAndCreationDateBetween(template, today.atStartOfDay(), today.plusDays(1).atStartOfDay())) {
                createNewOrderFromTemplate(template);
            }
        }
    }

    /**
     * Pomoćna metoda za kreiranje nove instance porudžbine na osnovu šablona.
     * OVA METODA JE U POTPUNOSTI IZMENJENA.
     * @param template Šablon za ponavljajuću porudžbinu.
     */
    private void createNewOrderFromTemplate(RepeatingOrder template) {
        // 1. Dobijamo ORIGINALNU porudžbinu koja služi kao osnova
        Order originalOrder = template.getOriginalOrder();
        if (originalOrder == null) {
            // Sigurnosna provera, ako je originalna porudžbina obrisana, ne radi ništa.
            return;
        }

        Order newInstance = new Order();

        // 2. Kopiraj osnovne podatke iz originalne porudžbine
        newInstance.setCustomer(originalOrder.getCustomer());
        newInstance.setAddress(originalOrder.getAddress());
        newInstance.setPaymentType(originalOrder.getPaymentType());
        newInstance.setCardAmount(originalOrder.getCardAmount());
        newInstance.setCashAmount(originalOrder.getCashAmount());
        newInstance.setNoteForDriver(originalOrder.getNoteForDriver());
        newInstance.setNoteForRestaurant(originalOrder.getNoteForRestaurant());
        newInstance.setDeliveryPrice(originalOrder.getDeliveryPrice()); // Pretpostavljamo da je cena dostave ista

        // 3. Postavi podatke specifične za ovu NOVU instancu
        newInstance.setCreationDate(LocalDateTime.now());
        newInstance.setStatus(OrderStatus.CREATED); // Odmah je spremna za obradu
        newInstance.setOrderType(OrderType.REPEATING); // Tip je sada 'REPEATING'
        newInstance.setRepeatingOrderTemplate(template); // Poveži ovu novu instancu sa šablonom

        // 4. Rekreiraj stavke porudžbine i ponovo izračunaj cenu (jer se cene mogu menjati)
        Set<OrderItem> newItems = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem originalItem : originalOrder.getOrderItems()) {
            OrderItem newItem = new OrderItem();
            newItem.setOrder(newInstance);
            newItem.setMenuItemVersion(originalItem.getMenuItemVersion());
            newItem.setQuantity(originalItem.getQuantity());
            newItems.add(newItem);

            subtotal = subtotal.add(newItem.getMenuItemVersion().getPrice().multiply(new BigDecimal(newItem.getQuantity())));
        }
        newInstance.setOrderItems(newItems);
        newInstance.setTotalPrice(subtotal.add(newInstance.getDeliveryPrice()));

        // Kupon se NIKADA ne primenjuje na ponovljene instance.

        // 5. Sačuvaj novu, kreiranu porudžbinu
        orderRepository.save(newInstance);
    }

    /**
     * Proverava da li je danas dan za isporuku na osnovu pravila iz šablona.
     * Ova metoda ostaje ista.
     */
    private boolean isDeliveryDay(RepeatingOrder template, LocalDate date) {
        switch (template.getRepeatType()) {
            case WEEKLY:
                // Potrebno je uporediti Enum direktno, a ne string reprezentaciju
                return date.getDayOfWeek().name().equals(template.getDayOfWeek().name());
            case MONTHLY:
                if (template.getDayOfMonth() == DayOfMonth.FIRST) {
                    return date.getDayOfMonth() == 1;
                } else if (template.getDayOfMonth() == DayOfMonth.FIFTEENTH) {
                    return date.getDayOfMonth() == 15;
                } else if (template.getDayOfMonth() == DayOfMonth.LAST) {
                    return date.isEqual(date.with(TemporalAdjusters.lastDayOfMonth()));
                }
                return false;
            default:
                return false;
        }
    }
}