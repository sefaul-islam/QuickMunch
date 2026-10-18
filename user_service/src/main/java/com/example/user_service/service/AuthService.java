package com.example.user_service.service;

import com.example.user_service.auth.CustomUserDetails;
import com.example.user_service.dto.AuthResponseDTO;
import com.example.user_service.dto.LoginRequestDTO;
import com.example.user_service.dto.RegisterRequestDTO;
import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.enums.RoleName;
import com.example.user_service.exception.BadCredentialsException;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.exception.DuplicateResourceException;
import com.example.user_service.repos.RoleRepository;
import com.example.user_service.repos.UserRepository;
import com.example.user_service.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new DuplicateResourceException("Email already exists: " + dto.email());
        }

        User user = new User();
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setPhoneNumber(dto.phoneNumber());

        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(RoleName.ROLE_CUSTOMER);
                    return roleRepository.save(newRole);
                });

        user.setRoles(Set.of(customerRole));

        User savedUser = userRepository.save(user);

        Set<String> roles = savedUser.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());

        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), roles);
        String refreshToken = jwtService.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResponseDTO(token, savedUser.getId(), savedUser.getEmail(), roles, refreshToken);
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            Set<String> roles = userDetails.getAuthorities().stream()
                    .map(a -> a.getAuthority())
                    .collect(Collectors.toSet());

            String token = jwtService.generateToken(userDetails.getUserId(), userDetails.getEmail(), roles);
            String refreshToken = jwtService.generateRefreshToken(userDetails.getUserId(), userDetails.getEmail());

            return new AuthResponseDTO(token, userDetails.getUserId(), userDetails.getEmail(), roles, refreshToken);
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    @Transactional
    public void changePassword(Long userId, com.example.user_service.dto.ChangePasswordRequestDTO dto) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getPassword() == null) {
            throw new BadCredentialsException("This account uses Google login and has no password to change");
        }
        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO refreshToken(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        Long userId = jwtService.extractUserId(refreshToken);
        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());
        String newAccessToken = jwtService.generateToken(userId, email, roles);
        String newRefreshToken = jwtService.generateRefreshToken(userId, email);
        return new AuthResponseDTO(newAccessToken, userId, email, roles, newRefreshToken);
    }
}
