package com.example.notification_service.service;

import com.example.notification_service.dto.OrderEvent;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    private final EmailService emailService;

    public NotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void processOrderCreated(OrderEvent event) {
        log.info("=== NEW ORDER NOTIFICATION ===");
        log.info("Order Number: {}", event.orderNumber());
        log.info("User ID: {}", event.userId());
        log.info("Restaurant ID: {}", event.restaurantId());
        log.info("User Email: {}", event.email());
        log.info("Total Amount: ${}", event.totalAmount());
        log.info("Delivery Address: {}", event.deliveryAddress());
        log.info("Status: {}", event.status());
        String subject = "QuickMunch Order Confirmed - " + event.orderNumber();

        String body = """
            Hello,

            Thank you for ordering from QuickMunch!

            Your order has been successfully created.

            Order Details
            -------------
            Order Number: %s
            Restaurant ID: %s
            Status: %s
            Total Amount: %s
            Delivery Address: %s

            We will notify you when your order status changes.

            Thank you for using QuickMunch!

            QuickMunch Team
            """.formatted(
                event.orderNumber(),
                event.restaurantId(),
                event.status(),
                event.totalAmount(),
                event.deliveryAddress()
        );

        emailService.sendEmail(
                event.email(),
                subject,
                body
        );
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
