import pool from './db';
import { WorkoutJSON } from "@/types/workouts";
import { WorkoutSchema } from "@/types/workouts";



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


