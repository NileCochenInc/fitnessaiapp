import { getExercisesByUserId, getLastEntryForExercise } from "@/lib/autocomplete";
import pool from "@/lib/db";

function ensureTestEnv() {
  if (
    process.env.NODE_ENV !== "test" &&
    process.env.DATABASE_URL?.includes("fitnessdb_test")
  ) {
    throw new Error("Test DB used outside test environment");
  }
}

describe("getExercisesByUserId integration tests", () => {
  let userId: number;
  const globalExercises = [
    "Bench Press",
    "Squat",
    "Deadlift",
    "Treadmill",
    "Rowing Machine",
    "Cable row",
    "Dumbbell Hammer curls",
    "Dumbbell flat bench press",
    "Biceps curl machine",
    "Cable triceps push down",
    "Cable lat raise",
    "Cable kneeling crunch",
    "Tricep dips",
    "Chin-ups",
    "Focus curl",
    "Incline dumbbell curl",
    "Pec fly machine",
    "Dumbbell lat raise",
    "Long lever plank",
    "Smith machine hip thrust",
    "Calf raise",
    "Easy grip curl",
    "Incline dumbbell bench press",
    "Cable oblique twist",
    "Angled leg press machine",
    "Outer thigh machine",
    "Inner thigh machine",
    "Prone leg curl machine",
    "Cable crunch",
  ];

  beforeAll(async () => {
    ensureTestEnv();

    // Create a test user
    const userRes = await pool.query(
      `
      INSERT INTO users (username, email, goal, password_hash)
      VALUES ('autocomplete_testuser', 'autocomplete_test@example.com', 'test goal', 'dummyhash')
      RETURNING id
      `
    );
    userId = Number(userRes.rows[0].id);
  });

  afterAll(async () => {
    // Clean up test user and related data
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  });

  it("should return all global exercises", async () => {
    const result = await getExercisesByUserId(userId);

    // Check that all global exercises are included
    globalExercises.forEach((exerciseName) => {
      expect(result).toContain(exerciseName);
    });
  });
});

