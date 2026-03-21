package com.nilecochen.fitnessapp.datatool.controller;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseStatsDTO;
import com.nilecochen.fitnessapp.datatool.service.ExerciseQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExerciseStatsController.class)
class ExerciseStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExerciseQueryService exerciseQueryService;

    @Test
    void testGetExerciseStats() throws Exception {
        // Arrange
        Long userId = 1L;
        Long exerciseId = 5L;
        ExerciseStatsDTO mockStats = new ExerciseStatsDTO(
            exerciseId, "Squat", 8L, Map.of("Weight", 225.0, "Reps", 12.0)
        );
        when(exerciseQueryService.getExerciseStats(userId, exerciseId)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/exercise-stats/1/5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.exerciseId").value(5))
            .andExpect(jsonPath("$.exerciseName").value("Squat"))
            .andExpect(jsonPath("$.frequencyThisMonth").value(8));
    }

    @Test
    void testGetExerciseStatsResponseStructure() throws Exception {
        // Arrange
        Long userId = 1L;
        Long exerciseId = 5L;
        ExerciseStatsDTO mockStats = new ExerciseStatsDTO(
            exerciseId, "Bench Press", 10L, Map.of("Weight", 185.0, "Reps", 8.0, "Rest (sec)", 90.0)
        );
        when(exerciseQueryService.getExerciseStats(userId, exerciseId)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/exercise-stats/1/5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.exerciseId").exists())
            .andExpect(jsonPath("$.exerciseName").exists())
            .andExpect(jsonPath("$.frequencyThisMonth").exists())
            .andExpect(jsonPath("$.maxMetrics").isMap())
            .andExpect(jsonPath("$.maxMetrics.['Weight']").value(185.0));
    }

    @Test
    void testGetExerciseStatsWithNoEntries() throws Exception {
        // Arrange
        Long userId = 1L;
        Long exerciseId = 5L;
        ExerciseStatsDTO mockStats = new ExerciseStatsDTO(exerciseId, "Squat", 0L, Map.of());
        when(exerciseQueryService.getExerciseStats(userId, exerciseId)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/exercise-stats/1/5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.frequencyThisMonth").value(0))
            .andExpect(jsonPath("$.maxMetrics").isEmpty());
    }
}
