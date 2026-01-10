import { createWorkout, WorkoutJSON } from "@/lib/workouts";
import pool from "@/lib/db"

function ensureTestEnv() {
    if (
        process.env.NODE_ENV !== "test" &&
        process.env.DATABASE_URL?.includes("fitnessdb_test")
    ) {
        throw new Error("Test DB used outside test environment");
    }
}


it("make sure jest is connected to test database not production database", () => {
    ensureTestEnv();
    
    expect(true).toBe(true)

})

it("ensure create workout can create workout in test database", async () => {
    
    const demoWorkout: WorkoutJSON = {
        user_id: 1,
        workout_date: "2023-01-01",
        workout_kind: "strength"
    }

    const createdWorkout = await createWorkout(demoWorkout)

    expect(createdWorkout).toEqual({
        id: expect.any(String), // postgres returns numbers as strings by default
        user_id: "1",
        workout_date: "2023-01-01",
        workout_kind: "strength"
    })

    const res = await pool.query(
            `SELECT
                id,
                user_id,
                workout_date::text AS workout_date,
                workout_kind
            FROM workouts
            WHERE user_id = $1 AND id = $2`,
            [createdWorkout.user_id, createdWorkout.id]
        );
    
    expect(res.rows[0]).toEqual({
        id: createdWorkout.id,
        user_id: createdWorkout.user_id,
        workout_date: createdWorkout.workout_date,
        workout_kind: createdWorkout.workout_kind
    })
    
})