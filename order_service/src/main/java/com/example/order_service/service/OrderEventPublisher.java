package com.example.order_service.service;

import com.example.order_service.dto.OrderEvent;
import com.example.order_service.entity.Order;
import com.example.order_service.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.order}")
    private String orderExchange;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    @Value("${rabbitmq.routing-key.order-status-updated}")
    private String orderStatusUpdatedRoutingKey;

    @Value("${rabbitmq.routing-key.order-cancelled}")
    private String orderCancelledRoutingKey;

    public void publishOrderCreated(Order order) {
        OrderEvent event = buildEvent(order, "ORDER_CREATED");
        rabbitTemplate.convertAndSend(orderExchange, orderCreatedRoutingKey, event);
        log.info("Published ORDER_CREATED event for order: {}", order.getOrderNumber());
    }

    public void publishOrderStatusUpdated(Order order) {
        OrderEvent event = buildEvent(order, "ORDER_STATUS_UPDATED");
        rabbitTemplate.convertAndSend(orderExchange, orderStatusUpdatedRoutingKey, event);
        log.info("Published ORDER_STATUS_UPDATED event for order: {}", order.getOrderNumber());
    }

    public void publishOrderCancelled(Order order) {
        OrderEvent event = buildEvent(order, "ORDER_CANCELLED");
        rabbitTemplate.convertAndSend(orderExchange, orderCancelledRoutingKey, event);
        log.info("Published ORDER_CANCELLED event for order: {}", order.getOrderNumber());
    }

    private OrderEvent buildEvent(Order order, String eventType) {
        return new OrderEvent(
                order.getOrderNumber(),
                order.getUserId(),
                order.getRestaurantId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                eventType,
                LocalDateTime.now()
        );
    }
}
