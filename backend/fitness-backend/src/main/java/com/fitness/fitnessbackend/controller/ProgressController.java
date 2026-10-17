package com.fitness.fitnessbackend.controller;

import com.fitness.fitnessbackend.entity.Progress;
import com.fitness.fitnessbackend.service.ProgressService;
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
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    public Progress createProgress(@RequestBody Progress progress) {
        return progressService.saveProgress(progress);
    }

    @GetMapping
    public List<Progress> getAllProgress() {
        return progressService.getAllProgress();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Progress> getProgressById(@PathVariable Long id) {
        Progress progress = progressService.getProgressById(id);

        if (progress == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(progress);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable Long id) {
        Progress progress = progressService.getProgressById(id);

        if (progress == null) {
            return ResponseEntity.notFound().build();
        }

        progressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }
}
