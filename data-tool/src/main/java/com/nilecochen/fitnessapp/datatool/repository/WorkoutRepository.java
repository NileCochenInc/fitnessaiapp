package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    // Count total workouts for a user within a date range
    long countByUserIdAndWorkoutDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // Count distinct exercises for a user within a date range
    @Query("SELECT COUNT(DISTINCT we.exercise.id) FROM Workout w " +
           "JOIN w.workoutExercises we WHERE w.userId = ?1 AND w.workoutDate BETWEEN ?2 AND ?3")
    long countDistinctExercises(Long userId, LocalDate startDate, LocalDate endDate);

    // Get all exercises a user has ever done with their latest date
    @Query("SELECT we.exercise.id as exerciseId, we.exercise.name as exerciseName, MAX(w.workoutDate) as latestDate " +
           "FROM Workout w JOIN w.workoutExercises we WHERE w.userId = ?1 GROUP BY we.exercise.id, we.exercise.name " +
           "ORDER BY MAX(w.workoutDate) DESC")
    List<Map<String, Object>> findUserExerciseHistory(Long userId);
}
