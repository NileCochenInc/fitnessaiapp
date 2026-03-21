package com.nilecochen.fitnessapp.datatool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseStatsDTO {

    // Exercise ID
    private Long exerciseId;

    // Exercise name
    private String exerciseName;

    // Number of times this exercise was performed this month
    private Long frequencyThisMonth;

    // Map of metric name to maximum recorded value for this exercise this month
    // Example: { "weight": 225.0, "reps": 15.0 }
    private Map<String, Double> maxMetrics;
}
