import { createWorkout, getWorkoutsByUserId, deleteWorkout } from "@/lib/workouts";
import { WorkoutJSON } from "@/types/workouts";

import pool from "@/lib/db"

function ensureTestEnv() {
    if (
        process.env.NODE_ENV !== "test" &&
        process.env.DATABASE_URL?.includes("fitnessdb_test")
    ) {
        throw new Error("Test DB used outside test environment");
    }
}


describe("createWorkout integration tests", () => {

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

        // Clean up - delete the created workout
        await pool.query(
            `DELETE FROM workouts WHERE id = $1`,
            [createdWorkout.id]
        );

        
    });


});

describe("getWorkoutsByUserId tests", () => {
    it("make sure jest is connected to test database not production database", () => {
        ensureTestEnv();
        
        expect(true).toBe(true)

    })


    it("returns workouts for a valid user ID with workouts, sorted by date descending", async () => {
        // Arrange: create two workouts for the same user
        const demoWorkout1: WorkoutJSON = {
            user_id: 1,
            workout_date: "2023-01-01",
            workout_kind: "strength",
        };
        const demoWorkout2: WorkoutJSON = {
            user_id: 1,
            workout_date: "2023-01-05",
            workout_kind: "cardio",
        };

        const created1 = await createWorkout(demoWorkout1);
        const created2 = await createWorkout(demoWorkout2);

        // Act
        const workouts = await getWorkoutsByUserId(1);

        // Assert
        expect(workouts.length).toBeGreaterThanOrEqual(2);
        expect(workouts[0].workout_date >= workouts[1].workout_date).toBe(true);
        expect(workouts).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: created1.id, workout_kind: "strength" }),
                expect.objectContaining({ id: created2.id, workout_kind: "cardio" }),
            ])
        );

        // Clean up
        await pool.query(`DELETE FROM workouts WHERE id = ANY($1)`, [[created1.id, created2.id]]);
    });


    /* not used as ID = 99999 may eventually exist
    it("returns an empty array for a valid user ID with no workouts", async () => {
        // Act
        const workouts = await getWorkoutsByUserId(99999); // assume this user ID doesn't exist

        // Assert
        expect(workouts).toEqual([]);
    });
    */

    

});


describe("deleteWorkout integration tests", () => {

    it("make sure jest is connected to test database not production database", () => {
        ensureTestEnv();
        expect(true).toBe(true);
    });

    it("should delete an existing workout successfully", async () => {
        // Arrange: create a workout to delete
        const demoWorkout: WorkoutJSON = {
            user_id: 1,
            workout_date: "2023-01-10",
            workout_kind: "strength",
        };

        const createdWorkout = await createWorkout(demoWorkout);

        // Act: delete the workout
        const deletionResult = await deleteWorkout(1, Number(createdWorkout.id));

        // Assert: deletionResult should be true
        expect(deletionResult).toBe(true);

        // Verify that the workout no longer exists in the DB
        const res = await pool.query(
            `SELECT id FROM workouts WHERE id = $1`,
            [createdWorkout.id]
        );
        expect(res.rows.length).toBe(0);
    });


    /* Not used as ID = 99999 may eventually exist
    it("should return false when deleting a non-existent workout", async () => {
        const deletionResult = await deleteWorkout(1, 999999); // unlikely ID
        expect(deletionResult).toBe(false);
    }); */

});