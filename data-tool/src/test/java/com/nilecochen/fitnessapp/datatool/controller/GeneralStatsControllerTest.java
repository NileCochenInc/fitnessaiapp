package com.nilecochen.fitnessapp.datatool.controller;

import com.nilecochen.fitnessapp.datatool.dto.ExerciseHistoryDTO;
import com.nilecochen.fitnessapp.datatool.dto.GeneralStatsDTO;
import com.nilecochen.fitnessapp.datatool.service.GeneralUserQueryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GeneralStatsController.class)
class GeneralStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeneralUserQueryService generalUserQueryService;

    @Test
    void testGetUserStats() throws Exception {
        // Arrange
        Long userId = 1L;
        GeneralStatsDTO mockStats = new GeneralStatsDTO(5L, 1.15, 3L, List.of());
        when(generalUserQueryService.getUserStats(userId)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/user-stats/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalWorkoutsThisMonth").value(5))
            .andExpect(jsonPath("$.averageWorkoutsPerWeek").value(1.15))
            .andExpect(jsonPath("$.exerciseFrequencyThisMonth").value(3));
    }

    @Test
    void testGetUserStatsResponseStructure() throws Exception {
        // Arrange
        Long userId = 1L;
        List<ExerciseHistoryDTO> exerciseHistory = List.of(
            new ExerciseHistoryDTO(1L, "Squat", java.time.LocalDate.now())
        );
        GeneralStatsDTO mockStats = new GeneralStatsDTO(5L, 1.15, 3L, exerciseHistory);
        when(generalUserQueryService.getUserStats(userId)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/user-stats/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalWorkoutsThisMonth").exists())
            .andExpect(jsonPath("$.averageWorkoutsPerWeek").exists())
            .andExpect(jsonPath("$.exerciseFrequencyThisMonth").exists())
            .andExpect(jsonPath("$.exerciseHistory").isArray())
            .andExpect(jsonPath("$.exerciseHistory[0].exerciseName").value("Squat"));
    }

    @Test
    void testGetUserStatsWithNoWorkouts() throws Exception {
        // Arrange
        Long userId = 1L;
        GeneralStatsDTO mockStats = new GeneralStatsDTO(0L, 0.0, 0L, List.of());
        when(generalUserQueryService.getUserStats(userId)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/user-stats/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalWorkoutsThisMonth").value(0))
            .andExpect(jsonPath("$.averageWorkoutsPerWeek").value(0.0))
            .andExpect(jsonPath("$.exerciseFrequencyThisMonth").value(0))
            .andExpect(jsonPath("$.exerciseHistory").isArray())
            .andExpect(jsonPath("$.exerciseHistory.length()").value(0));
    }
}
