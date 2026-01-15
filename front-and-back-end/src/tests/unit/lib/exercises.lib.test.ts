jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(() => ({
      query: jest.fn(),
      release: jest.fn()
    }))
  }
}));

import pool from '@/lib/db';
import {
  addWorkoutExercise,
  deleteWorkoutExercise,
  getExercisesForWorkout,
  getWorkoutMeta,
  editWorkoutExercise
} from '@/lib/exercises';

// describe("getExercisesForWorkout unit tests", () => {
//   beforeEach(() => {
//     (pool.query as jest.Mock).mockReset();
//   });

//   it("returns exercises with exercise_id as number", async () => {
//     // Mock the database returning a row with exercise_id as string
//     (pool.query as jest.Mock).mockResolvedValue({
//       rows: [{ exercise_id: "12", name: "Push Ups" }]
//     });

//     const result = await getExercisesForWorkout(1);

//     expect(result).toEqual([{ exercise_id: 12, name: "Push Ups" }]);
//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining("SELECT"),
//       [1]
//     );
//   });

//   it("returns empty array if no exercises", async () => {
//     (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

//     const result = await getExercisesForWorkout(1);

//     expect(result).toEqual([]);
//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining("SELECT"),
//       [1]
//     );
//   });
// });

describe("getExercisesForWorkout unit tests", () => {
  const userId = 42;

  beforeEach(() => {
    (pool.query as jest.Mock).mockReset();
  });

    it("returns exercises with exercise_id and workout_exercise_id as numbers", async () => {
    (pool.query as jest.Mock).mockResolvedValue({
        rows: [{ workout_exercise_id: "101", exercise_id: "12", name: "Push Ups" }]
    });

    const result = await getExercisesForWorkout(1, userId);

    expect(result).toEqual([
        { workout_exercise_id: 101, exercise_id: 12, name: "Push Ups" }
    ]);

    expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1, userId]
    );
    });


  it("returns empty array if no exercises", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    const result = await getExercisesForWorkout(1, userId);

    expect(result).toEqual([]);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [1, userId]
    );
  });
});


// // --- getWorkoutMeta ---
// describe("getWorkoutMeta unit tests", () => {
//   beforeEach(() => {
//     (pool.query as jest.Mock).mockReset();
//   });

//   it("throws if workout not found", async () => {
//     (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0, rows: [] });

//     await expect(getWorkoutMeta(1)).rejects.toThrow("Workout not found");
//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining("SELECT"),
//       [1]
//     );
//   });

//   it("returns meta if workout exists", async () => {
//     (pool.query as jest.Mock).mockResolvedValue({
//       rowCount: 1,
//       rows: [{ workout_date: "2023-01-01", workout_kind: "cardio" }]
//     });

//     const result = await getWorkoutMeta(1);
//     expect(result).toEqual({ workout_date: "2023-01-01", workout_kind: "cardio" });
//     expect(pool.query).toHaveBeenCalledWith(
//       expect.stringContaining("SELECT"),
//       [1]
//     );
//   });
// });
describe("getWorkoutMeta unit tests", () => {
  const userId = 42;

  beforeEach(() => {
    (pool.query as jest.Mock).mockReset();
  });

  it("throws if workout not found or unauthorized", async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rowCount: 0,
      rows: []
    });

    await expect(getWorkoutMeta(1, userId)).rejects.toThrow(
      "Workout not found or unauthorized"
    );

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [1, userId]
    );
  });

  it("returns meta if workout exists", async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rowCount: 1,
      rows: [{ workout_date: "2023-01-01", workout_kind: "cardio" }]
    });

    const result = await getWorkoutMeta(1, userId);

    expect(result).toEqual({
      workout_date: "2023-01-01",
      workout_kind: "cardio",
    });

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [1, userId]
    );
  });
});



// --- deleteWorkoutExercise ---
describe("deleteWorkoutExercise unit tests", () => {
  beforeEach(() => (pool.query as jest.Mock).mockReset());

  it("throws if workout_exercise not found", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
    await expect(deleteWorkoutExercise(1, 1)).rejects.toThrow(
      "Workout exercise not found or unauthorized"
    );
  });

  it("succeeds when workout_exercise exists", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
    await expect(deleteWorkoutExercise(1, 1)).resolves.toBeUndefined();
  });
});

