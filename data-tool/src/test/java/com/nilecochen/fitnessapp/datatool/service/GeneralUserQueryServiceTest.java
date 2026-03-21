package com.nilecochen.fitnessapp.datatool.service;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseHistoryDTO;
import com.nilecochen.fitnessapp.datatool.dto.GeneralStatsDTO;
import com.nilecochen.fitnessapp.datatool.repository.WorkoutRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeneralUserQueryServiceTest {

    @Mock
    private WorkoutRepository workoutRepository;

    @InjectMocks
    private GeneralUserQueryService service;

    private Long testUserId = 1L;
    private YearMonth currentMonth = YearMonth.now();
    private LocalDate monthStart = currentMonth.atDay(1);
    private LocalDate monthEnd = currentMonth.atEndOfMonth();

    @Test
    void testGetTotalWorkoutsThisMonth() {
        // Arrange
        long expectedCount = 5L;
        when(workoutRepository.countByUserIdAndWorkoutDateBetween(testUserId, monthStart, monthEnd))
            .thenReturn(expectedCount);

        // Act
        Long result = service.getTotalWorkoutsThisMonth(testUserId);

        // Assert
        assertEquals(expectedCount, result);
        verify(workoutRepository, times(1)).countByUserIdAndWorkoutDateBetween(testUserId, monthStart, monthEnd);
    }

    @Test
    void testGetAverageWorkoutsPerWeek() {
        // Arrange
        long totalWorkouts = 4L;  // 4 / 4.33 = ~0.92 workouts per week
        when(workoutRepository.countByUserIdAndWorkoutDateBetween(anyLong(), any(), any()))
            .thenReturn(totalWorkouts);

        // Act
        Double result = service.getAverageWorkoutsPerWeek(testUserId);

        // Assert
        assertNotNull(result);
        assertTrue(result > 0 && result < 1.5);  // Rough check
        assertEquals(4.0 / 4.33, result, 0.01);
    }

    @Test
    void testGetExerciseFrequencyThisMonth() {
        // Arrange
        long expectedFrequency = 3L;
        when(workoutRepository.countDistinctExercises(testUserId, monthStart, monthEnd))
            .thenReturn(expectedFrequency);

        // Act
        Long result = service.getExerciseFrequencyThisMonth(testUserId);

        // Assert
        assertEquals(expectedFrequency, result);
        verify(workoutRepository, times(1)).countDistinctExercises(testUserId, monthStart, monthEnd);
    }

    @Test
    void testGetExerciseHistory() {
        // Arrange
        List<Map<String, Object>> mockData = List.of(
            Map.of("exerciseId", 1L, "exerciseName", "Squat", "latestDate", LocalDate.now()),
            Map.of("exerciseId", 2L, "exerciseName", "Bench Press", "latestDate", LocalDate.now().minusDays(5))
        );
        when(workoutRepository.findUserExerciseHistory(testUserId)).thenReturn(mockData);

        // Act
        List<ExerciseHistoryDTO> result = service.getExerciseHistory(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Squat", result.get(0).getExerciseName());
        assertEquals(1L, result.get(0).getExerciseId());
    }

    @Test
    void testGetUserStats() {
        // Arrange
        when(workoutRepository.countByUserIdAndWorkoutDateBetween(testUserId, monthStart, monthEnd))
            .thenReturn(5L);
        when(workoutRepository.countDistinctExercises(testUserId, monthStart, monthEnd))
            .thenReturn(3L);
        List<Map<String, Object>> mockExercises = List.of(
            Map.of("exerciseId", 1L, "exerciseName", "Squat", "latestDate", LocalDate.now())
        );
        when(workoutRepository.findUserExerciseHistory(testUserId)).thenReturn(mockExercises);

        // Act
        GeneralStatsDTO result = service.getUserStats(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.getTotalWorkoutsThisMonth());
        assertEquals(3L, result.getExerciseFrequencyThisMonth());
        assertNotNull(result.getAverageWorkoutsPerWeek());
        assertNotNull(result.getExerciseHistory());
        assertEquals(1, result.getExerciseHistory().size());
    }

    @Test
    void testGetUserStatsWithNoData() {
        // Arrange
        when(workoutRepository.countByUserIdAndWorkoutDateBetween(testUserId, monthStart, monthEnd))
            .thenReturn(0L);
        when(workoutRepository.countDistinctExercises(testUserId, monthStart, monthEnd))
            .thenReturn(0L);
        when(workoutRepository.findUserExerciseHistory(testUserId)).thenReturn(List.of());

        // Act
        GeneralStatsDTO result = service.getUserStats(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(0L, result.getTotalWorkoutsThisMonth());
        assertEquals(0L, result.getExerciseFrequencyThisMonth());
        assertEquals(0.0, result.getAverageWorkoutsPerWeek());
        assertTrue(result.getExerciseHistory().isEmpty());
    }
}