describe("getLastEntryForExercise integration tests", () => {
  let userId: number;
  let otherUserId: number;
  let globalExerciseId: number;
  let userExerciseId: number;
  let workoutId: number;
  let workoutExerciseId: number;
  let metricIdWeight: number;
  let metricIdReps: number;

  beforeAll(async () => {
    ensureTestEnv();

    // Create test users
    const userRes = await pool.query(
      `INSERT INTO users (username, email, goal, password_hash)
       VALUES ('lastentry_user1', 'lastentry1@test.com', 'test goal', 'hash1')
       RETURNING id`
    );
    userId = Number(userRes.rows[0].id);

    const otherUserRes = await pool.query(
      `INSERT INTO users (username, email, goal, password_hash)
       VALUES ('lastentry_user2', 'lastentry2@test.com', 'test goal', 'hash2')
       RETURNING id`
    );
    otherUserId = Number(otherUserRes.rows[0].id);

    // Get or create global exercise (Squat should exist from seed data)
    const globalExRes = await pool.query(
      `SELECT id FROM exercises WHERE name = 'Squat' AND is_global = TRUE LIMIT 1`
    );
    globalExerciseId = Number(globalExRes.rows[0].id);

    // Create a user-specific exercise
    const userExRes = await pool.query(
      `INSERT INTO exercises (is_global, name, user_id)
       VALUES (FALSE, 'Custom Exercise', $1)
       RETURNING id`,
      [userId]
    );
    userExerciseId = Number(userExRes.rows[0].id);

    // Create global metric definitions (or get existing ones)
    const weightRes = await pool.query(
      `SELECT id FROM metric_definitions WHERE key = 'weight' AND is_global = TRUE LIMIT 1`
    );
    if (weightRes.rows.length > 0) {
      metricIdWeight = Number(weightRes.rows[0].id);
    } else {
      const insertWeightRes = await pool.query(
        `INSERT INTO metric_definitions (user_id, key, is_global, display_name, value_type, default_unit)
         VALUES (NULL, 'weight', TRUE, 'Weight', 'number', 'lbs')
         RETURNING id`
      );
      metricIdWeight = Number(insertWeightRes.rows[0].id);
    }

    const repsRes = await pool.query(
      `SELECT id FROM metric_definitions WHERE key = 'reps' AND is_global = TRUE LIMIT 1`
    );
    if (repsRes.rows.length > 0) {
      metricIdReps = Number(repsRes.rows[0].id);
    } else {
      const insertRepsRes = await pool.query(
        `INSERT INTO metric_definitions (user_id, key, is_global, display_name, value_type, default_unit)
         VALUES (NULL, 'reps', TRUE, 'Reps', 'number', NULL)
         RETURNING id`
      );
      metricIdReps = Number(insertRepsRes.rows[0].id);
    }

    // Create a workout
    const workoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE, 'strength')
       RETURNING id`,
      [userId]
    );
    workoutId = Number(workoutRes.rows[0].id);

    // Create a workout_exercise
    const weRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id)
       VALUES ($1, $2)
       RETURNING id`,
      [globalExerciseId, workoutId]
    );
    workoutExerciseId = Number(weRes.rows[0].id);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE id = $1 OR id = $2", [userId, otherUserId]);
    await pool.end();
  });

  // Clean up test-specific data after each test
  afterEach(async () => {
    // Delete all workouts created during tests (exclude the one from beforeAll which is CURRENT_DATE)
    await pool.query(
      `DELETE FROM workouts WHERE user_id = $1 AND workout_date < CURRENT_DATE - INTERVAL '1 day'`,
      [userId]
    );
    // Delete custom metrics created during tests
    await pool.query(
      `DELETE FROM metric_definitions WHERE user_id = $1 AND key NOT IN ('weight', 'reps')`,
      [userId]
    );
  });

  // ===== EDGE CASE 1: First-time exercise use =====
  it("should return null when exercise has no previous entries (first-time use)", async () => {
    // Create a new global exercise with no entries
    const newExRes = await pool.query(
      `INSERT INTO exercises (is_global, name)
       VALUES (TRUE, 'Never Used Exercise ' || random())
       RETURNING id`
    );
    const newExerciseId = Number(newExRes.rows[0].id);

    const result = await getLastEntryForExercise(newExerciseId, userId);
    expect(result).toBeNull();
  });

  // ===== EDGE CASE 2: Global exercise used by multiple users =====
  it("should return only the requesting user's entries, not other users' entries", async () => {
    // User 1 creates an entry
    const entry1Res = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [workoutExerciseId]
    );
    const entryId1 = Number(entry1Res.rows[0].id);

    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit)
       VALUES ($1, $2, 225, 'lbs')`,
      [entryId1, metricIdWeight]
    );

    // User 2 creates a workout with same exercise and different entry
    const user2WorkoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE - INTERVAL '1 day', 'strength')
       RETURNING id`,
      [otherUserId]
    );
    const user2WorkoutId = Number(user2WorkoutRes.rows[0].id);

    const user2WeRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [globalExerciseId, user2WorkoutId]
    );
    const user2WeId = Number(user2WeRes.rows[0].id);

    const entry2Res = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [user2WeId]
    );
    const entryId2 = Number(entry2Res.rows[0].id);

    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit)
       VALUES ($1, $2, 315, 'lbs')`,
      [entryId2, metricIdWeight]
    );

    // User 1 should get User 1's data (225), not User 2's (315)
    const result = await getLastEntryForExercise(globalExerciseId, userId);
    expect(result).not.toBeNull();
    expect(result!).toHaveLength(1);
    expect(result![0].value_number).toBe(225);
  });

  // ===== EDGE CASE 3: Multiple entries for same exercise in one workout =====
  it("should return the last entry when multiple entries exist for the same workout_exercise", async () => {
    // Create another workout for clean test
    const workout2Res = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE, 'strength')
       RETURNING id`,
      [userId]
    );
    const workout2Id = Number(workout2Res.rows[0].id);

    const we2Res = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [globalExerciseId, workout2Id]
    );
    const we2Id = Number(we2Res.rows[0].id);

    // Create 3 entries (sets) for the same workout_exercise
    const entry1Res = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [we2Id]
    );
    const e1 = Number(entry1Res.rows[0].id);

    const entry2Res = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 2) RETURNING id`,
      [we2Id]
    );
    const e2 = Number(entry2Res.rows[0].id);

    const entry3Res = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 3) RETURNING id`,
      [we2Id]
    );
    const e3 = Number(entry3Res.rows[0].id);

    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES ($1, $2, 185)`,
      [e1, metricIdWeight]
    );
    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES ($1, $2, 205)`,
      [e2, metricIdWeight]
    );
    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES ($1, $2, 225)`,
      [e3, metricIdWeight]
    );

    // Should return the last entry (225 lbs)
    const result = await getLastEntryForExercise(globalExerciseId, userId);
    expect(result).not.toBeNull();
    expect(result![0].value_number).toBe(225);
  });

  // ===== EDGE CASE 4: Deleted workouts (cascade delete) =====
  it("should return null when all entries are deleted via cascade delete", async () => {
    // Create a unique exercise for this test
    const testExRes = await pool.query(
      `INSERT INTO exercises (is_global, name)
       VALUES (TRUE, 'Test Cascade Exercise ' || random())
       RETURNING id`
    );
    const testExerciseId = Number(testExRes.rows[0].id);

    // Create workout with entry
    const workoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE - INTERVAL '5 days', 'strength')
       RETURNING id`,
      [userId]
    );
    const wId = Number(workoutRes.rows[0].id);

    const weRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [testExerciseId, wId]
    );
    const weId = Number(weRes.rows[0].id);

    const entryRes = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [weId]
    );
    const eId = Number(entryRes.rows[0].id);

    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES ($1, $2, 200)`,
      [eId, metricIdWeight]
    );

    // Verify entry exists
    let result = await getLastEntryForExercise(testExerciseId, userId);
    expect(result).not.toBeNull();

    // Delete the workout (cascades to entries and metrics)
    await pool.query("DELETE FROM workouts WHERE id = $1", [wId]);

    // Should return null now
    result = await getLastEntryForExercise(testExerciseId, userId);
    expect(result).toBeNull();
  });

  // ===== EDGE CASE 5: Metrics with NULL values =====
  it("should return metrics with null values preserved", async () => {
    // Create a unique exercise for this test
    const testExRes = await pool.query(
      `INSERT INTO exercises (is_global, name)
       VALUES (TRUE, 'Test Null Values Exercise ' || random())
       RETURNING id`
    );
    const testExerciseId = Number(testExRes.rows[0].id);

    const workoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE - INTERVAL '2 days', 'strength')
       RETURNING id`,
      [userId]
    );
    const wId = Number(workoutRes.rows[0].id);

    const weRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [testExerciseId, wId]
    );
    const weId = Number(weRes.rows[0].id);

    const entryRes = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [weId]
    );
    const eId = Number(entryRes.rows[0].id);

    // Insert weight with value, but reps as NULL
    const weightInsert = await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES ($1, $2, 250, 'lbs')`,
      [eId, metricIdWeight]
    );

    // Only insert reps if it exists
    if (metricIdReps) {
      const repsInsert = await pool.query(
        `INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES ($1, $2, NULL, NULL)`,
        [eId, metricIdReps]
      );
    }

    const result = await getLastEntryForExercise(testExerciseId, userId);
    expect(result).not.toBeNull();
    // Should have at least weight metric
    expect(result!.some((m) => m.key === "weight")).toBe(true);
    // If reps exists, should be present
    const repsMetric = result!.find((m) => m.key === "reps");
    if (repsMetric) {
      expect(repsMetric.value_number).toBeNull();
      expect(repsMetric.unit).toBeNull();
    }
  });

  // ===== EDGE CASE 6: Custom metrics + global metrics =====
  it("should return both global and user-specific metrics", async () => {
    // Create a unique exercise for this test
    const testExRes = await pool.query(
      `INSERT INTO exercises (is_global, name)
       VALUES (TRUE, 'Test Custom Metrics Exercise ' || random())
       RETURNING id`
    );
    const testExerciseId = Number(testExRes.rows[0].id);

    // Create user-specific metric with unique name
    const customMetricRes = await pool.query(
      `INSERT INTO metric_definitions (user_id, key, is_global, display_name)
       VALUES ($1, 'mood_' || random()::text, FALSE, 'Mood')
       RETURNING id`,
      [userId]
    );
    const customMetricId = Number(customMetricRes.rows[0].id);

    // Create workout with entries
    const workoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE - INTERVAL '3 days', 'strength')
       RETURNING id`,
      [userId]
    );
    const wId = Number(workoutRes.rows[0].id);

    const weRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [testExerciseId, wId]
    );
    const weId = Number(weRes.rows[0].id);

    const entryRes = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [weId]
    );
    const eId = Number(entryRes.rows[0].id);

    // Ensure metricIdWeight is set
    expect(metricIdWeight).toBeGreaterThan(0);

    // Add both global and custom metrics
    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES ($1, $2, 245, 'lbs')`,
      [eId, metricIdWeight]
    );
    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_text) VALUES ($1, $2, 'Great')`,
      [eId, customMetricId]
    );

    const result = await getLastEntryForExercise(testExerciseId, userId);
    expect(result).not.toBeNull();
    // Should have at least weight metric and custom metric
    expect(result!.length).toBeGreaterThanOrEqual(2);
    expect(result!.some((m) => m.key === "weight")).toBe(true);
    expect(result!.some((m) => m.key.includes("mood"))).toBe(true);
  });

  // ===== EDGE CASE 7: Entry with no metrics =====
  it("should return null when entry exists but has no associated metrics", async () => {
    // Create a unique exercise for this test
    const testExRes = await pool.query(
      `INSERT INTO exercises (is_global, name)
       VALUES (TRUE, 'Test No Metrics Exercise ' || random())
       RETURNING id`
    );
    const testExerciseId = Number(testExRes.rows[0].id);

    const workoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE - INTERVAL '4 days', 'strength')
       RETURNING id`,
      [userId]
    );
    const wId = Number(workoutRes.rows[0].id);

    const weRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [testExerciseId, wId]
    );
    const weId = Number(weRes.rows[0].id);

    // Create entry but don't add metrics
    await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1)`,
      [weId]
    );

    const result = await getLastEntryForExercise(testExerciseId, userId);
    expect(result).toBeNull();
  });

  // ===== EDGE CASE 8: Invalid/non-existent IDs =====
  it("should return null for non-existent exerciseId", async () => {
    const result = await getLastEntryForExercise(999999, userId);
    expect(result).toBeNull();
  });

  it("should return null for non-existent userId", async () => {
    const result = await getLastEntryForExercise(globalExerciseId, 999999);
    expect(result).toBeNull();
  });

  // ===== BONUS: User-specific exercises =====
  it("should work with user-specific exercises", async () => {
    const workoutRes = await pool.query(
      `INSERT INTO workouts (user_id, workout_date, workout_kind)
       VALUES ($1, CURRENT_DATE, 'strength')
       RETURNING id`,
      [userId]
    );
    const wId = Number(workoutRes.rows[0].id);

    const weRes = await pool.query(
      `INSERT INTO workout_exercises (exercise_id, workout_id) VALUES ($1, $2) RETURNING id`,
      [userExerciseId, wId]
    );
    const weId = Number(weRes.rows[0].id);

    const entryRes = await pool.query(
      `INSERT INTO entries (workout_exercise_id, entry_index) VALUES ($1, 1) RETURNING id`,
      [weId]
    );
    const eId = Number(entryRes.rows[0].id);

    await pool.query(
      `INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES ($1, $2, 100)`,
      [eId, metricIdWeight]
    );

    const result = await getLastEntryForExercise(userExerciseId, userId);
    expect(result).not.toBeNull();
    expect(result![0].value_number).toBe(100);
  });
});