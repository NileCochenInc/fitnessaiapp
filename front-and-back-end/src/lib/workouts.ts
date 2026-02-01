import pool from './db';
import { WorkoutJSON } from "@/types/workouts";
import { WorkoutSchema } from "@/types/workouts";
import { clearWorkoutEmbedding } from './clearEmbeddings';



//add workout to database
export async function createWorkout(workoutData: WorkoutJSON) {

    //validate input data
    try {
        WorkoutSchema.parse(workoutData);
    } catch (e) {
        throw new Error("Invalid workout data");
    }


    const {user_id, workout_date, workout_kind} = workoutData;


    //check if date is valid format
    const isDateValid = !isNaN(new Date(workout_date).getTime());
    if (!isDateValid) {
        throw new Error("Invalid workout_date format");
    }   

    const res = await pool.query(
            `INSERT INTO workouts (user_id, workout_date, workout_kind)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, workout_date:: text, workout_kind`,
            [user_id, workout_date, workout_kind]
        );

    return res.rows[0]
    
}

//Get workouts by user id

export async function getWorkoutsByUserId(user_id: number) {

    //edge case: validate user_id (positive integer)
    if (typeof user_id !== "number" || !Number.isInteger(user_id) || user_id <= 0) {
        throw new Error("Invalid user_id");
    } 


    try {
        const res = await pool.query(
            `SELECT
                id,
                user_id,
                workout_date::text AS workout_date,
                workout_kind
            FROM workouts
            WHERE user_id = $1
            ORDER BY workout_date DESC`,
            [user_id]
        );

        return res.rows; //can be [] if no workouts found
    } catch (error) {
        console.error("Database error in getWorkoutsByUserId:", error);
        throw new Error("Database error");
    }

}

//Edit workout by id
export async function updateWorkout(workout_id: number, user_id: number, workoutData: Omit<WorkoutJSON, 'user_id'>) {
    // Validate workout_id
    if (!Number.isInteger(workout_id) || workout_id <= 0) {
        throw new Error("Invalid workout_id");
    }

    // Validate input data
    try {
        WorkoutSchema.parse({ ...workoutData, user_id }); // keep user_id for validation if needed
    } catch (e) {
        throw new Error("Invalid workout data");
    }

    const { workout_date, workout_kind } = workoutData;

    // Validate date
    if (isNaN(new Date(workout_date).getTime())) {
        throw new Error("Invalid workout_date format");
    }

    const res = await pool.query(
        `UPDATE workouts
         SET workout_date = $2, workout_kind = $3
         WHERE id = $1 AND user_id = $4
         RETURNING id, user_id, workout_date::text AS workout_date, workout_kind`,
        [workout_id, workout_date, workout_kind, user_id]
    );

    if (res.rowCount === 0) {
        throw new Error("Workout not found or you do not have permission to edit it");
    }

    //clear workout embedding
    await clearWorkoutEmbedding(workout_id);

    return res.rows[0];
}


//Remove workout by id, only if it belongs to the given user
export async function deleteWorkout(user_id: number, workout_id: number) {
    // Validate user_id
    if (typeof user_id !== "number" || !Number.isInteger(user_id) || user_id <= 0) {
        throw new Error("Invalid user_id");
    }

    // Validate workout_id
    if (typeof workout_id !== "number" || !Number.isInteger(workout_id) || workout_id <= 0) {
        throw new Error("Invalid workout_id");
    }

    try {
        const res = await pool.query(
            `DELETE FROM workouts
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [workout_id, user_id]
        );

        if (res.rowCount === 0) {
            // Nothing was deleted — either workout doesn't exist or doesn't belong to this user
            return false;
        }

        return true; // deletion successful
    } catch (error) {
        console.error("Database error in deleteWorkout:", error);
        throw new Error("Database error");
    }
}



