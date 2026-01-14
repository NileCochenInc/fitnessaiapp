

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));


import { createWorkout, getWorkoutsByUserId, deleteWorkout } from "@/lib/workouts";
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


describe("deleteWorkout unit tests", () => {
    beforeEach(() => {
        (pool.query as jest.Mock).mockReset();
    });

    it("throws an error for invalid user_id", async () => {
        await expect(deleteWorkout(-1, 1)).rejects.toThrow("Invalid user_id");
        await expect(deleteWorkout(0, 1)).rejects.toThrow("Invalid user_id");
        await expect(deleteWorkout("abc" as any, 1)).rejects.toThrow("Invalid user_id");
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("throws an error for invalid workout_id", async () => {
        await expect(deleteWorkout(1, -1)).rejects.toThrow("Invalid workout_id");
        await expect(deleteWorkout(1, 0)).rejects.toThrow("Invalid workout_id");
        await expect(deleteWorkout(1, "abc" as any)).rejects.toThrow("Invalid workout_id");
        expect(pool.query).not.toHaveBeenCalled();
    });

    it("returns true when a workout is deleted successfully", async () => {
        // Mock DB returning 1 row affected
        (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

        const result = await deleteWorkout(1, 123);
        expect(result).toBe(true);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM workouts"),
            [123, 1]
        );
    });

    it("returns false when workout does not exist or does not belong to user", async () => {
        // Mock DB returning 0 rows affected
        (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

        const result = await deleteWorkout(1, 999);
        expect(result).toBe(false);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM workouts"),
            [999, 1]
        );
    });

    it("throws a database error if query fails", async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error("DB failure"));

        // mute console.error
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        await expect(deleteWorkout(1, 123)).rejects.toThrow("Database error");
        
        // restore console.error
        consoleSpy.mockRestore();
    });
});