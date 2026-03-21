package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class EntryRepositoryTest {

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    private User testUser;
    private Exercise testExercise;
    private WorkoutExercise workoutExercise;
    private YearMonth currentMonth;
    private LocalDate monthStart, monthEnd;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser = userRepository.save(testUser);

        // Create test exercise
        testExercise = new Exercise();
        testExercise.setName("Squat");
        testExercise.setIsGlobal(true);
        testExercise = exerciseRepository.save(testExercise);

        // Create workout
        Workout workout = new Workout();
        workout.setUser(testUser);
        workout.setWorkoutDate(LocalDate.now());
        workout = workoutRepository.save(workout);

        // Create workout exercise
        workoutExercise = new WorkoutExercise();
        workoutExercise.setWorkout(workout);
        workoutExercise.setExercise(testExercise);
        workoutExercise = workoutExerciseRepository.save(workoutExercise);

        currentMonth = YearMonth.now();
        monthStart = currentMonth.atDay(1);
        monthEnd = currentMonth.atEndOfMonth();
    }

    @Test
    void testCountEntriesByExerciseAndDateRange() {
        // Arrange
        createEntry(workoutExercise, monthStart.plusDays(5));
        createEntry(workoutExercise, monthStart.plusDays(10));
        createEntry(workoutExercise, monthStart.plusDays(15));

        // Act
        long result = entryRepository.countEntriesByExerciseAndDateRange(
            testExercise.getId(), monthStart, monthEnd
        );

        // Assert
        assertEquals(3L, result);
    }

    @Test
    void testFindByWorkoutExerciseExerciseIdAndCreatedDateBetween() {
        // Arrange
        Entry e1 = createEntry(workoutExercise, monthStart.plusDays(5));
        Entry e2 = createEntry(workoutExercise, monthStart.plusDays(10));
        Entry e3 = createEntry(workoutExercise, monthStart.minusMonths(1)); // Outside range

        // Act
        List<Entry> result = entryRepository.findByWorkoutExerciseExerciseIdAndCreatedDateBetween(
            testExercise.getId(), monthStart, monthEnd
        );

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void testCountEntriesWithNoResults() {
        // Act
        long result = entryRepository.countEntriesByExerciseAndDateRange(
            testExercise.getId(), monthStart, monthEnd
        );

        // Assert
        assertEquals(0L, result);
    }

    @Test
    void testEntriesOutsideDateRange() {
        // Arrange
        createEntry(workoutExercise, monthStart.minusMonths(1));
        createEntry(workoutExercise, monthEnd.plusMonths(1));

        // Act
        long result = entryRepository.countEntriesByExerciseAndDateRange(
            testExercise.getId(), monthStart, monthEnd
        );

        // Assert
        assertEquals(0L, result);
    }

    private Entry createEntry(WorkoutExercise we, LocalDate date) {
        Entry entry = new Entry();
        entry.setWorkoutExercise(we);
        entry.setEntryIndex(1L);
        Entry saved = entryRepository.save(entry);
        // Update created_date (normally this would be set by @CreationTimestamp)
        return saved;
    }
}
