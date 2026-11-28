package com.example.order_service.repository;

import com.example.order_service.entity.DeliveryAddress;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EntityManager entityManager;

    private Statistics statistics;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        entityManager.flush();
        entityManager.clear();

        SessionFactory sessionFactory = entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);
        statistics = sessionFactory.getStatistics();
        statistics.setStatisticsEnabled(true);
    }

    @Test
    @DisplayName("findByUserIdOrderByCreatedAtDesc fetches orders and items in one SQL query")
    void findByUserId_fetchesOrdersAndItemsWithoutNPlusOne() {
        for (int i = 1; i <= 3; i++) {
            Order order = Order.builder()
                    .orderNumber("QM-ORDER-" + i)
                    .userId("kc-user-1")
                    .restaurantId(10L)
                    .status(OrderStatus.PENDING)
                    .paymentStatus(PaymentStatus.PENDING)
                    .subtotal(new BigDecimal("25.00"))
                    .deliveryFee(new BigDecimal("2.99"))
                    .totalAmount(new BigDecimal("27.99"))
                    .deliveryAddress(DeliveryAddress.builder()
                            .street("123 Main St")
                            .city("Dhaka")
                            .postalCode("1200")
                            .recipientPhoneNumber("01700000000")
                            .build())
                    .build();
            order.getItems().add(OrderItem.builder()
                    .order(order).foodItemId((long) (i * 10 + 1)).quantity(1)
                    .unitPrice(new BigDecimal("10.00")).subtotal(new BigDecimal("10.00"))
                    .build());
            order.getItems().add(OrderItem.builder()
                    .order(order).foodItemId((long) (i * 10 + 2)).quantity(1)
                    .unitPrice(new BigDecimal("15.00")).subtotal(new BigDecimal("15.00"))
                    .build());
            orderRepository.save(order);
        }
        entityManager.flush();
        entityManager.clear();

        statistics.clear();

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc("kc-user-1");
        assertEquals(3, orders.size());
        int totalItems = orders.stream().mapToInt(o -> o.getItems().size()).sum();
        assertEquals(6, totalItems);

        assertEquals(1L, statistics.getPrepareStatementCount());
    }
}
