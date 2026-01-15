import {
  addWorkoutExercise,
  deleteWorkoutExercise,
  getExercisesForWorkout,
  getWorkoutMeta,
  editWorkoutExercise,
} from "@/lib/exercises";

import pool from "@/lib/db";

function ensureTestEnv() {
  if (
    process.env.NODE_ENV !== "test" &&
    process.env.DATABASE_URL?.includes("fitnessdb_test")
  ) {
    throw new Error("Test DB used outside test environment");
  }
}

describe("exercises.ts integration tests", () => {
  ensureTestEnv();

  let userId = 1;
  let workoutId: number;
  let exerciseId: number;
  let workoutExerciseId: number;

  beforeAll(async () => {
    // Create a test workout
    const res = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, '2026-01-01', 'strength')
       RETURNING id`,
      [userId]
    );
    workoutId = res.rows[0].id;
  });

  afterAll(async () => {
    // Clean up exercises and workout
    await pool.query(`DELETE FROM workout_exercises`);
    await pool.query(`DELETE FROM exercises WHERE user_id = $1`, [userId]);
    await pool.query(`DELETE FROM workouts WHERE id = $1`, [workoutId]);
    await pool.end();
  });

  it("addWorkoutExercise should create new exercise and attach to workout", async () => {
    const added = await addWorkoutExercise(workoutId, { name: "Push Ups" }, userId);

    expect(added).toEqual({ exercise_id: expect.any(Number), name: "Push Ups" });
    exerciseId = added.exercise_id;

    // Verify in DB
    const res = await pool.query(
      `SELECT * FROM workout_exercises WHERE exercise_id = $1 AND workout_id = $2`,
      [exerciseId, workoutId]
    );
    expect(res.rowCount).toBe(1);
    workoutExerciseId = res.rows[0].id;
  });



//   it("getExercisesForWorkout should return all exercises for a workout", async () => {
//     const exercises = await getExercisesForWorkout(workoutId);
//     expect(exercises).toEqual(
//       expect.arrayContaining([
//         { exercise_id: exerciseId, name: "Push Ups" },
//       ])
//     );
//   });

//   it("getWorkoutMeta should return workout date and kind", async () => {
//     const meta = await getWorkoutMeta(workoutId);
//     expect(meta).toEqual({ workout_date: "2026-01-01", workout_kind: "strength" });
//   });

//   it("editWorkoutExercise should update note", async () => {
//     const updated = await editWorkoutExercise(workoutExerciseId, { note: "3x12 reps" }, userId);
//     expect(updated.note).toBe("3x12 reps");
//     expect(updated.exercise_id).toBe(exerciseId);
//   });

    it("getExercisesForWorkout should return all exercises for a workout", async () => {
    const exercises = await getExercisesForWorkout(workoutId, userId);

    expect(exercises).toEqual(
        expect.arrayContaining([
        { exercise_id: exerciseId, name: "Push Ups" },
        ])
    );
    });
    it("getWorkoutMeta should return workout date and kind", async () => {
    const meta = await getWorkoutMeta(workoutId, userId);

    expect(meta).toEqual({
        workout_date: "2026-01-01",
        workout_kind: "strength",
    });
    });


  it("editWorkoutExercise should update exercise name to existing exercise", async () => {
    // Create a second exercise to test reuse
    const res = await pool.query(
      `INSERT INTO exercises (name, is_global, user_id) VALUES ($1, FALSE, $2) RETURNING id`,
      ["Burpees", userId]
    );
    const existingId = res.rows[0].id;

    const updated = await editWorkoutExercise(workoutExerciseId, { name: "Burpees" }, userId);
    expect(Number(updated.exercise_id)).toBe(Number(existingId));
    expect(updated.name).toBe("Burpees");
  });

  it("editWorkoutExercise should create new exercise if name does not exist", async () => {
    const updated = await editWorkoutExercise(workoutExerciseId, { name: "Squats" }, userId);
    expect(updated.name).toBe("Squats");
    expect(updated.exercise_id).toEqual(expect.any(Number));

    // Verify new exercise exists
    const exRes = await pool.query(`SELECT * FROM exercises WHERE name = 'Squats' AND user_id = $1`, [userId]);
    expect(exRes.rowCount).toBe(1);
  });

  it("deleteWorkoutExercise should remove workout_exercise but not exercise", async () => {
    await deleteWorkoutExercise(workoutExerciseId, userId);

    const weRes = await pool.query(`SELECT * FROM workout_exercises WHERE id = $1`, [workoutExerciseId]);
    expect(weRes.rowCount).toBe(0);

    const exRes = await pool.query(`SELECT * FROM exercises WHERE id = $1`, [exerciseId]);
    expect(exRes.rowCount).toBe(1);
  });

  it("deleteWorkoutExercise should throw error for unauthorized user", async () => {
    await expect(deleteWorkoutExercise(workoutExerciseId, 999)).rejects.toThrow();
  });

  it("editWorkoutExercise should throw error for unauthorized user", async () => {
    await expect(editWorkoutExercise(workoutExerciseId, { note: "x" }, 999)).rejects.toThrow();
  });
});
