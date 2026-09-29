package com.example.notification_service.listener;

import com.example.notification_service.dto.OrderEvent;
import com.example.notification_service.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderEventListener orderEventListener;

    @Test
    void testHandleOrderCreated() {
        OrderEvent event = new OrderEvent("ORD-123", 1L, 2L, "CREATED", new BigDecimal("50.0"), "123 Main St", "ORDER_CREATED", LocalDateTime.now());
        orderEventListener.handleOrderCreated(event);
        verify(notificationService).processOrderCreated(event);
    }

    @Test
    void testHandleOrderStatusUpdated() {
        OrderEvent event = new OrderEvent("ORD-123", 1L, 2L, "UPDATED", new BigDecimal("50.0"), "123 Main St", "ORDER_STATUS_UPDATED", LocalDateTime.now());
        orderEventListener.handleOrderStatusUpdated(event);
        verify(notificationService).processOrderStatusUpdated(event);
    }

    @Test
    void testHandleOrderCancelled() {
        OrderEvent event = new OrderEvent("ORD-123", 1L, 2L, "CANCELLED", new BigDecimal("50.0"), "123 Main St", "ORDER_CANCELLED", LocalDateTime.now());
        orderEventListener.handleOrderCancelled(event);
        verify(notificationService).processOrderCancelled(event);
    }
}
