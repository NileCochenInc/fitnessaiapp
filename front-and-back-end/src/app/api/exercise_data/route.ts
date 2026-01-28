import { NextRequest, NextResponse } from "next/server";
import { getEntriesAndMetrics, replaceEntriesAndMetrics } from "@/lib/exercise_data";
import { editWorkoutExercise } from "@/lib/exercises";
import { getLastEntryForExercise, getExerciseIdFromWorkoutExercise } from "@/lib/autocomplete";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path to your NextAuth config

// ==================== GET ====================
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const { searchParams } = new URL(req.url);
    const workoutExerciseIdParam = searchParams.get("workoutExerciseId");

    if (!workoutExerciseIdParam) {
      return NextResponse.json(
        { error: "Missing workoutExerciseId" },
        { status: 400 }
      );
    }

    const workoutExerciseId = Number(workoutExerciseIdParam);
    if (!Number.isInteger(workoutExerciseId)) {
      return NextResponse.json({ error: "Invalid workoutExerciseId" }, { status: 400 });
    }

    const entries = await getEntriesAndMetrics(workoutExerciseId, userId);
    
    // Fetch last entry for exercise prepopulation
    const exerciseId = await getExerciseIdFromWorkoutExercise(workoutExerciseId);
    const lastEntry = exerciseId ? await getLastEntryForExercise(exerciseId, userId) : null;
    console.log("Last Entry:", lastEntry);


    return NextResponse.json({ entries, lastEntry }, { status: 200 });
  } catch (err: any) {
    console.error("Error in GET /api/exercise-entries:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// ==================== POST ====================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const body = await req.json();
    const { workoutExerciseId, entries, name, note } = body;

    if (!workoutExerciseId || !entries) {
      return NextResponse.json(
        { error: "Missing workoutExerciseId or entries" },
        { status: 400 }
      );
    }

    // 1️⃣ Optionally update name/note first
    if (name || note) {
      await editWorkoutExercise(Number(workoutExerciseId), { name, note }, userId);
    }

    // 2️⃣ Replace entries & metrics
    const updatedEntries = await replaceEntriesAndMetrics(Number(workoutExerciseId), userId, entries);

    return NextResponse.json(updatedEntries, { status: 200 });
  } catch (err: any) {
    console.error("Error in POST /api/exercise-entries:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
