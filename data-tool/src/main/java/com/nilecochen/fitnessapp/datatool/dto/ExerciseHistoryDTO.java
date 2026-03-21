package com.nilecochen.fitnessapp.datatool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseHistoryDTO {

    // Exercise ID
    private Long exerciseId;

    // Exercise name
    private String exerciseName;

    // Latest date this exercise was performed
    private LocalDate latestDate;
}
