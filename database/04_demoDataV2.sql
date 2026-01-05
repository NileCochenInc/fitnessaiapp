-- ==============================
-- Dec 23, 2025 - Demo Workout
-- ==============================

-- Insert the workout
WITH workout_insert AS (
    INSERT INTO workouts (workout_date, user_id, workout_kind)
    VALUES ('2025-12-23', 1, 'strength')
    RETURNING id AS workout_id
),

-- Map global exercises to IDs
exercise_ids AS (
    SELECT id AS exercise_id, name
    FROM exercises
    WHERE is_global = TRUE
      AND name IN (
          'Cable row',
          'Dumbbell Hammer curls',
          'Dumbbell flat bench press',
          'Biceps curl machine',
          'Cable triceps push down',
          'Dumbbell Incline bench',
          'Cable lat raise',
          'Cable kneeling crunch'
      )
),

-- Map global metrics to IDs
metric_ids AS (
    SELECT id AS metric_id, key
    FROM metric_definitions
    WHERE is_global = TRUE
      AND key IN ('weight', 'reps')
),

-- Insert workout_exercises
workout_exercises_insert AS (
    INSERT INTO workout_exercises (workout_id, exercise_id)
    SELECT w.workout_id, e.exercise_id
    FROM workout_insert w
    CROSS JOIN exercise_ids e
    RETURNING id AS workout_exercise_id, exercise_id
),

-- Insert entries per exercise
entries_insert AS (
    -- Cable row: 120 lbs, reps 10, 12, 12
    INSERT INTO entries (workout_exercise_id, entry_index)
    SELECT we.workout_exercise_id, v.entry_index
    FROM workout_exercises_insert we
    JOIN (VALUES 
        ('Cable row', 1, 120, 10),
        ('Cable row', 2, 120, 12),
        ('Cable row', 3, 120, 12),
        ('Dumbbell Hammer curls', 1, 30, 7),
        ('Dumbbell Hammer curls', 2, 30, 8),
        ('Dumbbell Hammer curls', 3, 30, 7),
        ('Dumbbell flat bench press', 1, 55, 10),
        ('Dumbbell flat bench press', 2, 55, 9),
        ('Dumbbell flat bench press', 3, 55, 7),
        ('Biceps curl machine', 1, 60, 12),
        ('Biceps curl machine', 2, 65, 10),
        ('Biceps curl machine', 3, 65, 8),
        ('Cable triceps push down', 1, 110, 12),
        ('Cable triceps push down', 2, 110, 9),
        ('Cable triceps push down', 3, 110, 6),
        ('Dumbbell Incline bench', 1, 40, 10),
        ('Dumbbell Incline bench', 2, 45, 9),
        ('Dumbbell Incline bench', 3, 45, 8),
        ('Cable lat raise', 1, 15, 10),
        ('Cable lat raise', 2, 15, 10),
        ('Cable lat raise', 3, 15, 10),
        ('Cable kneeling crunch', 1, 120, 20),
        ('Cable kneeling crunch', 2, 120, 20),
        ('Cable kneeling crunch', 3, 120, 20)
    ) AS v(ex_name, entry_index, weight_val, reps_val)
      ON v.ex_name = (SELECT name FROM exercise_ids WHERE exercise_id = we.exercise_id)
    RETURNING id AS entry_id, workout_exercise_id, entry_index, weight_val, reps_val
),

-- Insert entry_metrics for weight and reps
entry_metrics_insert AS (
    INSERT INTO entry_metrics (entry_id, metric_id, value_number)
    SELECT e.entry_id, m.metric_id, CASE
        WHEN m.key = 'weight' THEN e.weight_val
        WHEN m.key = 'reps' THEN e.reps_val
    END
    FROM entries_insert e
    CROSS JOIN metric_ids m
    WHERE (m.key = 'weight' AND e.weight_val IS NOT NULL)
       OR (m.key = 'reps' AND e.reps_val IS NOT NULL)
)
SELECT 'Dec 23 demo data inserted' AS status;
