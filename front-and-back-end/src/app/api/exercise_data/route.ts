import { NextRequest, NextResponse } from "next/server";
import { getEntriesAndMetrics, replaceEntriesAndMetrics } from "@/lib/exercise_data"; // adjust path
import { editWorkoutExercise } from "@/lib/exercises"; // optional if you also patch name/note

// ==================== GET ====================
// Fetch all entries & metrics for a workout_exercise

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    // Always return entries array, even if empty
    const entries = await getEntriesAndMetrics(workoutExerciseId, userId);

    return NextResponse.json({ entries }, { status: 200 });
  } catch (err: any) {
    console.error("Error in GET /api/exercise-entries:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
// ==================== POST ====================
// Replace all entries & metrics for a workout_exercise
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workoutExerciseId, userId, entries, name, note } = body;

    if (!workoutExerciseId || !userId || !entries) {
      return NextResponse.json(
        { error: "Missing workoutExerciseId, userId, or entries" },
        { status: 400 }
      );
    }

    // 1️⃣ Optionally update name/note first
    if (name || note) {
      await editWorkoutExercise(Number(workoutExerciseId), { name, note }, Number(userId));
    }

    // 2️⃣ Replace entries & metrics
    const updatedEntries = await replaceEntriesAndMetrics(Number(workoutExerciseId), Number(userId), entries);

    return NextResponse.json(updatedEntries, { status: 200 });
  } catch (err: any) {
    console.error("Error in POST /api/exercise-entries:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
