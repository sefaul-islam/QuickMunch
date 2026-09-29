package com.example.notification_service.service;

import com.example.notification_service.dto.OrderEvent;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;

class NotificationServiceTest {

    private final NotificationService notificationService = new NotificationService();

    @Test
    void testProcessOrderCreated() {
        OrderEvent event = new OrderEvent("ORD-123", 1L, 2L, "CREATED", new BigDecimal("50.0"), "123 Main St", "ORDER_CREATED", LocalDateTime.now());
        notificationService.processOrderCreated(event);
    }

    @Test
    void testProcessOrderStatusUpdated() {
        OrderEvent event = new OrderEvent("ORD-123", 1L, 2L, "UPDATED", new BigDecimal("50.0"), "123 Main St", "ORDER_STATUS_UPDATED", LocalDateTime.now());
        notificationService.processOrderStatusUpdated(event);
    }

    @Test
    void testProcessOrderCancelled() {
        OrderEvent event = new OrderEvent("ORD-123", 1L, 2L, "CANCELLED", new BigDecimal("50.0"), "123 Main St", "ORDER_CANCELLED", LocalDateTime.now());
        notificationService.processOrderCancelled(event);
    }
}
