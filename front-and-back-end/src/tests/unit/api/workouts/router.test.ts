import { POST } from "@/app/api/workouts/router";
import * as workoutsLib from "@/lib/workouts";

jest.mock("@/lib/workouts", () => ({
  createWorkout: jest.fn(),
}));

describe("POST /workouts handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return 201 ands calls createWorkout with valid data", async () => {
    //create mock workout
    const mockWorkout = { id: 1, user_id: 1, workout_date: "2026-01-12", workout_kind: "cardio" };
    (workoutsLib.createWorkout as jest.Mock).mockResolvedValue(mockWorkout);

     const req = {
      json: async () => ({
        user_id: 1,
        workout_date: "2026-01-12",
        workout_kind: "cardio",
      }),
    } as unknown as Request;

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(workoutsLib.createWorkout).toHaveBeenCalledWith({
      user_id: 1,
      workout_date: "2026-01-12",
      workout_kind: "cardio",
    });


  });

  it("returns 400 for invalid data", async () => {
    // Mock request with invalid data (missing required fields)
    const req = {
        json: async () => ({
        user_id: 1,
        workout_kind: "cardio" // missing workout_date
        }),
    } as unknown as Request;

    const res = await POST(req);

    // Check that status is 400
    expect(res.status).toBe(400);

    // Check the response body
    const json = await res.json();
    expect(json).toEqual({ error: "invalid workout data" });
  });

  it("returns 500 if createWorkout throws an error", async() => {
    const validWorkout = {
        user_id: 1,
        workout_date: "2026-01-12",
        workout_kind: "cardio",
    };

    // Mock createWorkout to throw an error
    (workoutsLib.createWorkout as jest.Mock).mockRejectedValue(new Error("Database error"));

    const req = {
        json: async () => validWorkout,
    } as unknown as Request;

    const res = await POST(req);

    // Check status code
    expect(res.status).toBe(500);

    // Check response body
    const json = await res.json();
    expect(json).toEqual({ error: "Failed to create workout" });

    // Ensure createWorkout was called with the valid data
    expect(workoutsLib.createWorkout).toHaveBeenCalledWith(validWorkout);
  });



});