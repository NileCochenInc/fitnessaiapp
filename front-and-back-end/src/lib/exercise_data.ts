import { clear } from 'console';
import pool from './db';
import { clearWorkoutExerciseEmbedding, clearWorkoutEmbedding } from './clearEmbeddings';

/**
 * Types for entries and metrics
 */
export interface EntryMetric {
  metric_id: number;
  key: string;
  value_number?: number;
  value_text?: string;
  unit?: string;
}

export interface EntryWithMetrics {
  entry_id: number;
  entry_index: number;
  metrics: EntryMetric[];
}

/**
 * Fetch all entries and associated metrics for a given workout_exercise
 * If no entries exist, returns an empty array
 * If the workout_exercise row does not exist, optionally create it or just return empty array
 */
export async function getEntriesAndMetrics(
  workoutExerciseId: number,
  userId: number
): Promise<EntryWithMetrics[]> {
  const client = await pool.connect();
  try {
    // Check if workout_exercise exists for this user
    const weRes = await client.query(
      `
      SELECT we.id
      FROM workout_exercises we
      JOIN workouts w ON we.workout_id = w.id
      WHERE we.id = $1 AND w.user_id = $2
      `,
      [workoutExerciseId, userId]
    );

    // If workout_exercise doesn't exist, return empty array instead of throwing
    if (weRes.rowCount === 0) {
      return [];
    }

    // Fetch entries
    const entriesRes = await client.query(
      `
      SELECT id AS entry_id, entry_index
      FROM entries
      WHERE workout_exercise_id = $1
      ORDER BY entry_index
      `,
      [workoutExerciseId]
    );

    const entries = entriesRes.rows;
    if (entries.length === 0) return []; // no entries yet → return []

    // Fetch metrics for all entries
    const entryIds = entries.map(e => e.entry_id);
    const metricsRes = await client.query(
      `
      SELECT em.entry_id, em.metric_id, md.key, em.value_number, em.value_text, em.unit
      FROM entry_metrics em
      JOIN metric_definitions md ON em.metric_id = md.id
      WHERE em.entry_id = ANY($1::bigint[])
      `,
      [entryIds]
    );

    const metricsByEntry: Record<number, EntryMetric[]> = {};
    metricsRes.rows.forEach(m => {
      if (!metricsByEntry[m.entry_id]) metricsByEntry[m.entry_id] = [];
      metricsByEntry[m.entry_id].push({
        metric_id: m.metric_id,
        key: m.key,
        value_number: m.value_number,
        value_text: m.value_text,
        unit: m.unit,
      });
    });

    return entries.map(e => ({
      entry_id: e.entry_id,
      entry_index: e.entry_index,
      metrics: metricsByEntry[e.entry_id] || [],
    }));
  } finally {
    client.release();
  }
}
/**
 * Replace all entries and metrics for a workout_exercise
 * Only operates if the workout_exercise belongs to the user
 */
export async function replaceEntriesAndMetrics(
  workoutExerciseId: number,
  userId: number,
  entries: {
    entry_index?: number; // optional
    metrics: {
      key?: string;        // optional, in case frontend uses 'metric' instead
      metric?: string;     // fallback for frontend
      value_number?: number;
      value_text?: string;
      unit?: string;
    }[];
  }[]
): Promise<EntryWithMetrics[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify ownership
    const weRes = await client.query(
      `
      SELECT we.id
      FROM workout_exercises we
      JOIN workouts w ON we.workout_id = w.id
      WHERE we.id = $1 AND w.user_id = $2
      `,
      [workoutExerciseId, userId]
    );
    if (weRes.rowCount === 0)
      throw new Error('Workout exercise not found or not owned by user');

    // Delete existing entry_metrics and entries
    const oldEntryRes = await client.query(
      'SELECT id FROM entries WHERE workout_exercise_id = $1',
      [workoutExerciseId]
    );
    const oldEntryIds = oldEntryRes.rows.map(r => r.id);

    if (oldEntryIds.length > 0) {
      await client.query(
        'DELETE FROM entry_metrics WHERE entry_id = ANY($1::bigint[])',
        [oldEntryIds]
      );
      await client.query(
        'DELETE FROM entries WHERE id = ANY($1::bigint[])',
        [oldEntryIds]
      );
    }

    // If entries is empty, commit and return empty array
    if (!entries || entries.length === 0) {
      await client.query('COMMIT');
      return [];
    }

    const result: EntryWithMetrics[] = [];

    // Insert new entries and metrics
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Assign entry_index automatically if missing
      const entryIndex = entry.entry_index ?? i;

      // Insert entry
      const entryRes = await client.query(
        `
        INSERT INTO entries (workout_exercise_id, entry_index)
        VALUES ($1, $2)
        RETURNING id AS entry_id, entry_index
        `,
        [workoutExerciseId, entryIndex]
      );
      const newEntry = entryRes.rows[0];

      const entryMetrics: EntryMetric[] = [];

      for (const metric of entry.metrics) {
        // Use metric.key if present, else fallback to metric.metric
        const metricKey = (metric.key ?? metric.metric ?? "").trim();
        if (!metricKey) throw new Error("Metric key is missing");

        // Check if metric_definition exists (global or user-specific)
        const metricRes = await client.query(
          `
          SELECT id FROM metric_definitions
          WHERE key = $1 AND (is_global = TRUE OR user_id = $2)
          LIMIT 1
          `,
          [metricKey, userId]
        );

        let metricId: number;

        if (metricRes.rowCount! > 0) {
          metricId = metricRes.rows[0].id;
        } else {
          // Create new user-specific metric_definition
          const insertMetricRes = await client.query(
            `
            INSERT INTO metric_definitions (user_id, key, is_global)
            VALUES ($1, $2, FALSE)
            RETURNING id
            `,
            [userId, metricKey]
          );
          metricId = insertMetricRes.rows[0].id;
        }

        // Insert entry_metric
        await client.query(
          `
          INSERT INTO entry_metrics (entry_id, metric_id, value_number, value_text, unit)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            newEntry.entry_id,
            metricId,
            metric.value_number ?? null,
            metric.value_text ?? null,
            metric.unit ?? null,
          ]
        );

        entryMetrics.push({
          metric_id: metricId,
          key: metricKey,
          value_number: metric.value_number,
          value_text: metric.value_text,
          unit: metric.unit,
        });
      }

      result.push({
        entry_id: newEntry.entry_id,
        entry_index: newEntry.entry_index,
        metrics: entryMetrics,
      });
    }

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // clear embeddings
    await clearWorkoutEmbedding(workoutExerciseId, true);
    await clearWorkoutExerciseEmbedding(workoutExerciseId);
    client.release();
  }
}
