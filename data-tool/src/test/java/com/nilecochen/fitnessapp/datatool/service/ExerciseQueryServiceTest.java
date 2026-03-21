package com.nilecochen.fitnessapp.datatool.service;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseStatsDTO;
import com.nilecochen.fitnessapp.datatool.entities.Exercise;
import com.nilecochen.fitnessapp.datatool.entities.MetricDefinition;
import com.nilecochen.fitnessapp.datatool.repository.EntryMetricRepository;
import com.nilecochen.fitnessapp.datatool.repository.EntryRepository;
import com.nilecochen.fitnessapp.datatool.repository.ExerciseRepository;
import com.nilecochen.fitnessapp.datatool.repository.MetricDefinitionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.time.YearMonth;
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

    @Mock
    private MetricDefinitionRepository metricDefinitionRepository;

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

        MetricDefinition metric1 = new MetricDefinition();
        metric1.setId(1L);
        metric1.setDisplayName("Weight");

        MetricDefinition metric2 = new MetricDefinition();
        metric2.setId(2L);
        metric2.setDisplayName("Reps");

        when(exerciseRepository.findById(testExerciseId)).thenReturn(Optional.of(mockExercise));
        when(entryRepository.countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd))
            .thenReturn(5L);
        when(metricDefinitionRepository.findByExerciseId(testExerciseId))
            .thenReturn(List.of(metric1, metric2));
        when(entryMetricRepository.findMaxMetricValue(testExerciseId, 1L, monthStart, monthEnd))
            .thenReturn(Optional.of(225.0));
        when(entryMetricRepository.findMaxMetricValue(testExerciseId, 2L, monthStart, monthEnd))
            .thenReturn(Optional.of(12.0));

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
        when(metricDefinitionRepository.findByExerciseId(testExerciseId)).thenReturn(List.of());

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

        MetricDefinition metric1 = new MetricDefinition();
        metric1.setId(1L);
        metric1.setDisplayName("Weight (lbs)");

        MetricDefinition metric2 = new MetricDefinition();
        metric2.setId(2L);
        metric2.setDisplayName("Reps");

        MetricDefinition metric3 = new MetricDefinition();
        metric3.setId(3L);
        metric3.setDisplayName("Rest (sec)");

        when(exerciseRepository.findById(testExerciseId)).thenReturn(Optional.of(mockExercise));
        when(entryRepository.countEntriesByExerciseAndDateRange(testExerciseId, monthStart, monthEnd))
            .thenReturn(10L);
        when(metricDefinitionRepository.findByExerciseId(testExerciseId))
            .thenReturn(List.of(metric1, metric2, metric3));
        when(entryMetricRepository.findMaxMetricValue(eq(testExerciseId), eq(1L), any(), any()))
            .thenReturn(Optional.of(185.0));
        when(entryMetricRepository.findMaxMetricValue(eq(testExerciseId), eq(2L), any(), any()))
            .thenReturn(Optional.of(8.0));
        when(entryMetricRepository.findMaxMetricValue(eq(testExerciseId), eq(3L), any(), any()))
            .thenReturn(Optional.of(90.0));

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
