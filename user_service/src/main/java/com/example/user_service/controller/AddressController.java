package com.example.user_service.controller;

import com.example.user_service.dto.AddressRequestDTO;
import com.example.user_service.dto.AddressResponseDTO;
import com.example.user_service.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    public ResponseEntity<AddressResponseDTO> addAddress(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody AddressRequestDTO requestDTO,
            Authentication authentication) {
        String authenticatedEmail = (String) authentication.getCredentials();
        AddressResponseDTO address = addressService.addAddress(
                userId, requestDTO, authenticatedEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(address);
    }

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAddresses(
            @PathVariable("userId") Long userId) {
        List<AddressResponseDTO> addresses = addressService.getAddressesByUserId(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponseDTO> getAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId) {
        AddressResponseDTO address = addressService.getAddressById(userId, addressId);
        return ResponseEntity.ok(address);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @Valid @RequestBody AddressRequestDTO requestDTO,
            Authentication authentication) {
        String authenticatedEmail = (String) authentication.getCredentials();
        AddressResponseDTO address = addressService.updateAddress(
                userId, addressId, requestDTO, authenticatedEmail);
        return ResponseEntity.ok(address);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            Authentication authentication) {
        String authenticatedEmail = (String) authentication.getCredentials();
        addressService.deleteAddress(userId, addressId, authenticatedEmail);
        return ResponseEntity.noContent().build();
    }
}
