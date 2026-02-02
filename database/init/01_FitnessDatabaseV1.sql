
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    goal TEXT NOT NULL,
    password_hash TEXT,
    google_id VARCHAR(255) UNIQUE,
    provider VARCHAR(50)
);

--period of athletic work
CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    workout_date DATE NOT NULL,
    user_id BIGINT NOT NULL,
    workout_kind VARCHAR(50), -- strength, rowing, mixed, unknown
    embeddings VECTOR(1024),
    workout_text TEXT,
    CONSTRAINT fk_workouts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

--type of athletic work eg squats
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    is_global BOOLEAN NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT, -- null if is global is true
    CONSTRAINT fk_exercises_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_global_user_id --enforce is_global and user_id mutual exclusivity
        CHECK (
            (is_global = TRUE AND user_id IS NULL)
            OR
            (is_global = FALSE AND user_id IS NOT NULL)
        ),
    CONSTRAINT uniq_global_name
        UNIQUE (name, is_global)  -- ensures no duplicate global names
);

--instance of predefined exercise done on workout
CREATE TABLE workout_exercises (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    workout_id BIGINT NOT NULL,
    note TEXT,
    embeddings VECTOR(1024),
    exercise_text TEXT,
    CONSTRAINT fk_workout_exercises_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_exercises_workout
        FOREIGN KEY (workout_id) REFERENCES workouts(id)
        ON DELETE CASCADE,
    CONSTRAINT workout_exercise_unique
        UNIQUE (exercise_id, workout_id)
);

--instance exercise done eg "set"
CREATE TABLE entries (
    id BIGSERIAL PRIMARY KEY,
    workout_exercise_id BIGINT NOT NULL,
    entry_index BIGINT NOT NULL, -- what order entries happen in
    CONSTRAINT fk_entries_workout_exercise
        FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id)
        ON DELETE CASCADE
);

--user created metrics
CREATE TABLE metric_definitions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    key VARCHAR(100) NOT NULL,
    is_global BOOLEAN NOT NULL,
    display_name VARCHAR(255),
    value_type VARCHAR(20),
    default_unit VARCHAR(50),
    CONSTRAINT fk_user_metric_definitions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_global_user_id --enforce is_global and user_id mutual exclusivity
        CHECK (
            (is_global = TRUE AND user_id IS NULL)
            OR
            (is_global = FALSE AND user_id IS NOT NULL)
        ),
    CONSTRAINT uniq_global_key
        UNIQUE (key, is_global)  -- ensures no duplicate global names
);

--data about entry eg "weight per set"
CREATE TABLE entry_metrics (
    id BIGSERIAL PRIMARY KEY,
    entry_id BIGINT NOT NULL,
    metric_id BIGINT NOT NULL,
    value_number DOUBLE PRECISION,
    value_text TEXT,
    unit VARCHAR(50),
    CONSTRAINT fk_entry_metrics_entry
        FOREIGN KEY (entry_id) REFERENCES entries(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_entry_metrics_metric
        FOREIGN KEY (metric_id) REFERENCES metric_definitions(id)
        ON DELETE CASCADE,
    CONSTRAINT entry_metrics_definitions_uniq
        UNIQUE (entry_id, metric_id)
);

--N to N metric_definitions to exercises
CREATE TABLE metric_exercise_junction (
    id BIGSERIAL PRIMARY KEY,
    metric_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    CONSTRAINT fk_junction_metric
        FOREIGN KEY (metric_id) REFERENCES metric_definitions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_junction_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        ON DELETE CASCADE,
    CONSTRAINT uniq_metric_exercise
        UNIQUE (metric_id, exercise_id)
);