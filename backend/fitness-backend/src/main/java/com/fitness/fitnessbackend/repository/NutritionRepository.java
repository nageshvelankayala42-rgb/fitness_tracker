package com.fitness.fitnessbackend.repository;

import com.fitness.fitnessbackend.entity.Nutrition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NutritionRepository extends JpaRepository<Nutrition, Long> {
}
