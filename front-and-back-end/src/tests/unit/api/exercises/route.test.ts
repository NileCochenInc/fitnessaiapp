import { GET, POST, DELETE } from "@/app/api/exercises/route";
import * as exercisesLib from "@/lib/exercises";
import { NextRequest } from "next/server";

jest.mock("@/lib/exercises", () => ({
  __esModule: true,
  getExercisesForWorkout: jest.fn(),
  getWorkoutMeta: jest.fn(),
  addWorkoutExercise: jest.fn(),
  deleteWorkoutExercise: jest.fn(),
}));


describe("GET /exercises handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 400 if workoutId or userId is missing", async () => {
    const req = {
      url: "http://localhost/api/exercises?userId=1",
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      error: "Missing workoutId or userId query parameter",
    });
  });

  it("returns 400 if workoutId or userId is invalid", async () => {
    const req = {
      url: "http://localhost/api/exercises?userId=abc&workoutId=-1",
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      error: "Invalid workoutId or userId",
    });
  });

  it("returns 404 if workout is not found or unauthorized", async () => {
    (exercisesLib.getWorkoutMeta as jest.Mock).mockRejectedValue(
      new Error("Workout not found or unauthorized")
    );

    const req = {
      url: "http://localhost/api/exercises?userId=1&workoutId=99",
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({
      error: "Workout not found or unauthorized",
    });

    expect(exercisesLib.getWorkoutMeta).toHaveBeenCalledWith(99, 1);
    expect(exercisesLib.getExercisesForWorkout).not.toHaveBeenCalled();
  });

  it("returns 200 with workout meta and exercises", async () => {
    (exercisesLib.getWorkoutMeta as jest.Mock).mockResolvedValue({
      workout_date: "2026-01-12",
      workout_kind: "cardio",
    });

    (exercisesLib.getExercisesForWorkout as jest.Mock).mockResolvedValue([
      { exercise_id: 1, name: "Push Ups" },
      { exercise_id: 2, name: "Squats" },
    ]);

    const req = {
      url: "http://localhost/api/exercises?userId=1&workoutId=10",
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json).toEqual({
      workout_id: 10,
      workout_date: "2026-01-12",
      workout_kind: "cardio",
      exercises: [
        { exercise_id: 1, name: "Push Ups" },
        { exercise_id: 2, name: "Squats" },
      ],
    });

    expect(exercisesLib.getWorkoutMeta).toHaveBeenCalledWith(10, 1);
    expect(exercisesLib.getExercisesForWorkout).toHaveBeenCalledWith(10, 1);
  });

  it("returns 200 with empty exercises array when workout has no exercises", async () => {
    (exercisesLib.getWorkoutMeta as jest.Mock).mockResolvedValue({
      workout_date: "2026-01-12",
      workout_kind: "strength",
    });

    (exercisesLib.getExercisesForWorkout as jest.Mock).mockResolvedValue([]);

    const req = {
      url: "http://localhost/api/exercises?userId=1&workoutId=3",
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.exercises).toEqual([]);
  });

  it("returns 500 if an unexpected error occurs", async () => {
    (exercisesLib.getWorkoutMeta as jest.Mock).mockRejectedValue(
      new Error("DB connection lost")
    );

    const req = {
      url: "http://localhost/api/exercises?userId=1&workoutId=1",
    } as unknown as NextRequest;

    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal server error" });
  });
});


describe("POST /exercises handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 400 if workoutId, name, or userId is missing", async () => {
    const req = { json: async () => ({ workoutId: 1, name: "Push Ups" }) } as unknown as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing workoutId, name, or userId" });
  });

  it("returns 201 and calls addWorkoutExercise with valid data", async () => {
    const mockExercise = { exercise_id: 5, name: "Burpees" };
    (exercisesLib.addWorkoutExercise as jest.Mock).mockResolvedValue(mockExercise);

    const req = {
      json: async () => ({ workoutId: 2, name: "Burpees", userId: 1 }),
    } as unknown as NextRequest;

    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual(mockExercise);
    expect(exercisesLib.addWorkoutExercise).toHaveBeenCalledWith(2, { name: "Burpees" }, 1);
  });

  it("returns 500 if addWorkoutExercise throws an error", async () => {
    (exercisesLib.addWorkoutExercise as jest.Mock).mockRejectedValue(new Error("Workout not found or unauthorized"));

    const req = {
      json: async () => ({ workoutId: 99, name: "Lunges", userId: 1 }),
    } as unknown as NextRequest;

    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Workout not found or unauthorized" });
  });
});

describe("DELETE /exercises handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 400 if workoutExerciseId or userId is missing", async () => {
    const req = { url: "http://localhost/api/exercises?userId=1" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing workoutExerciseId or userId" });
  });

  it("returns 400 if IDs are invalid", async () => {
    const req = { url: "http://localhost/api/exercises?workoutExerciseId=abc&userId=-1" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Invalid ID(s)" });
  });

  it("returns 200 and calls deleteWorkoutExercise with valid IDs", async () => {
    (exercisesLib.deleteWorkoutExercise as jest.Mock).mockResolvedValue(undefined);

    const req = { url: "http://localhost/api/exercises?workoutExerciseId=10&userId=1" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: "Exercise removed from workout" });
    expect(exercisesLib.deleteWorkoutExercise).toHaveBeenCalledWith(10, 1);
  });

  it("returns 500 if deleteWorkoutExercise throws an error", async () => {
    (exercisesLib.deleteWorkoutExercise as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    const req = { url: "http://localhost/api/exercises?workoutExerciseId=10&userId=1" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });
});
