package com.oolab.PET.service.impl;

import com.oolab.PET.enity.User;
import com.oolab.PET.exception.ResourceNotFoundException;
import com.oolab.PET.repository.UserRepository;
import com.oolab.PET.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        // Same contract as the other services: a missing id is a 404, never a null
        // that every caller has to remember to check.
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPassword(userDetails.getPassword());
        return userRepository.save(user);
    }

    @Override
    public boolean deleteUser(Long id) {
        // Keeps the boolean contract the controller relies on, so deleting an
        // unknown id stays a plain "false" rather than an exception.
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.deleteById(id);
                    return true;
                })
                .orElse(false);
    }

}
