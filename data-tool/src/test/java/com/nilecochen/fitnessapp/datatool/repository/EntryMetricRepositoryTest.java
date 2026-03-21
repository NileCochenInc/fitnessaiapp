package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class EntryMetricRepositoryTest {

    @Autowired
    private EntryMetricRepository entryMetricRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private MetricDefinitionRepository metricDefinitionRepository;

    private User testUser;
    private Exercise testExercise;
    private MetricDefinition testMetric;
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

        // Create metric definition
        testMetric = new MetricDefinition();
        testMetric.setKey("weight");
        testMetric.setDisplayName("Weight (lbs)");
        testMetric.setIsGlobal(true);
        testMetric = metricDefinitionRepository.save(testMetric);

        currentMonth = YearMonth.now();
        monthStart = currentMonth.atDay(1);
        monthEnd = currentMonth.atEndOfMonth();
    }

    @Test
    void testFindMaxMetricValue() {
        // Arrange
        Entry e1 = createEntry(testExercise, monthStart.plusDays(5));
        Entry e2 = createEntry(testExercise, monthStart.plusDays(10));
        Entry e3 = createEntry(testExercise, monthStart.plusDays(15));

        createEntryMetric(e1, testMetric, 185.0);
        createEntryMetric(e2, testMetric, 225.0);  // Max
        createEntryMetric(e3, testMetric, 205.0);

        // Act
        Optional<Double> result = entryMetricRepository.findMaxMetricValue(
            testExercise.getId(), testMetric.getId(), monthStart, monthEnd
        );

        // Assert
        assertTrue(result.isPresent());
        assertEquals(225.0, result.get());
    }

    @Test
    void testFindMaxMetricValueWithMultipleMetrics() {
        // Arrange
        MetricDefinition metric2 = new MetricDefinition();
        metric2.setKey("reps");
        metric2.setDisplayName("Reps");
        metric2.setIsGlobal(true);
        metric2 = metricDefinitionRepository.save(metric2);

        Entry e1 = createEntry(testExercise, monthStart.plusDays(5));
        createEntryMetric(e1, testMetric, 225.0);
        createEntryMetric(e1, metric2, 8.0);

        // Act - query for first metric
        Optional<Double> result = entryMetricRepository.findMaxMetricValue(
            testExercise.getId(), testMetric.getId(), monthStart, monthEnd
        );

        // Assert
        assertTrue(result.isPresent());
        assertEquals(225.0, result.get());
    }

    @Test
    void testFindMaxMetricValueWithDateRange() {
        // Arrange
        Entry eInRange = createEntry(testExercise, monthStart.plusDays(5));
        Entry eOutside = createEntry(testExercise, monthStart.minusMonths(1));

        createEntryMetric(eInRange, testMetric, 225.0);  // Should be in result
        createEntryMetric(eOutside, testMetric, 300.0);  // Should NOT be in result

        // Act
        Optional<Double> result = entryMetricRepository.findMaxMetricValue(
            testExercise.getId(), testMetric.getId(), monthStart, monthEnd
        );

        // Assert
        assertTrue(result.isPresent());
        assertEquals(225.0, result.get());  // Max from in-range only
    }

    @Test
    void testFindMaxMetricValueWithNoResults() {
        // Act
        Optional<Double> result = entryMetricRepository.findMaxMetricValue(
            testExercise.getId(), testMetric.getId(), monthStart, monthEnd
        );

        // Assert
        assertTrue(result.isEmpty());
    }

    private Entry createEntry(Exercise exercise, LocalDate date) {
        Workout workout = new Workout();
        workout.setUser(testUser);
        workout.setWorkoutDate(date);
        workout = workoutRepository.save(workout);

        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workout);
        we.setExercise(exercise);
        we = workoutExerciseRepository.save(we);

        Entry entry = new Entry();
        entry.setWorkoutExercise(we);
        entry.setEntryIndex(1L);
        return entryRepository.save(entry);
    }

    private EntryMetric createEntryMetric(Entry entry, MetricDefinition metric, Double value) {
        EntryMetric em = new EntryMetric();
        em.setEntry(entry);
        em.setMetricDefinition(metric);
        em.setValueNumber(value);
        return entryMetricRepository.save(em);
    }
}
