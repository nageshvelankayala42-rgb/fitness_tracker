package com.fitness.fitnessbackend.repository;

import com.fitness.fitnessbackend.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
}
