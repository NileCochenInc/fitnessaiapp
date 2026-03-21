-- H2 Test Schema (without PostgreSQL vector types)

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    goal TEXT NOT NULL,
    password_hash TEXT,
    google_id VARCHAR(255) UNIQUE,
    provider VARCHAR(50)
);

CREATE TABLE exercises (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    is_global BOOLEAN NOT NULL,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT,
    CONSTRAINT fk_exercises_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uniq_global_name UNIQUE (name, is_global)
);

CREATE TABLE workouts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workout_date DATE NOT NULL,
    user_id BIGINT NOT NULL,
    workout_kind VARCHAR(50),
    workout_text TEXT,
    CONSTRAINT fk_workouts_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE workout_exercises (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exercise_id BIGINT NOT NULL,
    workout_id BIGINT NOT NULL,
    note TEXT,
    exercise_text TEXT,
    CONSTRAINT fk_workout_exercises_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT fk_workout_exercises_workout
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    CONSTRAINT workout_exercise_unique UNIQUE (exercise_id, workout_id)
);

CREATE TABLE entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workout_exercise_id BIGINT NOT NULL,
    entry_index BIGINT NOT NULL,
    CONSTRAINT fk_entries_workout_exercise
        FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
);

CREATE TABLE metric_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    key VARCHAR(100) NOT NULL,
    is_global BOOLEAN NOT NULL,
    display_name VARCHAR(255),
    value_type VARCHAR(20),
    default_unit VARCHAR(50),
    CONSTRAINT fk_user_metric_definitions_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uniq_global_key UNIQUE (key, is_global)
);

CREATE TABLE entry_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entry_id BIGINT NOT NULL,
    metric_id BIGINT NOT NULL,
    value_number DOUBLE,
    value_text TEXT,
    unit VARCHAR(50),
    CONSTRAINT fk_entry_metrics_entry
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
    CONSTRAINT fk_entry_metrics_metric
        FOREIGN KEY (metric_id) REFERENCES metric_definitions(id) ON DELETE CASCADE,
    CONSTRAINT entry_metrics_definitions_uniq UNIQUE (entry_id, metric_id)
);

CREATE TABLE metric_exercise_junction (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    CONSTRAINT fk_junction_metric
        FOREIGN KEY (metric_id) REFERENCES metric_definitions(id) ON DELETE CASCADE,
    CONSTRAINT fk_junction_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    CONSTRAINT uniq_metric_exercise UNIQUE (metric_id, exercise_id)
);
