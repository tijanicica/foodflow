package com.iis.foodflow.service;

import com.iis.foodflow.enums.DayOfMonth;
import com.iis.foodflow.enums.OrderStatus;
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

import java.time.DayOfWeek; // <-- VAŽNO: Importujte ugrađeni Java enum

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

    /**
     * Glavna metoda koja se pokreće periodično. Koristimo cron izraz za "svakog minuta".
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processPendingOrders() {
        processScheduledOrders();
        processRepeatingOrders();
    }

    /**
     * Pronalazi sve zakazane porudžbine (SCHEDULED_PENDING) i aktivira ih
     * tako što im menja status u CREATED.
     * Porudžbine se aktiviraju sat vremena pre zakazanog vremena isporuke.
     */
    private void processScheduledOrders() {
        LocalDateTime activationTime = LocalDateTime.now().plusHours(1);
        List<Order> ordersToActivate = orderRepository.findByStatusAndScheduledForBefore(
                OrderStatus.SCHEDULED_PENDING, activationTime
        );

        for (Order order : ordersToActivate) {
            order.setStatus(OrderStatus.CREATED);

            // Ako je za ovu zakazanu porudžbinu bio vezan kupon, sada ga označavamo kao iskorišćenog.
            Coupon coupon = order.getUsedCoupon();
            if (coupon != null && !coupon.isUsed()) {
                coupon.setUsed(true);
                coupon.setUsageDate(LocalDateTime.now());
                // Nema potrebe za save(coupon) jer je Order vlasnik veze i cascade će odraditi posao.
            }

            // Ovde se može dodati logika za slanje notifikacije restoranu.

            orderRepository.save(order);
        }
    }

    /**
     * Pronalazi sve aktivne šablone za ponavljajuće porudžbine i kreira nove
     * porudžbine ako je danas dan za isporuku.
     */
    private void processRepeatingOrders() {
        LocalDate today = LocalDate.now();
        List<RepeatingOrder> activeTemplates = repeatingOrderRepository.findAllByActiveTrueAndRepeatUntilAfterOrRepeatUntilIsNull(today);

        for (RepeatingOrder template : activeTemplates) {
            if (isDeliveryDay(template, today) && !orderRepository.existsByRepeatingOrderAndCreationDateBetween(template, today.atStartOfDay(), today.plusDays(1).atStartOfDay())) {
                createNewOrderFromTemplate(template);
            }
        }
    }

    /**
     * Pomoćna metoda za kreiranje nove instance porudžbine na osnovu šablona.
     * @param template Šablon za ponavljajuću porudžbinu.
     */
    private void createNewOrderFromTemplate(RepeatingOrder template) {
        Order templateOrder = template.getOrder();

        Order newInstance = new Order();

        // 1. Kopiraj osnovne podatke
        newInstance.setCustomer(templateOrder.getCustomer());
        newInstance.setPaymentType(templateOrder.getPaymentType());
        newInstance.setCardAmount(templateOrder.getCardAmount());
        newInstance.setCashAmount(templateOrder.getCashAmount());
        newInstance.setNoteForDriver(templateOrder.getNoteForDriver());
        newInstance.setNoteForRestaurant(templateOrder.getNoteForRestaurant());
        newInstance.setRepeatingOrder(template); // Poveži sa šablonom
        newInstance.setOrderType(templateOrder.getOrderType());
        newInstance.setCreationDate(LocalDateTime.now());
        newInstance.setStatus(OrderStatus.CREATED); // Odmah je spremna za restoran

        // 2. Rekreiraj stavke porudžbine (ovo je ključno)
        Set<OrderItem> newItems = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem templateItem : templateOrder.getOrderItems()) {
            OrderItem newItem = new OrderItem();
            newItem.setOrder(newInstance);
            newItem.setMenuItemVersion(templateItem.getMenuItemVersion()); // Cene se mogu promeniti, uzimamo trenutnu
            newItem.setQuantity(templateItem.getQuantity());
            newItems.add(newItem);

            // Ponovo izračunaj subtotal jer se cena stavke mogla promeniti od kreiranja šablona
            subtotal = subtotal.add(newItem.getMenuItemVersion().getPrice().multiply(new BigDecimal(newItem.getQuantity())));
        }
        newInstance.setOrderItems(newItems);

        // 3. Izračunaj ukupnu cenu. Kupon se NIKADA ne primenjuje na ponovljene porudžbine.
        newInstance.setDeliveryPrice(templateOrder.getDeliveryPrice()); // Pretpostavljamo da je cena dostave ista
        newInstance.setTotalPrice(subtotal.add(newInstance.getDeliveryPrice()));

        orderRepository.save(newInstance);
    }

    /**
     * Proverava da li je danas dan za isporuku na osnovu pravila iz šablona.
     */
    private boolean isDeliveryDay(RepeatingOrder template, LocalDate date) {
        switch (template.getRepeatType()) {
            case WEEKLY:
                return date.getDayOfWeek().name().equals(template.getDayOfWeek().name());
            case MONTHLY:
                if (template.getDayOfMonth() == DayOfMonth.FIRST) {
                    return date.isEqual(date.with(TemporalAdjusters.firstDayOfMonth()));
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