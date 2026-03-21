package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.Entry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EntryRepository extends JpaRepository<Entry, Long> {

    // Count entries for a specific exercise within a date range
    @Query("SELECT COUNT(e) FROM Entry e WHERE e.workoutExercise.exercise.id = ?1 " +
           "AND e.createdDate BETWEEN ?2 AND ?3")
    long countEntriesByExerciseAndDateRange(Long exerciseId, LocalDate startDate, LocalDate endDate);

    // Find all entries for a specific exercise within a date range
    List<Entry> findByWorkoutExerciseExerciseIdAndCreatedDateBetween(
        Long exerciseId, LocalDate startDate, LocalDate endDate);
}
