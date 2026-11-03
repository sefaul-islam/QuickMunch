package com.example.order_service.service;

import com.example.order_service.dto.CreateOrderDTO;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import com.example.order_service.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderPersistenceService {

    private final OrderRepository orderRepository;
    private final BigDecimal defaultDeliveryFee;


    @Transactional
    public Order saveOrder(
            Long userId,
            CreateOrderDTO dto,
            BigDecimal subtotal,
            List<OrderItem> orderItems
    ) {

        Order order = Order.builder()
                .orderNumber("QM-" + UUID.randomUUID())
                .userId(userId)
                .restaurantId(dto.restaurantId())
                .deliveryAddressId(dto.deliveryAddressId())
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .deliveryFee(defaultDeliveryFee)
                .totalAmount(subtotal.add(defaultDeliveryFee))
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        return orderRepository.save(order);
    }
}
