import pool from './db';



export type WorkoutJSON =  {
    user_id: number,
    workout_date: string,
    workout_kind: string
};

export async function createWorkout(workoutData: WorkoutJSON) {
    //add workout to database
    const {user_id, workout_date, workout_kind} = workoutData;

    const res = await pool.query(
            `INSERT INTO workouts (user_id, workout_date, workout_kind)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, workout_date:: text, workout_kind`,
            [user_id, workout_date, workout_kind]
        );

    return res.rows[0]
    
}


