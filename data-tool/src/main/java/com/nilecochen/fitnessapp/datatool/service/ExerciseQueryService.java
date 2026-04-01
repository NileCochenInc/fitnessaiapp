package com.nilecochen.fitnessapp.datatool.service;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseStatsDTO;
import com.nilecochen.fitnessapp.datatool.entities.Exercise;
import com.nilecochen.fitnessapp.datatool.repository.EntryMetricRepository;
import com.nilecochen.fitnessapp.datatool.repository.EntryRepository;
import com.nilecochen.fitnessapp.datatool.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ExerciseQueryService {

    private final ExerciseRepository exerciseRepository;
    private final EntryRepository entryRepository;
    private final EntryMetricRepository entryMetricRepository;

    public ExerciseQueryService(ExerciseRepository exerciseRepository,
                               EntryRepository entryRepository,
                               EntryMetricRepository entryMetricRepository) {
        this.exerciseRepository = exerciseRepository;
        this.entryRepository = entryRepository;
        this.entryMetricRepository = entryMetricRepository;
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
     * Get frequency of a specific exercise for a user this month
     */
    public Long getExerciseFrequency(Long userId, Long exerciseId) {
        LocalDate[] dateRange = getCurrentMonthDateRange();
        return entryRepository.countEntriesByExerciseAndDateRange(exerciseId, dateRange[0], dateRange[1]);
    }

    /**
     * Get maximum metric values for a specific exercise for a user this month
     * Queries all metrics that were actually logged, not what's configured in the junction table
     */
    public ExerciseStatsDTO getExerciseStats(Long userId, Long exerciseId) {
        LocalDate[] dateRange = getCurrentMonthDateRange();
        
        // Get exercise details
        Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
        if (exerciseOpt.isEmpty()) {
            return null;
        }
        Exercise exercise = exerciseOpt.get();
        
        // Get frequency for this month
        Long frequency = getExerciseFrequency(userId, exerciseId);
        
        // Get all metrics that were actually logged for this exercise this month
        List<Object[]> loggedMetrics = entryMetricRepository.findLoggedMetricsWithMaxValues(
            exerciseId, dateRange[0], dateRange[1]
        );
        
        // Build map of metric name -> max value for this month
        Map<String, Double> maxMetrics = new HashMap<>();
        for (Object[] row : loggedMetrics) {
            String metricDisplayName = (String) row[0];
            Double maxValue = (Double) row[1];
            maxMetrics.put(metricDisplayName, maxValue);
        }
        
        return new ExerciseStatsDTO(exerciseId, exercise.getName(), frequency, maxMetrics);
    }
}
