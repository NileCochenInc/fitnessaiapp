-- 1. Create demo user
INSERT INTO users (username, email, goal, password_hash)
VALUES ('demo_user', 'demo@example.com', 'Build strength and consistency', '$2b$10$example_hash')
RETURNING id;



-- Dec 23
-- 2. Insert a workout and capture its ID
WITH workout_insert AS (
    INSERT INTO workouts (workout_date, user_id, workout_kind)
    VALUES ('2025-12-23', 1, 'strength')
    RETURNING id AS workout_id
)

-- 3. Add workout_exercises for the first workout
INSERT INTO workout_exercises (workout_id, exercise_id, note)
SELECT 1 AS workout_id, e.id AS exercise_id, NULL AS note
FROM exercises e
WHERE e.is_global = TRUE
  AND e.name IN (
    'Cable row',
    'Dumbbell Hammer curls',
    'Dumbbell flat bench press',
    'Biceps curl machine',
    'Cable triceps push down',
    'Dumbbell Incline bench',
    'Cable lat raise',
    'Cable kneeling crunch'
  )
RETURNING id, exercise_id;

-- 4. Insert 3 entries per workout_exercise
WITH entries_insert AS (
    SELECT we.id AS workout_exercise_id, gs.entry_index
    FROM workout_exercises we
    CROSS JOIN (VALUES (1), (2), (3)) AS gs(entry_index)
)
INSERT INTO entries (workout_exercise_id, entry_index)
SELECT workout_exercise_id, entry_index
FROM entries_insert
RETURNING id, workout_exercise_id, entry_index;

-- 5. insert entry metrics
-- Insert entry metrics (weight and reps) for Dec 23, 2025
WITH metric_ids AS (
    SELECT id AS metric_id, key
    FROM metric_definitions
    WHERE is_global = TRUE
      AND key IN ('weight', 'reps')
),
entry_values AS (
    -- Map each exercise's entries to the weight/reps for each set
    SELECT e.id AS entry_id, we.exercise_id, e.entry_index,
           CASE 
               WHEN ex.name = 'Cable row' THEN 120
               WHEN ex.name = 'Dumbbell Hammer curls' THEN 30
               WHEN ex.name = 'Dumbbell flat bench press' THEN 55
               WHEN ex.name = 'Biceps curl machine' AND e.entry_index = 1 THEN 60
               WHEN ex.name = 'Biceps curl machine' AND e.entry_index IN (2,3) THEN 65
               WHEN ex.name = 'Cable triceps push down' THEN 110
               WHEN ex.name = 'Dumbbell Incline bench' AND e.entry_index = 1 THEN 40
               WHEN ex.name = 'Dumbbell Incline bench' AND e.entry_index IN (2,3) THEN 45
               WHEN ex.name = 'Cable lat raise' THEN 15
               WHEN ex.name = 'Cable kneeling crunch' THEN 120
           END AS weight,
           CASE
               WHEN ex.name = 'Cable row' AND e.entry_index = 1 THEN 10
               WHEN ex.name = 'Cable row' AND e.entry_index = 2 THEN 12
               WHEN ex.name = 'Cable row' AND e.entry_index = 3 THEN 12
               WHEN ex.name = 'Dumbbell Hammer curls' AND e.entry_index = 1 THEN 7
               WHEN ex.name = 'Dumbbell Hammer curls' AND e.entry_index = 2 THEN 8
               WHEN ex.name = 'Dumbbell Hammer curls' AND e.entry_index = 3 THEN 7
               WHEN ex.name = 'Dumbbell flat bench press' AND e.entry_index = 1 THEN 10
               WHEN ex.name = 'Dumbbell flat bench press' AND e.entry_index = 2 THEN 9
               WHEN ex.name = 'Dumbbell flat bench press' AND e.entry_index = 3 THEN 7
               WHEN ex.name = 'Biceps curl machine' AND e.entry_index = 1 THEN 12
               WHEN ex.name = 'Biceps curl machine' AND e.entry_index = 2 THEN 10
               WHEN ex.name = 'Biceps curl machine' AND e.entry_index = 3 THEN 8
               WHEN ex.name = 'Cable triceps push down' AND e.entry_index = 1 THEN 12
               WHEN ex.name = 'Cable triceps push down' AND e.entry_index = 2 THEN 9
               WHEN ex.name = 'Cable triceps push down' AND e.entry_index = 3 THEN 6
               WHEN ex.name = 'Dumbbell Incline bench' AND e.entry_index = 1 THEN 10
               WHEN ex.name = 'Dumbbell Incline bench' AND e.entry_index = 2 THEN 9
               WHEN ex.name = 'Dumbbell Incline bench' AND e.entry_index = 3 THEN 8
               WHEN ex.name = 'Cable lat raise' THEN 10
               WHEN ex.name = 'Cable kneeling crunch' THEN 20
           END AS reps
    FROM entries e
    JOIN workout_exercises we ON e.workout_exercise_id = we.id
    JOIN exercises ex ON we.exercise_id = ex.id
)
INSERT INTO entry_metrics (entry_id, metric_id, value_number)
SELECT ev.entry_id, m.metric_id,
       CASE 
           WHEN m.key = 'weight' THEN ev.weight
           WHEN m.key = 'reps' THEN ev.reps
       END
FROM entry_values ev
CROSS JOIN metric_ids m
WHERE (m.key = 'weight' AND ev.weight IS NOT NULL)
   OR (m.key = 'reps' AND ev.reps IS NOT NULL)
RETURNING entry_id, metric_id, value_number;


