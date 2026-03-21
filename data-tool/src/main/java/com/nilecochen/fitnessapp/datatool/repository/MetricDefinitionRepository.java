package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.MetricDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MetricDefinitionRepository extends JpaRepository<MetricDefinition, Long> {

    // Find all metric definitions for a specific exercise via the junction table
    @Query("SELECT md FROM MetricDefinition md " +
           "JOIN MetricExerciseJunction mej ON md.id = mej.metricDefinition.id " +
           "WHERE mej.exercise.id = ?1")
    List<MetricDefinition> findByExerciseId(Long exerciseId);
}
