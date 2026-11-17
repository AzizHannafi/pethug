package com.oolab.PET.service;

import com.oolab.PET.enity.User;
import com.oolab.PET.repository.UserRepository;
import com.oolab.PET.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(SpringExtension.class)
class UserServiceImplTest {

//    @MockBean
//    private UserRepository userRepository;
//
//
//    @TestConfiguration
//    static class UserServiceConfig{
//        @Bean
//        public UserService userService() {
//            return new UserServiceImpl();
//        }
//    }

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("John", "Doe", "john.doe@example.com");
        user.setIdPerson(1L);
    }

    @Test
    void createUser_shouldReturnSavedUser() {
        when(userRepository.save(any(User.class))).thenReturn(user);
        User created = userService.createUser(new User("x","y","z"));
        assertNotNull(created);
        assertEquals(1L, created.getIdPerson());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getUserById_whenFound_shouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        User found = userService.getUserById(1L);
        assertEquals("John", found.getFirstName());
    }

    @Test
    void getUserById_whenNotFound_shouldThrow() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.getUserById(2L));
        assertTrue(ex.getMessage().contains("User not found"));
    }

    @Test
    void getAllUsers_shouldReturnList() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(user));
        List<User> list = userService.getAllUsers();
        assertFalse(list.isEmpty());
        verify(userRepository).findAll();
    }

    @Test
    void updateUser_shouldModifyAndReturn() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User details = new User("Jane","Smith","jane.smith@example.com");
        User updated = userService.updateUser(1L, details);

        assertEquals("Jane", updated.getFirstName());
        assertEquals("Smith", updated.getLastName());
        verify(userRepository).save(user);
    }

    @Test
    void deleteUser_shouldInvokeDelete() {
        // The service only deletes a user it could find first, so the lookup has
        // to be stubbed as well - otherwise the mock reports "no such user".
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(userRepository).deleteById(1L);

        assertTrue(userService.deleteUser(1L));

        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_whenNotFound_shouldReturnFalseAndNotDelete() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertFalse(userService.deleteUser(2L));

        verify(userRepository, never()).deleteById(anyLong());
    }
}