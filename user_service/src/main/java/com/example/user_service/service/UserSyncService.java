package com.example.user_service.service;

import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.enums.RoleName;
import com.example.user_service.repos.RoleRepository;
import com.example.user_service.repos.UserRepository;
import com.example.user_service.security.KeycloakSecurityUtil;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Handles just-in-time provisioning and synchronization of local {@link User}
 * records from Keycloak JWT claims. On each authenticated request, this service
 * ensures the local database has a corresponding user row.
 */
@Service
public class UserSyncService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserSyncService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Finds or creates a local user based on the Keycloak JWT claims in the
     * given {@link Authentication}. If the user already exists (matched by
     * {@code keycloakId}), their email and name are synchronized from the JWT.
     *
     * @param authentication the current Spring Security authentication (must be a JwtAuthenticationToken)
     * @return the local {@link User} entity
     */
    @Transactional
    public User syncUser(Authentication authentication) {
        String keycloakId = KeycloakSecurityUtil.getKeycloakId(authentication);
        String email = KeycloakSecurityUtil.getEmail(authentication);
        String firstName = KeycloakSecurityUtil.getGivenName(authentication);
        String lastName = KeycloakSecurityUtil.getFamilyName(authentication);

        return userRepository.findByKeycloakId(keycloakId)
                .map(existingUser -> {
                    // Sync profile fields from Keycloak
                    boolean changed = false;
                    if (email != null && !email.equals(existingUser.getEmail())) {
                        existingUser.setEmail(email);
                        changed = true;
                    }
                    if (firstName != null && !firstName.equals(existingUser.getFirstName())) {
                        existingUser.setFirstName(firstName);
                        changed = true;
                    }
                    if (lastName != null && !lastName.equals(existingUser.getLastName())) {
                        existingUser.setLastName(lastName);
                        changed = true;
                    }
                    return changed ? userRepository.save(existingUser) : existingUser;
                })
                .orElseGet(() -> createUser(keycloakId, email, firstName, lastName));
    }

    private User createUser(String keycloakId, String email, String firstName, String lastName) {
        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(RoleName.ROLE_CUSTOMER);
                    return roleRepository.save(newRole);
                });

        User user = new User();
        user.setKeycloakId(keycloakId);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRoles(Set.of(customerRole));

        return userRepository.save(user);
    }
}
