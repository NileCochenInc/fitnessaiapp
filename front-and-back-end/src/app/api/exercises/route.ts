import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path to your NextAuth config
import { 
  getExercisesForWorkout, 
  getWorkoutMeta, 
  addWorkoutExercise, 
  deleteWorkoutExercise, 
  editWorkoutExercise  
} from "@/lib/exercises";

/*
Response shape:
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

// ==================== GET ====================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const { searchParams } = new URL(req.url);
    const workoutIdParam = searchParams.get("workoutId");

    if (!workoutIdParam) {
      return NextResponse.json({ error: "Missing workoutId query parameter" }, { status: 400 });
    }

    const workoutId = Number(workoutIdParam);
    if (!Number.isInteger(workoutId) || workoutId <= 0) {
      return NextResponse.json({ error: "Invalid workoutId" }, { status: 400 });
    }

    const meta = await getWorkoutMeta(workoutId, userId);
    const exercises = await getExercisesForWorkout(workoutId, userId);

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
    console.error("Error in GET /api/exercises:", error);
    if (error.message === "Workout not found or unauthorized") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ==================== POST ====================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const body = await req.json();
    const { workoutId, name } = body;

    if (!workoutId || !name) {
      return NextResponse.json({ error: "Missing workoutId or name" }, { status: 400 });
    }

    const exercise = await addWorkoutExercise(workoutId, { name }, userId);
    return NextResponse.json(exercise, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/exercises:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ==================== DELETE ====================
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const { searchParams } = new URL(req.url);
    const workoutExerciseIdParam = searchParams.get("workoutExerciseId");

    if (!workoutExerciseIdParam) {
      return NextResponse.json({ error: "Missing workoutExerciseId query parameter" }, { status: 400 });
    }

    const workoutExerciseId = Number(workoutExerciseIdParam);
    if (!Number.isInteger(workoutExerciseId)) {
      return NextResponse.json({ error: "Invalid workoutExerciseId" }, { status: 400 });
    }

    await deleteWorkoutExercise(workoutExerciseId, userId);
    return NextResponse.json({ message: "Exercise removed from workout" }, { status: 200 });
  } catch (err: any) {
    console.error("Error in DELETE /api/exercises:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ==================== PATCH ====================
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = Number(session.user.id);

    const body = await req.json();
    const { workoutExerciseId, name, note } = body;

    if (!workoutExerciseId) {
      return NextResponse.json({ error: "Missing workoutExerciseId" }, { status: 400 });
    }

    if (!name && note === undefined) {
      return NextResponse.json({ error: "Nothing to update: provide name or note" }, { status: 400 });
    }

    const updated = await editWorkoutExercise(Number(workoutExerciseId), { name, note }, userId);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error("Error in PATCH /api/exercises:", err);
    if (err.message === "Workout exercise not found or unauthorized") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
