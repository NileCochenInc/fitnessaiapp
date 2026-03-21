package com.nilecochen.fitnessapp.datatool.controller;

import com.nilecochen.fitnessapp.datatool.dto.GeneralStatsDTO;
import com.nilecochen.fitnessapp.datatool.service.GeneralUserQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-stats")
public class GeneralStatsController {

    private final GeneralUserQueryService generalUserQueryService;

    public GeneralStatsController(GeneralUserQueryService generalUserQueryService) {
        this.generalUserQueryService = generalUserQueryService;
    }

    /**
     * GET /api/user-stats/{userId}
     * Returns general statistics for a user this month:
     * - Total workouts
     * - Average workouts per week
     * - Exercise frequency
     */
    @GetMapping("/{userId}")
    public GeneralStatsDTO getUserStats(@PathVariable Long userId) {
        return generalUserQueryService.getUserStats(userId);
    }
}
