//types used by workouts logic

import {z} from "zod";

// /types/workout.ts
/*
export type WorkoutJSON = {
  user_id: number;
  workout_date: string;
  workout_kind: string;
}; */

//define WorkoutSchema
export const WorkoutSchema = z.object({
  user_id: z.number().int().positive(), //positive integers only
  workout_date: z.string().min(1), //no empty strings
  workout_kind: z.string().min(1), //no empty strings
});

//define WorkoutJSON type based on WorkoutSchema
export type WorkoutJSON = z.infer<typeof WorkoutSchema>;
