package com.nilecochen.fitnessapp.datatool.service;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseHistoryDTO;
import com.nilecochen.fitnessapp.datatool.dto.GeneralStatsDTO;
import com.nilecochen.fitnessapp.datatool.repository.WorkoutRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeneralUserQueryService {

    private final WorkoutRepository workoutRepository;

    public GeneralUserQueryService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    /**
     * Get the current month start and end dates
     */
    private LocalDate[] getCurrentMonthDateRange() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();
        return new LocalDate[]{startDate, endDate};
    }

    /**
     * Get total workouts for a user this month
     */
    public Long getTotalWorkoutsThisMonth(Long userId) {
        LocalDate[] dateRange = getCurrentMonthDateRange();
        return workoutRepository.countByUserIdAndWorkoutDateBetween(userId, dateRange[0], dateRange[1]);
    }

    /**
     * Calculate average workouts per week for a user this month
     */
    public Double getAverageWorkoutsPerWeek(Long userId) {
        Long totalWorkouts = getTotalWorkoutsThisMonth(userId);
        if (totalWorkouts == 0) {
            return 0.0;
        }
        
        // Approximate weeks in a month as 4.33 (52 weeks / 12 months)
        double weeksInMonth = 4.33;
        return totalWorkouts / weeksInMonth;
    }

    /**
     * Get number of distinct exercises performed this month
     */
    public Long getExerciseFrequencyThisMonth(Long userId) {
        LocalDate[] dateRange = getCurrentMonthDateRange();
        return workoutRepository.countDistinctExercises(userId, dateRange[0], dateRange[1]);
    }

    /**
     * Get all exercises a user has ever performed with their latest date
     */
    public List<ExerciseHistoryDTO> getExerciseHistory(Long userId) {
        List<Map<String, Object>> results = workoutRepository.findUserExerciseHistory(userId);
        return results.stream()
            .map(row -> new ExerciseHistoryDTO(
                ((Number) row.get("exerciseId")).longValue(),
                (String) row.get("exerciseName"),
                (LocalDate) row.get("latestDate")
            ))
            .collect(Collectors.toList());
    }

    /**
     * Get all general stats for a user this month
     */
    public GeneralStatsDTO getUserStats(Long userId) {
        return new GeneralStatsDTO(
            getTotalWorkoutsThisMonth(userId),
            getAverageWorkoutsPerWeek(userId),
            getExerciseFrequencyThisMonth(userId),
            getExerciseHistory(userId)
        );
    }
}
