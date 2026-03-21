package com.nilecochen.fitnessapp.datatool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneralStatsDTO {

    // Total number of workouts completed this month
    private Long totalWorkoutsThisMonth;

    // Average number of workouts per week this month
    private Double averageWorkoutsPerWeek;

    // Number of distinct exercises performed this month
    private Long exerciseFrequencyThisMonth;

    // List of all exercises user has ever done with their latest date performed
    private List<ExerciseHistoryDTO> exerciseHistory;
}
