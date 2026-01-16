// src/tests/unit/api/workouts/route.test.ts
import { NextRequest } from "next/server";

// ------------------------
// Mock NextAuth session
// ------------------------
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
import { getServerSession } from "next-auth/next";

// ------------------------
// Mock authOptions import
// ------------------------
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

// ------------------------
// Mock workouts library
// ------------------------
import * as workoutsLib from "@/lib/workouts";
jest.mock("@/lib/workouts", () => ({
  __esModule: true,
  createWorkout: jest.fn(),
  getWorkoutsByUserId: jest.fn(),
  deleteWorkout: jest.fn(),
  updateWorkout: jest.fn(),
}));

// ------------------------
// Import API handlers after mocks
// ------------------------
import { POST, GET, PUT, DELETE } from "@/app/api/workouts/route";

// ------------------------
// Helpers
// ------------------------
const mockSession = { user: { id: 1 } };

beforeEach(() => {
  jest.clearAllMocks();
  (getServerSession as jest.Mock).mockResolvedValue(mockSession);
});

// ------------------------
// POST tests
// ------------------------
describe("POST /workouts", () => {
  it("returns 201 and calls createWorkout with valid data", async () => {
    const mockWorkout = { id: 1, user_id: 1, workout_date: "2026-01-12", workout_kind: "cardio" };
    (workoutsLib.createWorkout as jest.Mock).mockResolvedValue(mockWorkout);

    const req = {
      json: async () => ({ workout_date: "2026-01-12", workout_kind: "cardio" }),
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json).toEqual(mockWorkout);

    expect(workoutsLib.createWorkout).toHaveBeenCalledWith({
      user_id: 1,
      workout_date: "2026-01-12",
      workout_kind: "cardio",
    });
  });

  it("returns 400 for invalid data", async () => {
    const req = {
      json: async () => ({ workout_kind: "cardio" }), // missing date
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/workout_date/);
  });

  it("returns 500 if createWorkout throws", async () => {
    (workoutsLib.createWorkout as jest.Mock).mockRejectedValue(new Error("DB error"));

    const req = {
      json: async () => ({ workout_date: "2026-01-12", workout_kind: "cardio" }),
    } as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json).toEqual({ error: "Failed to create workout" });
  });
});

// ------------------------
// GET tests
// ------------------------
describe("GET /workouts", () => {
  it("returns workouts for valid user session", async () => {
    const mockWorkouts = [{ id: 1, user_id: 1, workout_date: "2026-01-12", workout_kind: "cardio" }];
    (workoutsLib.getWorkoutsByUserId as jest.Mock).mockResolvedValue(mockWorkouts);

    const req = { url: "http://localhost/api/workouts" } as unknown as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockWorkouts);
    expect(workoutsLib.getWorkoutsByUserId).toHaveBeenCalledWith(1);
  });

  it("returns 500 if getWorkoutsByUserId throws", async () => {
    (workoutsLib.getWorkoutsByUserId as jest.Mock).mockRejectedValue(new Error("DB error"));

    const req = { url: "http://localhost/api/workouts" } as unknown as NextRequest;
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal server error" });
  });
});

// ------------------------
// DELETE tests
// ------------------------
describe("DELETE /workouts", () => {
  it("returns 404 if workout does not exist", async () => {
    (workoutsLib.deleteWorkout as jest.Mock).mockResolvedValue(false);

    const req = { url: "http://localhost/api/workouts?workoutId=99" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({ error: "Workout not found or not owned by you" });
  });

  it("returns 200 if workout deleted", async () => {
    (workoutsLib.deleteWorkout as jest.Mock).mockResolvedValue(true);

    const req = { url: "http://localhost/api/workouts?workoutId=1" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ message: "Workout deleted successfully" });
  });

  it("returns 500 if deleteWorkout throws", async () => {
    (workoutsLib.deleteWorkout as jest.Mock).mockRejectedValue(new Error("DB error"));

    const req = { url: "http://localhost/api/workouts?workoutId=1" } as unknown as NextRequest;
    const res = await DELETE(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal server error" });
  });
});

// ------------------------
// PUT tests
// ------------------------
describe("PUT /workouts", () => {
  it("returns 400 if workoutId missing", async () => {
    const req = { url: "http://localhost/api/workouts" } as unknown as NextRequest;
    const res = await PUT(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing workoutId/);
  });

  it("returns 400 for invalid body", async () => {
    const req = {
      url: "http://localhost/api/workouts?workoutId=1",
      json: async () => ({ workout_date: 12345, workout_kind: "cardio" }),
    } as unknown as NextRequest;

    const res = await PUT(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/workout_date/);
  });

  it("returns 200 with updated workout", async () => {
    const mockUpdatedWorkout = { id: 1, user_id: 1, workout_date: "2026-01-13", workout_kind: "rowing" };
    (workoutsLib.updateWorkout as jest.Mock).mockResolvedValue(mockUpdatedWorkout);

    const req = {
      url: "http://localhost/api/workouts?workoutId=1",
      json: async () => ({ workout_date: "2026-01-13", workout_kind: "rowing" }),
    } as unknown as NextRequest;

    const res = await PUT(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockUpdatedWorkout);

    expect(workoutsLib.updateWorkout).toHaveBeenCalledWith(
      1,
      1,
      { workout_date: "2026-01-13", workout_kind: "rowing" }
    );
  });

  it("returns 500 if updateWorkout throws unexpected error", async () => {
    (workoutsLib.updateWorkout as jest.Mock).mockRejectedValue(new Error("DB failure"));

    const req = {
      url: "http://localhost/api/workouts?workoutId=1",
      json: async () => ({ workout_date: "2026-01-13", workout_kind: "rowing" }),
    } as unknown as NextRequest;

    const res = await PUT(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Internal server error" });
  });
});
