import {
  getEntriesAndMetrics,
  replaceEntriesAndMetrics,
} from "@/lib/exercise_data";
import pool from "@/lib/db";

function ensureTestEnv() {
  if (
    process.env.NODE_ENV !== "test" &&
    process.env.DATABASE_URL?.includes("fitnessdb_test")
  ) {
    throw new Error("Test DB used outside test environment");
  }
}

describe("exercise_data integration tests", () => {
  let userId: number;
  let workoutId: number;
  let workoutExerciseId: number;
  let exerciseName: string;

  beforeAll(async () => {
    ensureTestEnv();

    // Create a test user with dummy password hash
    const userRes = await pool.query(
      `
      INSERT INTO users (username, email, goal, password_hash)
      VALUES ('testuser', 'testuser@example.com', 'test goal', 'dummyhash')
      RETURNING id
      `
    );
    userId = Number(userRes.rows[0].id);

    // Create a test workout
    const workoutRes = await pool.query(
      `
      INSERT INTO workouts (user_id, workout_date, workout_kind)
      VALUES ($1, '2023-01-01', 'strength')
      RETURNING id
      `,
      [userId]
    );
    workoutId = Number(workoutRes.rows[0].id);

    // Create a unique test exercise
    exerciseName = `test_exercise_${Date.now()}`;
    const exerciseRes = await pool.query(
      `
      INSERT INTO exercises (is_global, name, user_id)
      VALUES (FALSE, $1, $2)
      RETURNING id
      `,
      [exerciseName, userId]
    );
    const exerciseId = Number(exerciseRes.rows[0].id);

    // Create a workout_exercise
    const weRes = await pool.query(
      `
      INSERT INTO workout_exercises (workout_id, exercise_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [workoutId, exerciseId]
    );
    workoutExerciseId = Number(weRes.rows[0].id);
  });

  afterAll(async () => {
    // Clean up all test data
    await pool.query(`DELETE FROM entry_metrics`);
    await pool.query(`DELETE FROM entries`);
    await pool.query(`DELETE FROM workout_exercises`);
    await pool.query(`DELETE FROM workouts`);
    await pool.query(`DELETE FROM exercises WHERE name = $1`, [exerciseName]);
    await pool.query(`DELETE FROM metric_definitions WHERE key LIKE 'test_%'`);
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await pool.end();
  });

  it("getEntriesAndMetrics returns empty array when no entries exist", async () => {
    const entries = await getEntriesAndMetrics(workoutExerciseId, userId);
    expect(entries).toEqual([]);
  });

  it("replaceEntriesAndMetrics can create entries and metrics", async () => {
    const entriesInput = [
      {
        entry_index: 1,
        metrics: [
          { key: "test_weight", value_number: 100, unit: "kg" },
          { key: "test_reps", value_number: 10 },
        ],
      },
      {
        entry_index: 2,
        metrics: [{ key: "test_weight", value_number: 105, unit: "kg" }],
      },
    ];

    const createdEntries = await replaceEntriesAndMetrics(
      workoutExerciseId,
      userId,
      entriesInput
    );

    expect(createdEntries.length).toBe(2);
    expect(createdEntries[0]).toHaveProperty("entry_id");
    expect(createdEntries[0].metrics.length).toBe(2);
    expect(createdEntries[1].metrics[0].key).toBe("test_weight");
  });

  it("getEntriesAndMetrics returns entries and metrics correctly", async () => {
    const entries = await getEntriesAndMetrics(workoutExerciseId, userId);
    expect(entries.length).toBe(2);
    expect(entries[0]).toHaveProperty("entry_id");
    expect(entries[0].metrics[0]).toHaveProperty("metric_id");
    expect(entries[0].metrics[0].key).toMatch(/test_/);
  });

  it("replaceEntriesAndMetrics deletes existing entries when empty array provided", async () => {
    const result = await replaceEntriesAndMetrics(workoutExerciseId, userId, []);
    expect(result).toEqual([]);

    const entriesRes = await pool.query(
      `SELECT id FROM entries WHERE workout_exercise_id = $1`,
      [workoutExerciseId]
    );
    expect(entriesRes.rows.length).toBe(0);

    const metricsRes = await pool.query(`SELECT id FROM entry_metrics`);
    expect(metricsRes.rows.length).toBe(0);
  });

  it("throws error if workout_exercise does not exist", async () => {
    await expect(
      replaceEntriesAndMetrics(999999, userId, [])
    ).rejects.toThrow("Workout exercise not found or not owned by user");

    // getEntriesAndMetrics returns [] if workout_exercise doesn't exist
    const entries = await getEntriesAndMetrics(999999, userId);
    expect(entries).toEqual([]);
  });

  it("throws error if workout_exercise belongs to another user", async () => {
    // create another user with dummy password hash
    const otherUserRes = await pool.query(
      `
      INSERT INTO users (username, email, goal, password_hash)
      VALUES ('otheruser', 'other@example.com', 'goal', 'dummyhash')
      RETURNING id
      `
    );
    const otherUserId = Number(otherUserRes.rows[0].id);

    const otherWorkoutRes = await pool.query(
      `
      INSERT INTO workouts (user_id, workout_date, workout_kind)
      VALUES ($1, '2023-01-01', 'strength')
      RETURNING id
      `,
      [otherUserId]
    );
    const otherWorkoutId = Number(otherWorkoutRes.rows[0].id);

    const otherExerciseName = `test_exercise_${Date.now()}`;
    const exerciseRes = await pool.query(
      `
      INSERT INTO exercises (is_global, name, user_id)
      VALUES (FALSE, $1, $2)
      RETURNING id
      `,
      [otherExerciseName, otherUserId]
    );
    const exerciseId = Number(exerciseRes.rows[0].id);

    const otherWeRes = await pool.query(
      `
      INSERT INTO workout_exercises (workout_id, exercise_id)
      VALUES ($1, $2)
      RETURNING id
      `,
      [otherWorkoutId, exerciseId]
    );
    const otherWeId = Number(otherWeRes.rows[0].id);

    await expect(
      replaceEntriesAndMetrics(otherWeId, userId, [])
    ).rejects.toThrow("Workout exercise not found or not owned by user");

    // getEntriesAndMetrics still returns [] if owned by another user
    const entries = await getEntriesAndMetrics(otherWeId, userId);
    expect(entries).toEqual([]);

    // cleanup
    await pool.query(`DELETE FROM workout_exercises WHERE id = $1`, [otherWeId]);
    await pool.query(`DELETE FROM workouts WHERE id = $1`, [otherWorkoutId]);
    await pool.query(`DELETE FROM users WHERE id = $1`, [otherUserId]);
    await pool.query(`DELETE FROM exercises WHERE id = $1`, [exerciseId]);
  });
});
