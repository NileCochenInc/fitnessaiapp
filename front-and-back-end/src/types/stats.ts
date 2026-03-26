// API Response types for stats endpoints

export interface ExerciseHistoryDTO {
  exerciseId: number;
  exerciseName: string;
  latestDate: string; // ISO date format
}

export interface GeneralStatsDTO {
  totalWorkoutsThisMonth: number;
  averageWorkoutsPerWeek: number;
  exerciseFrequencyThisMonth: number;
  exerciseHistory: ExerciseHistoryDTO[];
}

export interface ExerciseStatsDTO {
  exerciseId: number;
  exerciseName: string;
  frequencyThisMonth: number;
  maxMetrics: Record<string, number>; // { "weight": 225.0, "reps": 15.0 }
}
