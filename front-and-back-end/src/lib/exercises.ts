import pool from './db';
import { clearWorkoutEmbedding, clearWorkoutExerciseEmbedding } from './clearEmbeddings';
import { clear } from 'console';


/**
 * Add or reuse an exercise, then attach it to a workout
 */
export async function addWorkoutExercise(
  workoutId: number,
  data: { name: string },
  userId: number
): Promise<{ workout_exercise_id: number; exercise_id: number; name: string }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1️⃣ Check if workout exists
    const workoutRes = await client.query(
      'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
      [workoutId, userId]
    );
    if (workoutRes.rowCount === 0) {
      throw new Error('Workout not found or unauthorized');
    }

    // 2️⃣ Check if exercise exists
    let exerciseRes = await client.query(
      `SELECT id FROM exercises
       WHERE name = $1 AND (is_global = TRUE OR user_id = $2)`,
      [data.name, userId]
    );

    let exerciseId: number;
    if (exerciseRes.rowCount === 0) {
      const insertExercise = await client.query(
        `INSERT INTO exercises (name, is_global, user_id)
         VALUES ($1, FALSE, $2)
         RETURNING id`,
        [data.name, userId]
      );
      exerciseId = Number(insertExercise.rows[0].id);
    } else {
      exerciseId = Number(exerciseRes.rows[0].id);
    }

    // 3️⃣ Insert into workout_exercises and RETURN ID
    const insertWorkoutExercise = await client.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id)
       VALUES ($1, $2)
       RETURNING id`,
      [exerciseId, workoutId]
    );

    const workoutExerciseId = Number(insertWorkoutExercise.rows[0].id);

    await client.query('COMMIT');

    return {
      workout_exercise_id: workoutExerciseId,
      exercise_id: exerciseId,
      name: data.name,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // clear workout embedding
    await clearWorkoutEmbedding(workoutId);
    client.release();
  }
}


/**
 * Delete a workout_exercise (does not delete exercise itself)
 */
export async function deleteWorkoutExercise(
  workoutExerciseId: number,
  userId: number
): Promise<void> {
  const res = await pool.query(
    `DELETE FROM workout_exercises we
     USING workouts w
     WHERE we.id = $1 AND we.workout_id = w.id AND w.user_id = $2`,
    [workoutExerciseId, userId]
  );
  if (res.rowCount === 0) {
    throw new Error('Workout exercise not found or unauthorized');
  }
  // clear workout embedding
  await clearWorkoutEmbedding(workoutExerciseId, true);
}

// /**
//  * Get all exercises linked to a workout
//  */
// export async function getExercisesForWorkout(
//   workoutId: number
// ): Promise<{ exercise_id: number; name: string }[]> {
//   const res = await pool.query(
//     `SELECT e.id AS exercise_id, e.name
//      FROM workout_exercises we
//      JOIN exercises e ON we.exercise_id = e.id
//      WHERE we.workout_id = $1`,
//     [workoutId]
//   );
//   return res.rows.map(row => ({
//     exercise_id: Number(row.exercise_id), // <-- cast here
//     name: row.name,
//     }));
// }

// /**
//  * Get workout meta (date + kind)
//  */
// export async function getWorkoutMeta(
//   workoutId: number
// ): Promise<{ workout_date: string; workout_kind: string }> {
//   const res = await pool.query(
//     `SELECT workout_date::text, workout_kind
//      FROM workouts
//      WHERE id = $1`,
//     [workoutId]
//   );
//   if (res.rowCount === 0) throw new Error('Workout not found');
//   return res.rows[0];
// }


/**
 * Get all exercises linked to a workout (auth-safe)
 */
export async function getExercisesForWorkout(
  workoutId: number,
  userId: number
): Promise<{ workout_exercise_id: number; exercise_id: number; name: string }[]> {
  const res = await pool.query(
    `SELECT we.id AS workout_exercise_id, e.id AS exercise_id, e.name
     FROM workout_exercises we
     JOIN workouts w ON we.workout_id = w.id
     JOIN exercises e ON we.exercise_id = e.id
     WHERE we.workout_id = $1
       AND w.user_id = $2`,
    [workoutId, userId]
  );

  return res.rows.map(row => ({
    workout_exercise_id: Number(row.workout_exercise_id), // needed for DELETE
    exercise_id: Number(row.exercise_id),
    name: row.name,
  }));
}

/**
 * Get workout meta (date + kind) (auth-safe)
 */
export async function getWorkoutMeta(
  workoutId: number,
  userId: number
): Promise<{ workout_date: string; workout_kind: string }> {
  const res = await pool.query(
    `SELECT workout_date::text, workout_kind
     FROM workouts
     WHERE id = $1
       AND user_id = $2`,
    [workoutId, userId]
  );

  if (res.rowCount === 0) {
    throw new Error('Workout not found or unauthorized');
  }

  return res.rows[0];
}





/**
 * Edit a workout_exercise
 */
export async function editWorkoutExercise(
  workoutExerciseId: number,
  data: { name?: string; note?: string },
  userId: number
): Promise<{ workout_exercise_id: number; exercise_id: number; name: string; note: string | null }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1️⃣ Ensure workout_exercise exists and belongs to user
    const weRes = await client.query(
      `SELECT we.id, we.exercise_id, we.workout_id
       FROM workout_exercises we
       JOIN workouts w ON we.workout_id = w.id
       WHERE we.id = $1 AND w.user_id = $2`,
      [workoutExerciseId, userId]
    );
    if (weRes.rowCount === 0) throw new Error('Workout exercise not found or unauthorized');

    let exerciseId = Number(weRes.rows[0].exercise_id);

    // 2️⃣ Handle name change if provided
    if (data.name) {
      const exRes = await client.query(
        `SELECT id FROM exercises WHERE name = $1 AND (is_global = TRUE OR user_id = $2)`,
        [data.name, userId]
      );

      if (exRes.rowCount === 0) {
        // Create new user-specific exercise
        const insertEx = await client.query(
          `INSERT INTO exercises (name, is_global, user_id) VALUES ($1, FALSE, $2) RETURNING id`,
          [data.name, userId]
        );
        exerciseId = Number(insertEx.rows[0].id);
      } else {
        exerciseId = Number(exRes.rows[0].id);
      }
    }

    // 3️⃣ Update workout_exercise row
    const updateFields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.note !== undefined) {
      updateFields.push(`note = $${idx}`);
      values.push(data.note);
      idx++;
    }
    if (data.name) {
      updateFields.push(`exercise_id = $${idx}`);
      values.push(exerciseId);
      idx++;
    }

    let updated = weRes.rows[0]; // fallback in case no update needed
    if (updateFields.length > 0) {
      const updateRes = await client.query(
        `UPDATE workout_exercises SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`,
        [...values, workoutExerciseId]
      );
      updated = updateRes.rows[0];
    }

    await client.query('COMMIT');

    // 4️⃣ Return updated row with exercise name
    const exerciseNameRes = await client.query('SELECT name FROM exercises WHERE id = $1', [exerciseId]);
    return {
      workout_exercise_id: Number(updated.id),
      exercise_id: Number(exerciseId),
      name: exerciseNameRes.rows[0].name,
      note: updated.note,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // clear workout and workout_exercise embeddings
    await clearWorkoutEmbedding(workoutExerciseId, true);
    await clearWorkoutExerciseEmbedding(workoutExerciseId);
    client.release();
  }
}
