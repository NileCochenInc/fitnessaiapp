-- ==============================================
-- FITNESS JOURNAL INSERTS
-- ==============================================


-- ===============================
-- Insert a made-up user
-- ===============================
INSERT INTO users (username, email, goal)
VALUES 
('fitness_fan123', 'fitnessfan123@example.com', 'Build strength and improve overall conditioning over the next 6 months.');



-- USER ID
-- Assuming user_id = 1

-- ===============================
-- Dec 23 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (1, '2025-12-23', 1, 'strength');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(1, 1, 11),  -- Cable row
(2, 1, 12),  -- Dumbell Hammer curls
(3, 1, 13),  -- Dumbell flat bench press
(4, 1, 4),   -- Biceps curl machine
(5, 1, 5),   -- Cable triceps push down
(6, 1, 6),   -- Dumbell Incline bench
(7, 1, 7),   -- Cable lat raise
(8, 1, 8);   -- Cable kneeling crunch

-- Entries and metrics
-- Cable row
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (1, 1, 1), (2, 1, 2), (3, 1, 3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(1,1,120),(1,2,10),
(2,1,120),(2,2,12),
(3,1,120),(3,2,12);

-- Dumbell Hammer curls
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (4,2,1),(5,2,2),(6,2,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(4,1,30),(4,2,7),
(5,1,30),(5,2,8),
(6,1,30),(6,2,7);

-- Dumbell flat bench press
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (7,3,1),(8,3,2),(9,3,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(7,1,55),(7,2,10),
(8,1,55),(8,2,9),
(9,1,55),(9,2,7);

-- Biceps curl machine
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (10,4,1),(11,4,2),(12,4,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(10,1,60),(10,2,12),
(11,1,65),(11,2,10),
(12,1,65),(12,2,8);

-- Cable triceps push down
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (13,5,1),(14,5,2),(15,5,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(13,1,110),(13,2,12),
(14,1,110),(14,2,9),
(15,1,110),(15,2,6);

-- Dumbell Incline bench
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (16,6,1),(17,6,2),(18,6,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(16,1,40),(16,2,10),
(17,1,45),(17,2,9),
(18,1,45),(18,2,8);

-- Cable lat raise
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (19,7,1),(20,7,2),(21,7,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(19,1,15),(19,2,10),
(20,1,15),(20,2,10),
(21,1,15),(21,2,10);

-- Cable kneeling crunch
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (22,8,1),(23,8,2),(24,8,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(22,1,120),(22,2,20),
(23,1,120),(23,2,20),
(24,1,120),(24,2,20);

-- ===============================
-- Dec 24 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (2, '2025-12-24', 1, 'strength');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(25,2,2),   -- Squat
(26,2,3),   -- Deadlift
(27,2,9),   -- Angled leg press machine
(28,2,10),  -- Prone leg curl machine
(29,2,4),   -- Biceps curl machine
(30,2,16);  -- Thigh machine inner/outer

-- Squat
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (31,25,1),(32,25,2),(33,25,3),(34,25,4);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(31,1,150),(31,2,10),
(32,1,150),(32,2,10),
(33,1,150),(33,2,10),
(34,1,150),(34,2,10);

-- Deadlift
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (35,26,1),(36,26,2),(37,26,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(35,1,130),(35,2,8),
(36,1,130),(36,2,8),
(37,1,130),(37,2,8);

-- Angled leg press machine
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (38,27,1),(39,27,2),(40,27,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(38,1,180),(38,2,15),
(39,1,205),(39,2,15),
(40,1,205),(40,2,15);

-- Prone leg curl machine
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (41,28,1),(42,28,2),(43,28,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(41,1,80),(41,2,10),
(42,1,80),(42,2,9),
(43,1,80),(43,2,8);

-- Biceps curl machine
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (44,29,1),(45,29,2),(46,29,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(44,1,65),(44,2,10),
(45,1,65),(45,2,10),
(46,1,65),(46,2,10);

-- Thigh machine inner/outer (10/12, 10/12, 10/12)
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (47,30,1),(48,30,2),(49,30,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(47,1,110),(47,2,10),  -- inner
(47,1,150),(47,2,12),  -- outer
(48,1,110),(48,2,10),
(48,1,150),(48,2,12),
(49,1,110),(49,2,10),
(49,1,150),(49,2,12);

-- ===============================
-- Dec 26 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (3, '2025-12-26', 1, 'strength');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(50,3,14),  -- Tricep dips
(51,3,15),  -- Chin-ups
(52,3,17),  -- Focus curl
(53,3,13),  -- Dumbell bench press flat
(54,3,18),  -- Incline dumbbell curl
(55,3,19),  -- Pec fly machine
(56,3,20),  -- Dumbell lat raise
(57,3,21);  -- Long lever plank

-- Tricep dips
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (50,50,1),(51,50,2),(52,50,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(50,2,11),(51,2,11),(52,2,12);

-- Chin-ups
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (53,51,1),(54,51,2),(55,51,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(53,2,7),(54,2,6),(55,2,6);

-- Focus curl
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (56,52,1),(57,52,2),(58,52,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(56,1,30),(56,2,10),
(57,1,30),(57,2,12),
(58,1,30),(58,2,10);

-- Dumbell bench press flat
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (59,53,1),(60,53,2),(61,53,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(59,1,60),(59,2,6),
(60,1,50),(60,2,9),
(61,1,50),(61,2,10);

-- Incline dumbbell curl
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (62,54,1),(63,54,2),(64,54,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(62,1,20),(62,2,15),
(63,1,25),(63,2,10),
(64,1,20),(64,2,8);

-- Pec fly machine
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (65,55,1),(66,55,2),(67,55,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(65,1,140),(65,2,10),
(66,1,140),(66,2,9),
(67,1,140),(67,2,9);

-- Dumbell lat raise
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (68,56,1),(69,56,2),(70,56,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(68,1,20),(68,2,15),
(69,1,20),(69,2,15),
(70,1,20),(70,2,15);

-- Long lever plank
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (71,57,1),(72,57,2),(73,57,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(71,9,30),
(72,9,30),
(73,9,30);

-- ==============================================
-- Note:
-- I have structured the first three days fully as an example
-- The remaining days (Dec 27 – Jan 3) follow exactly the same pattern:
-- 1) INSERT workout
-- 2) INSERT workout_exercises for that workout
-- 3) INSERT entries for each set
-- 4) INSERT entry_metrics for each set
-- ==============================================


-- ===============================
-- Dec 27 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (4, '2025-12-27', 1, 'rowing');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(71,4,29); -- Rowing Machine

-- Row machine workout
-- 5 min 20s/m
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (74,71,1);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(74,8,5),(74,6,20); -- duration_rowing=5 min, stroke_rate=20

-- 15 min intervals 20s/m 1min -> 30s/m 1min
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (75,71,2);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(75,8,15),(75,6,25); -- duration_rowing=15 min, stroke_rate avg 25

-- 5 min 20s/m
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (76,71,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(76,8,5),(76,6,20);

-- ===============================
-- Dec 28 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (5, '2025-12-28', 1, 'strength');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(72,5,4),   -- Biceps curl machine
(73,5,2),   -- Squat
(74,5,3),   -- Deadlift
(75,5,22),  -- Smith machine hip thrust
(76,5,10),  -- Prone leg curl
(77,5,9),   -- Angled leg press
(78,5,16),  -- Inner/Outer thigh
(79,5,23);  -- Calf raise

-- Biceps curl machine 65,65,10
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (77,72,1),(78,72,2),(79,72,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(77,1,65),(77,2,12),
(78,1,65),(78,2,12),
(79,1,65),(79,2,10);

-- Squat 150lbs, 10,10,10,10
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (80,73,1),(81,73,2),(82,73,3),(83,73,4);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(80,1,150),(80,2,10),
(81,1,150),(81,2,10),
(82,1,150),(82,2,10),
(83,1,150),(83,2,10);

-- Deadlift 130lbs, 8,8,8
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (84,74,1),(85,74,2),(86,74,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(84,1,130),(84,2,8),
(85,1,130),(85,2,8),
(86,1,130),(86,2,8);

-- Smith machine hip thrust 90,130,150 reps 15
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (87,75,1),(88,75,2),(89,75,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(87,1,90),(87,2,15),
(88,1,130),(88,2,15),
(89,1,150),(89,2,15);

-- Prone leg curl 80lbs 10,9,8
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (90,76,1),(91,76,2),(92,76,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(90,1,80),(90,2,10),
(91,1,80),(91,2,9),
(92,1,80),(92,2,8);

-- Angled leg press 230lbs 11,11,11
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (93,77,1),(94,77,2),(95,77,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(93,1,230),(93,2,11),
(94,1,230),(94,2,11),
(95,1,230),(95,2,11);

-- Inner/Outer thigh 10/12,11/11,13/10
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (96,78,1),(97,78,2),(98,78,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(96,1,110),(96,2,10),(96,1,150),(96,2,12),
(97,1,110),(97,2,11),(97,1,150),(97,2,11),
(98,1,110),(98,2,13),(98,1,150),(98,2,10);

-- Calf raise 115lbs 10,10,10
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (99,79,1),(100,79,2),(101,79,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(99,1,115),(99,2,10),
(100,1,115),(100,2,10),
(101,1,115),(101,2,10);

-- ===============================
-- Dec 29 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (6, '2025-12-29', 1, 'rowing');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES (102,6,29); -- Rowing Machine

-- Row machine 5 min 22 s/m
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (102,102,1);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(102,8,5),(102,6,22);

-- 15 min intervals 20->30 s/m
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (103,102,2);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(103,8,15),(103,6,25);

-- 5 min 22 s/m
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (104,102,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(104,8,5),(104,6,22);

-- ===============================
-- Dec 30 2025
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) VALUES (7, '2025-12-30', 1, 'strength');

INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(105,7,11),  -- Cable row machine
(106,7,24),  -- Easy grip curl
(107,7,13),  -- Dumbell chest press
(108,7,18),  -- Incline dumbell curl
(109,7,25),  -- Incline dumbell bench press
(110,7,5),   -- Cable Tricep push down
(111,7,7),   -- Cable lat raise
(112,7,26),  -- Cable oblique twist
(113,7,12);  -- Dumbell hammer curl

-- Entries would follow same structure (set by set)
-- Example: Cable row machine 13,13,10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES (1051,105,1),(1052,105,2),(1053,105,3);
INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(1051,1,120),(1051,2,13),
(1052,1,120),(1052,2,13),
(1053,1,120),(1053,2,10);

-- Continue similarly for all exercises on Dec 30
-- (Easy grip curl, Dumbell chest press, Incline curls, etc.)

-- ===============================
-- Dec 30 2025 Workout
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) 
VALUES (7, '2025-12-30', 1, 'strength');

-- Workout exercises
INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(105, 7, 11),  -- Cable row machine
(106, 7, 24),  -- Easy grip curl
(107, 7, 13),  -- Dumbell chest press
(108, 7, 18),  -- Incline dumbell curl
(109, 7, 25),  -- Incline dumbell bench press
(110, 7, 5),   -- Cable Tricep push down
(111, 7, 12),  -- Cable lat raise
(112, 7, 26),  -- Cable oblique twist
(113, 7, 12);  -- Dumbell hammer curl

-- ===============================
-- Entries and metrics
-- ===============================

-- Cable row machine 120lbs: 13, 13, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1051, 105, 1),
(1052, 105, 2),
(1053, 105, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1051, 1, 120, 'lbs'), (1051, 2, 13),
(1052, 1, 120, 'lbs'), (1052, 2, 13),
(1053, 1, 120, 'lbs'), (1053, 2, 10);

-- Easy grip curl 40lbs plus bar: 12, 10, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1054, 106, 1),
(1055, 106, 2),
(1056, 106, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1054, 1, 40, 'lbs'), (1054, 2, 12),
(1055, 1, 40, 'lbs'), (1055, 2, 10),
(1056, 1, 40, 'lbs'), (1056, 2, 10);

-- Dumbell chest press 55lbs each: 12, 10, 8 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1057, 107, 1),
(1058, 107, 2),
(1059, 107, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1057, 1, 55, 'lbs'), (1057, 2, 12),
(1058, 1, 55, 'lbs'), (1058, 2, 10),
(1059, 1, 55, 'lbs'), (1059, 2, 8);

-- Incline dumbell curl 20lbs each: 15, 10, 12 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1060, 108, 1),
(1061, 108, 2),
(1062, 108, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1060, 1, 20, 'lbs'), (1060, 2, 15),
(1061, 1, 20, 'lbs'), (1061, 2, 10),
(1062, 1, 20, 'lbs'), (1062, 2, 12);

-- Incline dumbell bench press 45lbs each: 8, 10, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1063, 109, 1),
(1064, 109, 2),
(1065, 109, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1063, 1, 45, 'lbs'), (1063, 2, 8),
(1064, 1, 45, 'lbs'), (1064, 2, 10),
(1065, 1, 45, 'lbs'), (1065, 2, 10);

-- Cable Tricep push down 110, 100, 100 lbs: 8, 12, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1066, 110, 1),
(1067, 110, 2),
(1068, 110, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1066, 1, 110, 'lbs'), (1066, 2, 8),
(1067, 1, 100, 'lbs'), (1067, 2, 12),
(1068, 1, 100, 'lbs'), (1068, 2, 10);

-- Cable lat raise 15lbs per side: 8, 8, 8 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1069, 111, 1),
(1070, 111, 2),
(1071, 111, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1069, 1, 15, 'lbs'), (1069, 2, 8),
(1070, 1, 15, 'lbs'), (1070, 2, 8),
(1071, 1, 15, 'lbs'), (1071, 2, 8);

-- Cable oblique twist 50lbs per side: 12, 12, 12 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1072, 112, 1),
(1073, 112, 2),
(1074, 112, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1072, 1, 50, 'lbs'), (1072, 2, 12),
(1073, 1, 50, 'lbs'), (1073, 2, 12),
(1074, 1, 50, 'lbs'), (1074, 2, 12);

-- Dumbell hammer curl 30lbs each: 10, 9, 9 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1075, 113, 1),
(1076, 113, 2),
(1077, 113, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1075, 1, 30, 'lbs'), (1075, 2, 10),
(1076, 1, 30, 'lbs'), (1076, 2, 9),
(1077, 1, 30, 'lbs'), (1077, 2, 9);










-- ===============================
-- Jan 3 2026 Workout
-- ===============================
INSERT INTO workouts (id, workout_date, user_id, workout_kind) 
VALUES (8, '2026-01-03', 1, 'strength');

-- Workout exercises
INSERT INTO workout_exercises (id, workout_id, exercise_id) VALUES
(114, 8, 15),  -- Chin-ups
(115, 8, 5),   -- Triceps cable push down
(116, 8, 12),  -- Dumbell hammer curl
(117, 8, 13),  -- Dumbell bench press
(118, 8, 4),   -- Biceps curl machine
(119, 8, 19),  -- Pec fly machine
(120, 8, 20),  -- Dumbell lat raise
(121, 8, 27);  -- Cable crunch

-- ===============================
-- Entries and metrics
-- ===============================

-- Chin-ups: 10, 8, 7 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1101, 114, 1),
(1102, 114, 2),
(1103, 114, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number) VALUES
(1101, 2, 10),
(1102, 2, 8),
(1103, 2, 7);

-- Triceps cable push down 110lbs: 10, 10, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1104, 115, 1),
(1105, 115, 2),
(1106, 115, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1104, 1, 110, 'lbs'), (1104, 2, 10),
(1105, 1, 110, 'lbs'), (1105, 2, 10),
(1106, 1, 110, 'lbs'), (1106, 2, 10);

-- Dumbell hammer curl 30lbs each: 10, 9, 9 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1107, 116, 1),
(1108, 116, 2),
(1109, 116, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1107, 1, 30, 'lbs'), (1107, 2, 10),
(1108, 1, 30, 'lbs'), (1108, 2, 9),
(1109, 1, 30, 'lbs'), (1109, 2, 9);

-- Dumbell bench press 55lbs each: 12, 9, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1110, 117, 1),
(1111, 117, 2),
(1112, 117, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1110, 1, 55, 'lbs'), (1110, 2, 12),
(1111, 1, 55, 'lbs'), (1111, 2, 9),
(1112, 1, 55, 'lbs'), (1112, 2, 10);

-- Biceps curl machine 65lbs each: 12, 10, 10 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1113, 118, 1),
(1114, 118, 2),
(1115, 118, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1113, 1, 65, 'lbs'), (1113, 2, 12),
(1114, 1, 65, 'lbs'), (1114, 2, 10),
(1115, 1, 65, 'lbs'), (1115, 2, 10);

-- Pec fly machine 140lbs: 10, 8, 8 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1116, 119, 1),
(1117, 119, 2),
(1118, 119, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1116, 1, 140, 'lbs'), (1116, 2, 10),
(1117, 1, 140, 'lbs'), (1117, 2, 8),
(1118, 1, 140, 'lbs'), (1118, 2, 8);

-- Dumbell lat raise 20lbs each: 16, 15, 15 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1119, 120, 1),
(1120, 120, 2),
(1121, 120, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1119, 1, 20, 'lbs'), (1119, 2, 16),
(1120, 1, 20, 'lbs'), (1120, 2, 15),
(1121, 1, 20, 'lbs'), (1121, 2, 15);

-- Cable crunch 120lbs: 20, 20, 20 reps
INSERT INTO entries (id, workout_exercise_id, entry_index) VALUES
(1122, 121, 1),
(1123, 121, 2),
(1124, 121, 3);

INSERT INTO entry_metrics (entry_id, metric_id, value_number, unit) VALUES
(1122, 1, 120, 'lbs'), (1122, 2, 20),
(1123, 1, 120, 'lbs'), (1123, 2, 20),
(1124, 1, 120, 'lbs'), (1124, 2, 20);