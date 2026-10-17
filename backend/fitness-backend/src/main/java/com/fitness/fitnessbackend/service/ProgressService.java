package com.fitness.fitnessbackend.service;

import com.fitness.fitnessbackend.entity.Progress;
import com.fitness.fitnessbackend.repository.ProgressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public Progress saveProgress(Progress progress) {
        return progressRepository.save(progress);
    }

    public List<Progress> getAllProgress() {
        return progressRepository.findAll();
    }

    public Progress getProgressById(Long id) {
        return progressRepository.findById(id).orElse(null);
    }

    public void deleteProgress(Long id) {
        progressRepository.deleteById(id);
    }
}
