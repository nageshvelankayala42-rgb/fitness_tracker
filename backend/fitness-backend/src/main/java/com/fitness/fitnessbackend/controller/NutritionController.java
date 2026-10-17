package com.fitness.fitnessbackend.controller;

import com.fitness.fitnessbackend.entity.Nutrition;
import com.fitness.fitnessbackend.service.NutritionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @PostMapping
    public Nutrition createNutrition(@RequestBody Nutrition nutrition) {
        return nutritionService.saveNutrition(nutrition);
    }

    @GetMapping
    public List<Nutrition> getAllNutrition() {
        return nutritionService.getAllNutrition();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Nutrition> getNutritionById(@PathVariable Long id) {
        Nutrition nutrition = nutritionService.getNutritionById(id);

        if (nutrition == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(nutrition);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNutrition(@PathVariable Long id) {
        nutritionService.deleteNutrition(id);
        return ResponseEntity.noContent().build();
    }
}
