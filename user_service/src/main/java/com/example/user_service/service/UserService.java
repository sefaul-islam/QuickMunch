package com.example.user_service.service;

import com.example.user_service.dto.AddressResponseDTO;
import com.example.user_service.dto.UpdateUserRequestDTO;
import com.example.user_service.dto.UserProfileResponseDTO;
import com.example.user_service.entity.User;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.exception.UnauthorizedException;
import com.example.user_service.repos.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponseDTO getUserById(Long id) {
        User user = userRepository.findByIdWithAddresses(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        return mapToDto(user);
    }

    @Transactional
    public UserProfileResponseDTO updateUser(Long id,
                                              UpdateUserRequestDTO dto,
                                              String authenticatedEmail) {

        User user = userRepository.findByIdWithAddresses(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        if (!user.getEmail().equals(authenticatedEmail)) {
            throw new UnauthorizedException(
                    "You are not authorized to update this user's profile");
        }

        // Partial update: only apply non-null fields
        if (dto.firstName() != null) {
            user.setFirstName(dto.firstName());
        }
        if (dto.lastName() != null) {
            user.setLastName(dto.lastName());
        }
        if (dto.phoneNumber() != null) {
            user.setPhoneNumber(dto.phoneNumber());
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Transactional
    public void deleteUser(Long id, String authenticatedEmail) {

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        if (!user.getEmail().equals(authenticatedEmail)) {
            throw new UnauthorizedException(
                    "You are not authorized to delete this user's profile");
        }

        // Soft delete
        user.setIsActive(false);
        userRepository.save(user);
    }

    private UserProfileResponseDTO mapToDto(User user) {
        return new UserProfileResponseDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddresses().stream()
                        .map(addr -> new AddressResponseDTO(
                                addr.getId(),
                                addr.getLabel(),
                                addr.getStreet(),
                                addr.getCity(),
                                addr.getState(),
                                addr.getZipCode(),
                                addr.getCountry()
                        ))
                        .collect(Collectors.toList()),
                user.getProfilePictureUrl(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet())
        );
    }
}
