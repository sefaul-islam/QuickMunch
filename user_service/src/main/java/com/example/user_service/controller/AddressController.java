package com.example.user_service.controller;

import com.example.user_service.dto.AddressRequestDTO;
import com.example.user_service.dto.AddressResponseDTO;
import com.example.user_service.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAddresses(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal OidcUser oidcUser) {

        List<AddressResponseDTO> addresses =
                addressService.getAddressesByUserId(userId, oidcUser.getEmail());
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponseDTO> getAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @AuthenticationPrincipal OidcUser oidcUser) {

        AddressResponseDTO address =
                addressService.getAddress(userId, addressId, oidcUser.getEmail());
        return ResponseEntity.ok(address);
    }

    @PostMapping
    public ResponseEntity<AddressResponseDTO> createAddress(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody AddressRequestDTO dto,
            @AuthenticationPrincipal OidcUser oidcUser) {

        AddressResponseDTO created =
                addressService.createAddress(userId, dto, oidcUser.getEmail());

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{addressId}")
                .buildAndExpand(created.id())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @Valid @RequestBody AddressRequestDTO dto,
            @AuthenticationPrincipal OidcUser oidcUser) {

        AddressResponseDTO updated = addressService.updateAddress(
                userId, addressId, dto, oidcUser.getEmail());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @AuthenticationPrincipal OidcUser oidcUser) {

        addressService.deleteAddress(userId, addressId, oidcUser.getEmail());
        return ResponseEntity.noContent().build();
    }
}

