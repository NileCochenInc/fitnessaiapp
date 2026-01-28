import pool from './db';

export async function getExercisesByUserId(userId: number) {
    const result = await pool.query(
        `SELECT DISTINCT name FROM exercises 
         WHERE is_global = TRUE OR user_id = $1
         ORDER BY name`,
        [userId]
    );
    const returnedNames = result.rows.map(row => row.name);
    //console.log(returnedNames);
    return returnedNames
}




/**
 * Fetches all metrics from the most recent entry for a given exercise performed by a user.
 * Used for prepopulating new entries with data from the previous workout.
 * 
 * Finds the entry from the most recent workout for the given exercise, then returns
 * ALL metrics associated with that entry. This ensures complete data prepopulation.
 * 
 * @param exerciseId - The exercise ID (can be global or user-specific)
 * @param userId - The user ID for data isolation and authorization
 * @returns Array of all metric objects from the most recent entry, or null if no entries exist
 * 
 * @example
 * const metrics = await getLastEntryForExercise(5, 1);
 * // Returns: [
 * //   { metric_id: 10, key: 'weight', value_number: 225, value_text: null, unit: 'lbs' },
 * //   { metric_id: 11, key: 'reps', value_number: 8, value_text: null, unit: null }
 * // ]
 * 
 * @edge_case First-time exercise use
 *   When user selects an exercise they've never logged before.
 *   Returns: null
 *   Frontend: Display empty metric fields for user to fill in from scratch
 * 
 * @edge_case Global exercise used by multiple users
 *   Exercise "Squats" is global. User A logs it in Jan, User B logs it in Feb.
 *   Returns: Only User B's last entry (filtered by w.user_id)
 *   Frontend: User isolation is enforced - no cross-user data leakage
 * 
 * @edge_case Multiple entries for same exercise in one workout
 *   User does 3 sets of squats in single workout = 3 entries for same workout_exercise_id.
 *   Returns: The last entry from that workout (ORDER BY e.id DESC within the most recent workout)
 *   Frontend: Prepopulates from most recent set, which is typical user behavior
 * 
 * @edge_case Deleted workouts (cascade delete)
 *   User deletes a workout containing exercise data. CASCADE DELETE removes entries.
 *   Returns: null
 *   Frontend: Falls back to empty form, same as first-time use
 * 
 * @edge_case Metrics with NULL values
 *   Last entry has incomplete data (e.g., weight=225, reps=null, unit='lbs').
 *   Returns: Metric objects with null fields preserved - ALL metrics for that entry
 *   Frontend: MUST handle null values gracefully when prepopulating inputs
 * 
 * @edge_case Custom metrics + global metrics
 *   Exercise has both global metrics (weight, reps) and user-created metrics (mood, notes).
 *   Returns: ALL metrics from last entry (both global and user-specific)
 *   Frontend: All metrics prepopulated regardless of scope
 * 
 * @edge_case Entry with no metrics
 *   Entry created but no metrics added (edge case, shouldn't happen in normal flow).
 *   Returns: null (entry_metrics JOIN produces no rows)
 *   Frontend: Displays empty form
 * 
 * @edge_case Invalid or non-existent IDs
 *   exerciseId or userId don't exist in database.
 *   Returns: null (WHERE clause matches zero rows)
 *   Frontend: Displays empty form safely - no SQL injection risk
 * 
 * @implementation Uses a subquery to first identify the most recent entry (by workout_date DESC,
 *   then entry_id DESC), then fetches ALL metrics for that entry in the outer query. This ensures
 *   complete metric data is returned, not just a single metric per entry.
 */
export async function getLastEntryForExercise(exerciseId: number, userId: number) {
    const result = await pool.query(
        `SELECT em.metric_id, md.key, em.value_number, em.value_text, em.unit
         FROM entries e
         JOIN workout_exercises we ON e.workout_exercise_id = we.id
         JOIN workouts w ON we.workout_id = w.id
         JOIN entry_metrics em ON e.id = em.entry_id
         JOIN metric_definitions md ON em.metric_id = md.id
         WHERE we.exercise_id = $1 AND w.user_id = $2 
         AND e.id = (
           SELECT e2.id FROM entries e2
           JOIN workout_exercises we2 ON e2.workout_exercise_id = we2.id
           JOIN workouts w2 ON we2.workout_id = w2.id
           WHERE we2.exercise_id = $1 AND w2.user_id = $2
           ORDER BY w2.workout_date DESC, e2.id DESC
           LIMIT 1
         )`,
        [exerciseId, userId]
    );
    return result.rows.length > 0 ? result.rows : null;
}

/**
 * Gets the exercise ID from a workout_exercise ID.
 * Used to resolve the actual exercise being performed from a workout_exercise record.
 * 
 * @param workoutExerciseId - The workout_exercise ID
 * @returns The exercise ID, or null if the workout_exercise doesn't exist
 * 
 * @example
 * const exerciseId = await getExerciseIdFromWorkoutExercise(123);
 * // Returns: 456
 */
export async function getExerciseIdFromWorkoutExercise(workoutExerciseId: number) {
    const result = await pool.query(
        `SELECT exercise_id FROM workout_exercises WHERE id = $1`,
        [workoutExerciseId]
    );
    return result.rows.length > 0 ? result.rows[0].exercise_id : null;
}