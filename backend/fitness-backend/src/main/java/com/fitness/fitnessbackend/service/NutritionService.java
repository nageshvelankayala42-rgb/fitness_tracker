package com.fitness.fitnessbackend.service;

import com.fitness.fitnessbackend.entity.Nutrition;
import com.fitness.fitnessbackend.repository.NutritionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NutritionService {

    private final NutritionRepository nutritionRepository;

    public NutritionService(NutritionRepository nutritionRepository) {
        this.nutritionRepository = nutritionRepository;
    }

    public Nutrition saveNutrition(Nutrition nutrition) {
        return nutritionRepository.save(nutrition);
    }

    public List<Nutrition> getAllNutrition() {
        return nutritionRepository.findAll();
    }

    public Nutrition getNutritionById(Long id) {
        return nutritionRepository.findById(id).orElse(null);
    }

    public void deleteNutrition(Long id) {
        nutritionRepository.deleteById(id);
    }
}
