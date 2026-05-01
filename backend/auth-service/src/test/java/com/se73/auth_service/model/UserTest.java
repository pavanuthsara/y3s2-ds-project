package com.se73.auth_service.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void userGettersAndSetters() {
        User user = new User();
        user.setId(1L);
        user.setUsername("test");
        user.setEmail("test@test.com");
        user.setPassword("pass");
        user.setFirstName("First");
        user.setLastName("Last");
        user.setRole(UserRole.PATIENT);

        assertEquals(1L, user.getId());
        assertEquals("test", user.getUsername());
        assertEquals("test@test.com", user.getEmail());
        assertEquals("pass", user.getPassword());
        assertEquals("First", user.getFirstName());
        assertEquals("Last", user.getLastName());
        assertEquals(UserRole.PATIENT, user.getRole());

        // Test UserDetails methods
        assertNotNull(user.getAuthorities());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());

        user.setEnabled(false);
        assertFalse(user.isEnabled());

        // Test constructor
        User user2 = new User("user2", "u2@test.com", "pass", "F", "L", UserRole.DOCTOR);
        assertEquals("user2", user2.getUsername());
    }
}
