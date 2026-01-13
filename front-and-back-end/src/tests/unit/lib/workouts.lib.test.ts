

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));


import { createWorkout, getWorkoutsByUserId } from "@/lib/workouts";
import { WorkoutJSON } from "@/types/workouts";
import pool from "@/lib/db"


describe("workouts lib unit tests", () => {
    beforeEach(() => {
        (pool.query as jest.Mock).mockReset(); // reset mock between tests
    });

    it("ensure create workout fails with missing fields", async () => {
        const incompleteWorkout: any = {
            user_id: 1,
            // workout_date is missing
            workout_kind: "cardio"
        }

        await expect(createWorkout(incompleteWorkout as WorkoutJSON)).rejects.toThrow("Invalid workout data");
    });

    it("ensure create workout fails with fields of wrong type", async () => {
        const incompleteWorkout: any = {
            user_id: "1", // should be number
            workout_date: "2023-01-01",
            workout_kind: "cardio"
        }

        await expect(createWorkout(incompleteWorkout as WorkoutJSON)).rejects.toThrow("Invalid workout data");
    });

    it("ensure create workout fails with wrong date format", async () => {
        const incompleteWorkout: any = {
            user_id: 1,
            workout_date: "wrong date format", // invalid date
            workout_kind: "cardio"
        }

        await expect(createWorkout(incompleteWorkout as WorkoutJSON)).rejects.toThrow("Invalid workout_date format");
    });

});



describe("getWorkoutsByUserId unit tests", () => {
    beforeEach(() => {
        (pool.query as jest.Mock).mockReset();
    });

    it("throws an error for negative user_id", async () => {
        await expect(getWorkoutsByUserId(-1)).rejects.toThrow("Invalid user_id");
        expect(pool.query).not.toHaveBeenCalled(); // DB should not be queried
    });

    it("throws an error for user_id of zero", async () => {
        await expect(getWorkoutsByUserId(0)).rejects.toThrow("Invalid user_id");
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("throws an error for non-number user_id", async () => {
        await expect(getWorkoutsByUserId("abc" as any)).rejects.toThrow("Invalid user_id");
        await expect(getWorkoutsByUserId(null as any)).rejects.toThrow("Invalid user_id");
        expect(pool.query).not.toHaveBeenCalled();
    });
});