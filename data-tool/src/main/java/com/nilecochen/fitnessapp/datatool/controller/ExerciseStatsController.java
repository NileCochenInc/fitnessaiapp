package com.nilecochen.fitnessapp.datatool.controller;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseStatsDTO;
import com.nilecochen.fitnessapp.datatool.service.ExerciseQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/exercise-stats")
public class ExerciseStatsController {

    private final ExerciseQueryService exerciseQueryService;

    public ExerciseStatsController(ExerciseQueryService exerciseQueryService) {
        this.exerciseQueryService = exerciseQueryService;
    }

    /**
     * GET /api/exercise-stats/{userId}/{exerciseId}
     * Returns specific statistics for an exercise this month for a user:
     * - Frequency (times performed)
     * - Max metrics (for each metric type available)
     */
    @GetMapping("/{userId}/{exerciseId}")
    public ExerciseStatsDTO getExerciseStats(@PathVariable Long userId, @PathVariable Long exerciseId) {
        return exerciseQueryService.getExerciseStats(userId, exerciseId);
    }
}
