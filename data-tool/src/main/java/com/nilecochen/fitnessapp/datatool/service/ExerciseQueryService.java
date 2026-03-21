package com.nilecochen.fitnessapp.datatool.service;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseStatsDTO;
import com.nilecochen.fitnessapp.datatool.entities.Exercise;
import com.nilecochen.fitnessapp.datatool.entities.MetricDefinition;
import com.nilecochen.fitnessapp.datatool.repository.EntryMetricRepository;
import com.nilecochen.fitnessapp.datatool.repository.EntryRepository;
import com.nilecochen.fitnessapp.datatool.repository.ExerciseRepository;
import com.nilecochen.fitnessapp.datatool.repository.MetricDefinitionRepository;
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
    private final MetricDefinitionRepository metricDefinitionRepository;

    public ExerciseQueryService(ExerciseRepository exerciseRepository,
                               EntryRepository entryRepository,
                               EntryMetricRepository entryMetricRepository,
                               MetricDefinitionRepository metricDefinitionRepository) {
        this.exerciseRepository = exerciseRepository;
        this.entryRepository = entryRepository;
        this.entryMetricRepository = entryMetricRepository;
        this.metricDefinitionRepository = metricDefinitionRepository;
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
        
        // Get all metrics defined for this exercise
        List<MetricDefinition> metrics = metricDefinitionRepository.findByExerciseId(exerciseId);
        
        // Build map of metric name -> max value for this month
        Map<String, Double> maxMetrics = new HashMap<>();
        for (MetricDefinition metric : metrics) {
            Optional<Double> maxValue = entryMetricRepository.findMaxMetricValue(
                exerciseId, metric.getId(), dateRange[0], dateRange[1]
            );
            if (maxValue.isPresent()) {
                maxMetrics.put(metric.getDisplayName(), maxValue.get());
            }
        }
        
        return new ExerciseStatsDTO(exerciseId, exercise.getName(), frequency, maxMetrics);
    }
}
