package com.fitness.fitnessbackend.service;

import com.fitness.fitnessbackend.entity.User;
import com.fitness.fitnessbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveUser(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return null;
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            return user;
        }

        return null;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        if (user == null) {
            return null;
        }

        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setAge(updatedUser.getAge());
        user.setGender(updatedUser.getGender());
        user.setWeight(updatedUser.getWeight());
        user.setHeight(updatedUser.getHeight());
        user.setFitnessGoal(updatedUser.getFitnessGoal());
        user.setActivityLevel(updatedUser.getActivityLevel());
        user.setPreferredWorkoutType(updatedUser.getPreferredWorkoutType());
        return userRepository.save(user);
    }

    public int changePassword(Long id, String currentPassword, String newPassword) {
        User user = getUserById(id);
        if (user == null) {
            return 0;
        }
        if (!Objects.equals(user.getPassword(), currentPassword)) {
            return -1;
        }
        user.setPassword(newPassword);
        userRepository.save(user);
        return 1;
    }
}