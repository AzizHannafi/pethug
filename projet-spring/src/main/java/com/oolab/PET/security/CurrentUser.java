package com.oolab.PET.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Who is calling, and what they are allowed to touch.
 *
 * Ownership is always read from the token, never from the request body: a client
 * cannot claim to be someone else by posting a different ownerId.
 */
@Component
public class CurrentUser {

    public static final String ROLE_ADMIN = "ROLE_client_admin";

    private Authentication authentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /** Keycloak user id (the token subject), or null when nobody is signed in. */
    public String id() {
        Authentication authentication = authentication();
        return authentication == null ? null : authentication.getName();
    }

    /** Human readable name for display, falling back to the id. */
    public String displayName() {
        Authentication authentication = authentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {
            Jwt token = jwtAuthentication.getToken();
            String name = token.getClaimAsString("name");
            if (name == null || name.isBlank()) {
                name = token.getClaimAsString("preferred_username");
            }
            if (name != null && !name.isBlank()) {
                return name;
            }
        }
        return id();
    }

    public boolean isAdmin() {
        Authentication authentication = authentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> ROLE_ADMIN.equals(authority.getAuthority()));
    }

    public boolean owns(String ownerId) {
        String me = id();
        return me != null && me.equals(ownerId);
    }

    /**
     * Administrators may manage anything; everybody else only what they own.
     * Throws AccessDeniedException, which Spring Security turns into a 403.
     */
    public void assertCanManage(String ownerId, String what) {
        if (isAdmin() || owns(ownerId)) {
            return;
        }
        throw new AccessDeniedException("You can only manage your own " + what + ".");
    }
}
