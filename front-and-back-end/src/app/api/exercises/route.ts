import { NextRequest, NextResponse } from "next/server";
import { getExercisesForWorkout, getWorkoutMeta } from "@/lib/exercises";



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


//post exercise



//put exercise

//delete exercise
