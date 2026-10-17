package com.fitness.fitnessbackend.repository;

import com.fitness.fitnessbackend.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
}
