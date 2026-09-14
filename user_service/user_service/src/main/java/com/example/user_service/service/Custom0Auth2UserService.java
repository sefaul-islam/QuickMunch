package com.example.user_service.service;

import com.example.user_service.entity.User;
import com.example.user_service.repos.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class Custom0Auth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    public Custom0Auth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User googleUser = super.loadUser(userRequest);

        String googleId = googleUser.getAttribute("sub");
        String email = googleUser.getAttribute("email");
        String name = googleUser.getAttribute("name");
        String picture = googleUser.getAttribute("picture");

        String firstName = null;
        String lastName = null;
        if (name != null) {
            String[] parts = name.trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String fName = firstName;
        String lName = lastName;

        User user = userRepository
                .findByGoogleId(googleId)
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setGoogleId(googleId);
                    newUser.setEmail(email);
                    newUser.setFirstName(fName);
                    newUser.setLastName(lName);
                    newUser.setProfilePictureUrl(picture);

                    return userRepository.save(newUser);
                });

        return googleUser;
    }
}
