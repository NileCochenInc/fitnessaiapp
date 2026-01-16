import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path to your NextAuth config
import { createWorkout, getWorkoutsByUserId, updateWorkout, deleteWorkout } from "@/lib/workouts";
import { WorkoutSchema } from "@/types/workouts";

// GET /api/workouts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user session ID" }, { status: 400 });
    }

    const workouts = await getWorkoutsByUserId(userId);
    return NextResponse.json(workouts);
  } catch (err: any) {
    console.error("Error in GET /api/workouts:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/workouts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await req.json();

    // Validate workout data
    const parsed = WorkoutSchema.pick({ workout_date: true, workout_kind: true }).safeParse(raw);
    if (!parsed.success) {
      const messages = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user session ID" }, { status: 400 });
    }

    // Create workout with userId from session
    const workout = await createWorkout({ user_id: userId, ...parsed.data });
    return NextResponse.json(workout, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/workouts:", err);
    return NextResponse.json({ error: "Failed to create workout" }, { status: 500 });
  }
}

// PUT /api/workouts?workoutId=123
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workoutIdParam = searchParams.get("workoutId");

    if (!workoutIdParam) {
      return NextResponse.json({ error: "Missing workoutId query parameter" }, { status: 400 });
    }

    const workoutId = Number(workoutIdParam);
    if (!Number.isInteger(workoutId) || workoutId <= 0) {
      return NextResponse.json({ error: "Invalid workoutId" }, { status: 400 });
    }

    const raw = await req.json();
    const parsed = WorkoutSchema.pick({ workout_date: true, workout_kind: true }).safeParse(raw);
    if (!parsed.success) {
      const messages = parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user session ID" }, { status: 400 });
    }

    const updatedWorkout = await updateWorkout(workoutId, userId, parsed.data);
    return NextResponse.json(updatedWorkout);
  } catch (err: any) {
    console.error("Error in PUT /api/workouts:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/workouts?workoutId=123
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workoutIdParam = searchParams.get("workoutId");

    if (!workoutIdParam) {
      return NextResponse.json({ error: "Missing workoutId query parameter" }, { status: 400 });
    }

    const workoutId = Number(workoutIdParam);
    if (!Number.isInteger(workoutId) || workoutId <= 0) {
      return NextResponse.json({ error: "Invalid workoutId" }, { status: 400 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "Invalid user session ID" }, { status: 400 });
    }
    const deleted = await deleteWorkout(userId, workoutId);
    if (!deleted) {
      return NextResponse.json({ error: "Workout not found or not owned by you" }, { status: 404 });
    }

    return NextResponse.json({ message: "Workout deleted successfully" });
  } catch (err: any) {
    console.error("Error in DELETE /api/workouts:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
