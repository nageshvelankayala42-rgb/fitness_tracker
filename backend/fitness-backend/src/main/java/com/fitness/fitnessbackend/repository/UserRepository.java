package com.fitness.fitnessbackend.repository;

import com.fitness.fitnessbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

	User findByEmail(String email);
}