package com.example.user_service.service;

import com.example.user_service.dto.AddressRequestDTO;
import com.example.user_service.dto.AddressResponseDTO;
import com.example.user_service.entity.Address;
import com.example.user_service.entity.User;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.exception.UnauthorizedException;
import com.example.user_service.repos.AddressRepository;
import com.example.user_service.repos.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository,
                          UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all addresses for a user.
     * Single query: SELECT * FROM addresses WHERE user_id = ?
     */
    @Transactional(readOnly = true)
    public List<AddressResponseDTO> getAddressesByUserId(Long userId,
                                                         String authenticatedEmail) {
        User user = findActiveUserOrThrow(userId);
        assertOwner(user, authenticatedEmail);

        // Direct query on addresses table — no N+1
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Get a single address by addressId scoped to userId.
     * Single query: SELECT * FROM addresses WHERE id = ? AND user_id = ?
     */
    @Transactional(readOnly = true)
    public AddressResponseDTO getAddress(Long userId, Long addressId,
                                          String authenticatedEmail) {
        User user = findActiveUserOrThrow(userId);
        assertOwner(user, authenticatedEmail);

        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with id: " + addressId));

        return mapToDto(address);
    }

    /**
     * Create a new address for a user.
     * Queries: 1 SELECT user, 1 INSERT address
     */
    @Transactional
    public AddressResponseDTO createAddress(Long userId,
                                             AddressRequestDTO dto,
                                             String authenticatedEmail) {
        User user = findActiveUserOrThrow(userId);
        assertOwner(user, authenticatedEmail);

        Address address = Address.builder()
                .label(dto.label())
                .street(dto.street())
                .city(dto.city())
                .state(dto.state())
                .zipCode(dto.zipCode())
                .country(dto.country())
                .user(user)
                .build();

        Address saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    /**
     * Update an existing address.
     * Queries: 1 SELECT user, 1 SELECT address (by id + user_id), 1 UPDATE
     */
    @Transactional
    public AddressResponseDTO updateAddress(Long userId, Long addressId,
                                             AddressRequestDTO dto,
                                             String authenticatedEmail) {
        User user = findActiveUserOrThrow(userId);
        assertOwner(user, authenticatedEmail);

        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with id: " + addressId));

        address.setLabel(dto.label());
        address.setStreet(dto.street());
        address.setCity(dto.city());
        address.setState(dto.state());
        address.setZipCode(dto.zipCode());
        address.setCountry(dto.country());

        Address saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    /**
     * Delete an address (hard delete).
     * Queries: 1 SELECT user, 1 SELECT address (by id + user_id), 1 DELETE
     */
    @Transactional
    public void deleteAddress(Long userId, Long addressId,
                               String authenticatedEmail) {
        User user = findActiveUserOrThrow(userId);
        assertOwner(user, authenticatedEmail);

        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with id: " + addressId));

        addressRepository.delete(address);
    }

    // ── Helpers ──────────────────────────────────────────────

    private User findActiveUserOrThrow(Long userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));
    }

    private void assertOwner(User user, String authenticatedEmail) {
        if (!user.getEmail().equals(authenticatedEmail)) {
            throw new UnauthorizedException(
                    "You are not authorized to manage this user's addresses");
        }
    }

    private AddressResponseDTO mapToDto(Address address) {
        return new AddressResponseDTO(
                address.getId(),
                address.getLabel(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry()
        );
    }
}

