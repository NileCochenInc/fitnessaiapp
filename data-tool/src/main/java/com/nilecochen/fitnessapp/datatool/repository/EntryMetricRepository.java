package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.EntryMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EntryMetricRepository extends JpaRepository<EntryMetric, Long> {

    // Find maximum metric value for a specific exercise and metric definition within a date range
    @Query("SELECT MAX(em.valueNumber) FROM EntryMetric em " +
           "WHERE em.entry.workoutExercise.exercise.id = ?1 AND em.metricDefinition.id = ?2 " +
           "AND em.entry.workoutExercise.workout.workoutDate BETWEEN ?3 AND ?4")
    Optional<Double> findMaxMetricValue(Long exerciseId, Long metricDefinitionId, 
                                        LocalDate startDate, LocalDate endDate);

    // Find all metrics that were actually logged for a specific exercise within a date range
    // Returns: List of Object[] where each element is [metricDisplayName, maxValue]
    // Uses COALESCE to fallback to metric key if displayName is NULL
    @Query("SELECT COALESCE(md.displayName, md.key), MAX(em.valueNumber) " +
           "FROM EntryMetric em " +
           "JOIN em.metricDefinition md " +
           "JOIN em.entry e " +
           "JOIN e.workoutExercise we " +
           "WHERE we.exercise.id = ?1 " +
           "AND we.workout.workoutDate BETWEEN ?2 AND ?3 " +
           "AND em.valueNumber IS NOT NULL " +
           "GROUP BY COALESCE(md.displayName, md.key)")
    List<Object[]> findLoggedMetricsWithMaxValues(Long exerciseId, LocalDate startDate, LocalDate endDate);
}
