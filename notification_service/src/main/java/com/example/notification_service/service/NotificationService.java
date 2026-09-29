package com.example.notification_service.service;

import com.example.notification_service.dto.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    public void processOrderCreated(OrderEvent event) {
        log.info("=== NEW ORDER NOTIFICATION ===");
        log.info("Order Number: {}", event.orderNumber());
        log.info("User ID: {}", event.userId());
        log.info("Restaurant ID: {}", event.restaurantId());
        log.info("Total Amount: ${}", event.totalAmount());
        log.info("Delivery Address: {}", event.deliveryAddress());
        log.info("Status: {}", event.status());
        // TODO: Send actual email/SMS/push notification
    }

    public void processOrderStatusUpdated(OrderEvent event) {
        log.info("=== ORDER STATUS UPDATE NOTIFICATION ===");
        log.info("Order Number: {}", event.orderNumber());
        log.info("New Status: {}", event.status());
        log.info("User ID: {}", event.userId());
        // TODO: Send status update notification to customer
    }

    public void processOrderCancelled(OrderEvent event) {
        log.info("=== ORDER CANCELLED NOTIFICATION ===");
        log.info("Order Number: {}", event.orderNumber());
        log.info("User ID: {}", event.userId());
        log.info("Restaurant ID: {}", event.restaurantId());
        log.info("Refund Amount: ${}", event.totalAmount());
        // TODO: Send cancellation notification to customer and restaurant
    }
}
