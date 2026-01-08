import pool from './db';

export type WorkoutJSON =  {
    user_id: number,
    date: string,
    workout_kind: string
};

export async function createWorkout(workoutData: WorkoutJSON) {
    //add workout to database
    const {user_id, date, workout_kind} = workoutData;

    const res = await pool.query(
            `INSERT INTO workouts (user_id, date, workout_kind)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, date, workout_kind`,
            [user_id, date, workout_kind]
        );

    return res.rows[0]
    
  
}


