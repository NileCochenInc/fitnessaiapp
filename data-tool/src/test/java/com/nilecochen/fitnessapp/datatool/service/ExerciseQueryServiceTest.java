package com.nilecochen.fitnessapp.datatool.service;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseStatsDTO;
import com.nilecochen.fitnessapp.datatool.entities.Exercise;
import com.nilecochen.fitnessapp.datatool.repository.EntryMetricRepository;
import com.nilecochen.fitnessapp.datatool.repository.EntryRepository;
import com.nilecochen.fitnessapp.datatool.repository.ExerciseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExerciseQueryServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private EntryMetricRepository entryMetricRepository;

    @InjectMocks
    private ExerciseQueryService service;

    private Long testUserId = 1L;
    private Long testExerciseId = 5L;
    private YearMonth currentMonth = YearMonth.now();
    private LocalDate monthStart = currentMonth.atDay(1);
    private LocalDate monthEnd = currentMonth.atEndOfMonth();

    @Test
    void testGetExerciseFrequency() {
        // Arrange
        long expectedFrequency = 8L;
        when(entryRepository.countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd))
            .thenReturn(expectedFrequency);

        // Act
        Long result = service.getExerciseFrequency(testUserId, testExerciseId);

        // Assert
        assertEquals(expectedFrequency, result);
        verify(entryRepository, times(1)).countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd);
    }

    @Test
    void testGetExerciseStats() {
        // Arrange
        Exercise mockExercise = new Exercise();
        mockExercise.setId(testExerciseId);
        mockExercise.setName("Squat");
        mockExercise.setIsGlobal(true);

        // Prepare logged metrics result: List<Object[]> where each element is [displayName, maxValue]
        List<Object[]> loggedMetrics = new ArrayList<>();
        loggedMetrics.add(new Object[]{"Weight", 225.0});
        loggedMetrics.add(new Object[]{"Reps", 12.0});

        when(exerciseRepository.findById(testExerciseId)).thenReturn(Optional.of(mockExercise));
        when(entryRepository.countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd))
            .thenReturn(5L);
        when(entryMetricRepository.findLoggedMetricsWithMaxValues(testExerciseId, monthStart, monthEnd))
            .thenReturn(loggedMetrics);

        // Act
        ExerciseStatsDTO result = service.getExerciseStats(testUserId, testExerciseId);

        // Assert
        assertNotNull(result);
        assertEquals(testExerciseId, result.getExerciseId());
        assertEquals("Squat", result.getExerciseName());
        assertEquals(5L, result.getFrequencyThisMonth());
        assertEquals(2, result.getMaxMetrics().size());
        assertEquals(225.0, result.getMaxMetrics().get("Weight"));
        assertEquals(12.0, result.getMaxMetrics().get("Reps"));
    }

    @Test
    void testGetExerciseStatsWithNoEntries() {
        // Arrange
        Exercise mockExercise = new Exercise();
        mockExercise.setId(testExerciseId);
        mockExercise.setName("Squat");

        when(exerciseRepository.findById(testExerciseId)).thenReturn(Optional.of(mockExercise));
        when(entryRepository.countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd))
            .thenReturn(0L);
        when(entryMetricRepository.findLoggedMetricsWithMaxValues(testExerciseId, monthStart, monthEnd))
            .thenReturn(new ArrayList<>()); // Return empty list for no logged metrics

        // Act
        ExerciseStatsDTO result = service.getExerciseStats(testUserId, testExerciseId);

        // Assert
        assertNotNull(result);
        assertEquals(0L, result.getFrequencyThisMonth());
        assertTrue(result.getMaxMetrics().isEmpty());
    }

    @Test
    void testGetExerciseStatsWithMultipleMetrics() {
        // Arrange
        Exercise mockExercise = new Exercise();
        mockExercise.setId(testExerciseId);
        mockExercise.setName("Bench Press");

        // Prepare logged metrics with 3 different metrics
        List<Object[]> loggedMetrics = new ArrayList<>();
        loggedMetrics.add(new Object[]{"Weight (lbs)", 185.0});
        loggedMetrics.add(new Object[]{"Reps", 8.0});
        loggedMetrics.add(new Object[]{"Rest (sec)", 90.0});

        when(exerciseRepository.findById(testExerciseId)).thenReturn(Optional.of(mockExercise));
        when(entryRepository.countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd))
            .thenReturn(10L);
        when(entryMetricRepository.findLoggedMetricsWithMaxValues(testExerciseId, monthStart, monthEnd))
            .thenReturn(loggedMetrics);

        // Act
        ExerciseStatsDTO result = service.getExerciseStats(testUserId, testExerciseId);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.getMaxMetrics().size());
        assertEquals(185.0, result.getMaxMetrics().get("Weight (lbs)"));
        assertEquals(8.0, result.getMaxMetrics().get("Reps"));
        assertEquals(90.0, result.getMaxMetrics().get("Rest (sec)"));
    }
}
