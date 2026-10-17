package com.fitness.fitnessbackend.controller;

import com.fitness.fitnessbackend.dto.LoginRequest;
import com.fitness.fitnessbackend.dto.PasswordChangeRequest;
import com.fitness.fitnessbackend.dto.UserResponse;
import com.fitness.fitnessbackend.entity.User;
import com.fitness.fitnessbackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        if (savedUser == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("An account with this email already exists");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponse(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        User user = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (user != null) {
            return ResponseEntity.ok(new UserResponse(user));
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return user == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(new UserResponse(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userService.updateUser(id, updatedUser);
        return user == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(new UserResponse(user));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest request) {
        if (request.getCurrentPassword() == null || request.getNewPassword() == null
                || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body("Password request is invalid");
        }

        int result = userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        if (result == 0) {
            return ResponseEntity.notFound().build();
        }
        if (result == -1) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
        }
        return ResponseEntity.ok("Password changed successfully");
    }
}