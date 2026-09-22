package com.example.user_service.service;

import com.example.user_service.entity.Role;
import com.example.user_service.entity.User;
import com.example.user_service.enums.RoleName;
import com.example.user_service.repos.RoleRepository;
import com.example.user_service.repos.UserRepository;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class Custom0Auth2UserService extends OidcUserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public Custom0Auth2UserService(UserRepository userRepository,
                                   RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest)
            throws OAuth2AuthenticationException {

        OidcUser oidcUser = super.loadUser(userRequest);

        String googleId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        String firstName = null;
        String lastName = null;
        if (name != null) {
            String[] parts = name.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String fName = firstName;
        String lName = lastName;

        userRepository
                .findByGoogleId(googleId)
                .orElseGet(() -> {

                    Role customerRole = roleRepository
                            .findByName(RoleName.ROLE_CUSTOMER)
                            .orElseGet(() -> {
                                Role newRole = new Role();
                                newRole.setName(RoleName.ROLE_CUSTOMER);
                                return roleRepository.save(newRole);
                            });

                    User newUser = new User();

                    newUser.setGoogleId(googleId);
                    newUser.setEmail(email);
                    newUser.setFirstName(fName);
                    newUser.setLastName(lName);
                    newUser.setProfilePictureUrl(picture);
                    newUser.setRoles(Set.of(customerRole));

                    return userRepository.save(newUser);
                });

        return oidcUser;
    }
}

