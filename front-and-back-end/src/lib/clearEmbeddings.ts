import pool from './db';

/**
 * Clears embeddings for a specific workout exercise.
 * Called whenever workout exercise data changes to ensure embeddings are regenerated.
 * 
 * @param workoutExerciseId - The ID of the workout_exercise to clear embeddings for
 * @returns true if the row was updated, false otherwise
 * 
 * @example
 * await clearWorkoutExerciseEmbedding(123);
 */
export async function clearWorkoutExerciseEmbedding(workoutExerciseId: number) {
    const result = await pool.query(
        `UPDATE workout_exercises 
         SET embedding = NULL, embedding_text = NULL
         WHERE id = $1`,
        [workoutExerciseId]
    );
    return (result.rowCount ?? 0) > 0;
}

/**
 * Clears embeddings for a specific workout.
 * Called whenever workout metadata (date, kind) changes to ensure embeddings are regenerated.
 * 
 * @param workoutIdOrExerciseId - Either a workout ID or workout_exercise ID (see isWorkoutExerciseId parameter)
 * @param isWorkoutExerciseId - If true, resolves the workout ID from the workout_exercise in a single query.
 *                              If false (default), directly clears the workout embedding.
 * @returns true if the workout row was updated, false otherwise
 * 
 * @example
 * // Clear the workout's embedding directly
 * await clearWorkoutEmbedding(789);
 * 
 * @example
 * // Clear the workout's embedding by resolving from workout_exercise (single query)
 * await clearWorkoutEmbedding(123, true);
 */
export async function clearWorkoutEmbedding(workoutIdOrExerciseId: number, isWorkoutExerciseId?: boolean) {
    let query: string;
    
    if (isWorkoutExerciseId) {
        // Single query: resolve workout_exercise to workout and clear in one go
        query = `UPDATE workouts 
                 SET embedding = NULL, embedding_text = NULL
                 WHERE id = (SELECT workout_id FROM workout_exercises WHERE id = $1)`;
    } else {
        // Direct update
        query = `UPDATE workouts 
                 SET embedding = NULL, embedding_text = NULL
                 WHERE id = $1`;
    }
    
    const result = await pool.query(query, [workoutIdOrExerciseId]);
    return (result.rowCount ?? 0) > 0;
}