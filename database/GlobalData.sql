-- Insert global exercises and capture IDs
WITH inserted_exercises AS (
    INSERT INTO exercises (is_global, name, user_id)
    VALUES
        (TRUE, 'Bench Press', NULL),
        (TRUE, 'Squat', NULL),
        (TRUE, 'Deadlift', NULL),
        (TRUE, 'Treadmill', NULL),
        (TRUE, 'Rowing Machine', NULL)
    RETURNING id, name
),

-- Insert global metrics and capture IDs
inserted_metrics AS (
    INSERT INTO metric_definitions (user_id, key, is_global, display_name, value_type, default_unit)
    VALUES
        (NULL, 'weight', TRUE, 'Weight', 'number', 'kg'),
        (NULL, 'reps', TRUE, 'Repetitions', 'number', 'count'),
        (NULL, 'duration', TRUE, 'Duration', 'number', 'minutes'),
        (NULL, 'distance', TRUE, 'Distance', 'number', 'km'),
        (NULL, 'speed', TRUE, 'Speed', 'number', 'km/h'),
        (NULL, 'incline', TRUE, 'Incline', 'number', '%'),
        (NULL, 'stroke_rate', TRUE, 'Stroke Rate', 'number', 'strokes/min'),
        (NULL, 'distance_rowed', TRUE, 'Distance Rowed', 'number', 'm'),
        (NULL, 'duration_rowing', TRUE, 'Duration Rowing', 'number', 'minutes')
    RETURNING id, key
)

-- Insert into junction table by joining
INSERT INTO metric_exercise_junction (metric_id, exercise_id)
SELECT m.id AS metric_id, e.id AS exercise_id
FROM inserted_exercises e
JOIN inserted_metrics m
    ON ( (e.name = 'Bench Press' AND m.key IN ('weight','reps'))
      OR (e.name = 'Squat' AND m.key IN ('weight','reps'))
      OR (e.name = 'Deadlift' AND m.key IN ('weight','reps'))
      OR (e.name = 'Treadmill' AND m.key IN ('duration','distance','speed'))
      OR (e.name = 'Rowing Machine' AND m.key IN ('stroke_rate','distance_rowed','duration_rowing')));
