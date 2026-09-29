package com.example.notification_service.listener;

import com.example.notification_service.dto.OrderEvent;
import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "${rabbitmq.queue.order-created}")
    public void handleOrderCreated(OrderEvent event) {
        log.info("Received ORDER_CREATED event for order: {}", event.orderNumber());
        notificationService.processOrderCreated(event);
    }

    @RabbitListener(queues = "${rabbitmq.queue.order-status-updated}")
    public void handleOrderStatusUpdated(OrderEvent event) {
        log.info("Received ORDER_STATUS_UPDATED event for order: {}", event.orderNumber());
        notificationService.processOrderStatusUpdated(event);
    }

    @RabbitListener(queues = "${rabbitmq.queue.order-cancelled}")
    public void handleOrderCancelled(OrderEvent event) {
        log.info("Received ORDER_CANCELLED event for order: {}", event.orderNumber());
        notificationService.processOrderCancelled(event);
    }
}