describe("addWorkoutExercise unit tests", () => {
  let mockClient: any;

  beforeEach(() => {
    (pool.connect as jest.Mock).mockReset();
    mockClient = { query: jest.fn(), release: jest.fn() };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  it("throws if workout not found", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workouts")) {
        return Promise.resolve({ rowCount: 0, rows: [] });
      }
      return Promise.resolve({ rowCount: 1, rows: [] });
    });

    await expect(addWorkoutExercise(1, { name: "Push Ups" }, 1)).rejects.toThrow(
      "Workout not found or unauthorized"
    );
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("reuses existing exercise", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workouts")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 1 }] });
      } else if (sql.includes("FROM exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 42 }] });
      } else if (sql.includes("INSERT INTO workout_exercises")) {
        return Promise.resolve({ rows: [{ id: 100 }] });
      }
      return Promise.resolve({ rowCount: 0, rows: [] });
    });

    const result = await addWorkoutExercise(1, { name: "Push Ups" }, 1);
    expect(result).toEqual({ exercise_id: 42, name: "Push Ups" });
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("creates new exercise if not exists", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workouts")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 1 }] });
      } else if (sql.includes("FROM exercises")) {
        return Promise.resolve({ rowCount: 0, rows: [] });
      } else if (sql.includes("INSERT INTO exercises")) {
        return Promise.resolve({ rows: [{ id: 99 }] });
      } else if (sql.includes("INSERT INTO workout_exercises")) {
        return Promise.resolve({ rows: [{ id: 101 }] });
      }
      return Promise.resolve({ rowCount: 0, rows: [] });
    });

    const result = await addWorkoutExercise(1, { name: "Squats" }, 1);
    expect(result).toEqual({ exercise_id: 99, name: "Squats" });
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe("editWorkoutExercise unit tests", () => {
  let mockClient: any;

  beforeEach(() => {
    (pool.connect as jest.Mock).mockReset();
    mockClient = { query: jest.fn(), release: jest.fn() };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  it("throws if workout_exercise not found", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workout_exercises")) {
        return Promise.resolve({ rowCount: 0, rows: [] });
      }
      return Promise.resolve({ rowCount: 1, rows: [] });
    });

    await expect(editWorkoutExercise(1, { note: "test" }, 1)).rejects.toThrow(
      "Workout exercise not found or unauthorized"
    );
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("updates note only", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workout_exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 10, exercise_id: 5, workout_id: 1 }] });
      } else if (sql.includes("UPDATE workout_exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 10, note: "New Note" }] });
      } else if (sql.includes("FROM exercises")) {
        return Promise.resolve({ rows: [{ name: "Push Ups" }] });
      }
      return Promise.resolve({ rowCount: 0, rows: [] });
    });

    const result = await editWorkoutExercise(10, { note: "New Note" }, 1);
    expect(result).toEqual({
      workout_exercise_id: 10,
      exercise_id: 5,
      name: "Push Ups",
      note: "New Note",
    });
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("changes name to existing exercise", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workout_exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 10, exercise_id: 5, workout_id: 1 }] });
      } else if (sql.includes("FROM exercises") && sql.includes("WHERE name")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 42 }] });
      } else if (sql.includes("UPDATE workout_exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 10 }] });
      } else if (sql.includes("FROM exercises") && !sql.includes("WHERE name")) {
        return Promise.resolve({ rows: [{ name: "Burpees" }] });
      }
      return Promise.resolve({ rowCount: 0, rows: [] });
    });

    const result = await editWorkoutExercise(10, { name: "Burpees" }, 1);
    expect(result).toEqual({
      workout_exercise_id: 10,
      exercise_id: 42,
      name: "Burpees",
      note: undefined,
    });
    expect(mockClient.release).toHaveBeenCalled();
  });

  it("creates new exercise if name does not exist", async () => {
    mockClient.query.mockImplementation((sql:string) => {
      if (sql.includes("FROM workout_exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 10, exercise_id: 5, workout_id: 1 }] });
      } else if (sql.includes("FROM exercises") && sql.includes("WHERE name")) {
        return Promise.resolve({ rowCount: 0, rows: [] });
      } else if (sql.includes("INSERT INTO exercises")) {
        return Promise.resolve({ rows: [{ id: 99 }] });
      } else if (sql.includes("UPDATE workout_exercises")) {
        return Promise.resolve({ rowCount: 1, rows: [{ id: 10 }] });
      } else if (sql.includes("FROM exercises") && !sql.includes("WHERE name")) {
        return Promise.resolve({ rows: [{ name: "New Exercise" }] });
      }
      return Promise.resolve({ rowCount: 0, rows: [] });
    });

    const result = await editWorkoutExercise(10, { name: "New Exercise" }, 1);
    expect(result).toEqual({
      workout_exercise_id: 10,
      exercise_id: 99,
      name: "New Exercise",
      note: undefined,
    });
    expect(mockClient.release).toHaveBeenCalled();
  });
});
