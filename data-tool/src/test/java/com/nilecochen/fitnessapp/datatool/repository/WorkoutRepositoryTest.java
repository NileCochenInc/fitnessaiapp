package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.Exercise;
import com.nilecochen.fitnessapp.datatool.entities.User;
import com.nilecochen.fitnessapp.datatool.entities.Workout;
import com.nilecochen.fitnessapp.datatool.entities.WorkoutExercise;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class WorkoutRepositoryTest {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    private User testUser;
    private Exercise exercise1, exercise2;
    private YearMonth currentMonth;
    private LocalDate monthStart, monthEnd;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser = userRepository.save(testUser);

        // Create test exercises
        exercise1 = new Exercise();
        exercise1.setName("Squat");
        exercise1.setIsGlobal(true);
        exercise1 = exerciseRepository.save(exercise1);

        exercise2 = new Exercise();
        exercise2.setName("Bench Press");
        exercise2.setIsGlobal(true);
        exercise2 = exerciseRepository.save(exercise2);

        // Set date range for current month
        currentMonth = YearMonth.now();
        monthStart = currentMonth.atDay(1);
        monthEnd = currentMonth.atEndOfMonth();
    }

    @Test
    void testCountByUserIdAndWorkoutDateBetween() {
        // Arrange - create 3 workouts this month and 1 outside
        Workout w1 = createWorkout(testUser, monthStart.plusDays(5));
        Workout w2 = createWorkout(testUser, monthStart.plusDays(10));
        Workout w3 = createWorkout(testUser, monthStart.plusDays(15));
        Workout w4 = createWorkout(testUser, monthStart.minusMonths(1)); // Previous month

        // Act
        long result = workoutRepository.countByUserIdAndWorkoutDateBetween(testUser.getId(), monthStart, monthEnd);

        // Assert
        assertEquals(3L, result);
    }

    @Test
    void testCountDistinctExercises() {
        // Arrange - create workouts with multiple exercises
        Workout w1 = createWorkout(testUser, monthStart.plusDays(5));
        createWorkoutExercise(w1, exercise1);

        Workout w2 = createWorkout(testUser, monthStart.plusDays(10));
        createWorkoutExercise(w2, exercise1);  // Same exercise
        createWorkoutExercise(w2, exercise2);  // Different exercise

        // Act
        long result = workoutRepository.countDistinctExercises(testUser.getId(), monthStart, monthEnd);

        // Assert
        assertEquals(2L, result);
    }

    @Test
    void testFindUserExerciseHistory() {
        // Arrange
        Workout w1 = createWorkout(testUser, monthStart.plusDays(5));
        createWorkoutExercise(w1, exercise1);

        Workout w2 = createWorkout(testUser, monthStart.plusDays(10));
        createWorkoutExercise(w2, exercise2);

        Workout w3 = createWorkout(testUser, monthStart.plusDays(15));
        createWorkoutExercise(w3, exercise1);  // Latest for exercise1

        // Act
        List<Map<String, Object>> result = workoutRepository.findUserExerciseHistory(testUser.getId());

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        // Should be ordered by latest date DESC
        LocalDate latestDate1 = (LocalDate) result.get(0).get("latestDate");
        assertNotNull(latestDate1);
    }

    @Test
    void testCountWithNoWorkouts() {
        // Act
        long result = workoutRepository.countByUserIdAndWorkoutDateBetween(testUser.getId(), monthStart, monthEnd);

        // Assert
        assertEquals(0L, result);
    }

    private Workout createWorkout(User user, LocalDate date) {
        Workout workout = new Workout();
        workout.setUser(user);
        workout.setWorkoutDate(date);
        return workoutRepository.save(workout);
    }

    private WorkoutExercise createWorkoutExercise(Workout workout, Exercise exercise) {
        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workout);
        we.setExercise(exercise);
        return workoutExerciseRepository.save(we);
    }
}
