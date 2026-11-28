package com.example.order_service.repository;

import com.example.order_service.entity.Cart;
import com.example.order_service.entity.CartItem;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class CartRepositoryTest {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private EntityManager entityManager;

    private Statistics statistics;

    @BeforeEach
    void setUp() {
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        entityManager.flush();
        entityManager.clear();

        SessionFactory sessionFactory = entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);
        statistics = sessionFactory.getStatistics();
        statistics.setStatisticsEnabled(true);
    }

    @Test
    @DisplayName("findWithItemsByUserId fetches cart and all items in a single SQL query without N+1")
    void findWithItemsByUserId_fetchesInSingleQuery() {
        Cart cart = Cart.builder()
                .userId("kc-user-1")
                .restaurantId(10L)
                .build();
        cart.getItems().add(CartItem.builder().cart(cart).foodItemId(101L).quantity(2).build());
        cart.getItems().add(CartItem.builder().cart(cart).foodItemId(102L).quantity(1).build());
        cart.getItems().add(CartItem.builder().cart(cart).foodItemId(103L).quantity(4).build());
        cartRepository.saveAndFlush(cart);
        entityManager.clear();

        statistics.clear();

        Optional<Cart> loadedOpt = cartRepository.findWithItemsByUserId("kc-user-1");
        assertTrue(loadedOpt.isPresent());
        Cart loaded = loadedOpt.get();
        assertEquals(3, loaded.getItems().size());
        assertEquals(7, loaded.getItems().stream().mapToInt(CartItem::getQuantity).sum());

        assertEquals(1L, statistics.getPrepareStatementCount());
    }

    @Test
    @DisplayName("Bulk delete removes all items and cart in two SQL statements regardless of item count")
    void bulkDelete_executesTwoStatements() {
        Cart cart = Cart.builder()
                .userId("kc-user-2")
                .restaurantId(20L)
                .build();
        cart.getItems().add(CartItem.builder().cart(cart).foodItemId(201L).quantity(1).build());
        cart.getItems().add(CartItem.builder().cart(cart).foodItemId(202L).quantity(3).build());
        cart.getItems().add(CartItem.builder().cart(cart).foodItemId(203L).quantity(2).build());
        Cart saved = cartRepository.saveAndFlush(cart);
        entityManager.clear();

        statistics.clear();

        int deletedItems = cartItemRepository.deleteAllByCartId(saved.getId());
        int deletedCarts = cartRepository.deleteCartById(saved.getId());

        assertEquals(3, deletedItems);
        assertEquals(1, deletedCarts);
        assertEquals(2L, statistics.getPrepareStatementCount());
        assertTrue(cartRepository.findByUserId("kc-user-2").isEmpty());
    }
}
