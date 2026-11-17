package com.oolab.PET.controller;

import com.google.common.base.Preconditions;
import com.oolab.PET.enity.User;
import com.oolab.PET.model.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import com.oolab.PET.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/users")
// The whole user directory is an administration feature.
@PreAuthorize("hasRole('client_admin')")
@SecurityRequirement(name = "keycloak")
public class UserController {

    @Autowired
    private UserService userService;


    @GetMapping
    public ApiResponse<List<User>> getAllUsers(){
        return new ApiResponse<List<User>>(HttpStatus.OK.value(), "List fetched successfully", userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        return new ApiResponse<User>(HttpStatus.OK.value(), "User fetched successfully", userService.getUserById(id));

    }

    @PostMapping()
    public ApiResponse<User> createUser(@RequestBody User u){
        Preconditions.checkNotNull(u);
        return new ApiResponse<User>(HttpStatus.OK.value(), "User created successfully", userService.createUser(u));
    }

    @PutMapping("/{id}")
    public ApiResponse<User> updateUserEntity(@PathVariable("id") Long id, @RequestBody User u){
        Preconditions.checkNotNull(u);
        Preconditions.checkNotNull(id);
        User user = userService.getUserById(id);
        if(Objects.isNull(user))
            return new ApiResponse<User>(HttpStatus.NOT_FOUND.value(), "User with username "+id+" not found", null);
        return
                new ApiResponse<User>(
                        HttpStatus.OK.value(), "User updated successfully", userService.updateUser(id, u));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deteleUserEntity(@PathVariable Long id){
        if (userService.deleteUser(id)) {
            return new ApiResponse<Void>(HttpStatus.OK.value(), "User deteleted successfully", null);
        } else {
            return new ApiResponse<Void>(HttpStatus.NOT_FOUND.value(), "User with username "+id+" not found", null);

        }


    }
}
