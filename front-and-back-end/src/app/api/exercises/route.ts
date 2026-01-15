import { NextRequest, NextResponse } from "next/server";
import { getExercisesForWorkout, getWorkoutMeta, addWorkoutExercise, deleteWorkoutExercise, editWorkoutExercise  } from "@/lib/exercises";


/*
response shape:
{
  workout_id: number;
  workout_date: string;
  workout_kind: string;
  exercises: {
    exercise_id: number;
    name: string;
  }[];
}
*/
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const workoutIdParam = searchParams.get("workoutId");
    const userIdParam = searchParams.get("userId");

    // ─── Validate query params ─────────────────────────────
    if (!workoutIdParam || !userIdParam) {
      return NextResponse.json(
        { error: "Missing workoutId or userId query parameter" },
        { status: 400 }
      );
    }

    const workoutId = Number(workoutIdParam);
    const userId = Number(userIdParam);

    if (
      !Number.isInteger(workoutId) ||
      workoutId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid workoutId or userId" },
        { status: 400 }
      );
    }

    // ─── Fetch workout meta (throws if not found / unauthorized) ───
    const meta = await getWorkoutMeta(workoutId, userId);

    // ─── Fetch exercises (empty array is valid) ───────────────────
    const exercises = await getExercisesForWorkout(workoutId, userId);

    // ─── Combined response ────────────────────────────────────────
    return NextResponse.json(
      {
        workout_id: workoutId,
        workout_date: meta.workout_date,
        workout_kind: meta.workout_kind,
        exercises,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error in GET /api/workout-details:", error);

    if (error.message === "Workout not found or unauthorized") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



// ==================== POST ====================
// Add or attach an exercise to a workout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workoutId, name, userId } = body;

    if (!workoutId || !name || !userId) {
      return NextResponse.json(
        { error: "Missing workoutId, name, or userId" },
        { status: 400 }
      );
    }

    // future auth: replace `userId` with session-derived value
    const exercise = await addWorkoutExercise(workoutId, { name }, userId);

    return NextResponse.json(exercise, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/exercises:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================== DELETE ====================
// Remove an exercise from a workout
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workoutExerciseIdParam = searchParams.get("workoutExerciseId");
    const userIdParam = searchParams.get("userId");

    if (!workoutExerciseIdParam || !userIdParam) {
      return NextResponse.json(
        { error: "Missing workoutExerciseId or userId" },
        { status: 400 }
      );
    }

    const workoutExerciseId = Number(workoutExerciseIdParam);
    const userId = Number(userIdParam);

    if (!Number.isInteger(workoutExerciseId) || !Number.isInteger(userId)) {
      return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
    }

    // future auth: replace `userId` with session-derived value
    await deleteWorkoutExercise(workoutExerciseId, userId);

    return NextResponse.json(
      { message: "Exercise removed from workout" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in DELETE /api/exercises:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}


// ==================== PATCH ====================
// Edit a workout exercise (name and/or note)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { workoutExerciseId, name, note, userId } = body;

    // ─── Validate required fields ─────────────────────────────
    if (!workoutExerciseId || !userId) {
      return NextResponse.json(
        { error: "Missing workoutExerciseId or userId" },
        { status: 400 }
      );
    }

    if (!name && note === undefined) {
      return NextResponse.json(
        { error: "Nothing to update: provide name or note" },
        { status: 400 }
      );
    }

    // ─── Call library function to update ─────────────────────
    // future auth: replace `userId` with session-derived value
    const updated = await editWorkoutExercise(
      Number(workoutExerciseId),
      { name, note },
      Number(userId)
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Error in PATCH /api/exercises:", err);

    if (err.message === "Workout exercise not found or unauthorized") {
      return NextResponse.json(
        { error: err.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
