import { POST, GET, DELETE } from "@/app/api/workouts/route";
import * as workoutsLib from "@/lib/workouts";
import { NextRequest } from "next/server";

jest.mock("@/lib/workouts", () => ({
  __esModule: true,
  createWorkout: jest.fn(),
  getWorkoutsByUserId: jest.fn(),
  deleteWorkout: jest.fn(),
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
    } as unknown as NextRequest;

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
    } as unknown as NextRequest;

    const res = await POST(req);

    // Check that status is 400
    expect(res.status).toBe(400);

    // Check the response body
    const json = await res.json();
    expect(json).toEqual({ error: "invalid workout data" });
  });

  it("returns 500 if createWorkout throws an error", async() => {

     // silence expected error logging
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const validWorkout = {
        user_id: 1,
        workout_date: "2026-01-12",
        workout_kind: "cardio",
    };

    // Mock createWorkout to throw an error
    (workoutsLib.createWorkout as jest.Mock).mockRejectedValue(new Error("Database error"));

    const req = {
        json: async () => validWorkout,
    } as unknown as NextRequest;

    const res = await POST(req);

    // Check status code
    expect(res.status).toBe(500);

    // Check response body
    const json = await res.json();
    expect(json).toEqual({ error: "Failed to create workout" });

    // Ensure createWorkout was called with the valid data
    expect(workoutsLib.createWorkout).toHaveBeenCalledWith(validWorkout);

    // restore console
    consoleSpy.mockRestore();
  });

});

describe("GET /workouts handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if userId query parameter is missing", async () => {
    const req = { url: "http://localhost/api/workouts" } as unknown as NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing userId query parameter" });
  });

  it("returns workouts for a valid userId", async () => {
    const mockWorkouts = [
      { id: "1", user_id: 1, workout_date: "2026-01-12", workout_kind: "cardio" },
    ];
    (workoutsLib.getWorkoutsByUserId as jest.Mock).mockResolvedValue(mockWorkouts);

    const req = { url: "http://localhost/api/workouts?userId=1" } as unknown as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockWorkouts);
    expect(workoutsLib.getWorkoutsByUserId).toHaveBeenCalledWith(1);
  });
});


describe("DELETE /workouts handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

  });

  it("returns 400 if userId or workoutId is missing", async () => {
    const req = {
      url: "http://localhost/api/workouts?userId=1",
    } as unknown as NextRequest;

    const res = await DELETE(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      error: "Missing userId or workoutId query parameter",
    });
  });

  it("returns 404 if workout does not exist or is not owned by user", async () => {
    (workoutsLib.deleteWorkout as jest.Mock).mockResolvedValue(false);

    const req = {
      url: "http://localhost/api/workouts?userId=1&workoutId=99",
    } as unknown as NextRequest;

    const res = await DELETE(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({
      error: "Workout not found or not owned by user",
    });

    expect(workoutsLib.deleteWorkout).toHaveBeenCalledWith(1, 99);
  });

  it("returns 200 when workout is successfully deleted", async () => {
    (workoutsLib.deleteWorkout as jest.Mock).mockResolvedValue(true);

    const req = {
      url: "http://localhost/api/workouts?userId=1&workoutId=2",
    } as unknown as NextRequest;

    const res = await DELETE(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      message: "Workout deleted successfully",
    });

    expect(workoutsLib.deleteWorkout).toHaveBeenCalledWith(1, 2);
  });

  it("returns 500 if deleteWorkout throws an error", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (workoutsLib.deleteWorkout as jest.Mock).mockRejectedValue(
      new Error("Database failure")
    );

    const req = {
      url: "http://localhost/api/workouts?userId=1&workoutId=2",
    } as unknown as NextRequest;

    const res = await DELETE(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal server error" });

    consoleSpy.mockRestore();
  });

  afterEach(() => {
    jest.restoreAllMocks();

  });

});
