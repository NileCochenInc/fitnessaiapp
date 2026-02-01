-- Insert global exercises and capture IDs
WITH inserted_exercises AS (
    INSERT INTO exercises (is_global, name, user_id)
    VALUES
        (TRUE, 'Bench Press', NULL),
        (TRUE, 'Squat', NULL),
        (TRUE, 'Deadlift', NULL),
        (TRUE, 'Treadmill', NULL),
        (TRUE, 'Rowing Machine', NULL),
        (TRUE, 'Cable row', NULL),
        (TRUE, 'Dumbbell Hammer curls', NULL),
        (TRUE, 'Dumbbell flat bench press', NULL),
        (TRUE, 'Biceps curl machine', NULL),
        (TRUE, 'Cable triceps push down', NULL),
        (TRUE, 'Cable lat raise', NULL),
        (TRUE, 'Cable kneeling crunch', NULL),
        (TRUE, 'Tricep dips', NULL),
        (TRUE, 'Chin-ups', NULL),
        (TRUE, 'Focus curl', NULL),
        (TRUE, 'Incline dumbbell curl', NULL),
        (TRUE, 'Pec fly machine', NULL),
        (TRUE, 'Dumbbell lat raise', NULL),
        (TRUE, 'Long lever plank', NULL),
        (TRUE, 'Smith machine hip thrust', NULL),
        (TRUE, 'Calf raise', NULL),
        (TRUE, 'Easy grip curl', NULL),
        (TRUE, 'Incline dumbbell bench press', NULL),
        (TRUE, 'Cable oblique twist', NULL),
        (TRUE, 'Angled leg press machine', NULL),
        (TRUE, 'Outer thigh machine', NULL),
        (TRUE, 'Inner thigh machine', NULL),
        (TRUE, 'Prone leg curl machine', NULL),
        (TRUE, 'Cable crunch', NULL)
    RETURNING id, name
),

-- Insert global metrics and capture IDs
inserted_metrics AS (
    INSERT INTO metric_definitions (user_id, key, is_global, display_name, value_type, default_unit)
    VALUES
        (NULL, 'weight', TRUE, 'Weight', 'number', 'lbs'),
        (NULL, 'reps', TRUE, 'Repetitions', 'number', NULL),
        (NULL, 'duration', TRUE, 'Duration', 'number', 'minutes'),
        (NULL, 'distance', TRUE, 'Distance', 'number', 'km'),
        (NULL, 'speed', TRUE, 'Speed', 'number', 'km/h'),
        (NULL, 'stroke_rate', TRUE, 'Stroke Rate', 'number', 'strokes/min')
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
      OR (e.name = 'Cable row' AND m.key IN ('weight','reps'))
      OR (e.name = 'Dumbbell Hammer curls' AND m.key IN ('weight','reps'))
      OR (e.name = 'Dumbbell flat bench press' AND m.key IN ('weight','reps'))
      OR (e.name = 'Biceps curl machine' AND m.key IN ('weight','reps'))
      OR (e.name = 'Cable triceps push down' AND m.key IN ('weight','reps'))
      OR (e.name = 'Cable lat raise' AND m.key IN ('weight','reps'))
      OR (e.name = 'Cable kneeling crunch' AND m.key IN ('weight','reps'))
      OR (e.name = 'Tricep dips' AND m.key IN ('reps'))
      OR (e.name = 'Chin-ups' AND m.key IN ('reps'))
      OR (e.name = 'Focus curl' AND m.key IN ('weight','reps'))
      OR (e.name = 'Incline dumbbell curl' AND m.key IN ('weight','reps'))
      OR (e.name = 'Pec fly machine' AND m.key IN ('weight','reps'))
      OR (e.name = 'Dumbbell lat raise' AND m.key IN ('weight','reps'))
      OR (e.name = 'Smith machine hip thrust' AND m.key IN ('weight','reps'))
      OR (e.name = 'Calf raise' AND m.key IN ('weight','reps'))
      OR (e.name = 'Easy grip curl' AND m.key IN ('weight','reps'))
      OR (e.name = 'Incline dumbbell bench press' AND m.key IN ('weight','reps'))
      OR (e.name = 'Cable oblique twist' AND m.key IN ('weight','reps'))
      OR (e.name = 'Cable crunch' AND m.key IN ('weight','reps'))
      OR (e.name = 'Angled leg press machine' AND m.key IN ('weight','reps'))
      OR (e.name = 'Outer thigh machine' AND m.key IN ('weight','reps'))
      OR (e.name = 'Inner thigh machine' AND m.key IN ('weight','reps'))
      OR (e.name = 'Prone leg curl machine' AND m.key IN ('weight','reps'))
      OR (e.name = 'Long lever plank' AND m.key IN ('duration'))
      OR (e.name = 'Treadmill' AND m.key IN ('duration','distance','speed'))
      OR (e.name = 'Rowing Machine' AND m.key IN ('stroke_rate','distance','duration'))
    );
